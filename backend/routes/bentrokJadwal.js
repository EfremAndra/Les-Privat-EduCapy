const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();
// Dipasang di /api/murid: jadwal guru + booking + cari guru pengganti

// get method untuk jadwal booking berdasarkan id guru
router.get("/jadwal/:id_guru", async (req, res) => {
  const idGuru = req.params.id_guru;
  try {
    // jadwal utama berisikan jadwal kesediaan guru
    const jadwalUtama = `SELECT j.id_jadwal, 
                          j.jam_mulai, 
                          j.jam_selesai, 
                          j.hari_mengajar,
                          jk.tanggal_awal_bersedia,     
                          jk.tanggal_akhir_bersedia
                          FROM jadwal j 
                          JOIN jadwal_kesediaan jk ON jk.id_kesediaan = j.id_kesediaan
                          WHERE jk.id_guru = ?`;
    // array untuk menyimpan data hasil eksekusi query jadwal kesediaan
    const [tersedia] = await db.query(jadwalUtama, [idGuru]);
    // mengambil jadwal yang telah dibooking  oleh murid
    const jadwalBook = `SELECT pi.id_jadwal,
                        j.hari_mengajar,
                        pi.tanggal_mulai,
                        pi.tanggal_selesai,
                        pi.jam_mulai_les, 
                        pi.jam_selesai_les
                        FROM pendaftaran_item pi
                        JOIN jadwal j ON j.id_jadwal=pi.id_jadwal
                        JOIN jadwal_kesediaan jk ON j.id_kesediaan = jk.id_kesediaan
                        WHERE jk.id_guru= ?
                         AND pi.status!='Dibatalkan'
                         AND pi.tanggal_selesai>=CURDATE()`;
    // array untuk menyimpan hasil query jadwal book guru
    const [terbooking] = await db.query(jadwalBook, [idGuru]);
    res.status(200).json({ tersedia, terbooking });
  } catch (err) {
    console.error("gagal mengambil jadwal:", err);
    return res.status(500).json({ error: "gagal mengambil data jadwal" });
  }
});
// post method untuk menyimmpan hasil pendaftaran kelas/les murid
router.post("/booking", verifyToken, async (req, res) => {
  const id_murid = req.user.id_user;
  const { jadwal_list, nama_mapel, tanggal_mulai, tanggal_selesai } = req.body;

  if (
    !jadwal_list ||
    jadwal_list.length === 0 ||
    !nama_mapel ||
    !tanggal_mulai ||
    !tanggal_selesai
  ) {
    return res
      .status(400)
      .json({ message: "Lengkapi semua data pendaftaran!" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [mapelResult] = await connection.query(
      "SELECT id_mapel FROM mata_pelajaran WHERE nama = ?",
      [nama_mapel],
    );
    if (mapelResult.length === 0)
      throw new Error("Mata pelajaran tidak ditemukan.");
    const id_mapel = mapelResult[0].id_mapel;

    const [daftarResult] = await connection.query(
      "INSERT INTO pendaftaran (id_murid) VALUES (?)",
      [id_murid],
    );
    const id_daftar = daftarResult.insertId;
    for (const slot of jadwal_list) {
      await connection.query(
        `INSERT INTO pendaftaran_item (id_daftar, id_jadwal, id_mapel, tanggal_mulai, tanggal_selesai, jam_mulai_les, jam_selesai_les, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Mendatang')`,
        [
          id_daftar,
          slot.id_jadwal,
          id_mapel,
          tanggal_mulai,
          tanggal_selesai,
          slot.jamMulaiSpesifik,
          slot.jamAkhirSpesifik,
        ],
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Berhasil menyimpan ke daftar booking!" });
  } catch (error) {
    await connection.rollback();
    console.error("Error Booking:", error);
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});
// get method untuk mencari guru pengganti ketika tanggal yang dipilih murid melebih kesediaan guru utama
router.get("/cari-pengganti", async (req, res) => {
  // ambil data mapel, hari, jam mulai, jamselesai, serta tanggal kontrak les
  const { mapel, hari, jamMulai, jamSelesai, mulai, selesai } = req.query;

  const query = `
    SELECT 
      u.Id_user AS id, 
      u.nama, 
      j.id_jadwal, 
      j.hari_mengajar,
      j.jam_mulai,
      j.jam_selesai
    FROM user u
    JOIN guru g ON u.Id_user = g.Id_guru
    JOIN keahlian k ON g.Id_guru = k.Id_guru
    JOIN mata_pelajaran mp ON k.Id_mapel = mp.Id_mapel
    JOIN jadwal_kesediaan jk ON jk.id_guru = g.Id_guru
    JOIN jadwal j ON j.id_kesediaan = jk.id_kesediaan
    WHERE mp.nama = ? 
      AND j.hari_mengajar = ?
      AND j.jam_mulai <= ? 
      AND j.jam_selesai >= ?
      AND jk.tanggal_awal_bersedia <= ? 
      AND jk.tanggal_akhir_bersedia >= ?
    GROUP BY u.Id_user
  `;
  try {
    // simpan data yang diisi murid ke array
    const [results] = await db.query(query, [
      mapel,
      hari,
      jamMulai,
      jamSelesai,
      mulai,
      selesai,
    ]);
    res.status(200).json(results);
  } catch (error) {
    console.error("Gagal mengambil guru pengganti kelas:", error);
    return res
      .status(500)
      .json({ error: "Gagal mengambil data guru pengganti" });
  }
});

module.exports = router;
