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

const $id = (id) => document.getElementById(id);
const show = (el, on = true) => el && (el.style.display = on ? "" : "none");
const text = (el, v = "") => el && (el.textContent = v);
const html = (el, v = "") => el && (el.innerHTML = v);
const href = (el, v) => el && (el.href = v);

async function refreshUI() {
  const navCart = $id("navCart");
  const btnLogout = $id("btnLogout");
  const boxLogin = $id("boxLogin");
  const boxLogged = $id("boxLogged");
  const loginMsg = $id("loginMsg");
  const uName = $id("uName");
  const uEmail = $id("uEmail");
  const uRole = $id("uRole");
  const uCart = $id("uCart");
  const uCartWrap = $id("uCartWrap");
  const btnGoCart = $id("btnGoCart");
  const welcome = $id("welcome-message");
  const linkRegister = document.querySelector('a[href="/register"]');

  try {
    const { payload: user } = await API("/api/sessions/current");

    // Estado logueado
    show(boxLogin, false);
    show(boxLogged, true);
    show(btnLogout, true);
    if (linkRegister) show(linkRegister, false);
    if (loginMsg) text(loginMsg, "");

    text(uName, user.first_name || "");
    text(uEmail, user.email || "");
    text(uRole, user.role || "user");
    if (welcome)
      html(welcome, `<h2>¡Bienvenido, ${user.first_name || user.email}!</h2>`);

    const cid = String(user.cart || user.cartId || "");
    const hasCart = Boolean(cid);

    if (hasCart) {
      text(uCart, cid);
      show(uCartWrap, true);
      if (navCart) {
        show(navCart, true);
        href(navCart, `/cart/${cid}`);
      }
      if (btnGoCart) {
        show(btnGoCart, true);
        href(btnGoCart, `/cart/${cid}`);
      }
    } else {
      show(uCartWrap, false);
      show(navCart, false);
      show(btnGoCart, false);
    }
  } catch {
    // Invitado
    show(boxLogged, false);
    show(boxLogin, true);
    show(btnLogout, false);
    show(navCart, false);
    if (welcome) text(welcome, "");
    if (linkRegister) show(linkRegister, true);
  }
}

// Login
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const loginMsg = $id("loginMsg");
  if (loginMsg) text(loginMsg, "");
  const body = Object.fromEntries(new FormData(e.currentTarget).entries());
  try {
    await API("/api/sessions/login", { method: "POST", body });
    await refreshUI();
    if (window.__refreshNav) window.__refreshNav(); // refresca navbar global si existe
  } catch (error) {
    if (loginMsg) text(loginMsg, error.message);
  }
});

// Logout (POST)
$id("btnLogout")?.addEventListener("click", async () => {
  try {
    await API("/api/sessions/logout", { method: "POST" });
  } catch {}
  await refreshUI();
  if (window.__refreshNav) window.__refreshNav();
});

// Estado inicial
refreshUI();
