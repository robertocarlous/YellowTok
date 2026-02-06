import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { PRIMARY_CHAIN } from './config/chains'

export const config = createConfig({
  chains: [PRIMARY_CHAIN],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [PRIMARY_CHAIN.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
