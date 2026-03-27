const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false },
  img: { type: DataTypes.STRING },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
  tableName: "product",
  timestamps: false
});

module.exports = Product;