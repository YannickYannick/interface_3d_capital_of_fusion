import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate('/planets');
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-start pt-20">
      {/* Gradient overlay from left to right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e27] via-[#0a0e27]/95 to-transparent z-10"></div>

      {/* Content overlay on the left */}
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.p
            className="text-lg md:text-xl text-gray-300 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            National dancing school
          </motion.p>

          <motion.p
            className="text-base md:text-lg text-white/80 mb-8 max-w-lg leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Improve your Latin technique in this fast Dance Masterclass! Learn how to feel the music, add style to your movement, and gain a foundation in this dance technique. During the course of the masterclass you will refocus and refine dance technique and broaden your performance skills.
          </motion.p>

          <motion.p
            className="text-sm text-gray-400 mb-8 italic"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Sunday classes will skip Super Bowl Sunday (2/7) and end one week late on 3/14
          </motion.p>

          <motion.button
            onClick={handleEnter}
            size="lg"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Class Schedule →
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
