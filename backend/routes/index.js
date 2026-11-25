const express = require("express");
const router = express.Router();

router.use("/admin", require("./adminMurid"));
router.use("/auth", require("./authRegisterMurid"));
router.use("/murid", require("./tingkatPendidikan"));

// 3.4 Pengelolaan data guru
router.use("/admin", require("./adminGuru"));

module.exports = router;
