const express = require("express");
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require("../controllers/product.controller");
const authMiddleware = require("../middleware/auth"); // Opcional: proteger creación/edición/eliminación

// Rutas públicas
router.get("/products", getProducts);

// Rutas protegidas (solo admin o usuario logueado)
router.post("/products", authMiddleware, createProduct);
router.put("/products/:id", authMiddleware, updateProduct);
router.delete("/products/:id", authMiddleware, deleteProduct);

module.exports = router;