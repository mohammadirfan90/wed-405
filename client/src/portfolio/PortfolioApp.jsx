import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import PortfolioNavbar from './components/PortfolioNavbar';
import PortfolioFooter from './components/PortfolioFooter';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import PortfolioPage from './pages/PortfolioPage';
import PackagesPage from './pages/PackagesPage';
import BookNowPage from './pages/BookNowPage';
import { getSettings } from './lib/portfolioApi';

/**
 * PortfolioApp — layout shell for /portfolio/*.
 * Provides a top-level <PortfolioNavbar /> + <Outlet /> + <PortfolioFooter />,
 * and loads /api/settings once so footer + booking form share the contact info.
 */
export default function PortfolioApp() {
  const [settings, setSettings] = useState({});
  const location = useLocation();

  useEffect(() => {
    getSettings()
      .then((s) => {
        if (s && typeof s === 'object') setSettings(s);
      })
      .catch(() => {});
  }, []);

  // Reset scroll on every route change so each page lands at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="pf-root pf-paper min-h-screen flex flex-col">
      <PortfolioNavbar />
      <div className="flex-1">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="gallery" element={<PortfolioPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="packages" element={<PackagesPage />} />
          <Route path="book" element={<BookNowPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
      <PortfolioFooter settings={settings} />
    </div>
  );
}
