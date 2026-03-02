import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./admin/auth/useAuth";
import AuthGate   from "./admin/auth/AuthGate";
import AdminApp   from "./admin/AdminApp";
import SalesmanApp from "./salesman/SalesmanApp";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin — protected by JWT */}
          <Route path="/admin/*" element={
            <AuthGate>
              <AdminApp />
            </AuthGate>
          }/>

          {/* Salesman — uses encrypted token in URL, NOT plain stallId */}
          <Route path="/salesman/:token" element={<SalesmanApp />} />

          {/* Root → admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
