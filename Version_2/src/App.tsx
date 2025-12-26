import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Section from './pages/Section';
import PageTransition from './components/PageTransition';
import YouTubeBackground from './components/YouTubeBackground';

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Landing />
            </PageTransition>
          }
        />
        <Route
          path="/planets"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <About />
            </PageTransition>
          }
        />
        <Route
          path="/projects"
          element={
            <PageTransition>
              <Projects />
            </PageTransition>
          }
        />
        <Route
          path="/section/:sphereId"
          element={
            <PageTransition>
              <Section />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function Nav() {
  const location = useLocation();
  
  // Navigation complète sur la page Landing
  if (location.pathname === '/') {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-white hover:text-gray-300 transition-colors">
              Community
            </Link>
            <Link to="/" className="text-white hover:text-gray-300 transition-colors flex items-center gap-1">
              Home
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <Link to="/" className="text-white hover:text-gray-300 transition-colors flex items-center gap-1">
              About us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <Link to="/" className="text-white hover:text-gray-300 transition-colors flex items-center gap-1">
              Lessons
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <Link to="/" className="text-white hover:text-gray-300 transition-colors flex items-center gap-1">
              Events
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <Link to="/" className="text-white hover:text-gray-300 transition-colors flex items-center gap-1">
              Contacts
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            Register Now
          </button>
        </div>
      </nav>
    );
  }

  // Navigation simplifiée sur les autres pages
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-4">
      <Link
        to="/planets"
        className="px-4 py-2 bg-white/6 border border-white/12 rounded-lg text-sm text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
      >
        Planets
      </Link>
      <Link
        to="/about"
        className="px-4 py-2 bg-white/6 border border-white/12 rounded-lg text-sm text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
      >
        About
      </Link>
      <Link
        to="/projects"
        className="px-4 py-2 bg-white/6 border border-white/12 rounded-lg text-sm text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
      >
        Projects
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Vidéo YouTube en arrière-plan - persiste sur toutes les pages */}
      <YouTubeBackground videoId="Dqg0oKlXpTE" />
      <Nav />
      <AppRoutes />
    </BrowserRouter>
  );
}

