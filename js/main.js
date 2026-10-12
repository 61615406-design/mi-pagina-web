const loginTab = document.getElementById("tab-login");
const registerTab = document.getElementById("tab-register");
const loginPanel = document.getElementById("panel-login");
const registerPanel = document.getElementById("panel-register");
const switchCopy = document.querySelector("[data-switch-copy]");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalText = document.getElementById("modal-text");

const STORAGE_KEY = "aventura-users";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function setTab(tab) {
  const isLogin = tab === "login";
  loginTab.classList.toggle("is-active", isLogin);
  registerTab.classList.toggle("is-active", !isLogin);
  loginTab.setAttribute("aria-selected", String(isLogin));
  registerTab.setAttribute("aria-selected", String(!isLogin));
  loginPanel.classList.toggle("is-active", isLogin);
  registerPanel.classList.toggle("is-active", !isLogin);
  loginPanel.hidden = !isLogin;
  registerPanel.hidden = isLogin;

  switchCopy.innerHTML = isLogin
    ? '¿No tienes cuenta? <button type="button" class="link-strong" data-goto="register">Crear cuenta</button>'
    : '¿Ya tienes cuenta? <button type="button" class="link-strong" data-goto="login">Iniciar sesión</button>';
}

function showMessage(form, text, ok = false) {
  const box = form.querySelector("[data-form-message]");
  if (!box) return;
  box.hidden = !text;
  box.textContent = text;
  box.classList.toggle("is-ok", ok);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function markValidity(input, valid) {
  input.classList.toggle("is-invalid", !valid);
}

document.querySelectorAll("[data-tab]").forEach((btn) => {
  btn.addEventListener("click", () => setTab(btn.dataset.tab));
});

document.querySelector(".auth").addEventListener("click", (event) => {
  const target = event.target.closest("[data-goto]");
  if (target) setTab(target.dataset.goto);
});

document.querySelectorAll("[data-toggle-password]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = btn.parentElement.querySelector("input");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.classList.toggle("is-on", show);
    btn.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
  });
});

document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;
  const remember = form.remember.checked;

  const emailOk = isValidEmail(email);
  const passOk = password.length >= 6;
  markValidity(form.email, emailOk);
  markValidity(form.password, passOk);

  if (!emailOk || !passOk) {
    showMessage(form, "Revisa tu correo y que la contraseña tenga al menos 6 caracteres.");
    return;
  }

  const user = getUsers().find((item) => item.email === email && item.password === password);
  if (!user) {
    showMessage(form, "No encontramos esa cuenta. Crea una o verifica tus datos.");
    return;
  }

  if (remember) localStorage.setItem("aventura-session", email);
  else localStorage.removeItem("aventura-session");

  showMessage(form, `Bienvenido, ${user.name}. Tus reservas están listas.`, true);
});

document.getElementById("register-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.name.value.trim();
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;

  const nameOk = name.length >= 2;
  const emailOk = isValidEmail(email);
  const passOk = password.length >= 6;
  markValidity(form.name, nameOk);
  markValidity(form.email, emailOk);
  markValidity(form.password, passOk);

  if (!nameOk || !emailOk || !passOk) {
    showMessage(form, "Completa nombre, un correo válido y una contraseña de 6+ caracteres.");
    return;
  }

  const users = getUsers();
  if (users.some((item) => item.email === email)) {
    showMessage(form, "Ese correo ya está registrado. Inicia sesión.");
    return;
  }

  users.push({ name, email, password });
  saveUsers(users);
  showMessage(form, "Cuenta creada. Ya puedes iniciar sesión.", true);
  setTimeout(() => {
    document.getElementById("login-form").email.value = email;
    setTab("login");
  }, 700);
});

function openModal(title, text) {
  modalTitle.textContent = title;
  modalText.textContent = text;
  modal.hidden = false;
}

modal.querySelector("[data-close-modal]").addEventListener("click", () => {
  modal.hidden = true;
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.hidden = true;
});

document.querySelector("[data-forgot]").addEventListener("click", (event) => {
  event.preventDefault();
  openModal(
    "Recuperar contraseña",
    "En esta demo estática no enviamos correos. En GitHub Pages el acceso se guarda solo en tu navegador."
  );
});

document.querySelectorAll("[data-social]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const network = btn.dataset.social === "google" ? "Google" : "Facebook";
    openModal(
      `Continuar con ${network}`,
      "El diseño incluye estos botones como en la imagen. En GitHub Pages no hay servidor OAuth; usa correo y contraseña locales."
    );
  });
});

document.querySelectorAll('a[href="#terminos"], a[href="#privacidad"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const legal = link.getAttribute("href") === "#terminos" ? "Términos" : "Política de privacidad";
    openModal(legal, `Texto de ejemplo de ${legal} para esta landing estática de reservas.`);
  });
});

const remembered = localStorage.getItem("aventura-session");
if (remembered) {
  document.getElementById("login-form").email.value = remembered;
}
