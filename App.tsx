
import React, { useEffect, useReducer, useState } from 'react';
import { quizQuestions } from './data/quizData';
import HomeScreen from './components/HomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import InstallButton from './components/InstallButton';
import { QuizState, QuizAction } from './types';

const initialState: QuizState = {
  status: 'idle',
  questions: [],
  currentIndex: 0,
  answers: [],
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...state,
        status: 'active',
        questions: quizQuestions,
        answers: new Array(quizQuestions.length).fill(null),
      };
    case 'SELECT_ANSWER': {
      const newAnswers = [...state.answers];
      newAnswers[state.currentIndex] = action.payload;
      return {
        ...state,
        answers: newAnswers,
      };
    }
    case 'NEXT_QUESTION':
      if (state.currentIndex < state.questions.length - 1) {
        return { ...state, currentIndex: state.currentIndex + 1 };
      }
      return { ...state, status: 'finished' };
    case 'PREVIOUS_QUESTION':
      if (state.currentIndex > 0) {
        return { ...state, currentIndex: state.currentIndex - 1 };
      }
      return state;
    case 'RESTART_QUIZ':
      return {
        ...initialState,
        status: 'active',
        questions: quizQuestions,
        answers: new Array(quizQuestions.length).fill(null),
      };
    default:
      return state;
  }
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Don't show the prompt if the app is already in standalone mode
      if (!window.matchMedia('(display-mode: standalone)').matches) {
         setInstallPrompt(e);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt && 'prompt' in installPrompt) {
      (installPrompt as any).prompt();
      (installPrompt as any).userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null);
      });
    }
  };

  const calculateScore = () => {
    return state.answers.reduce((score, answer, index) => {
      if (answer === state.questions[index].answer) {
        return score + 1;
      }
      return score;
    }, 0);
  };
  
  const currentQuestion = state.questions[state.currentIndex];

  return (
    <main className="h-screen w-screen bg-slate-900 overflow-hidden">
      {state.status === 'idle' && <HomeScreen onStart={() => dispatch({ type: 'START_QUIZ' })} />}
      {state.status === 'active' && currentQuestion && (
        <QuizScreen
          question={currentQuestion}
          currentIndex={state.currentIndex}
          totalQuestions={state.questions.length}
          selectedAnswer={state.answers[state.currentIndex]}
          onSelectAnswer={(answer) => dispatch({ type: 'SELECT_ANSWER', payload: answer })}
          onNext={() => dispatch({ type: 'NEXT_QUESTION' })}
          onPrevious={() => dispatch({ type: 'PREVIOUS_QUESTION' })}
        />
      )}
      {state.status === 'finished' && (
        <ResultScreen
          score={calculateScore()}
          total={state.questions.length}
          onRestart={() => dispatch({ type: 'RESTART_QUIZ' })}
        />
      )}
      {installPrompt && <InstallButton onInstall={handleInstallClick} />}
    </main>
  );
};

export default App;
