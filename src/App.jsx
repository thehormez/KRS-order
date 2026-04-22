import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerPage from "./CustomerPage";
import DashboardPage from "./DashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/customer" replace />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
