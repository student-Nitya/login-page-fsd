const $ = (s) => document.querySelector(s);

// Tabs
const tabSignin = $("#tab-signin");
const tabSignup = $("#tab-signup");
const formSignin = $("#form-signin");
const formSignup = $("#form-signup");
const siMsg = $("#si-msg");
const suMsg = $("#su-msg");

function activate(tab) {
  const isSignin = tab === "signin";
  tabSignin.classList.toggle("active", isSignin);
  tabSignup.classList.toggle("active", !isSignin);
  formSignin.classList.toggle("active", isSignin);
  formSignup.classList.toggle("active", !isSignin);
  siMsg.classList.remove("show", "ok", "err");
  suMsg.classList.remove("show", "ok", "err");
}

tabSignin.addEventListener("click", () => activate("signin"));
tabSignup.addEventListener("click", () => activate("signup"));

async function post(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

// Sign In
formSignin.addEventListener("submit", async (e) => {
  e.preventDefault();
  const identifier = document.getElementById("si-identifier").value.trim();
  const password = document.getElementById("si-password").value;
  const { ok, body } = await post("/login", { identifier, password });
  siMsg.textContent = body.message || (ok ? "Success" : "Failed");
  siMsg.className = `msg show ${ok ? "ok" : "err"}`;
});

// Sign Up
formSignup.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("su-username").value.trim();
  const password = document.getElementById("su-password").value;
  const confirmPassword = document.getElementById("su-confirm").value;
  const email = document.getElementById("su-email").value.trim();
  const phone = document.getElementById("su-phone").value.trim();
  const { ok, body } = await post("/signup", { username, email, phone, password, confirmPassword });
  suMsg.textContent = body.message || (ok ? "Account created" : "Failed");
  suMsg.className = `msg show ${ok ? "ok" : "err"}`;
  if (ok) activate("signin");
});