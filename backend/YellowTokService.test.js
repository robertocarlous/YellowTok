/**
 * YellowTok Service - Test Suite
 * 
 * Run with: npm test
 */

import YellowTokService from './YellowTokService';

// Mock WebSocket
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    setTimeout(() => {
      this.readyState = 1;
      if (this.onopen) this.onopen();
    }, 100);
  }

  send(data) {
    console.log('WebSocket send:', data);
    // Simulate response
    if (this.onmessage) {
      setTimeout(() => {
        this.onmessage({
          data: JSON.stringify({
            type: 'session_created',
            sessionId: 'test_session_123'
          })
        });
      }, 50);
    }
  }

  close() {
    this.readyState = 3;
    if (this.onclose) this.onclose();
  }
};

// Mock wallet provider
const mockWalletProvider = {
  request: jest.fn(async ({ method, params }) => {
    if (method === 'eth_requestAccounts') {
      return ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'];
    }
    if (method === 'personal_sign') {
      return '0xmocksignature123';
    }
    return null;
  })
};

describe('YellowTokService', () => {
  let yellowTok;

  beforeEach(() => {
    yellowTok = new YellowTokService({
      clearnodeUrl: 'wss://clearnet-sandbox.yellow.com/ws'
    });
  });

  afterEach(() => {
    if (yellowTok) {
      yellowTok.disconnect();
    }
  });

  // ============================================================================
  // Initialization Tests
  // ============================================================================

  describe('Initialization', () => {
    test('should initialize successfully with wallet provider', async () => {
      const result = await yellowTok.initialize(mockWalletProvider);

      expect(result.success).toBe(true);
      expect(result.address).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
    });

    test('should fail initialization without wallet provider', async () => {
      const result = await yellowTok.initialize(null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should connect to ClearNode', async () => {
      const onConnected = jest.fn();
      yellowTok.on('onConnected', onConnected);

      await yellowTok.initialize(mockWalletProvider);

      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(onConnected).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Session Tests
  // ============================================================================

  describe('Session Management', () => {
    beforeEach(async () => {
      await yellowTok.initialize(mockWalletProvider);
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    test('should create streaming session', async () => {
      const streamerAddress = '0x1234567890abcdef';
      const depositAmount = 20;

      const result = await yellowTok.createStreamSession(
        streamerAddress,
        depositAmount,
        { isPartner: false }
      );

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.deposit).toBe(depositAmount);
      expect(result.commissionRate).toBe(10); // Standard rate
    });

    test('should create partner session with 3% commission', async () => {
      const result = await yellowTok.createStreamSession(
        '0x1234567890abcdef',
        20,
        { isPartner: true }
      );

      expect(result.commissionRate).toBe(3);
    });

    test('should get session info', async () => {
      await yellowTok.createStreamSession('0x1234567890abcdef', 20);

      const info = yellowTok.getSessionInfo();

      expect(info).not.toBeNull();
      expect(info.initialDeposit).toBe(20);
      expect(info.currentBalance).toBe(20);
      expect(info.spent).toBe(0);
    });

    test('should return null when no active session', () => {
      const info = yellowTok.getSessionInfo();
      expect(info).toBeNull();
    });
  });

  // ============================================================================
  // Tipping Tests
  // ============================================================================

  describe('Tipping', () => {
    const streamerAddress = '0x1234567890abcdef';

    beforeEach(async () => {
      await yellowTok.initialize(mockWalletProvider);
      await new Promise(resolve => setTimeout(resolve, 150));
      await yellowTok.createStreamSession(streamerAddress, 20);
    });

    test('should send tip successfully', async () => {
      const result = await yellowTok.sendTip(1.00, streamerAddress, 'Great stream!');

      expect(result.success).toBe(true);
      expect(result.tipAmount).toBe(1.00);
      expect(result.commission).toBe(0.10); // 10% of $1
      expect(result.creatorReceives).toBe(0.90);
      expect(result.remainingBalance).toBe(19.00);
    });

    test('should calculate commission correctly for partner', async () => {
      // Create partner session
      await yellowTok.endStreamSession();
      await yellowTok.createStreamSession(streamerAddress, 20, { isPartner: true });

      const result = await yellowTok.sendTip(1.00, streamerAddress);

      expect(result.commission).toBe(0.03); // 3% of $1
      expect(result.creatorReceives).toBe(0.97);
    });

    test('should reject tip exceeding balance', async () => {
      await expect(
        yellowTok.sendTip(25.00, streamerAddress)
      ).rejects.toThrow('Insufficient balance');
    });

    test('should reject tip to wrong streamer', async () => {
      await expect(
        yellowTok.sendTip(1.00, '0xdifferentaddress')
      ).rejects.toThrow('Active session is with a different streamer');
    });

    test('should trigger onTipSent event', async () => {
      const onTipSent = jest.fn();
      yellowTok.on('onTipSent', onTipSent);

      await yellowTok.sendTip(1.00, streamerAddress);

      expect(onTipSent).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1.00,
          creatorReceives: 0.90,
          commission: 0.10
        })
      );
    });

    test('should send batch tips', async () => {
      const tips = [
        { amount: 0.50, streamerAddress, message: 'Nice!' },
        { amount: 1.00, streamerAddress, message: 'Great!' },
        { amount: 2.00, streamerAddress, message: 'Awesome!' }
      ];

      const result = await yellowTok.sendTipBatch(tips);

      expect(result.success).toBe(true);
      expect(result.totalTips).toBe(3);
      expect(result.successfulTips).toBe(3);
      expect(result.totalAmount).toBe(3.50);
    });
  });

  // ============================================================================
  // Spending Limit Tests
  // ============================================================================

  describe('Spending Limits', () => {
    beforeEach(async () => {
      await yellowTok.initialize(mockWalletProvider);
      await new Promise(resolve => setTimeout(resolve, 150));
      await yellowTok.createStreamSession('0x1234567890abcdef', 20);
    });

    test('should allow tip within limit', () => {
      const check = yellowTok.checkSpendingLimit(5, 50);

      expect(check.allowed).toBe(true);
      expect(check.percentUsed).toBe(10); // 5/50 = 10%
    });

    test('should warn at 90% of limit', async () => {
      // Spend $45 (90% of $50 limit)
      await yellowTok.sendTip(20, '0x1234567890abcdef');

      const check = yellowTok.checkSpendingLimit(25, 50);

      expect(check.allowed).toBe(true);
      expect(check.warning).toBe(true);
      expect(check.percentUsed).toBeGreaterThanOrEqual(90);
    });

    test('should reject tip exceeding limit', async () => {
      await yellowTok.sendTip(20, '0x1234567890abcdef');

      const check = yellowTok.checkSpendingLimit(35, 50);

      expect(check.allowed).toBe(false);
      expect(check.reason).toBe('Spending limit exceeded');
    });
  });

  // ============================================================================
  // Session Closing Tests
  // ============================================================================

  describe('Session Closing', () => {
    const streamerAddress = '0x1234567890abcdef';

    beforeEach(async () => {
      await yellowTok.initialize(mockWalletProvider);
      await new Promise(resolve => setTimeout(resolve, 150));
      await yellowTok.createStreamSession(streamerAddress, 20);
    });

    test('should end session successfully', async () => {
      await yellowTok.sendTip(5, streamerAddress);

      const result = await yellowTok.endStreamSession();

      expect(result.success).toBe(true);
      expect(result.totalSpent).toBe(5);
      expect(result.unusedBalance).toBe(15);
    });

    test('should trigger onSessionClosed event', async () => {
      const onSessionClosed = jest.fn();
      yellowTok.on('onSessionClosed', onSessionClosed);

      await yellowTok.endStreamSession();

      expect(onSessionClosed).toHaveBeenCalled();
    });

    test('should clear active session after closing', async () => {
      await yellowTok.endStreamSession();

      const info = yellowTok.getSessionInfo();
      expect(info).toBeNull();
    });

    test('should throw error when ending non-existent session', async () => {
      await yellowTok.endStreamSession();

      await expect(
        yellowTok.endStreamSession()
      ).rejects.toThrow('No active stream session to end');
    });
  });

  // ============================================================================
  // Event Listener Tests
  // ============================================================================

  describe('Event Listeners', () => {
    test('should register event handlers', () => {
      const handler = jest.fn();

      yellowTok.on('onConnected', handler);
      yellowTok.on('onTipReceived', handler);
      yellowTok.on('onError', handler);

      expect(yellowTok.eventHandlers.onConnected).toBe(handler);
      expect(yellowTok.eventHandlers.onTipReceived).toBe(handler);
      expect(yellowTok.eventHandlers.onError).toBe(handler);
    });

    test('should trigger onTipReceived for streamers', async () => {
      const onTipReceived = jest.fn();
      yellowTok.on('onTipReceived', onTipReceived);

      await yellowTok.initialize(mockWalletProvider);

      // Simulate incoming tip
      yellowTok._handleMessage(JSON.stringify({
        type: 'tip',
        amount: '1000000', // $1 in USDC units
        sender: '0xsenderaddress',
        message: 'Great stream!',
        timestamp: Date.now(),
        commission: '100000' // $0.10 commission
      }));

      expect(onTipReceived).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1.00,
          creatorReceives: 0.90,
          sender: '0xsenderaddress',
          message: 'Great stream!'
        })
      );
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    test('should trigger onError on connection failure', async () => {
      const onError = jest.fn();
      yellowTok.on('onError', onError);

      // Mock WebSocket error
      global.WebSocket = class ErrorWebSocket {
        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Connection failed'));
            }
          }, 50);
        }
        send() { }
        close() { }
      };

      const result = await yellowTok.initialize(mockWalletProvider);

      expect(result.success).toBe(false);
    });

    test('should handle invalid tip amounts', async () => {
      await yellowTok.initialize(mockWalletProvider);
      await new Promise(resolve => setTimeout(resolve, 150));
      await yellowTok.createStreamSession('0x1234567890abcdef', 20);

      await expect(
        yellowTok.sendTip(0, '0x1234567890abcdef')
      ).rejects.toThrow('Tip amount must be greater than 0');

      await expect(
        yellowTok.sendTip(-5, '0x1234567890abcdef')
      ).rejects.toThrow('Tip amount must be greater than 0');
    });
  });

  // ============================================================================
  // Utility Tests
  // ============================================================================

  describe('Utility Methods', () => {
    test('should convert dollars to asset units correctly', () => {
      const units = yellowTok._toAssetUnits(1.50);
      expect(units).toBe(1500000); // 1.50 USDC = 1,500,000 units (6 decimals)
    });

    test('should convert asset units to dollars correctly', () => {
      const dollars = yellowTok._fromAssetUnits(1500000);
      expect(dollars).toBe(1.50);
    });

    test('should handle decimal precision', () => {
      const units = yellowTok._toAssetUnits(0.123456);
      expect(units).toBe(123456);

      const dollars = yellowTok._fromAssetUnits(123456);
      expect(dollars).toBe(0.123456);
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration Tests', () => {
    test('should handle complete viewer flow', async () => {
      const streamerAddress = '0x1234567890abcdef';

      // 1. Initialize
      const initResult = await yellowTok.initialize(mockWalletProvider);
      expect(initResult.success).toBe(true);
      await new Promise(resolve => setTimeout(resolve, 150));

      // 2. Create session
      const sessionResult = await yellowTok.createStreamSession(streamerAddress, 50);
      expect(sessionResult.success).toBe(true);

      // 3. Send multiple tips
      await yellowTok.sendTip(1.00, streamerAddress);
      await yellowTok.sendTip(2.50, streamerAddress);
      await yellowTok.sendTip(5.00, streamerAddress);

      // 4. Check session info
      const info = yellowTok.getSessionInfo();
      expect(info.spent).toBe(8.50);
      expect(info.currentBalance).toBe(41.50);

      // 5. End session
      const endResult = await yellowTok.endStreamSession();
      expect(endResult.totalSpent).toBe(8.50);
      expect(endResult.unusedBalance).toBe(41.50);
    });
  });
});
