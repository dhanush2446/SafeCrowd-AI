import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/landing";
import Home from "./pages/home";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
