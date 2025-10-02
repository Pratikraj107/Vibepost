import { useState, useEffect, Suspense, lazy } from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Demo from './components/Demo';
import Benefits from './components/Benefits';
import UseCases from './components/UseCases';
import Pricing from './components/Pricing';
import SocialProof from './components/SocialProof';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (currentPath === '/login') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <Login />
      </Suspense>
    );
  }

  if (currentPath === '/signup') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <Signup />
      </Suspense>
    );
  }

  if (currentPath === '/dashboard') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>}>
        <Dashboard />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Hero />
      <Features />
      <HowItWorks />
      <Demo />
      <Benefits />
      <UseCases />
      <Pricing />
      <SocialProof />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function App() {
  return <Router />;
}

export default App;
