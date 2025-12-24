import { motion } from 'framer-motion';

export default function About() {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold">About</h1>
        <p className="text-xl text-gray-400">Page à propos avec transitions animées</p>
      </div>
    </motion.div>
  );
}

