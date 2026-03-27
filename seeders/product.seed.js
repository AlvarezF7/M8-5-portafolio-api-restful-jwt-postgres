//este archivo contiene los productos de Go-Art
const sequelize = require("../config/sequelize");
const { Product } = require("../models/index.models");

const seedProducts = async () => {
  try {
    console.log("⏳ Insertando productos...");

    // Sincroniza la BD
    await sequelize.sync();

    // Limpia la tabla para evitar duplicados
    await Product.destroy({ where: {} });

    // Insertar productos
    await Product.bulkCreate([
      {
        name: "Croquera Bristol",
        description: "Croquera de papel Bristol para dibujo",
        price: 10000,
        stock: 10,
        img: "/img/croquera-bristol.png"
      },
      {
        name: "Destacadores Básicos",
        description: "Set básico de destacadores",
        price: 4000,
        stock: 13,
        img: "/img/destacadores.png"
      },
      {
        name: "Set 12 destacadores",
        description: "Set de 12 destacadores de colores",
        price: 10000,
        stock: 0,
        img: "/img/set-12-destacadores.png"
      },
      {
        name: "Set Tiralineas punta 0.5",
        description: "Tiralíneas de colores punta 0.5",
        price: 3000,
        stock: 13,
        img: "/img/tiralinea-colores.png"
      },
      {
        name: "Estuche basico",
        description: "Estuche básico para útiles",
        price: 3500,
        stock: 34,
        img: "/img/estuche-basico.png"
      },
      {
        name: "Set Marcadores Posca",
        description: "Marcadores tipo Posca para pintura",
        price: 3000,
        stock: 18,
        img: "/img/plumones-posca.png"
      },
      {
        name: "Acuarelas Himi",
        description: "Set de acuarelas Himi",
        price: 11000,
        stock: 22,
        img: "/img/acuarelas.png"
      },
      {
        name: "Pinceles para acrilico",
        description: "Pinceles especiales para pintura acrílica",
        price: 6000,
        stock: 8,
        img: "/img/pinceles.png"
      },
      {
        name: "Set Espatulas metalicas",
        description: "Espátulas metálicas para pintura",
        price: 5000,
        stock: 2,
        img: "/img/set-espatulas.png"
      },
      {
        name: "Set 12 Oleos",
        description: "Set de 12 pinturas al óleo",
        price: 14000,
        stock: 9,
        img: "/img/set-oleo.png"
      },
      {
        name: "Croquera Canson XL",
        description: "Croquera Canson XL reciclada",
        price: 15000,
        stock: 10,
        img: "/img/croquera-recycle.png"
      },
      {
        name: "Croquera para Acuarela",
        description: "Croquera especial para acuarela",
        price: 15000,
        stock: 20,
        img: "/img/croquera-acuarela.png"
      }
    ]);

    console.log("✅ Productos insertados correctamente");
    process.exit();
  } catch (error) {
    console.error("❌ Error al insertar productos:", error);
    process.exit(1);
  }
};

seedProducts();