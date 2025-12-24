import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import PageTransition from './components/PageTransition';

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
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
      </Routes>
    </AnimatePresence>
  );
}

function Nav() {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-4">
      <Link
        to="/"
        className="px-4 py-2 bg-white/6 border border-white/12 rounded-lg text-sm text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
      >
        Home
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
      <Nav />
      <AppRoutes />
    </BrowserRouter>
  );
}

