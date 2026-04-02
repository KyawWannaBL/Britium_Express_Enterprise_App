import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import AppShell from './components/AppShell';

// Placeholder components for your 13 portals
const Dashboard = () => <div class="p-8">Welcome to the Imperial Dashboard</div>;
const Unauthorized = () => <div class="p-8 text-red-600">Access Denied: High Authority Required</div>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="unauthorized" element={<Unauthorized />} />
            {/* Additional 13 portal routes go here */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
