/**
 * 
 * This service handles all Yellow Network state channel operations for YellowTok:
 * - Creating streaming sessions (state channels)
 * - Instant, gasless tipping via off-chain transactions
 * - Session management and settlement
 * - Balance tracking and spending limits

 */

import { createAppSessionMessage, parseRPCResponse } from '@erc7824/nitrolite';

class YellowTokService {
  constructor(config = {}) {
    // Configuration
    this.config = {
      // Use sandbox for testing, production for live
      clearnodeUrl: config.clearnodeUrl || 'wss://clearnet-sandbox.yellow.com/ws',
      // Commission rates
      standardCommission: config.standardCommission || 10, // 10% for standard
      partnerCommission: config.partnerCommission || 3,    // 3% for partners
      // Default asset
      defaultAsset: config.defaultAsset || 'usdc',
      // Asset decimals (USDC has 6 decimals)
      assetDecimals: config.assetDecimals || 6,
      ...config
    };

    // Connection state
    this.ws = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;

    // User state
    this.userAddress = null;
    this.messageSigner = null;

    // Session state
    this.activeSessions = new Map(); // sessionId -> session data
    this.activeStreamSession = null; // Current stream session

    // Event callbacks
    this.eventHandlers = {
      onConnected: null,
      onDisconnected: null,
      onSessionCreated: null,
      onTipReceived: null,
      onTipSent: null,
      onBalanceUpdate: null,
      onSessionClosed: null,
      onError: null
    };
  }

