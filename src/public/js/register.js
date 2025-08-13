(() => {
  const $id = (id) => document.getElementById(id);
  const $ = (sel) => document.querySelector(sel);
  const show = (el) => el && (el.style.display = "");
  const hide = (el) => el && (el.style.display = "none");

  const navCart = $id("navCart");
  const btnLogout = $id("btnLogout");
  const linkRegister = $('a[href="/register"]');

  async function refreshNav() {
    try {
      const r = await fetch("/api/sessions/current", {
        credentials: "include",
      });
      if (!r.ok) throw new Error("no-session");
      const data = await r.json().catch(() => ({}));
      const user = data?.payload || {};
      const cid = String(user.cartId ?? user.cart ?? "");

      // logueado
      show(btnLogout);
      hide(linkRegister);

      if (navCart && cid) {
        show(navCart);
        navCart.href = `/cart/${cid}`;
      } else {
        hide(navCart);
      }
    } catch {
      // invitado
      hide(btnLogout);
      hide(navCart);
      show(linkRegister);
    }
  }

  // para que products.js / home.js puedan refrescar nav post-login
  window.__refreshNav = refreshNav;

  async function doLogout() {
    try {
      await fetch("/api/sessions/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    await refreshNav();
    location.replace("/");
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      doLogout();
    });
  }

  refreshNav();
})();
