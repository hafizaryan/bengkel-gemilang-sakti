import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sparepart from './pages/Sparepart';
import Supplier from './pages/Supplier';
import Customer from './pages/Customer';
import Karyawan from './pages/Karyawan';
import ServiceMotor from './pages/ServiceMotor';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Payroll from './pages/Payroll';
import Reports from './pages/Reports';
import MainLayout from './layouts/MainLayout';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/spareparts" element={<Sparepart />} />
            <Route path="/suppliers" element={<Supplier />} />
            <Route path="/customers" element={<Customer />} />
            <Route path="/employees" element={<Karyawan />} />
            <Route path="/services" element={<ServiceMotor />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/payrolls" element={<Payroll />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
