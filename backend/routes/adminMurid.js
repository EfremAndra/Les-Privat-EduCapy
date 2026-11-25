const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

// semua endpoint di admin wajib menggunakan token dan role = admin
router.use(verifyToken);
router.use(isAdmin);

// ===== FITUR 3.3: PENGELOLAAN DATA MURID =====
router.get("/murid-terdaftar", async (req, res) => {
  try {
    // query untuk mendapatkan data semua akun murid yang terdaftar
    const query = `
        SELECT 
          u.id_user AS id,
          u.nama,
          tp.tingkat,
          tp.jenjang,
          COUNT(pi.id_pendItem) AS jumlah_kelas
        FROM user u
        JOIN murid m ON u.id_user = m.id_murid
        LEFT JOIN tingkat_pendidikan tp ON m.id_pendidikan = tp.id_pendidikan
        LEFT JOIN pendaftaran p ON m.id_murid = p.id_murid
        LEFT JOIN pendaftaran_item pi ON p.id_daftar = pi.id_daftar
        WHERE u.role = 'murid'
        GROUP BY u.id_user, u.nama, tp.tingkat, tp.jenjang
      `;
    const [results] = await db.query(query);

    res.status(200).json(results);
  } catch (error) {
    console.error("Gagal mengambil data murid:", error);
    res.status(500).json({ error: "Gagal mengambil data murid dari server" });
  }
});

module.exports = router;
