const express = require("express");
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const uploadFile = require("../../helpers/upload_file.helpers");
const router = express.Router();

const store = uploadFile.single("car_image");

const {
  createCar,
  deleteCar,
  getCar,
  getCars,
  updateCar,
} = require("./cars.controller");

router.get("/cars", authMiddleware, getCars);
router.get("/cars/:id", authMiddleware, getCar);
router.post("/cars/create", authMiddleware, adminMiddleware, store, createCar);
router.put(
  "/cars/:id/update",
  authMiddleware,
  adminMiddleware,
  store,
  updateCar
);
router.delete("/cars/:id/delete", authMiddleware, adminMiddleware, deleteCar);

module.exports = router;
