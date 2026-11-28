const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();
router.use(verifyToken);
// Dipasang di /api/guru (khusus role guru, lihat isGuru di routes/guru.js)

// ----- Get Kalender -----

router.get("/kalender", async (req, res) => {
  const { start_date, end_date } = req.query;
  const id_guru = req.user.id_user;

  if (!start_date || !end_date) {
    return res.status(400).json({
      status: "error",
      message: "Parameter start_date dan end_date (YYYY-MM-DD) wajib diisi!",
    });
  }

  try {
    // query untuk mengambil data sesi yang aktif dan yang ada di dalam rentang
    const getKalender = `
            SELECT 
                pi.id_penditem,
                j.hari_mengajar,
                pi.jam_mulai_les,
                pi.jam_selesai_les,
                mp.nama AS nama_mapel,
                u.nama AS nama_murid,
                pi.status
            FROM pendaftaran_item pi
            JOIN jadwal j ON pi.id_jadwal = j.id_jadwal
            JOIN jadwal_kesediaan jk ON j.id_kesediaan = jk.id_kesediaan
            JOIN mata_pelajaran mp ON pi.id_mapel = mp.id_mapel
            JOIN pendaftaran p ON pi.id_daftar = p.id_daftar
            JOIN user u ON p.id_murid = u.id_user
            WHERE jk.id_guru = ?
              AND pi.tanggal_mulai <= ? 
              AND pi.tanggal_selesai >= ?
            ORDER BY FIELD(j.hari_mengajar, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'), 
                     pi.jam_mulai_les ASC
    `;

    const [jadwalAktif] = await db.query(getKalender, [
      id_guru,
      end_date, // urutan dituker agar start <= end dan end >= start
      start_date,
    ]);

    // kelompokkan berdasarkan hari
    const formattedData = jadwalAktif.reduce((acc, curr) => {
      const hari = curr.hari_mengajar;
      if (!acc[hari]) {
        acc[hari] = [];
      }
      acc[hari].push({
        id_penditem: curr.id_penditem,
        mapel: curr.nama_mapel,
        murid: curr.nama_murid,
        jam_mulai: curr.jam_mulai_les.substring(0, 5), // HH:MM
        jam_selesai: curr.jam_selesai_les.substring(0, 5), // HH:MM
        status: curr.status,
      });
      return acc;
    }, {});

    res.status(200).json({
      status: "success",
      message: "Data kalender berhasil diambil",
      data: formattedData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

module.exports = router;
