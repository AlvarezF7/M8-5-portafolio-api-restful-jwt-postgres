const { Product } = require("../models/index.models");

// GET /api/products → listar todos los productos
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error en getProducts:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// POST /api/products → crear producto
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, img } = req.body;
    if (!name || price == null) return res.status(400).json({ error: "Datos incompletos" });

    const product = await Product.create({ name, description, price, stock, img });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error en createProduct:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
};

// PUT /api/products/:id → actualizar producto
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price,stock, img } = req.body;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    await product.update({ name, description, price, stock, img });
    res.status(200).json(product);
  } catch (error) {
    console.error("Error en updateProduct:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// DELETE /api/products/:id → eliminar producto
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    await product.destroy();
    res.status(200).json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error en deleteProduct:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };