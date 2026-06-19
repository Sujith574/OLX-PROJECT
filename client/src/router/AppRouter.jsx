import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Spinner from '../components/ui/Spinner';

// Lazy load pages
const Home = lazy(() => import('../pages/Home'));
const Browse = lazy(() => import('../pages/Browse'));
const ItemDetail = lazy(() => import('../pages/ItemDetail'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const AddListing = lazy(() => import('../pages/AddListing'));
const EditListing = lazy(() => import('../pages/EditListing'));
const Messages = lazy(() => import('../pages/Messages'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('../pages/admin/ManageUsers'));
const ManageListings = lazy(() => import('../pages/admin/ManageListings'));
const ManageCategories = lazy(() => import('../pages/admin/ManageCategories'));
const ManageReports = lazy(() => import('../pages/admin/ManageReports'));
const ManageClaims = lazy(() => import('../pages/admin/ManageClaims'));

// Protected route wrapper
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Admin route wrapper
const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
};

// Guest-only route (redirect if logged in)
const GuestRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-800">
    <Spinner size="lg" />
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Guest-only routes */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route path="/add-listing" element={<AddListing />} />
              <Route path="/edit-listing/:id" element={<EditListing />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:conversationId" element={<Messages />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/listings" element={<ManageListings />} />
              <Route path="/admin/categories" element={<ManageCategories />} />
              <Route path="/admin/reports" element={<ManageReports />} />
              <Route path="/admin/claims" element={<ManageClaims />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
