import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ManajemenMurid from "@/pages/admin/ManajemenMurid";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/manajemen-murid" replace />} />
        <Route path="/admin/manajemen-murid" element={<ManajemenMurid />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
