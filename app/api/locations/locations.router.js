const express = require("express");
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const router = express.Router();

const { getLocation, updateLocation } = require("./locations.controller");

router.get("/locations", authMiddleware, getLocation);
router.put(
  "/locations/update",
  authMiddleware,
  adminMiddleware,
  updateLocation
);

module.exports = router;
