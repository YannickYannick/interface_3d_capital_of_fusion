import { motion } from 'framer-motion';

interface HeroTextProps {
  text?: string;
}

export default function HeroText({ text = 'CApital' }: HeroTextProps) {
  return (
    <motion.div
      className="fixed inset-0 grid place-items-center pointer-events-none z-10 mix-blend-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h1 className="text-[clamp(60px,14vw,220px)] tracking-tighter font-bold uppercase opacity-90">
        {text}
      </h1>
    </motion.div>
  );
}

