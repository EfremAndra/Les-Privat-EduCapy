const express = require("express");
const db = require("../config/db");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();
router.use(verifyToken);
router.use(isAdmin);
// Dipasang di /api/admin (GET & POST /mata-pelajaran: baca/buat jenjang+tingkat)

// get method untuk mata pelajaran yang diajar
router.get("/mata-pelajaran", async (req, res) => {
  try {
    // query untuk mendapatkan mapel yang diajar oleh seluruh guru
    const query = `
      SELECT 
        MIN(mp.id_mapel) AS id, 
        mp.nama,
        tp.jenjang,
        GROUP_CONCAT(DISTINCT u.nama SEPARATOR ', ') AS pengajar
      FROM mata_pelajaran mp
      JOIN tingkat_pendidikan tp ON mp.id_pendidikan = tp.id_pendidikan
      LEFT JOIN keahlian k ON k.id_mapel = mp.id_mapel
      LEFT JOIN guru g ON g.id_guru = k.id_guru
      LEFT JOIN user u ON u.id_user = g.id_guru
      GROUP BY mp.nama, tp.jenjang
    `;

    const [rows] = await db.query(query);

    return res.status(200).json({
      status: "success",
      data: rows,
    });
  } catch (error) {
    console.error("Gagal mengambil data mata pelajaran: ", error);
    res
      .status(500)
      .json({ error: "Gagal mengambil data mata pelajaran dari server" });
  }
});
// post method untuk menyimpan mata pelajaran baru yang ditambahkan admin
router.post("/mata-pelajaran", async (req, res) => {
  const { nama, jenjang, tingkat } = req.body;

  if (!nama || !jenjang || !tingkat) {
    return res.status(400).json({ message: "Lengkapi data yang diperlukan!" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Cari atau pastikan tingkat_pendidikan ada
    let [tpRows] = await connection.query(
      "SELECT id_pendidikan FROM tingkat_pendidikan WHERE jenjang = ? AND tingkat = ?",
      [jenjang, tingkat],
    );

    let idPendidiakan;
    if (tpRows.length === 0) {
      // Jika belum ada, buat baru
      const [insertTp] = await connection.query(
        "INSERT INTO tingkat_pendidikan (jenjang, tingkat) VALUES (?, ?)",
        [jenjang, tingkat],
      );
      idPendidiakan = insertTp.insertId;
    } else {
      idPendidiakan = tpRows[0].id_pendidikan;
    }

    // 2. Cek apakah mata pelajaran dengan nama dan id_pendidikan yang sama sudah ada
    const [existingMapel] = await connection.query(
      "SELECT * FROM mata_pelajaran WHERE nama = ? AND id_pendidikan = ?",
      [nama, idPendidiakan],
    );

    if (existingMapel.length > 0) {
      await connection.rollback();
      return res
        .status(409)
        .json({ message: "Mata Pelajaran untuk tingkat ini sudah ada!" });
    }

    // 3. Insert mata pelajaran
    const insertMapel =
      "INSERT INTO mata_pelajaran (id_pendidikan, nama) VALUES (?, ?)";
    const [mapelResult] = await connection.query(insertMapel, [
      idPendidiakan,
      nama,
    ]);
    const newMapelId = mapelResult.insertId;

    await connection.commit();

    res.status(201).json({
      message: "Mata Pelajaran berhasil didaftarkan",
      data: {
        id: newMapelId,
        nama,
        jenjang,
        tingkat,
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error creating mata pelajaran:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  } finally {
    connection.release();
  }
});

module.exports = router;
