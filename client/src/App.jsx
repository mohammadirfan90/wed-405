import { Routes, Route, Navigate } from 'react-router-dom';
import { Agentation } from 'agentation';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Home from './pages/Home.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import UserHome from './pages/user/UserHome.jsx';
import Packages from './pages/user/Packages.jsx';
import BookPackage from './pages/user/BookPackage.jsx';
import MyBookings from './pages/user/MyBookings.jsx';
import SimplePage from './pages/user/SimplePage.jsx';

import AdminHome from './pages/admin/AdminHome.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import ManagePackages from './pages/admin/ManagePackages.jsx';
import ManageBookings from './pages/admin/ManageBookings.jsx';
import ManagePortfolio from './pages/admin/ManagePortfolio.jsx';
import ManageBlogs from './pages/admin/ManageBlogs.jsx';
import ManageContact from './pages/admin/ManageContact.jsx';
import ManageTestimonials from './pages/admin/ManageTestimonials.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import ManageAdmins from './pages/admin/ManageAdmins.jsx';
import ManageSettings from './pages/admin/ManageSettings.jsx';
import ManageHeroSlides from './pages/admin/ManageHeroSlides.jsx';
import ManageStorySections from './pages/admin/ManageStorySections.jsx';
import ManageVideos from './pages/admin/ManageVideos.jsx';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* User dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="user">
              <UserHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/packages"
          element={
            <ProtectedRoute role="user">
              <Packages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/packages/:id"
          element={
            <ProtectedRoute role="user">
              <BookPackage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bookings"
          element={
            <ProtectedRoute role="user">
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/services"
          element={
            <ProtectedRoute role="user">
              <SimplePage title="Our Services" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/portfolio"
          element={
            <ProtectedRoute role="user">
              <SimplePage title="Portfolio" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/about"
          element={
            <ProtectedRoute role="user">
              <SimplePage title="About Us" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/blogs"
          element={
            <ProtectedRoute role="user">
              <SimplePage title="Blogs" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/contact"
          element={
            <ProtectedRoute role="user">
              <SimplePage title="Contact Us" />
            </ProtectedRoute>
          }
        />

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
          path="/admin/blogs"
          element={
            <ProtectedRoute role="admin">
              <ManageBlogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <ManageUsers />
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
          path="/admin/contact"
          element={
            <ProtectedRoute role="admin">
              <ManageContact />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {process.env.NODE_ENV === "development" && <Agentation />}
    </>
  );
}
