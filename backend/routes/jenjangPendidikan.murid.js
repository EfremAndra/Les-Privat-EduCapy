const express = require("express");
const router = express.Router();
const db = require("../config/db");
// Dipasang di /api/murid (dipakai dropdown Jenjang & Tingkat)

// get method untuk mendapatkan id tingkat pendidikan
router.get("/tingkat-pendidikan", async (req, res) => {
  try {
    const query = "SELECT * FROM tingkat_pendidikan";
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

module.exports = router;
