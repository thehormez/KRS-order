import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerPage from "./CustomerPage";
import DashboardPage from "./DashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerPage />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