  /**
   * Initialize the service and connect to Yellow Network
   * @param {Object} walletProvider - Web3 wallet provider (e.g., window.ethereum)
   * @returns {Promise<Object>} - { success: boolean, address: string }
   */
  async initialize(walletProvider) {
    try {
      console.log(' Initializing YellowTok Service...');

      // Setup wallet connection
      const { userAddress, messageSigner } = await this._setupWallet(walletProvider);
      this.userAddress = userAddress;
      this.messageSigner = messageSigner;

      console.log(' Wallet connected:', userAddress);

      // Connect to Yellow Network ClearNode
      await this._connectToClearNode();

      return {
        success: true,
        address: userAddress
      };
    } catch (error) {
      console.error(' Failed to initialize YellowTok Service:', error);
      this._triggerEvent('onError', {
        type: 'initialization_error',
        message: error.message,
        error
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Setup wallet connection and message signer
   * @private
   */
  async _setupWallet(walletProvider) {
    if (!walletProvider) {
      throw new Error('No wallet provider available. Please install MetaMask or another Web3 wallet.');
    }

    // Request account access
    const accounts = await walletProvider.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.');
    }

    const userAddress = accounts[0];

    // Create message signer function
    const messageSigner = async (message) => {
      try {
        return await walletProvider.request({
          method: 'personal_sign',
          params: [message, userAddress]
        });
      } catch (error) {
        console.error('Failed to sign message:', error);
        throw new Error('User rejected signature or signing failed');
      }
    };

    return { userAddress, messageSigner };
  }

  /**
   * Connect to Yellow Network ClearNode
   * @private
   */
  async _connectToClearNode() {
    return new Promise((resolve, reject) => {
      console.log('🔌 Connecting to Yellow Network ClearNode...');
      
      this.ws = new WebSocket(this.config.clearnodeUrl);

      // Connection opened
      this.ws.onopen = () => {
        console.log('Connected to Yellow Network ClearNode');
        this.connected = true;
        this.reconnectAttempts = 0;
        this._triggerEvent('onConnected');
        resolve();
      };

      // Message received
      this.ws.onmessage = (event) => {
        this._handleMessage(event.data);
      };

      // Connection error
      this.ws.onerror = (error) => {
        console.error(' ClearNode connection error:', error);
        this._triggerEvent('onError', {
          type: 'connection_error',
          message: 'Failed to connect to Yellow Network',
          error
        });
        reject(error);
      };

      // Connection closed
      this.ws.onclose = () => {
        console.log(' Disconnected from Yellow Network');
        this.connected = false;
        this._triggerEvent('onDisconnected');
        this._attemptReconnect();
      };
    });
  }

  /**
   * Attempt to reconnect to ClearNode
   * @private
   */
  _attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(` Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
      
      setTimeout(() => {
        this._connectToClearNode().catch(err => {
          console.error('Reconnect failed:', err);
        });
      }, delay);
    } else {
      console.error(' Max reconnection attempts reached');
      this._triggerEvent('onError', {
        type: 'max_reconnect_attempts',
        message: 'Could not reconnect to Yellow Network'
      });
    }
  }

  /**
   * Create a new streaming session (state channel)
   * This opens a state channel between viewer and streamer
   * 
   * @param {string} streamerAddress - Ethereum address of the streamer
   * @param {number} depositAmount - Amount viewer wants to deposit (in dollars)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Session details
   */
  async createStreamSession(streamerAddress, depositAmount, options = {}) {
    if (!this.connected) {
      throw new Error('Not connected to Yellow Network. Please initialize first.');
    }

    if (!streamerAddress || !depositAmount) {
      throw new Error('Streamer address and deposit amount are required');
    }

    try {
      console.log(` Creating stream session with ${streamerAddress}...`);

      // Convert dollar amount to asset units (considering decimals)
      const depositInUnits = this._toAssetUnits(depositAmount);

      // Determine commission rate (3% for partners, 10% for standard)
      const isPartner = options.isPartner || false;
      const commissionRate = isPartner ? this.config.partnerCommission : this.config.standardCommission;

      // Create application definition for the streaming session
      const appDefinition = {
        protocol: 'yellowtok-streaming-v1',
        participants: [this.userAddress, streamerAddress],
        // Weights determine voting power (50-50 split for bilateral channel)
        weights: [50, 50],
        // Quorum: percentage of weights needed for consensus (100 = both must agree)
        quorum: 100,
        // Challenge period in seconds (0 for instant finality in sandbox)
        challenge: options.challengePeriod || 0,
        // Unique nonce to prevent replay attacks
        nonce: Date.now(),
        // Custom metadata
        metadata: {
          sessionType: 'streaming',
          commissionRate,
          isPartner,
          streamerId: streamerAddress,
          viewerId: this.userAddress,
          timestamp: new Date().toISOString()
        }
      };

      // Initial allocations (viewer deposits, streamer starts at 0)
      const allocations = [
        {
          participant: this.userAddress,
          asset: this.config.defaultAsset,
          amount: depositInUnits.toString()
        },
        {
          participant: streamerAddress,
          asset: this.config.defaultAsset,
          amount: '0'
        }
      ];

      // Create and sign the session message
      const sessionMessage = await this._createAppSessionMessage(
        [{ definition: appDefinition, allocations }]
      );

      // Send to ClearNode
      this.ws.send(sessionMessage);

      // Store session locally
      const sessionId = `stream_${Date.now()}`;
      const session = {
        sessionId,
        streamerAddress,
        viewerAddress: this.userAddress,
        initialDeposit: depositAmount,
        currentBalance: depositAmount,
        spent: 0,
        commissionRate,
        isPartner,
        createdAt: Date.now(),
        status: 'pending',
        appDefinition,
        allocations
      };

      this.activeSessions.set(sessionId, session);
      this.activeStreamSession = session;

      console.log(' Stream session created:', sessionId);

      return {
        success: true,
        sessionId,
        deposit: depositAmount,
        commissionRate,
        session
      };

    } catch (error) {
      console.error(' Failed to create stream session:', error);
      this._triggerEvent('onError', {
        type: 'session_creation_error',
        message: error.message,
        error
      });
      throw error;
    }
  }

  /**
   * Send an instant tip to the streamer
   * This happens OFF-CHAIN via state channels (no gas fees!)
   * 
   * @param {number} tipAmount - Amount to tip (in dollars)
   * @param {string} streamerAddress - Address of the streamer
   * @param {string} message - Optional message with the tip
   * @returns {Promise<Object>} - Tip result
   */
  async sendTip(tipAmount, streamerAddress, message = '') {
    if (!this.activeStreamSession) {
      throw new Error('No active stream session. Please create a session first.');
    }

    if (this.activeStreamSession.streamerAddress !== streamerAddress) {
      throw new Error('Active session is with a different streamer');
    }

    if (tipAmount <= 0) {
      throw new Error('Tip amount must be greater than 0');
    }

    if (tipAmount > this.activeStreamSession.currentBalance) {
      throw new Error('Insufficient balance. Please deposit more funds.');
    }

    try {
      console.log(` Sending tip of $${tipAmount} to ${streamerAddress}...`);

      // Convert tip amount to asset units
      const tipInUnits = this._toAssetUnits(tipAmount);

      // Calculate commission
      const commissionAmount = tipAmount * (this.activeStreamSession.commissionRate / 100);
      const creatorReceives = tipAmount - commissionAmount;

      // Create tip data
      const tipData = {
        type: 'tip',
        sessionId: this.activeStreamSession.sessionId,
        amount: tipInUnits.toString(),
        recipient: streamerAddress,
        sender: this.userAddress,
        message,
        timestamp: Date.now(),
        commission: this._toAssetUnits(commissionAmount).toString(),
        creatorReceives: this._toAssetUnits(creatorReceives).toString()
      };

      // Sign the tip
      const signature = await this.messageSigner(JSON.stringify(tipData));

      // Create signed tip message
      const signedTip = {
        ...tipData,
        signature
      };

      // Send through state channel (OFF-CHAIN, instant, $0 gas!)
      this.ws.send(JSON.stringify({
        jsonrpc: '2.0',
        method: 'send_state_update',
        params: signedTip,
        id: Date.now()
      }));

      // Update local session state
      this.activeStreamSession.spent += tipAmount;
      this.activeStreamSession.currentBalance -= tipAmount;

      // Trigger event
      this._triggerEvent('onTipSent', {
        amount: tipAmount,
        amountInUnits: tipInUnits,
        recipient: streamerAddress,
        message,
        commission: commissionAmount,
        creatorReceives,
        remainingBalance: this.activeStreamSession.currentBalance,
        totalSpent: this.activeStreamSession.spent
      });

      console.log(` Tip sent! Creator receives $${creatorReceives.toFixed(2)} (${this.activeStreamSession.commissionRate}% commission)`);

      return {
        success: true,
        tipAmount,
        commission: commissionAmount,
        creatorReceives,
        remainingBalance: this.activeStreamSession.currentBalance,
        totalSpent: this.activeStreamSession.spent
      };

    } catch (error) {
      console.error(' Failed to send tip:', error);
      this._triggerEvent('onError', {
        type: 'tip_error',
        message: error.message,
        error
      });
      throw error;
    }
  }

  /**
   * Send multiple tips in a batch
   * Useful for animations or special effects
   * 
   * @param {Array<Object>} tips - Array of tip objects
   * @returns {Promise<Object>}
   */
  async sendTipBatch(tips) {
    const results = [];
    let totalAmount = 0;

    for (const tip of tips) {
      try {
        const result = await this.sendTip(
          tip.amount,
          tip.streamerAddress,
          tip.message || ''
        );
        results.push({ ...result, success: true });
        totalAmount += tip.amount;
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return {
      success: true,
      totalTips: tips.length,
      successfulTips: results.filter(r => r.success).length,
      totalAmount,
      results
    };
  }

  /**
   * End the current streaming session and settle on-chain
   * This batches all tips into 1 on-chain transaction and returns unused funds
   * 
   * @returns {Promise<Object>}
   */
  async endStreamSession() {
    if (!this.activeStreamSession) {
      throw new Error('No active stream session to end');
    }

    try {
      console.log(' Ending stream session...');

      const sessionId = this.activeStreamSession.sessionId;
      const unusedBalance = this.activeStreamSession.currentBalance;

      // Send close session message to ClearNode
      this.ws.send(JSON.stringify({
        jsonrpc: '2.0',
        method: 'close_session',
        params: {
          sessionId,
          timestamp: Date.now()
        },
        id: Date.now()
      }));

      // Update session status
      this.activeStreamSession.status = 'closed';
      this.activeStreamSession.closedAt = Date.now();

      const sessionSummary = {
        sessionId,
        duration: this.activeStreamSession.closedAt - this.activeStreamSession.createdAt,
        totalDeposited: this.activeStreamSession.initialDeposit,
        totalSpent: this.activeStreamSession.spent,
        unusedBalance,
        commissionRate: this.activeStreamSession.commissionRate
      };

      console.log(' Stream session ended. Unused balance will be returned:', unusedBalance);

      this._triggerEvent('onSessionClosed', sessionSummary);

      // Clear active session
      this.activeStreamSession = null;

      return {
        success: true,
        ...sessionSummary
      };

    } catch (error) {
      console.error(' Failed to end stream session:', error);
      this._triggerEvent('onError', {
        type: 'session_close_error',
        message: error.message,
        error
      });
      throw error;
    }
  }

  /**
   * Handle incoming messages from ClearNode
   * @private
   */
  _handleMessage(data) {
    try {
      const message = parseRPCResponse(data);

      switch (message.type) {
        case 'session_created':
          this._handleSessionCreated(message);
          break;

        case 'tip':
        case 'state_update':
          this._handleTipReceived(message);
          break;

        case 'balance_update':
          this._handleBalanceUpdate(message);
          break;

        case 'session_closed':
          this._handleSessionClosed(message);
          break;

        case 'error':
          this._handleError(message);
          break;

        default:
          console.log(' Received message:', message);
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  /**
   * Handle session created confirmation
   * @private
   */
  _handleSessionCreated(message) {
    console.log(' Session created on ClearNode:', message.sessionId);

    if (this.activeStreamSession) {
      this.activeStreamSession.status = 'active';
      this.activeStreamSession.clearnodeSessionId = message.sessionId;
    }

    this._triggerEvent('onSessionCreated', {
      sessionId: message.sessionId,
      session: this.activeStreamSession
    });
  }

  /**
   * Handle incoming tip (when you're the streamer)
   * @private
   */
  _handleTipReceived(message) {
    const tipAmount = this._fromAssetUnits(parseInt(message.amount));
    const commission = message.commission ? this._fromAssetUnits(parseInt(message.commission)) : 0;
    const creatorReceives = tipAmount - commission;

    console.log(` Tip received: $${tipAmount} (you get $${creatorReceives})`);

    this._triggerEvent('onTipReceived', {
      amount: tipAmount,
      commission,
      creatorReceives,
      sender: message.sender,
      message: message.message || '',
      timestamp: message.timestamp
    });
  }

  /**
   * Handle balance update
   * @private
   */
  _handleBalanceUpdate(message) {
    const balance = this._fromAssetUnits(parseInt(message.balance));
    
    if (this.activeStreamSession) {
      this.activeStreamSession.currentBalance = balance;
    }

    this._triggerEvent('onBalanceUpdate', { balance });
  }

  /**
   * Handle session closed confirmation
   * @private
   */
  _handleSessionClosed(message) {
    console.log(' Session closed on-chain, unused funds returned');
    this._triggerEvent('onSessionClosed', message);
  }

  /**
   * Handle error messages
   * @private
   */
  _handleError(message) {
    console.error(' ClearNode error:', message.error);
    this._triggerEvent('onError', {
      type: 'clearnode_error',
      message: message.error,
      details: message
    });
  }

  /**
   * Create app session message (helper for Yellow SDK)
   * @private
   */
  async _createAppSessionMessage(sessions) {
    const message = JSON.stringify({
      type: 'create_session',
      sessions,
      timestamp: Date.now()
    });

    const signature = await this.messageSigner(message);

    return JSON.stringify({
      jsonrpc: '2.0',
      method: 'create_app_session',
      params: {
        message,
        signature,
        sender: this.userAddress
      },
      id: Date.now()
    });
  }

  /**
   * Convert dollar amount to asset units (considering decimals)
   * @private
   */
  _toAssetUnits(dollarAmount) {
    return Math.floor(dollarAmount * Math.pow(10, this.config.assetDecimals));
  }

  /**
   * Convert asset units to dollar amount
   * @private
   */
  _fromAssetUnits(units) {
    return units / Math.pow(10, this.config.assetDecimals);
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    if (this.eventHandlers.hasOwnProperty(event)) {
      this.eventHandlers[event] = handler;
    } else {
      console.warn(`Unknown event: ${event}`);
    }
  }

  /**
   * Trigger event handler
   * @private
   */
  _triggerEvent(event, data) {
    if (this.eventHandlers[event]) {
      try {
        this.eventHandlers[event](data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    }
  }

  /**
   * Get current session info
   */
  getSessionInfo() {
    if (!this.activeStreamSession) {
      return null;
    }

    return {
      sessionId: this.activeStreamSession.sessionId,
      streamer: this.activeStreamSession.streamerAddress,
      initialDeposit: this.activeStreamSession.initialDeposit,
      currentBalance: this.activeStreamSession.currentBalance,
      spent: this.activeStreamSession.spent,
      commissionRate: this.activeStreamSession.commissionRate,
      isPartner: this.activeStreamSession.isPartner,
      status: this.activeStreamSession.status
    };
  }

  /**
   * Check if spending limit would be exceeded
   */
  checkSpendingLimit(tipAmount, spendingLimit) {
    if (!this.activeStreamSession) {
      return { allowed: false, reason: 'No active session' };
    }

    const newTotal = this.activeStreamSession.spent + tipAmount;

    if (newTotal > spendingLimit) {
      return {
        allowed: false,
        reason: 'Spending limit exceeded',
        currentSpent: this.activeStreamSession.spent,
        limit: spendingLimit,
        wouldBe: newTotal
      };
    }

    // Warning at 90%
    const percentUsed = (newTotal / spendingLimit) * 100;
    if (percentUsed >= 90) {
      return {
        allowed: true,
        warning: true,
        message: `You've used ${percentUsed.toFixed(0)}% of your spending limit`,
        percentUsed
      };
    }

    return { allowed: true, percentUsed };
  }

  /**
   * Disconnect from Yellow Network
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    console.log('👋 Disconnected from Yellow Network');
  }
}

export default YellowTokService;
