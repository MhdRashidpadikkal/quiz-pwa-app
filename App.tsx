import React, { useEffect, useReducer, useState } from 'react';
import { quizQuestions } from './data/quizData';
import HomeScreen from './components/HomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import InstallScreen from './components/InstallScreen';
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
  const [showInstallScreen, setShowInstallScreen] = useState(false);
  const [installSkipped, setInstallSkipped] = useState(false);

  useEffect(() => {
    // Check if app is already installed/running as PWA
    const checkStandalone = () => {
      const isInStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isInStandaloneMode);
      console.log('[App] Is Standalone Mode:', isInStandaloneMode);

      // Check if user previously skipped install
      const skipped = localStorage.getItem('installSkipped') === 'true';
      setInstallSkipped(skipped);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[App] beforeinstallprompt event fired');
      e.preventDefault();
      setInstallPrompt(e);
      
      // Show install screen if not standalone and not skipped
      if (!isStandalone && !localStorage.getItem('installSkipped')) {
        setShowInstallScreen(true);
      }
    };

    const handleAppInstalled = () => {
      console.log('[App] PWA was installed successfully');
      setInstallPrompt(null);
      setIsStandalone(true);
      setShowInstallScreen(false);
      localStorage.removeItem('installSkipped');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      console.log('[App] No install prompt available');
      alert('Installation is not available on this device/browser. Try using Chrome or Edge on Android/Desktop.');
      return;
    }

    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      console.log(`[App] User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('[App] User accepted the install prompt');
        setShowInstallScreen(false);
      } else {
        console.log('[App] User dismissed the install prompt');
      }
      
      setInstallPrompt(null);
    } catch (error) {
      console.error('[App] Install prompt error:', error);
    }
  };

  const handleSkipInstall = () => {
    console.log('[App] User skipped installation');
    setShowInstallScreen(false);
    setInstallSkipped(true);
    // Remember that user skipped (expires in 7 days)
    localStorage.setItem('installSkipped', 'true');
    localStorage.setItem('installSkippedDate', Date.now().toString());
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

  // Show install screen if prompt available and not installed/skipped
  if (showInstallScreen && installPrompt && !isStandalone) {
    return (
      <InstallScreen 
        onInstall={handleInstallClick} 
        onSkip={handleSkipInstall}
      />
    );
  }

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
    </main>
  );
};

export default App;