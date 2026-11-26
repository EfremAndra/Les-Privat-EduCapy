const express = require("express");
const router = express.Router();

// Fitur login
const authRoutes = require("./auth");

<<<<<<< HEAD
// Fitur dashboard
const adminRoutes = require("./admin");
const guruRoutes = require("./guru");

// Fitur pengelolaan data murid
const adminMuridRoutes = require("./adminMurid");
const authRegisterMuridRoutes = require("./authRegisterMurid");
const tingkatPendidikanRoutes = require("./tingkatPendidikan");

// Authentication
router.use("/auth", authRoutes);
router.use("/auth", authRegisterMuridRoutes);

// Admin
router.use("/admin", adminMuridRoutes);
router.use("/admin", adminRoutes)const express = require("express");
const router = express.Router();

// Fitur login
const authRoutes = require("./auth");

// Fitur dashboard
const adminRoutes = require("./admin");
const guruRoutes = require("./guru");

// Fitur pengelolaan data murid
const adminMuridRoutes = require("./adminMurid");
const authRegisterMuridRoutes = require("./authRegisterMurid");
const tingkatPendidikanRoutes = require("./tingkatPendidikan");

// Fitur pengelolaan data guru
const adminGuruRoutes = require("./adminGuru");

// Authentication
router.use("/auth", authRoutes);
router.use("/auth", authRegisterMuridRoutes);

// Admin
router.use("/admin", adminMuridRoutes);
router.use("/admin", adminGuruRoutes);
router.use("/admin", adminRoutes);

// Guru
router.use("/guru", guruRoutes);

// Murid
router.use("/murid", tingkatPendidikanRoutes);

module.exports = router;;

// Guru
router.use("/guru", guruRoutes);

// Murid
router.use("/murid", tingkatPendidikanRoutes);

module.exports = router;
=======
// 3.4 Pengelolaan data guru
router.use("/admin", require("./adminGuru"));

module.exports = router;
>>>>>>> origin/feature/3.4-Pengelolaan-Data-Guru/Lance
