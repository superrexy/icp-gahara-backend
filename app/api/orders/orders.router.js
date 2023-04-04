const express = require("express");
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const router = express.Router();

const {
  getOrders,
  getOrder,
  createOrder,
  deleteOrder,
  doneOrder,
  midtransNotification,
  getOrderPayment,
} = require("./orders.controller");

router.get("/orders", authMiddleware, getOrders);
router.get("/orders/:id", authMiddleware, getOrder);
router.get("/orders/:id/payment", authMiddleware, getOrderPayment);
router.get("/orders/:id/done", authMiddleware, adminMiddleware, doneOrder);
router.post("/orders/create", authMiddleware, createOrder);
router.delete(
  "/orders/:id/delete",
  authMiddleware,
  adminMiddleware,
  deleteOrder
);

// Midtrans
router.post("/midtrans/notifications", midtransNotification);

module.exports = router;
