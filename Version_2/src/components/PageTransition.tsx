import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const isBack = location.state?.from === 'back';

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: isBack ? 0.92 : 1.08,
        filter: 'blur(8px)',
        y: isBack ? -20 : 20
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        filter: 'blur(0px)',
        y: 0
      }}
      exit={{ 
        opacity: 0, 
        scale: 1.08,
        filter: 'blur(8px)',
        y: 20
      }}
      transition={{ 
        duration: isBack ? 0.6 : 0.8,
        ease: 'easeInOut' 
      }}
    >
      {children}
    </motion.div>
  );
}

