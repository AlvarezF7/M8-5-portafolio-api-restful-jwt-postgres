const contenedorProductos = document.getElementById("cardMuestra");
const carritoBody = document.getElementById("carritoBody");
const subtotalHTML = document.getElementById("subtotal");
const ivaHTML = document.getElementById("iva");
const totalHTML = document.getElementById("total");
const resumenModalBody = document.getElementById("modalResumenBody");
const btnComprar = document.querySelector("#totalCarrito button");

const btnIniciarSesion = document.getElementById("btnIniciarSesion");
const btnCrearCuenta = document.getElementById("createAcount");
const usuarioLogueadoSpan = document.getElementById("usuarioLogueado");
const btnCerrarSession = document.getElementById("btnCerrarSession");

let productos = [];
let carrito = [];
let subtotal = 0, iva = 0, total = 0;


function formatoPrecio(precio) {
  return "$" + precio.toLocaleString("es-CL");
}


const verificarLogin = () => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (token && username) {
    usuarioLogueadoSpan.textContent = `Hola, ${username}`;
    btnCerrarSession.classList.remove("d-none");
  } else {
    usuarioLogueadoSpan.textContent = "";
    btnCerrarSession.classList.add("d-none");
  }
};
verificarLogin();


const obtenerProductos = async () => {
  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    productos = data;
    mostrarProductos();
  } catch (error) {
    console.error("Error al cargar productos:", error);
    alert("No se pueden cargar productos");
  }
};

const mostrarProductos = () => {
  contenedorProductos.innerHTML = "";
  productos.forEach(prod => {
    const card = document.createElement("div");
    card.className = "cards";
    card.style.width = "16rem";
    card.innerHTML = `
      <img src="${prod.img || './img/default.png'}" class="card-img-top">
      <div class="card-body d-flex flex-column" style="gap:5px">
        <h5 class="card-title">${prod.name}</h5>
        <p class="card-text">${formatoPrecio(prod.price)}</p>
        <p class="card-stock">Stock: ${prod.stock}</p>
        <button class="btn btn-primary mt-auto" id="btnAgregar">Agregar</button>
      </div>
    `;
    const boton = card.querySelector("button");
    boton.addEventListener("click", () => agregarAlCarrito(prod.id, card));
    contenedorProductos.appendChild(card);
  });
};


const agregarAlCarrito = async (id, card) => {
  const token = localStorage.getItem("token");
  if (!token) return alert("Debes iniciar sesión para agregar productos al carrito");

  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ productId: id, quantity: 1 })
    });
    const data = await res.json();

    if (res.ok) {
      const item = carrito.find(p => p.id === id);
      if (item) item.quantity++;
      else {
        const producto = productos.find(p => p.id === id);
        carrito.push({ ...producto, quantity: 1 });
      }

      const productoActual = productos.find(p => p.id === id);
      productoActual.stock = data.stock;
      card.querySelector(".card-stock").textContent = `Stock: ${productoActual.stock}`;

      renderCarrito();
    } else {
      alert(data.error || "No se pudo agregar al carrito");
    }
  } catch (error) {
    console.error(error);
    alert("Error agregando al carrito");
  }
};

const renderCarrito = () => {
  carritoBody.innerHTML = "";
  carrito.forEach(prod => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${prod.name}</td>
      <td><input type="number" min="1" value="${prod.quantity}" style="width:60px"></td>
      <td>${formatoPrecio(prod.price)}</td>
      <td>${formatoPrecio(prod.price * prod.quantity)}</td>
      <td><button class="btn btn-danger btn-sm">X</button></td>
    `;
    // CAMBIAR CANTIDAD
    fila.querySelector("input").addEventListener("change", async e => {
      const nuevaCantidad = parseInt(e.target.value);
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ productId: prod.id, quantity: nuevaCantidad })
        });
        const data = await res.json();
        if (res.ok) {
          prod.quantity = nuevaCantidad;
          prod.stock = data.stock;
          renderCarrito();
        } else {
          alert(data.error || "No se pudo actualizar la cantidad");
          e.target.value = prod.quantity;
        }
      } catch (err) {
        console.error(err);
        e.target.value = prod.quantity;
      }
    });

    // ELIMINAR PRODUCTO
    fila.querySelector("button").addEventListener("click", async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`/api/cart/${prod.id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          carrito = carrito.filter(p => p.id !== prod.id);
          renderCarrito();
        } else {
          const data = await res.json();
          alert(data.error || "No se pudo eliminar el producto");
        }
      } catch (err) {
        console.error(err);
      }
    });

    carritoBody.appendChild(fila);
  });

  calcularTotal();
};


const calcularTotal = () => {
  subtotal = carrito.reduce((acc, p) => acc + p.price * p.quantity, 0);
  iva = Math.round(subtotal * 0.19);
  total = subtotal + iva;

  subtotalHTML.textContent = "Sub-Total: " + formatoPrecio(subtotal);
  ivaHTML.textContent = "IVA 19%: " + formatoPrecio(iva);
  totalHTML.innerHTML = `<strong>Total a Pagar: ${formatoPrecio(total)}</strong>`;
};

// --- CHECKOUT ---
btnComprar.addEventListener("click", async () => {
  if (carrito.length === 0) return alert("El carrito está vacío");
  const token = localStorage.getItem("token");
  if (!token) return alert("Debes iniciar sesión para comprar");

  try {
    const res = await fetch("/api/cart/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ carrito })
    });
    const data = await res.json();
    if (res.ok) {
      resumenModalBody.innerHTML = `
        <p>ID Venta: <strong>${data.id}</strong></p>
        <ul>${data.productos.map(p => `<li>${p.name} x ${p.quantity} = ${formatoPrecio(p.price * p.quantity)}</li>`).join("")}</ul>
        <p>Sub-Total: ${formatoPrecio(subtotal)}</p>
        <p>IVA 19%: ${formatoPrecio(iva)}</p>
        <p><strong>Total: ${formatoPrecio(total)}</strong></p>
      `;
      carrito = [];
      obtenerProductos();
      renderCarrito();
      new bootstrap.Modal(document.getElementById("modalResumen")).show();
    } else alert(data.error || "Error al procesar la compra");
  } catch (error) {
    console.error(error);
    alert("Error al procesar la compra");
  }
});

// --- LOGIN ---
btnIniciarSesion.addEventListener("click", async () => {
  const user = document.getElementById("user").value;
  const password = document.getElementById("password").value;
  if (!user || !password) return alert("Ingrese usuario y contraseña");

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      verificarLogin();
      bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
    } else alert(data.error || "Usuario o contraseña incorrectos");
  } catch (error) {
    console.error(error);
    alert("Error en login");
  }
});

// --- REGISTRO ---
btnCrearCuenta.addEventListener("click", async () => {
  const username = document.getElementById("nameUser").value;
  const password = document.getElementById("createPass").value;
  const email = document.getElementById("email").value;
  if (!username || !password || !email) return alert("Complete todos los campos");

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email })
    });
    const data = await res.json();
    if (res.ok) {
      alert("Cuenta creada, inicie sesión");
      bootstrap.Modal.getInstance(document.getElementById("modalRegistrarse")).hide();
      new bootstrap.Modal(document.getElementById("loginModal")).show();
    } else alert(data.error || "Error al crear cuenta");
  } catch (error) {
    console.error(error);
    alert("Error al registrar usuario");
  }
});

// --- CERRAR SESION ---
btnCerrarSession.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  verificarLogin();
});

// --- INICIALIZACION ---
obtenerProductos();
verificarLogin();