const express = require("express");
const path = require("path");
require("dotenv").config();

const { initDB } = require("./models/index.models");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rutas
app.use("/api",authRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);


const PORT = process.env.PORT || 3000;
initDB().then(() => app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`)));