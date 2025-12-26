import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SPHERE_NAMES } from '../lib/sphereNames';

export default function Section() {
  const { sphereId } = useParams<{ sphereId: string }>();
  const navigate = useNavigate();

  const sphereName = sphereId ? SPHERE_NAMES[sphereId] || sphereId : 'Unknown';

  const handleBack = () => {
    navigate('/', { state: { from: 'back' } });
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-[#0a0e27]"
      initial={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <div className="text-center space-y-8 max-w-2xl px-8">
        <motion.h1
          className="text-6xl md:text-8xl font-bold text-white uppercase tracking-tighter"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {sphereName}
        </motion.h1>
        <motion.p
          className="text-xl text-gray-400"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Contenu spécifique pour la section {sphereName}
        </motion.p>
        <motion.button
          onClick={handleBack}
          className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Retour
        </motion.button>
      </div>
    </motion.div>
  );
}

