// testYellowTokService.js
// Test script for YellowTokService in the browser (requires MetaMask)

import YellowTokService from './backend/YellowTokService.js';

(async () => {
    // Replace with a real Ethereum address for testing
    const TEST_STREAMER_ADDRESS = '0x000000000000000000000000000000000000dead';
    const DEPOSIT_AMOUNT = 1; // $1 USDC
    const TIP_AMOUNT = 0.1; // $0.10 USDC

    // Create service instance
    const yellowTok = new YellowTokService();

    // Register event handlers
    yellowTok.on('onConnected', () => console.log('Connected to Yellow Network'));
    yellowTok.on('onSessionCreated', (data) => console.log('Session created:', data));
    yellowTok.on('onTipSent', (data) => console.log('Tip sent:', data));
    yellowTok.on('onTipReceived', (data) => console.log('Tip received:', data));
    yellowTok.on('onSessionClosed', (data) => console.log('Session closed:', data));
    yellowTok.on('onError', (err) => console.error('Error:', err));

    // Initialize with MetaMask
    const result = await yellowTok.initialize(window.ethereum);
    if (!result.success) {
        console.error('Initialization failed:', result.error);
        return;
    }

    // Create a stream session
    const session = await yellowTok.createStreamSession(TEST_STREAMER_ADDRESS, DEPOSIT_AMOUNT);
    console.log('Stream session:', session);

    // Send a tip
    const tip = await yellowTok.sendTip(TIP_AMOUNT, TEST_STREAMER_ADDRESS, 'Test tip!');
    console.log('Tip result:', tip);

    // End the session
    const end = await yellowTok.endStreamSession();
    console.log('Session ended:', end);
})();
