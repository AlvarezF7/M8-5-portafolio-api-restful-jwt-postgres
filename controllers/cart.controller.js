const sequelize = require("../config/sequelize");
const { CartItem, Product } = require("../models/index.models");

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const items = await CartItem.findAll({
      where: { user_id: req.userId },
      include: Product
    });

    res.status(200).json(items);
  } catch (error) {
    console.error("Error en getCart:", error);
    res.status(500).json({ error: "Error al obtener carrito" });
  }
};

// POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const existingItem = await CartItem.findOne({
      where: { user_id: req.userId, product_id: productId }
    });

    if (existingItem) {
      const nuevaCantidad = existingItem.quantity + quantity;

      // validar stock REAL
      if (product.stock < nuevaCantidad) {
        return res.status(400).json({ error: "Stock insuficiente" });
      }

      existingItem.quantity = nuevaCantidad;
      await existingItem.save();

    } else {
      // validar stock inicial
      if (product.stock < quantity) {
        return res.status(400).json({ error: "Stock insuficiente" });
      }

      await CartItem.create({
        user_id: req.userId,
        product_id: productId,
        quantity
      });
    }

    res.status(201).json({
      message: "Producto agregado",
       stock: product.stock
    });
    console.log("BODY:", req.body);
  } catch (error) {
    console.error("Error en addToCart:", error);
    res.status(500).json({ error: "Error al agregar al carrito" });
  }
};

// DELETE /api/cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const item = await CartItem.findOne({
      where: { user_id: req.userId, product_id: productId }
    });

    if (!item) {
      return res.status(404).json({ error: "Producto no encontrado en carrito" });
    }

    // para no duplicar stock
    await item.destroy();

    res.status(200).json({ message: "Producto eliminado" });

  } catch (error) {
    console.error("Error en removeFromCart:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

// POST /api/cart/checkout
const checkout = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.userId;

    const cartItems = await CartItem.findAll({
      where: { user_id: userId },
      include: { model: Product, required: true },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!cartItems.length) {
      await t.rollback();
      return res.status(400).json({ error: "Carrito vacío" });
    }

    let productosResponse = [];

    for (const item of cartItems) {
      const product = item.Product;

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }

      // se descuenta stock 
      await product.update(
        { stock: product.stock - item.quantity },
        { transaction: t }
      );

      productosResponse.push({
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal: product.price * item.quantity // 🔥 importante para frontend
      });
    }

    await CartItem.destroy({
      where: { user_id: userId },
      transaction: t
    });

    await t.commit();

    res.status(200).json({
      id: Date.now(),
      productos: productosResponse,
      total: productosResponse.reduce((acc, p) => acc + p.subtotal, 0)
    });

  } catch (error) {
    await t.rollback();
    console.error("Error en checkout:", error);

    res.status(error.message.includes("Stock") ? 409 : 500).json({
      error: error.message
    });
  }
};

module.exports = { getCart, addToCart, removeFromCart, checkout };