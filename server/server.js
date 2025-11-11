require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// ✅ Auth Route
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const complaintRoutes = require("./routes/complaints");
app.use("/api/complaints", complaintRoutes);

// default route
app.get("/", (req, res) => {
  res.send("Rental Portal API Running ✅");
});

// connect DB & start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log("❌ DB Connection Error: ", err));
