import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NewScan from "./pages/NewScan";
import Reports from "./pages/Reports";
import Chatbot from "./pages/Chatbot";

export default function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
