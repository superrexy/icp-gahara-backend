const express = require("express");
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const router = express.Router();

const {
  getOrders,
  getOrder,
  createOrder,
  deleteOrder,
  updateOrder,
  doneOrder,
} = require("./orders.controller");

router.get("/orders", authMiddleware, getOrders);
router.get("/orders/:id", authMiddleware, getOrder);
router.get("/orders/:id/done", authMiddleware, adminMiddleware, doneOrder);
router.post("/orders/create", authMiddleware, createOrder);
router.put("/orders/:id/update", authMiddleware, adminMiddleware, updateOrder);
router.delete(
  "/orders/:id/delete",
  authMiddleware,
  adminMiddleware,
  deleteOrder
);

module.exports = router;
