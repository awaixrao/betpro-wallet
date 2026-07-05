require("dotenv").config();

const express = require("express");
const cors = require("cors");
const betproRoutes = require("./betpro/betpro.routes");

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});

app.use("/api/betpro", betproRoutes);

// Generic fallback error handler (safety net)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error." });
});

module.exports = app;
