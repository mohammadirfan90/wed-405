import { Routes, Route, Navigate } from 'react-router-dom';
import { Agentation } from 'agentation';
import Home from './pages/Home.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import AdminHome from './pages/admin/AdminHome.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import ManagePackages from './pages/admin/ManagePackages.jsx';
import ManageBookings from './pages/admin/ManageBookings.jsx';
import ManagePortfolio from './pages/admin/ManagePortfolio.jsx';
import ManageTestimonials from './pages/admin/ManageTestimonials.jsx';
import ManageAdmins from './pages/admin/ManageAdmins.jsx';
import ManageSettings from './pages/admin/ManageSettings.jsx';
import ManageHeroSlides from './pages/admin/ManageHeroSlides.jsx';
import ManageStorySections from './pages/admin/ManageStorySections.jsx';
import ManageVideos from './pages/admin/ManageVideos.jsx';
import PortfolioApp from './portfolio/PortfolioApp.jsx';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin console */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/packages"
          element={
            <ProtectedRoute role="admin">
              <ManagePackages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute role="admin">
              <ManageBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/portfolio"
          element={
            <ProtectedRoute role="admin">
              <ManagePortfolio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/admins"
          element={
            <ProtectedRoute role="admin">
              <ManageAdmins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/testimonials"
          element={
            <ProtectedRoute role="admin">
              <ManageTestimonials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <ManageSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/heroslides"
          element={
            <ProtectedRoute role="admin">
              <ManageHeroSlides />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stories"
          element={
            <ProtectedRoute role="admin">
              <ManageStorySections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/videos"
          element={
            <ProtectedRoute role="admin">
              <ManageVideos />
            </ProtectedRoute>
          }
        />
        {/* Public photography portfolio SPA */}
        <Route path="/portfolio/*" element={<PortfolioApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {process.env.NODE_ENV === "development" && <Agentation />}
    </>
  );
}
