# YellowTok - Context Definition

## Descripción del Producto

**YellowTok** es una aplicación descentralizada inspirada en TikTok Lives que permite realizar transmisiones en vivo con un sistema de propinas (tips) instantáneas utilizando Yellow Network.

### Características Principales

1. **Pagos Instantáneos**: Utilizando Yellow Network para habilitar el mecanismo de "tap" ininterrumpido sin pop-ups de confirmación de transacción.

2. **Integración ENS**: Los streamers se identifican mediante su ENS name, del cual se extrae:
   - Nombre (ENS name)
   - Avatar (ENS avatar)
   - Descripción (ENS text records)

3. **Experiencia Familiar**: UI/UX basada en TikTok para que los usuarios nuevos "se sientan como en casa".

### Stack Tecnológico

- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS 4
- **Web3**: Wagmi + Viem
- **Routing**: React Router DOM
- **Network**: Base Sepolia (Testnet)

### Paleta de Colores

- **Primary**: Amarillo (#FACC15 - Yellow 400)
- **Background**: Negro profundo (#0A0A0A)
- **Surface**: Gris oscuro (#141414)
- **Surface Light**: Gris medio (#1F1F1F)
- **Accent**: Amarillo brillante (#FDE047 - Yellow 300)
- **Text Primary**: Blanco (#FFFFFF)
- **Text Secondary**: Gris (#A1A1AA)

### Rutas de la Aplicación

| Ruta | Descripción |
|------|-------------|
| `/` | Feed principal con lives (demo: un video del streamer configurado) |
| `/streamer/:ensName` | Página del perfil del streamer con detalles ENS |

### Variables de Entorno

```env
STREAMER_ADDRESS=0x...  # Dirección del streamer para el demo
```

### Flujo de Usuario

1. Usuario entra a `/` y ve el feed de lives
2. Usuario conecta su wallet MetaMask (Base Sepolia)
3. Usuario puede ver el live del streamer
4. Usuario puede navegar al perfil del streamer en `/streamer/:ensName`
5. En el perfil se muestran los detalles del ENS del streamer

### Integración Yellow Network (Futuro)

- Canal de pago state channel entre viewer y streamer
- Tap continuo para enviar micro-tips
- Sin confirmaciones de transacción por cada tip
- Liquidación final on-chain al cerrar el canal

---

*Este documento define el contexto del producto y debe ser consultado como referencia principal.*
