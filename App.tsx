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
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed/running as PWA
    const checkStandalone = () => {
      const isInStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isInStandaloneMode);
      console.log('Is Standalone Mode:', isInStandaloneMode);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setInstallPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      console.log('No install prompt available');
      return;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    console.log(`User response to the install prompt: ${outcome}`);
    setInstallPrompt(null);
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
      {/* Show install button only if: prompt available AND not in standalone mode */}
      {installPrompt && !isStandalone && <InstallButton onInstall={handleInstallClick} />}
      
      {/* Debug info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/50 text-white text-xs p-2 rounded">
          <div>Standalone: {isStandalone ? 'Yes' : 'No'}</div>
          <div>Install Prompt: {installPrompt ? 'Available' : 'Not Available'}</div>
        </div>
      )}
    </main>
  );
};

export default App;