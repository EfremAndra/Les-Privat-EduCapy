const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("./config/db");
const app = express();
const apiRouter = require("./routes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.get("/api/health", (req, res) => {
  res.json({ message: "Backend EduCapy berjalan!" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
