import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useAnimation, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Radio, 
  Wallet, 
  Globe, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Activity,
  Play,
  Hexagon,
  ChevronRight,
  BarChart3,
  Users,
  Coins,
  Lock,
  Menu,
  X
} from 'lucide-react';

// --- Color Palette (from context.md) ---
const COLORS = {
  bg: "#0A0A0A",
  surface: "#0f0f0f",
  surfaceLight: "#1F1F1F",
  primary: "#FACC15", // Yellow 400
  accent: "#FDE047",  // Yellow 300
  text: "#FFFFFF",
  textSecondary: "#A1A1AA"
};

// --- 3D BACKGROUND COMPONENT (The "Network") ---
const ParticleNetwork = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const particleCount = 70;
  const connectionDistance = 3.5;

  const [positions, linePositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const linePos = new Float32Array(particleCount * particleCount * 6); // Max possible lines
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return [pos, linePos];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    // Gentle rotation
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02;

    // Pulse effect
    const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.05;
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          attach="material"
          size={0.05}
          color={COLORS.primary}
          transparent
          opacity={0.8}
        />
      </points>
      
      {/* Grid Helper for "Tech" feel */}
      <gridHelper args={[20, 20, COLORS.surfaceLight, COLORS.surface]} position={[0, -5, 0]} rotation={[0, 0, 0]} />
    </group>
  );
};

