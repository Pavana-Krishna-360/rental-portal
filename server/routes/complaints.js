const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const auth = require("../middleware/auth");

// Create complaint (tenant)
router.post("/", auth, async (req, res) => {
  try {
    const { propertyName, issue } = req.body;

    const complaint = new Complaint({
      tenant: req.user.id,
      propertyName,
      issue,
    });

    await complaint.save();
    res.json({ message: "Complaint submitted ✅", complaint });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get complaints for logged-in tenant
router.get("/my", auth, async (req, res) => {
  const complaints = await Complaint.find({ tenant: req.user.id }).sort({ createdAt: -1 });
  res.json(complaints);
});

// Get all complaints (landlord only)
router.get("/", auth, async (req, res) => {
  if (req.user.role !== "landlord") {
    return res.status(403).json({ message: "Access denied" });
  }

  const complaints = await Complaint.find().populate("tenant", "name email").sort({ createdAt: -1 });
  res.json(complaints);
});

// Update status (landlord only)
router.put("/:id/status", auth, async (req, res) => {
  if (req.user.role !== "landlord") {
    return res.status(403).json({ message: "Only landlord can update status" });
  }

  const { status } = req.body;

  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json({ message: "Status updated ✅", complaint });
});

module.exports = router;
