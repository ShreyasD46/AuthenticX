import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewScan from "./pages/NewScan";
import Reports from "./pages/Reports";
import Chatbot from "./pages/Chatbot";
import Squares from "./components/Squares";
import ReportDetail from "./pages/ReportDetail";

export default function App() {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen">
        {/* Animated squares background */}
        <div className="fixed inset-0 z-0">
          <Squares
            direction="diagonal"
            speed={1}
            borderColor="rgba(59, 130, 246, 0.3)"
            squareSize={60}
            hoverFillColor="rgba(59, 130, 246, 0.2)"
          />
        </div>

        {/* Main app content */}
        <div className="relative z-10">
          <Router>
            <Routes>
              {/* Public full-screen landing page */}
              <Route path="/" element={<Home />} />

              {/* All app pages use the Layout wrapper */}
              <Route path="/services" element={<Layout><Dashboard /></Layout>} />
              <Route path="/scan" element={<Layout><NewScan /></Layout>} />
              <Route path="/reports" element={<Layout><Reports /></Layout>} />
              <Route path="/chatbot" element={<Layout><Chatbot /></Layout>} />
              <Route path="/reports/:id" element={<Layout><ReportDetail /></Layout>} />
            </Routes>
          </Router>
        </div>
      </div>
    </ThemeProvider>
  );
}