// --- UI COMPONENTS ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-5 bg-opacity-50 backdrop-blur-xl border-b border-white/5 transition-all duration-300 hover:bg-opacity-80" style={{ backgroundColor: `${COLORS.bg}80` }}>
      <div className="flex items-center gap-2 cursor-pointer group">
        <div className="relative flex items-center justify-center w-8 h-8 transition-transform duration-300 group-hover:rotate-12">
          <div className="absolute inset-0 rounded-full opacity-75 animate-pulse" style={{ backgroundColor: COLORS.primary, boxShadow: '0 0 15px #FACC15' }}></div>
          <div className="relative rounded-full w-8 h-8 flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
            <Play size={14} className="text-black ml-0.5" fill="black" />
          </div>
        </div>
        <span className="text-2xl font-black tracking-tighter text-white">
          Yellow<span style={{ color: COLORS.primary }}>Tok</span>
        </span>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-10 text-sm font-medium tracking-wide" style={{ color: COLORS.textSecondary }}>
        {['Technology', 'Ecosystem', 'Community', 'Developers'].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className="relative group hover:text-white transition-colors duration-300">
            {item}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-4">
        <Link 
          to="/home" 
          className="px-6 py-2.5 text-sm font-bold text-black transition-all duration-300 rounded-full hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:scale-105 active:scale-95" 
          style={{ backgroundColor: COLORS.primary }}
        >
          Launch App
        </Link>
      </div>

      {/* Mobile Toggle */}
      <div className="md:hidden text-white cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-black/95 border-b border-white/10 p-6 flex flex-col gap-4 md:hidden backdrop-blur-xl"
          >
            {['Technology', 'Ecosystem', 'Community', 'Developers'].map((item) => (
              <a key={item} href="#" className="text-white text-lg font-medium" onClick={() => setIsOpen(false)}>{item}</a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <ParticleNetwork />
        </Canvas>
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#0A0A0A] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10 pointer-events-none"></div>

      <motion.div style={{ y: y1, opacity }} className="z-20 max-w-5xl mx-auto text-center px-4 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8 inline-block"
        >
          <div className="px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: COLORS.accent }}>Yellow Network Powered</span>
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-8 leading-[0.9]"
        >
          STREAM <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 drop-shadow-[0_0_25px_rgba(250,204,21,0.3)]">
            WITHOUT LIMITS
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto mb-12 text-lg md:text-xl font-light" 
          style={{ color: COLORS.textSecondary }}
        >
          The world's first live streaming layer powered by instant state channels. 
          <span className="text-white font-normal"> Zero gas. Zero friction. Pure flow.</span>
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link 
            to="/home" 
            className="group relative px-8 py-4 bg-yellow-400 text-black font-black rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(250,204,21,0.4)]"
          >
            <span className="relative flex items-center gap-2 z-10">
              Start Exploring <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <button className="group px-8 py-4 font-bold text-white border border-white/20 rounded-full hover:bg-white/5 transition-all flex items-center gap-2">
            <Play size={16} fill="white" /> Watch Demo
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

const Ticker = () => {
  // Marquee effect text
  return (
    <div className="w-full bg-yellow-400 py-3 overflow-hidden border-y border-black/10">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="flex gap-8 whitespace-nowrap text-black font-black text-xl tracking-widest"
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className="flex items-center gap-2">
            INSTANT SETTLEMENT <Zap size={16} fill="black" /> 
            GASLESS TRANSACTIONS <Zap size={16} fill="black" /> 
            ENS NATIVE <Zap size={16} fill="black" />
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const Stats = () => {
  return (
    <section id="statistics" className="py-24 px-6 relative z-10 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            Network <span style={{ color: COLORS.primary }}>Scale</span>
          </motion.h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: COLORS.textSecondary }}>
            Unprecedented throughput for micro-transactions, enabling real-time creator economies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Tips Per Second", value: "100,000+", icon: Zap, color: "text-yellow-400" },
            { label: "Gas Saved", value: "$2.4M", icon: Coins, color: "text-green-400" },
            { label: "Active Channels", value: "14,205", icon: Activity, color: "text-blue-400" },
            { label: "Uptime", value: "99.99%", icon: ShieldCheck, color: "text-purple-400" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-3xl border border-white/5 flex flex-col justify-between min-h-[200px] hover:border-yellow-500/30 transition-colors group"
              style={{ backgroundColor: COLORS.surface }}
            >
              <div className={`p-3 rounded-2xl bg-white/5 w-fit group-hover:bg-white/10 transition-colors`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div>
                <div className="text-4xl font-black text-white mb-1 tracking-tight">{stat.value}</div>
                <div className="text-sm font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureGrid = () => {
  const features = [
    {
      title: "Payment Channels",
      desc: "Secure state channels between Viewers and Streamers allow for continuous, instant value transfer without hitting the L1 chain.",
      icon: Layers,
      col: "md:col-span-2"
    },
    {
      title: "ENS Integration",
      desc: "No fake accounts. Every streamer is a verified ENS identity.",
      icon: Globe,
      col: "md:col-span-1"
    },
    {
      title: "Final Settlement",
      desc: "When the stream ends, net balances are settled instantly on Base Sepolia.",
      icon: Lock,
      col: "md:col-span-1"
    },
    {
      title: "Seamless UX",
      desc: "A Web2-feeling interface with Web3 superpowers. Connect MetaMask and start tipping in seconds.",
      icon: Wallet,
      col: "md:col-span-2"
    }
  ];

  return (
    <section id="technology" className="py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">How it Works</h2>
            <p className="text-xl" style={{ color: COLORS.textSecondary }}>The Stack</p>
          </div>
          <div className="hidden md:block">
             <ArrowRight size={40} className="text-yellow-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`${f.col} p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-[#141414] to-[#0a0a0a] hover:border-yellow-500/50 transition-all duration-500 group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-32 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-yellow-500/10"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-6 bg-black/50 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <f.icon size={24} style={{ color: COLORS.primary }} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-base leading-relaxed" style={{ color: COLORS.textSecondary }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const InteractiveDemo = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [totalStreamed, setTotalStreamed] = useState(0);
  const springVal = useSpring(0, { stiffness: 100, damping: 20 });
  
  useEffect(() => {
    let interval: any;
    if (isPressed) {
      interval = setInterval(() => {
        setTotalStreamed(prev => {
          const newVal = prev + 0.005;
          springVal.set(newVal);
          return newVal;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPressed, springVal]);

  const displayValue = useTransform(springVal, v => v.toFixed(4));

  return (
    <section id="demo" className="py-32 px-6 relative overflow-hidden bg-[#080808]">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6">Try the <span className="text-yellow-400">Flow</span></h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Hold the button to stream money in real-time. No pop-ups. No Metamask clicks. Just pure interaction.
          </p>
        </div>

        <div className="relative max-w-md mx-auto aspect-[9/16] md:aspect-[3/4] rounded-[3rem] overflow-hidden border-8 border-gray-800 shadow-2xl bg-black">
          {/* Phone Screen Content */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

          {/* UI Overlay */}
          <div className="absolute top-0 w-full p-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
               <span className="text-white text-xs font-bold tracking-widest">LIVE</span>
            </div>
            <div className="flex items-center gap-1 text-white text-xs font-medium bg-black/40 px-2 py-1 rounded-full backdrop-blur-md">
              <Users size={12} /> 12.4k
            </div>
          </div>

          {/* Side Actions */}
          <div className="absolute right-4 bottom-32 flex flex-col gap-4">
            {[1,2,3].map((_,i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 cursor-pointer transition-colors">
                <HeartIcon />
              </div>
            ))}
          </div>

          {/* Interaction Area */}
          <div className="absolute bottom-8 left-0 w-full px-8 flex flex-col items-center">
            <div className="w-full flex justify-between items-end mb-4 text-white px-2">
              <div>
                <div className="font-bold text-sm">alice.eth</div>
                <div className="text-xs text-white/70">Live from Tokyo 🇯🇵</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Streamed</div>
                <div className="font-mono text-xl text-yellow-400 font-bold">
                  <motion.span>{displayValue}</motion.span> ETH
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              onMouseLeave={() => setIsPressed(false)}
              onTouchStart={() => setIsPressed(true)}
              onTouchEnd={() => setIsPressed(false)}
              className="w-full py-4 rounded-2xl font-black text-lg text-black relative overflow-hidden shadow-lg"
            >
              <motion.div 
                className="absolute inset-0 bg-yellow-400"
                animate={isPressed ? { scale: 20, opacity: 0 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              
              <span className="relative z-10 flex items-center justify-center gap-2 mix-blend-difference text-white">
                {isPressed ? 'STREAMING...' : 'HOLD TO TIP'} <Zap size={18} fill="currentColor" />
              </span>
              
              {/* Progress fill */}
              {isPressed && (
                <motion.div 
                  layoutId="activeGlow"
                  className="absolute inset-0 bg-yellow-300 shadow-[0_0_30px_#fde047]"
                  initial={{ x: '-100%' }}
                  animate={{ x: '0%' }}
                  transition={{ duration: 0.1, repeat: Infinity }}
                />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);

const CallToAction = () => {
  return (
    <section className="py-32 px-6 bg-[#FACC15] text-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter">BUILD THE FUTURE</h2>
        <p className="text-xl md:text-2xl font-medium mb-12 max-w-2xl mx-auto opacity-80">
          Join the YellowTok developer ecosystem. Integrate instant streaming payments into your dApp today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-10 py-5 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-900 transition-colors">
            Read Docs
          </button>
          <button className="px-10 py-5 bg-transparent border-2 border-black text-black rounded-full font-bold text-lg hover:bg-black/10 transition-colors">
            Join Discord
          </button>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-20 px-6 border-t border-white/10" style={{ backgroundColor: COLORS.bg }}>
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
            <Play size={14} className="text-black ml-0.5" fill="black" />
          </div>
          <span className="text-2xl font-black text-white">YellowTok</span>
        </div>
        <p className="text-gray-400 max-w-sm mb-8">
          The decentralized streaming layer for the next generation of creator economies. Powered by Yellow Network.
        </p>
        <div className="flex gap-4">
          {['Twitter', 'GitHub', 'Discord'].map(s => (
            <a key={s} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black transition-all">
              <span className="text-xs font-bold">{s[0]}</span>
            </a>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-white font-bold mb-6">Platform</h4>
        <ul className="space-y-4 text-sm text-gray-400">
          {['Live Streaming', 'Tipping', 'ENS Profiles', 'Analytics'].map(i => <li key={i}><a href="#" className="hover:text-yellow-400 transition-colors">{i}</a></li>)}
        </ul>
      </div>
      
      <div>
        <h4 className="text-white font-bold mb-6">Developers</h4>
        <ul className="space-y-4 text-sm text-gray-400">
          {['Documentation', 'SDK', 'GitHub', 'Status'].map(i => <li key={i}><a href="#" className="hover:text-yellow-400 transition-colors">{i}</a></li>)}
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-gray-600 text-sm">
      © 2025 YellowTok. All rights reserved.
    </div>
  </footer>
);

// --- MAIN LANDING PAGE COMPONENT ---

const LandingPage = () => {
  return (
    <div className="min-h-screen font-sans selection:bg-yellow-500/30 selection:text-yellow-200 overflow-x-hidden" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <Stats />
        <FeatureGrid />
        <InteractiveDemo />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;