(() => {
  const el = (id) => document.getElementById(id);

  async function refreshNav() {
    const navCart = el("navCart");
    const btnLogout = el("btnLogout");
    const linkRegister = document.querySelector('a[href="/register"]');

    try {
      const r = await fetch("/api/sessions/current", {
        credentials: "include",
      });
      if (!r.ok) throw 0;
      const { payload } = await r.json();
      const cid = (payload.cart || payload.cartId || "").toString();

      // mostrar / ocultar según sesión
      if (btnLogout) btnLogout.style.display = "";
      if (linkRegister) linkRegister.style.display = "none"; // ⟵ ocultar "Registrarme" logueado

      if (navCart && cid) {
        navCart.style.display = "";
        navCart.href = `/cart/${cid}`;
      } else if (navCart) {
        navCart.style.display = "none";
      }
    } catch {
      // invitado
      if (btnLogout) btnLogout.style.display = "none";
      if (navCart) navCart.style.display = "none";
      const linkRegister = document.querySelector('a[href="/register"]');
      if (linkRegister) linkRegister.style.display = ""; // ⟵ mostrar "Registrarme" invitado
    }
  }

  // para que products.js/home.js puedan refrescar tras login
  window.__refreshNav = refreshNav;

  async function doLogout() {
    try {
      await fetch("/api/sessions/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}
    await refreshNav();
    location.replace("/");
  }

  const btnLogout = el("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      doLogout();
    });
  }

  refreshNav();
})();
