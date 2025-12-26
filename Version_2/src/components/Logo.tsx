import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-10 mix-blend-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{ paddingTop: '10vh' }}
    >
      <img
        src="/LOGO_CAPITAL_OF_FUSION.png"
        alt="Capital of Fusion"
        className="w-auto"
        style={{ height: 'clamp(400px, 40vw, 800px)' }}
      />
    </motion.div>
  );
}

