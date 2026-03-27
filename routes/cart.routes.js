const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  removeFromCart,
  checkout
} = require("../controllers/cart.controller");

const authMiddleware = require("../middleware/auth");

// todas protegidas
router.get("/cart", authMiddleware, getCart);
router.post("/cart", authMiddleware, addToCart);
router.delete("/cart/:productId", authMiddleware, removeFromCart);


router.post("/cart/checkout", authMiddleware, checkout);

module.exports = router;