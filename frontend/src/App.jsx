import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NewScan from "./pages/NewScan";
import Reports from "./pages/Reports";
import Chatbot from "./pages/Chatbot";
import Squares from "./components/Squares";

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
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/scan" element={<NewScan />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/chatbot" element={<Chatbot />} />
              </Routes>
            </Layout>
          </Router>
        </div>
      </div>
    </ThemeProvider>
  );
}
