
import React from 'react';
import { motion } from 'framer-motion';

interface ResultScreenProps {
  score: number;
  total: number;
  onRestart: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, total, onRestart }) => {
  const percentage = Math.round((score / total) * 100);
  let message = '';
  if (percentage >= 80) message = "Excellent work!";
  else if (percentage >= 50) message = "Not bad, but you can do better!";
  else message = "Better luck next time!";


  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full text-white p-8 text-center"
    >
      <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
      <p className="text-slate-300 text-lg mb-6">{message}</p>
      <div className="bg-slate-800 p-8 rounded-2xl shadow-lg mb-8">
        <p className="text-lg text-slate-400">Your Score</p>
        <p className="text-6xl font-bold text-sky-400 my-2">{score}<span className="text-3xl text-slate-400">/{total}</span></p>
        <p className="text-xl font-semibold text-white">{percentage}%</p>
      </div>

      <button
        onClick={onRestart}
        className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg shadow-sky-500/30 transform hover:scale-105 transition-all duration-300"
      >
        Restart Quiz
      </button>
    </motion.div>
  );
};

export default ResultScreen;
