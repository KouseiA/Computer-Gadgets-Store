document.addEventListener("DOMContentLoaded", () => {
  console.log("AUTH DEBUG SCRIPT LOADED - V4");
  // alerts removed to avoid annoying user on load, but we will alert on submit

  // --- Elements ---
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const cooldownOverlay = document.getElementById("cooldownOverlay");
  const cooldownTimer = document.getElementById("cooldownTimer");
  const demoBtn = document.getElementById("demoBtn");

  // Register Inputs
  const regUsername = document.getElementById("regUsername");
  const regEmail = document.getElementById("regEmail");
  const regPassword = document.getElementById("regPassword");
  const regBtn = document.getElementById("regBtn");

  // Login Inputs
  const loginUsername = document.getElementById("loginUsername"); // Can be email or user
  const loginPassword = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");
  const loginError = document.getElementById("loginError");

  // Validation Elements
  const criteriaLength = document.getElementById("crit-length");
  const criteriaSymbol = document.getElementById("crit-symbol");
  const criteriaUpper = document.getElementById("crit-upper");
  const criteriaLower = document.getElementById("crit-lower");
  const criteriaNumber = document.getElementById("crit-number");

  // --- State & Constants ---
  const COOLDOWN_DURATION = 3 * 60 * 1000; // 3 minutes in ms
  const MAX_ATTEMPTS = 3;

  // --- Initialization ---
  checkCooldown();

  // --- Demo Login ---
  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      loginUsername.value = "Admin";
      // Note: Enter password manually for security
      // loginPassword.value = "Admin123";
      // Auto login
      // loginBtn.click();
    });
  }

  // --- Tab Switching ---
  tabLogin.addEventListener("click", () => switchTab("login"));
  tabRegister.addEventListener("click", () => switchTab("register"));

  function switchTab(tab) {
    if (tab === "login") {
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      loginForm.classList.add("active");
      registerForm.classList.remove("active");
    } else {
      tabRegister.classList.add("active");
      tabLogin.classList.remove("active");
      registerForm.classList.add("active");
      loginForm.classList.remove("active");
    }
    // Clear errors
    if (loginError) {
      loginError.textContent = "";
      loginError.className = "validation-feedback";
    }
  }

  // --- Password Validation (Registration) ---
  // Regex Patterns
  const reLength = /^.{8,15}$/;
  const reSymbol = /[^A-Za-z0-9]/; // Has special char
  const reUpper = /[A-Z]/;
  const reLower = /[a-z]/;
  const reNumber = /[0-9]/;

  if (regPassword) {
    regPassword.addEventListener("input", validatePassword);
  }

  function validatePassword() {
    if (!regPassword) return false;
    const pass = regPassword.value;
    let valid = true;

    // Check 8-15 Chars
    if (reLength.test(pass)) {
      criteriaLength?.classList.add("pass");
    } else {
      criteriaLength?.classList.remove("pass");
      valid = false;
    }

    // Check Symbol
    if (reSymbol.test(pass)) {
      criteriaSymbol?.classList.add("pass");
    } else {
      criteriaSymbol?.classList.remove("pass");
      valid = false;
    }

    // Check Uppercase
    if (reUpper.test(pass)) {
      criteriaUpper?.classList.add("pass");
    } else {
      criteriaUpper?.classList.remove("pass");
      valid = false;
    }

    // Check Lowercase
    if (reLower.test(pass)) {
      criteriaLower?.classList.add("pass");
    } else {
      criteriaLower?.classList.remove("pass");
      valid = false;
    }

    // Check Number
    if (reNumber.test(pass)) {
      criteriaNumber?.classList.add("pass");
    } else {
      criteriaNumber?.classList.remove("pass");
      valid = false;
    }

    if (regBtn) regBtn.disabled = !valid;
    return valid;
  }

  // --- Registration Logic (Connected to API) ---
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      alert("DEBUG: Submitting Registration to Server..."); // DEBUG ALERT

      if (!validatePassword()) {
        alert("DEBUG: Password validation failed.");
        return;
      }

      const username = regUsername.value.trim();
      const email = regEmail.value.trim();
      const password = regPassword.value;

      try {
        const response = await fetch("../api/users.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, role: "customer" }),
        });

        alert("DEBUG: Server Response Status: " + response.status); // DEBUG ALERT

        const result = await response.json();
        console.log(result);

        if (response.ok) {
          alert("Registration Successful! Please Login.");
          switchTab("login");
          registerForm.reset();
          // Reset validation UI
          [
            criteriaLength,
            criteriaSymbol,
            criteriaUpper,
            criteriaLower,
            criteriaNumber,
          ].forEach((el) => el?.classList.remove("pass"));
        } else {
          alert("Error: " + (result.error || "Registration failed"));
        }
      } catch (err) {
        console.error(err);
        alert("Connection Error: " + err.message);
      }
    });
  }

  // --- Login Logic (Connected to API) ---
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Check Cooldown first
      if (isCooldownActive()) return;

      const userStr = loginUsername.value.trim();
      const pass = loginPassword.value;

      try {
        const response = await fetch("../api/login.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: userStr, password: pass }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Success
          resetAttempts();
          // Set Session
          localStorage.setItem("currentUser", JSON.stringify(result.user));

          alert(`Welcome back, ${result.user.username}!`);

          if (result.user.role === "admin") {
            window.location.href = "../admin/dashboard.html";
          } else {
            window.location.href = "../shop/index.html";
          }
        } else {
          // Failure
          handleLoginFailure(result.error);
        }
      } catch (err) {
        console.error(err);
        alert("Connection Error");
      }
    });
  }

  function handleLoginFailure(msg) {
    let attempts = parseInt(localStorage.getItem("loginAttempts") || "0");
    attempts++;
    localStorage.setItem("loginAttempts", attempts);

    if (attempts >= MAX_ATTEMPTS) {
      startCooldown();
    } else {
      if (loginError) {
        loginError.textContent =
          msg ||
          `Invalid credentials. ${MAX_ATTEMPTS - attempts} attempts remaining.`;
        loginError.classList.add("invalid");
      }
    }
  }

  // --- Cooldown Management ---
  function startCooldown() {
    const endTime = Date.now() + COOLDOWN_DURATION;
    localStorage.setItem("cooldownEnd", endTime);
    checkCooldown();
  }

  function checkCooldown() {
    if (isCooldownActive()) {
      showCooldownUI();
    } else {
      // If cooldown just finished but overlay is showing
      if (cooldownOverlay && cooldownOverlay.classList.contains("active")) {
        resetAttempts();
        hideCooldownUI();
      }
    }
  }

  function isCooldownActive() {
    const end = localStorage.getItem("cooldownEnd");
    if (!end) return false;
    return Date.now() < parseInt(end);
  }

  function showCooldownUI() {
    if (!cooldownOverlay) return;
    cooldownOverlay.classList.add("active");
    if (loginBtn) loginBtn.disabled = true;
    if (loginUsername) loginUsername.disabled = true;
    if (loginPassword) loginPassword.disabled = true;
    if (demoBtn) demoBtn.disabled = true;

    const updateTimer = () => {
      const end = parseInt(localStorage.getItem("cooldownEnd"));
      const remaining = end - Date.now();

      if (remaining <= 0) {
        hideCooldownUI();
        resetAttempts();
        return;
      }

      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      if (cooldownTimer)
        cooldownTimer.textContent = `${m}:${s < 10 ? "0" : ""}${s}`;
      requestAnimationFrame(updateTimer);
    };
    updateTimer();
  }

  function hideCooldownUI() {
    if (!cooldownOverlay) return;
    cooldownOverlay.classList.remove("active");
    if (loginBtn) loginBtn.disabled = false;
    if (loginUsername) loginUsername.disabled = false;
    if (loginPassword) loginPassword.disabled = false;
    if (demoBtn) demoBtn.disabled = false;
    localStorage.removeItem("cooldownEnd");
    if (loginError) loginError.textContent = "";
  }

  function resetAttempts() {
    localStorage.setItem("loginAttempts", "0");
  }
});
