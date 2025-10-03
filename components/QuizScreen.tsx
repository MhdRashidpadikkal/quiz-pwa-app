
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '../types';
import ProgressBar from './ProgressBar';

interface QuizScreenProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  onPrevious,
}) => {
  const cardVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <div className="flex flex-col h-full p-6 text-white w-full max-w-md mx-auto">
      <div className="mb-4">
        <p className="text-sky-400 font-semibold">Question {currentIndex + 1}/{totalQuestions}</p>
        <ProgressBar current={currentIndex + 1} total={totalQuestions} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="flex-grow flex flex-col"
        >
          <h2 className="text-2xl font-bold mb-6 text-slate-100">{question.question}</h2>
          <div className="space-y-4">
            {question.options.map((option) => {
              const isSelected = selectedAnswer === option;
              return (
                <button
                  key={option}
                  onClick={() => onSelectAnswer(option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 font-semibold text-lg
                    ${isSelected
                      ? 'bg-sky-500 border-sky-400 shadow-md shadow-sky-500/20'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-500'
                    }
                  `}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!selectedAnswer}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {currentIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default QuizScreen;
