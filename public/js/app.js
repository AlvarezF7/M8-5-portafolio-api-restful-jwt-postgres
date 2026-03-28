const contenedorProductos = document.getElementById("cardMuestra");
const carritoBody = document.getElementById("carritoBody");
const subtotalHTML = document.getElementById("subtotal");
const ivaHTML = document.getElementById("iva");
const totalHTML = document.getElementById("total");
const resumenModalBody = document.getElementById("modalResumenBody");
const btnComprar = document.getElementById("btnCompra");

const btnIniciarSesion = document.getElementById("btnIniciarSesion");
const btnCrearCuenta = document.getElementById("createAcount");
const usuarioLogueadoSpan = document.getElementById("usuarioLogueado");
const btnCerrarSession = document.getElementById("btnCerrarSession");

// ================= ESTADO =================
let productos = [];
let carrito = [];


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

// ================= PRODUCTOS =================
const obtenerProductos = async () => {
  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    productos = data;
    mostrarProductos();
  } catch (error) {
    console.error(error);
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
    boton.addEventListener("click", () => agregarAlCarrito(prod.id));

    contenedorProductos.appendChild(card);
  });
};

// ================= CARRITO DESDE BACK =================
const obtenerCarrito = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("/api/cart", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 401) {
      alert("Sesión expirada, vuelve a iniciar sesión");
      localStorage.clear();
      verificarLogin();
      return;
    }

    const data = await res.json();

    if (res.ok) {
      carrito = data.map(item => ({
        id: item.product_id,
        name: item.Product.name,
        price: item.Product.price,
        quantity: item.quantity
      }));
      renderCarrito();
    }
  } catch (error) {
    console.error("Error en obtenerCarrito:", error);
  }
};

// ================= AGREGAR =================
const agregarAlCarrito = async (id) => {
  const token = localStorage.getItem("token");
  if (!token) return alert("Debes iniciar sesión");

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
      await obtenerCarrito();
      await obtenerProductos();
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error(error);
  }
};

// ================= RENDER CARRITO =================
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

    fila.querySelector("input").addEventListener("change", async e => {
      const nuevaCantidad = parseInt(e.target.value);
      const diferencia = nuevaCantidad - prod.quantity;

      if (diferencia === 0) return;

      const token = localStorage.getItem("token");

      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: prod.id,
            quantity: diferencia
          })
        });

        if (res.ok) {
          await obtenerCarrito();
          await obtenerProductos();
        } else {
          e.target.value = prod.quantity;
        }
      } catch (error) {
        console.error(error);
      }
    });

    fila.querySelector("button").addEventListener("click", async () => {
      const token = localStorage.getItem("token");

      await fetch(`/api/cart/${prod.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      await obtenerCarrito();
      await obtenerProductos();
    });

    carritoBody.appendChild(fila);
  });

  calcularTotal();
};

// ================= TOTALES =================
const calcularTotal = () => {
  const subtotal = carrito.reduce((acc, p) => acc + p.price * p.quantity, 0);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  subtotalHTML.textContent = "Sub-Total: " + formatoPrecio(subtotal);
  ivaHTML.textContent = "IVA 19%: " + formatoPrecio(iva);
  totalHTML.innerHTML = `<strong>Total a Pagar: ${formatoPrecio(total)}</strong>`;
};

// ================= CHECKOUT =================
btnComprar.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("Debes iniciar sesión");

  try {
    const res = await fetch("/api/cart/checkout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      const subtotal = data.productos.reduce((acc, p) => acc + p.price * p.quantity, 0);
      const iva = Math.round(subtotal * 0.19);
      const total = subtotal + iva;

      resumenModalBody.innerHTML = `
        <p>ID Venta: <strong>${data.id}</strong></p>
        <ul>
          ${data.productos.map(p => `
            <li>${p.name} x ${p.quantity} = ${formatoPrecio(p.price * p.quantity)}</li>
          `).join("")}
        </ul>
        <p>Sub-Total: ${formatoPrecio(subtotal)}</p>
        <p>IVA 19%: ${formatoPrecio(iva)}</p>
        <p><strong>Total: ${formatoPrecio(total)}</strong></p>
      `;

      await obtenerCarrito();
      await obtenerProductos();

      new bootstrap.Modal(document.getElementById("modalResumen")).show();
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error(error);
  }
});

// ================= LOGIN =================
btnIniciarSesion.addEventListener("click", async () => {
  const user = document.getElementById("user").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ username: user, password })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    verificarLogin();
    await obtenerCarrito();
    bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();

    // Limpia inputs después de login exitoso
    document.getElementById("user").value = "";
    document.getElementById("password").value = "";
  } else {
    alert(data.error);
  }
});

// ================= REGISTRO =================
btnCrearCuenta.addEventListener("click", async () => {
  const username = document.getElementById("nameUser").value;
  const password = document.getElementById("createPass").value;
  const email = document.getElementById("email").value;

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ username, password, email })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Cuenta creada");
  } else {
    alert(data.error);
  }
});

// ================= LOGOUT =================
btnCerrarSession.addEventListener("click", () => {
  localStorage.clear();
  carrito = [];
  renderCarrito();
  verificarLogin();

  // Limpiar inputs del modal login
  document.getElementById("user").value = "";
  document.getElementById("password").value = "";

  // Limpiar inputs del modal registro
  document.getElementById("nameUser").value = "";
  document.getElementById("createPass").value = "";
  document.getElementById("email").value = "";

  // Cerrar modales si estuvieran abiertos (opcional)
  const loginModalEl = document.getElementById("loginModal");
  const registerModalEl = document.getElementById("modalRegistrarse");
  bootstrap.Modal.getInstance(loginModalEl)?.hide();
  bootstrap.Modal.getInstance(registerModalEl)?.hide();
});

// ================= LIMPIAR INPUTS AL ABRIR MODALES =================
const loginModalEl = document.getElementById("loginModal");
loginModalEl.addEventListener("show.bs.modal", () => {
  document.getElementById("user").value = "";
  document.getElementById("password").value = "";
});

const registerModalEl = document.getElementById("modalRegistrarse");
registerModalEl.addEventListener("show.bs.modal", () => {
  document.getElementById("nameUser").value = "";
  document.getElementById("createPass").value = "";
  document.getElementById("email").value = "";
});

// ================= INIT =================
obtenerProductos();
obtenerCarrito();
verificarLogin();