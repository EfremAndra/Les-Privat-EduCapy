const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

// semua endpoint di admin wajib menggunakan token dan role = admin
router.use(verifyToken);
router.use(isAdmin);

// ===== FITUR 3.4: PENGELOLAAN DATA GURU =====
// ----- CREATE GURU (ADMIN) -----
router.post("/guru", async (req, res) => {
  const { nama, email, password, alamat, pendidikan, keahlian } = req.body;

  if (!nama || !email || !password || !alamat || !pendidikan) {
    return res.status(400).json({ message: "Lengkapi data yang diperlukan!" });
  }

  // bikin connection khusus untuk transaction
  const connection = await db.getConnection();

  try {
    // cek datanya udah ada apa belum
    const [existingUser] = await connection.query(
      "SELECT id_user FROM user WHERE email = ?",
      [email],
    );
    if (existingUser.length > 0) {
      await connection.rollback();
      connection.release();
      return res
        .status(409)
        .json({ message: "Email sudah terdaftar di sistem!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.beginTransaction();

    // insert ke table user (role hardcoded, guru)
    const insertUser =
      "INSERT INTO user (nama, role, email, password, alamat) VALUES (?, ?, ?, ?, ?)";
    const [userResult] = await connection.query(insertUser, [
      nama,
      "guru",
      email,
      hashedPassword,
      alamat,
    ]);
    const newUserId = userResult.insertId;

    // insert ke table guru
    const insertGuru = "INSERT INTO guru (id_guru, pendidikan) VALUES (?, ?)";
    await connection.query(insertGuru, [newUserId, pendidikan]);

    // insert ke table keahlian
    if (keahlian && Array.isArray(keahlian) && keahlian.length > 0) {
      const keahlianData = keahlian.map((id_mapel) => [newUserId, id_mapel]);
      const insertKeahlian =
        "INSERT INTO keahlian (id_guru, id_mapel) VALUES ?";
      await connection.query(insertKeahlian, [keahlianData]);
    }

    // commit jika transaction berhasil
    await connection.commit();

    // ambil data user yang baru aja register
    const [userData] = await connection.query(
      `SELECT u.id_user, u.nama, u.email, u.alamat, g.pendidikan
       FROM user u
       JOIN guru g ON u.id_user = g.id_guru
       WHERE u.id_user = ?`,
      [newUserId],
    );

    res.status(201).json({
      message: "Registrasi guru berhasil",
      data: userData[0],
    });
  } catch (err) {
    // kalo ada error cancel semua perubahan
    await connection.rollback();
    console.error("Transaction error: ", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  } finally {
    // kembalikan connection ke pool
    connection.release();
  }
});

// get method untuk mendapat guru terdaftar
router.get("/guru-terdaftar", async (req, res) => {
  try {
    // query mendapatkan data guru berupa id, nama , email, pendidikan, mata pelajaran yang diajar
    const query = `
      SELECT 
        u.id_user AS id,
        u.nama,
        u.email,
        g.pendidikan,
        GROUP_CONCAT(mp.nama SEPARATOR ', ') AS keahlian_mapel
      FROM user u
      JOIN guru g ON u.id_user = g.id_guru
      LEFT JOIN keahlian k ON g.id_guru = k.id_guru
      LEFT JOIN mata_pelajaran mp ON k.id_mapel = mp.id_mapel
      WHERE u.role = 'guru'
      GROUP BY u.id_user, u.nama, u.email, g.pendidikan
    `;

    const [results] = await db.query(query);

    res.status(200).json(results);
  } catch (error) {
    console.error("Gagal mengambil data guru:", error);
    res.status(500).json({ error: "Gagal mengambil data guru dari server" });
  }
});
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

module.exports = router;
