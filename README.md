## M8-5-Portafolio API RestFul+ JWT + postgres

## Descripción

Esta es una API RESTful para un sistema de e-commerce  Go-Art que permite manejar productos, usuarios y carritos de compra. Incluye autenticación con **JWT**, manejo de stock y checkout. El frontend consume esta API y permite realizar todas las operaciones básicas de un carrito de compras.


## Tecnologías utilizadas
- Node.js
- Express
- Sequelize (ORM)
- PostgreSQL
- JWT (JSON Web Tokens)
- Bcrypt (hash de contraseñas)
- Bootstrap (frontend)

## Estructura Proyecto
![Texto alternativo](https://github.com/AlvarezF7/M8-5-portafolio-api-restful-jwt-postgres/blob/main/public/img/estructura-proyecto.png)


## Funcionalidades
- Registro e inicio de sesión de usuarios con JWT.
- Gestión de productos (CRUD) para usuarios autenticados.
- Carrito de compras con cálculo de subtotal, IVA y total.
- Descuento temporal de stock en frontend al agregar al carrito.
- Checkout seguro que actualiza el stock real y vacía el carrito.



## Endpoints
| Método | Ruta                 | Protección | Descripción                                   |
| ------ | -------------------- | ---------- | --------------------------------------------- |
| POST   | /api/auth/register   | No         | Registrar un nuevo usuario                    |
| POST   | /api/auth/login      | No         | Iniciar sesión y recibir token JWT            |
| GET    | /api/products        | No         | Listar todos los productos                    |
| POST   | /api/products        | Sí         | Crear un producto (requiere token)            |
| PUT    | /api/products/:id    | Sí         | Actualizar un producto por ID                 |
| DELETE | /api/products/:id    | Sí         | Eliminar un producto por ID                   |
| GET    | /api/cart            | Sí         | Obtener los productos del carrito del usuario |
| POST   | /api/cart            | Sí         | Agregar producto al carrito                   |
| DELETE | /api/cart/:productId | Sí         | Eliminar producto del carrito por ID          |
| POST   | /api/cart/checkout   | Sí         | Procesar la compra y actualizar stock         |



## Instrucciones de ejecución

1. Clonar el repositorio
2. Crear archivo de entorno:
   - Renombrar `.env_ejemplo` a `.env`
   - Configurar las credenciales de la base de datos PostgreSQL
3. Instalar dependencias: **npm install**.
4. Ejecutar el seeder para poblar la base de datos: **node seeders/product.seed.js**.
5. Iniciar el servidor: **npm start**.
6. Abrir en el navegador: http://localhost:3000



## Notas
- ⚠️ Si no se ejecuta el seeder, la aplicación mostrará productos vacíos.
- Los endpoints que requieren token deben enviarlo en el header Authorization: Bearer <token>.



## Autor
Fernanda Álvarez para curso Fullstack Javascript Sence.
