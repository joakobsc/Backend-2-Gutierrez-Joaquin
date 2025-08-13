const API = (url, { method = "GET", body } = {}) =>
  fetch(url, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (r) => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || data.message || "Error");
    return data;
  });

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const show = (el, on = true) => el && (el.style.display = on ? "" : "none");
const text = (el, v = "") => el && (el.textContent = v);

const guestBlock = $("#guestBlock");
const loggedBlock = $("#loggedBlock");
const loginForm = $("#loginForm");
const loginMsg = $("#loginMsg");
const cartIdSpan = $("#cartId");
const btnGoCart = $("#btnGoCart");
const addButtons = $$(".add-to-cart");

function bindAddHandlers(cid) {
  addButtons.forEach((btn) => {
    btn.disabled = false;
    btn.title = "";
    const pid = btn.dataset.pid;
    btn.onclick = async () => {
      try {
        await API(`/api/cart/${cid}/product/${pid}`, { method: "POST" });
        if (window.Swal) {
          Swal.fire({
            icon: "success",
            title: "Agregado al carrito",
            timer: 1200,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        if (window.Swal) {
          Swal.fire({ icon: "error", title: "Error", text: error.message });
        } else {
          alert("Error: " + error.message);
        }
      }
    };
  });
}

function setGuestUI() {
  show(guestBlock, true);
  show(loggedBlock, false);
  addButtons.forEach((b) => {
    b.disabled = true;
    b.title = "Inicia sesión para agregar al carrito";
    b.onclick = null;
  });
}

function setUserUI(user) {
  show(guestBlock, false);
  show(loggedBlock, true);

  const cid = String(user.cart || user.cartId || "");
  text(cartIdSpan, cid);
  if (btnGoCart) btnGoCart.onclick = () => (location.href = `/cart/${cid}`);

  bindAddHandlers(cid);
}

async function refreshSession() {
  try {
    const { payload } = await API("/api/sessions/current");
    setUserUI(payload);
  } catch {
    setGuestUI();
  }
}

// Login submit
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (loginMsg) text(loginMsg, "");
  const body = Object.fromEntries(new FormData(loginForm).entries());
  try {
    await API("/api/sessions/login", { method: "POST", body });
    await refreshSession();
    if (window.__refreshNav) window.__refreshNav(); // refresca navbar (Salir / Mi carrito)
    if (window.Swal) {
      Swal.fire({
        icon: "success",
        title: "Login exitoso",
        timer: 1000,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    if (loginMsg) text(loginMsg, error.message);
  }
});

// Estado inicial
refreshSession();
