const sequelize = require("../config/sequelize");
const User = require("./user.models");
const Product = require("./product.models");
const CartItem = require("./cart_item.models");

const initDB = async () => {
  // --- Relaciones ---
  User.hasMany(CartItem, { foreignKey: "user_id" });
  CartItem.belongsTo(User, { foreignKey: "user_id" });

  Product.hasMany(CartItem, { foreignKey: "product_id" });
  CartItem.belongsTo(Product, { foreignKey: "product_id" });

  try {
    await sequelize.sync({ alter: true }); // sincroniza DB con cambios
    console.log("✅ Base de datos sincronizada");
  } catch (error) {
    console.error("❌ Error al sincronizar DB:", error);
  }
};

module.exports = { sequelize, User, Product, CartItem, initDB };