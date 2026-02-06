/**
 * YellowTok Service - TypeScript Type Definitions
 * 
 * Use these types for better IDE support and type safety
 */

// ============================================================================
// Configuration Types
// ============================================================================

export interface YellowTokConfig {
    /** ClearNode WebSocket URL */
    clearnodeUrl?: string;
    /** Commission rate for standard streamers (default: 10) */
    standardCommission?: number;
    /** Commission rate for partner streamers (default: 3) */
    partnerCommission?: number;
    /** Default asset to use (default: 'usdc') */
    defaultAsset?: string;
    /** Asset decimal places (default: 6 for USDC) */
    assetDecimals?: number;
  }
  
  // ============================================================================
  // Session Types
  // ============================================================================
  
  export interface StreamSession {
    /** Unique session identifier */
    sessionId: string;
    /** Ethereum address of the streamer */
    streamerAddress: string;
    /** Ethereum address of the viewer */
    viewerAddress: string;
    /** Initial deposit amount in dollars */
    initialDeposit: number;
    /** Current available balance in dollars */
    currentBalance: number;
    /** Total amount spent in this session */
    spent: number;
    /** Commission rate for this session (3 or 10) */
    commissionRate: number;
    /** Whether this is a partner streamer */
    isPartner: boolean;
    /** Session creation timestamp */
    createdAt: number;
    /** Session status */
    status: 'pending' | 'active' | 'closed';
    /** Yellow Network session ID from ClearNode */
    clearnodeSessionId?: string;
    /** Session end timestamp (if closed) */
    closedAt?: number;
    /** Application definition for state channel */
    appDefinition: AppDefinition;
    /** Initial allocations */
    allocations: Allocation[];
  }
  
  export interface AppDefinition {
    /** Protocol identifier */
    protocol: string;
    /** Participant addresses */
    participants: string[];
    /** Voting weights for each participant */
    weights: number[];
    /** Quorum percentage needed for consensus */
    quorum: number;
    /** Challenge period in seconds */
    challenge: number;
    /** Unique nonce */
    nonce: number;
    /** Custom metadata */
    metadata?: {
      sessionType: string;
      commissionRate: number;
      isPartner: boolean;
      streamerId: string;
      viewerId: string;
      timestamp: string;
    };
  }
  
  export interface Allocation {
    /** Participant address */
    participant: string;
    /** Asset identifier (e.g., 'usdc') */
    asset: string;
    /** Amount in asset units (considering decimals) */
    amount: string;
  }
  
  export interface SessionOptions {
    /** Whether the streamer is a partner (3% vs 10% commission) */
    isPartner?: boolean;
    /** Challenge period in seconds (default: 0) */
    challengePeriod?: number;
  }
  
  // ============================================================================
  // Result Types
  // ============================================================================
  
  export interface InitializeResult {
    /** Whether initialization was successful */
    success: boolean;
    /** User's Ethereum address */
    address?: string;
    /** Error message if failed */
    error?: string;
  }
  
  export interface CreateSessionResult {
    /** Whether session creation was successful */
    success: boolean;
    /** Unique session identifier */
    sessionId: string;
    /** Deposit amount in dollars */
    deposit: number;
    /** Commission rate (3 or 10) */
    commissionRate: number;
    /** Full session object */
    session: StreamSession;
  }
  
  export interface SendTipResult {
    /** Whether tip was sent successfully */
    success: boolean;
    /** Tip amount in dollars */
    tipAmount: number;
    /** Commission amount in dollars */
    commission: number;
    /** Amount creator receives after commission */
    creatorReceives: number;
    /** Remaining balance after tip */
    remainingBalance: number;
    /** Total spent in this session */
    totalSpent: number;
  }
  
  export interface EndSessionResult {
    /** Whether session was ended successfully */
    success: boolean;
    /** Session identifier */
    sessionId: string;
    /** Session duration in milliseconds */
    duration: number;
    /** Total amount deposited */
    totalDeposited: number;
    /** Total amount spent */
    totalSpent: number;
    /** Unused balance returned */
    unusedBalance: number;
    /** Commission rate used */
    commissionRate: number;
  }
  
  export interface SpendingLimitCheck {
    /** Whether the tip is allowed */
    allowed: boolean;
    /** Warning flag (true at 90% of limit) */
    warning?: boolean;
    /** Warning or error message */
    message?: string;
    /** Reason for denial */
    reason?: string;
    /** Current amount spent */
    currentSpent?: number;
    /** Spending limit */
    limit?: number;
    /** What total would be after this tip */
    wouldBe?: number;
    /** Percentage of limit used */
    percentUsed: number;
  }
  
  export interface BatchTipResult {
    /** Whether batch operation completed */
    success: boolean;
    /** Total number of tips attempted */
    totalTips: number;
    /** Number of successful tips */
    successfulTips: number;
    /** Total amount of all tips */
    totalAmount: number;
    /** Individual results for each tip */
    results: Array<SendTipResult | { success: false; error: string }>;
  }
  
  // ============================================================================
  // Event Data Types
  // ============================================================================
  
  export interface TipSentEvent {
    /** Tip amount in dollars */
    amount: number;
    /** Tip amount in asset units */
    amountInUnits: number;
    /** Recipient address */
    recipient: string;
    /** Optional message with tip */
    message: string;
    /** Commission amount in dollars */
    commission: number;
    /** Amount creator receives */
    creatorReceives: number;
    /** Remaining balance */
    remainingBalance: number;
    /** Total spent in session */
    totalSpent: number;
  }
  
  export interface TipReceivedEvent {
    /** Tip amount in dollars */
    amount: number;
    /** Commission in dollars */
    commission: number;
    /** Amount you receive after commission */
    creatorReceives: number;
    /** Sender's address */
    sender: string;
    /** Optional message from sender */
    message: string;
    /** Timestamp of the tip */
    timestamp: number;
  }
  
  export interface SessionCreatedEvent {
    /** Session identifier from ClearNode */
    sessionId: string;
    /** Full session object */
    session: StreamSession;
  }
  
  export interface BalanceUpdateEvent {
    /** Updated balance in dollars */
    balance: number;
  }
  
  export interface SessionClosedEvent {
    /** Session identifier */
    sessionId?: string;
    /** Session duration */
    duration?: number;
    /** Total deposited */
    totalDeposited?: number;
    /** Total spent */
    totalSpent?: number;
    /** Unused balance returned */
    unusedBalance?: number;
    /** Commission rate */
    commissionRate?: number;
  }
  
  export interface ErrorEvent {
    /** Error type */
    type: 'initialization_error' 
      | 'connection_error' 
      | 'session_creation_error' 
      | 'tip_error' 
      | 'session_close_error' 
      | 'clearnode_error'
      | 'max_reconnect_attempts';
    /** Error message */
    message: string;
    /** Original error object */
    error?: any;
    /** Additional error details */
    details?: any;
  }
  
  // ============================================================================
  // Event Handler Types
  // ============================================================================
  
  export type ConnectedHandler = () => void;
  export type DisconnectedHandler = () => void;
  export type SessionCreatedHandler = (data: SessionCreatedEvent) => void;
  export type TipSentHandler = (data: TipSentEvent) => void;
  export type TipReceivedHandler = (data: TipReceivedEvent) => void;
  export type BalanceUpdateHandler = (data: BalanceUpdateEvent) => void;
  export type SessionClosedHandler = (data: SessionClosedEvent) => void;
  export type ErrorHandler = (error: ErrorEvent) => void;
  
  export interface EventHandlers {
    onConnected: ConnectedHandler | null;
    onDisconnected: DisconnectedHandler | null;
    onSessionCreated: SessionCreatedHandler | null;
    onTipSent: TipSentHandler | null;
    onTipReceived: TipReceivedHandler | null;
    onBalanceUpdate: BalanceUpdateHandler | null;
    onSessionClosed: SessionClosedHandler | null;
    onError: ErrorHandler | null;
  }
  
  export type EventName = keyof EventHandlers;
  export type EventHandler = 
    | ConnectedHandler 
    | DisconnectedHandler 
    | SessionCreatedHandler 
    | TipSentHandler 
    | TipReceivedHandler 
    | BalanceUpdateHandler 
    | SessionClosedHandler 
    | ErrorHandler;
  
  // ============================================================================
  // Tip Types
  // ============================================================================
  
  export interface TipData {
    /** Tip type identifier */
    type: 'tip';
    /** Session ID */
    sessionId: string;
    /** Tip amount in asset units */
    amount: string;
    /** Recipient address */
    recipient: string;
    /** Sender address */
    sender: string;
    /** Optional message */
    message: string;
    /** Timestamp */
    timestamp: number;
    /** Commission amount in asset units */
    commission: string;
    /** Amount creator receives in asset units */
    creatorReceives: string;
  }
  
  export interface SignedTip extends TipData {
    /** Cryptographic signature */
    signature: string;
  }
  
  export interface BatchTip {
    /** Tip amount in dollars */
    amount: number;
    /** Streamer address */
    streamerAddress: string;
    /** Optional message */
    message?: string;
  }
  
  // ============================================================================
  // Session Info Types
  // ============================================================================
  
  export interface SessionInfo {
    /** Session identifier */
    sessionId: string;
    /** Streamer address */
    streamer: string;
    /** Initial deposit amount */
    initialDeposit: number;
    /** Current available balance */
    currentBalance: number;
    /** Total spent in session */
    spent: number;
    /** Commission rate */
    commissionRate: number;
    /** Partner status */
    isPartner: boolean;
    /** Session status */
    status: 'pending' | 'active' | 'closed';
  }
  
  // ============================================================================
  // Wallet Types
  // ============================================================================
  
  export interface WalletProvider {
    /** Request method for Web3 provider */
    request(args: { method: string; params?: any[] }): Promise<any>;
    /** Event listeners */
    on?(event: string, handler: (...args: any[]) => void): void;
    /** Remove event listener */
    removeListener?(event: string, handler: (...args: any[]) => void): void;
  }
  
  export type MessageSigner = (message: string) => Promise<string>;
  
  // ============================================================================
  // RPC Message Types
  // ============================================================================
  
  export interface RPCMessage {
    /** JSON-RPC version */
    jsonrpc: '2.0';
    /** RPC method */
    method: string;
    /** Method parameters */
    params: any;
    /** Request ID */
    id: number;
  }
  
  export interface RPCResponse {
    /** Response type */
    type: string;
    /** Response data */
    [key: string]: any;
  }
  
  // ============================================================================
  // Main Service Class Type
  // ============================================================================
  
  export default class YellowTokService {
    constructor(config?: YellowTokConfig);
    
    // Connection methods
    initialize(walletProvider: WalletProvider): Promise<InitializeResult>;
    disconnect(): void;
    
    // Session methods
    createStreamSession(
      streamerAddress: string,
      depositAmount: number,
      options?: SessionOptions
    ): Promise<CreateSessionResult>;
    
    endStreamSession(): Promise<EndSessionResult>;
    getSessionInfo(): SessionInfo | null;
    
    // Tipping methods
    sendTip(
      tipAmount: number,
      streamerAddress: string,
      message?: string
    ): Promise<SendTipResult>;
    
    sendTipBatch(tips: BatchTip[]): Promise<BatchTipResult>;
    
    // Utility methods
    checkSpendingLimit(
      tipAmount: number,
      spendingLimit: number
    ): SpendingLimitCheck;
    
    // Event subscription
    on(event: 'onConnected', handler: ConnectedHandler): void;
    on(event: 'onDisconnected', handler: DisconnectedHandler): void;
    on(event: 'onSessionCreated', handler: SessionCreatedHandler): void;
    on(event: 'onTipSent', handler: TipSentHandler): void;
    on(event: 'onTipReceived', handler: TipReceivedHandler): void;
    on(event: 'onBalanceUpdate', handler: BalanceUpdateHandler): void;
    on(event: 'onSessionClosed', handler: SessionClosedHandler): void;
    on(event: 'onError', handler: ErrorHandler): void;
    on(event: EventName, handler: EventHandler): void;
  }
  