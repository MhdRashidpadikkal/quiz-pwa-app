
import React from 'react';
import { motion } from 'framer-motion';

interface HomeScreenProps {
  onStart: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full text-white p-8 text-center"
    >
      <h1 className="text-6xl font-bold mb-4 text-sky-400">QuizGo</h1>
      <p className="text-slate-300 text-lg mb-8">Test your knowledge. Anytime, anywhere.</p>
      <button
        onClick={onStart}
        className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg shadow-sky-500/30 transform hover:scale-105 transition-all duration-300"
      >
        Start Quiz
      </button>
    </motion.div>
  );
};

export default HomeScreen;
