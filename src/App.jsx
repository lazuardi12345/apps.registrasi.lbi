// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseCatalogDetailPage from "./pages/CourseCatalogDetailPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ProgramAboutPage from "./pages/ProgramAboutPage";
import PostDetailPage from "./pages/PostDetailPage";
import StudentDashboard from "./pages/StudentDashboard";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import RegistrationPage from "./pages/RegistrationPage";
import LanguageTestRegistrationPage from "./pages/LanguageTestRegistrationPage";
import LanguageTestsPage from "./pages/LanguageTestsPage";
import PaymentConfirmationPage from "./pages/PaymentConfirmationPage";
import "./index.css";

function AppContent() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleOpenAuth = (mode = "login") => {
    navigate(mode === "register" ? "/register" : "/login");
  };

  // Check if current route is the student dashboard
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app">
      {/* Hide public header on dashboard since dashboard has its own specialized topbar */}
      {!isDashboard && !isAuthPage && (
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenAuth={handleOpenAuth}
        />
      )}

      <Routes>
        <Route path="/" element={<HomePage onOpenRegister={() => handleOpenAuth('register')} />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/courses/catalog/:slug" element={<CourseCatalogDetailPage />} />
        <Route path="/id/language-course/:slug" element={<CourseDetailPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/programs/bipa" element={<ProgramAboutPage serviceSlug="program-bipa-129" />} />
        <Route path="/programs/ppb" element={<ProgramAboutPage serviceSlug="program-pelayanan-bahasa-127" />} />
        <Route path="/programs/ppp" element={<ProgramAboutPage serviceSlug="program-penerjemahan-dan-penjurubahasaan-1283" />} />
        <Route path="/posts/:slug" element={<PostDetailPage />} />
        <Route path="/pendaftaran" element={<RegistrationPage />} />
        <Route path="/pendaftaran/ppb" element={<RegistrationPage defaultProgram="ppb" />} />
        <Route path="/pendaftaran/bipa" element={<RegistrationPage defaultProgram="bipa" />} />
        <Route path="/pendaftaran/ppp" element={<RegistrationPage defaultProgram="ppp" />} />
        <Route path="/daftar" element={<RegistrationPage />} />
        <Route path="/daftar/ppb" element={<RegistrationPage defaultProgram="ppb" />} />
        <Route path="/daftar/bipa" element={<RegistrationPage defaultProgram="bipa" />} />
        <Route path="/daftar/ppp" element={<RegistrationPage defaultProgram="ppp" />} />
        <Route path="/pendaftaran-tes" element={<LanguageTestRegistrationPage />} />
        <Route path="/informasi-pendaftaran-tes" element={<LanguageTestsPage />} />
        <Route path="/konfirmasi-pembayaran" element={<PaymentConfirmationPage />} />
        <Route path="/bayar" element={<PaymentConfirmationPage />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>

      {!isDashboard && !isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
