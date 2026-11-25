
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const app = express();
const apiRouter = require("./routes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parsing URL

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.send("Backend EduCapy berjalan!");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
