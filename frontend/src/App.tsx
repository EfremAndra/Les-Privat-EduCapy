const DashboardLayout = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  return (
    <div className="flex h-screen w-full bg-[#FDFDFD] overflow-hidden">
      <Sidebar isExpanded={isExpanded} />
      <main className="flex-1 overflow-y-auto">
        <UpperMenu onCloseSidebar={() => setIsExpanded(!isExpanded)} />
        <Outlet />
      </main>
    </div>
  );
};












import ManajemenPelajaran from "./pages/admin/ManajemenPelajaran";































































































       <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/MainPage" replace />} />

          {/* murid akses route */}
          <Route element={<MuridRoute />}>
            <Route path="/MainPage" element={<MainPage />} />
            <Route path="/jadwal" element={<Jadwal />} />
            <Route path="/cari-kelas" element={<Kelas />} />
            <Route path="/riwayat-kelas" element={<RiwayatKelas />} />
          </Route>

          {/* guru akses route */}
          <Route element={<TeacherRoute />}>
            <Route path="/guru" element={<DashboardPage />} />
            <Route
              path="/guru/ketersediaan-jadwal"
              element={<KetersediaanPage />}
            />
            <Route
              path="/guru/manajemen-kalender"
              element={<ManajemenKalender />}
            />
            <Route path="/guru/daftar-booking" element={<DaftarBooking />} />
          </Route>

          {/* admin akses route */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/manajemen-murid" element={<ManajemenMurid />} />
            <Route path="/admin/manajemen-guru" element={<ManajemenGuru />} />
            <Route
              path="/admin/manajemen-pelajaran"
              element={<ManajemenPelajaran />}
            />
          </Route>
        </Route>