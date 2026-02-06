/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STREAMER_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
