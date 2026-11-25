const express = require("express");
const router = express.Router();

router.use("/admin", require("./adminMurid"));
router.use("/auth", require("./authRegisterMurid"));
router.use("/murid", require("./tingkatPendidikan"));

module.exports = router;
