const express = require("express");
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const uploadFile = require("../../helpers/upload_file.helpers");
const router = express.Router();

const storeMultiple = uploadFile.array("images", 5);

const {
  createCar,
  deleteCar,
  getCar,
  getCars,
  updateCar,
  deleteImageCar,
} = require("./cars.controller");

router.get("/cars", authMiddleware, getCars);

router.get("/cars/:id", authMiddleware, getCar);

router.post(
  "/cars/create",
  authMiddleware,
  adminMiddleware,
  storeMultiple,
  createCar
);

router.put(
  "/cars/:id/update",
  authMiddleware,
  adminMiddleware,
  storeMultiple,
  updateCar
);

router.delete("/cars/:id/delete", authMiddleware, adminMiddleware, deleteCar);

router.delete(
  "/cars/:id/images/:image_id/delete",
  authMiddleware,
  adminMiddleware,
  deleteImageCar
);

module.exports = router;
