import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/react-app/pages/Home";
import SplashPage from "@/react-app/pages/Splash";
import LoginPage from "@/react-app/pages/Login";
import AnalyzePage from "@/react-app/pages/Analyze";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/start" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
      </Routes>
    </Router>
  );
}
