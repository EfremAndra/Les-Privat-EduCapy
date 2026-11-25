const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const router = express.Router();

// secret key untuk JWT
const JWT_SECRET = process.env.JWT_SECRET;

// ----- LOGIN USER -----
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan Password harus diisi!" });
  }

  try {
    const [users] = await db.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Email atau password salah!" });
    }

    const user = users[0];

    if (user.role !== role) {
      return res.status(401).json({
        message: `Anda tidak memiliki hak untuk masuk sebagai ${role}!`,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email atau password salah!" });
    }

    const token = jwt.sign(
      { id_user: user.id_user, role: user.role, nama: user.nama },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(200).json({
      message: "Login berhasil",
      token: token,
      data: {
        id_user: user.id_user,
        nama: user.nama,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

module.exports = router;
