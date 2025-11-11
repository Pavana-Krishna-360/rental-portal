const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth"); // ✅ Added import

// REGISTER (Admin or Landlord manual creation, optional)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();
    res.json({ message: "User registered successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Tenant Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "tenant",
      isApproved: false, // landlord approval pending
    });

    await newUser.save();
    res.status(201).json({ message: "Signup successful. Awaiting landlord approval." });
  } catch (err) {
    res.status(500).json({ message: "Server error during signup" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // 🚫 Block unapproved tenants
    if (user.role === "tenant" && !user.isApproved) {
      return res.status(403).json({ message: "Account not yet approved by landlord." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all unapproved tenants (landlord only)
router.get("/unapproved", auth, async (req, res) => {
  if (req.user.role !== "landlord") {
    return res.status(403).json({ message: "Access denied" });
  }
  const unapproved = await User.find({ role: "tenant", isApproved: false });
  res.json(unapproved);
});

// ✅ Approve a tenant (landlord only)
router.put("/approve/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "landlord") {
      return res.status(403).json({ message: "Only landlord can approve tenants" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json({ message: "Tenant approved successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Reject a tenant (landlord only)
router.delete("/reject/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "landlord") {
      return res.status(403).json({ message: "Only landlord can reject tenants" });
    }

    const tenant = await User.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    if (tenant.role !== "tenant") {
      return res.status(400).json({ message: "Can only reject tenant accounts" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Tenant rejected and removed successfully" });
  } catch (err) {
    console.error("Reject tenant error:", err);
    res.status(500).json({ message: "Server error while rejecting tenant" });
  }
});


module.exports = router;

