import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ManajemenMurid from "@/pages/admin/ManajemenMurid";
import ManajemenGuru from "@/pages/admin/ManajemenGuru";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/manajemen-murid" replace />} />
        <Route path="/admin/manajemen-murid" element={<ManajemenMurid />} />
        <Route path="/admin/manajemen-guru" element={<ManajemenGuru />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
