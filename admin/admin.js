/**
 * Admin Centralized Logic
 */

// Initialize when ready
function initAdmin() {
  console.log("Admin JS Initialized");
  checkAuth();
  setupLogout();

  if (window.location.pathname.includes("dashboard.html")) {
    loadDashboardStats();
  }

  if (window.location.pathname.includes("products.html")) {
    loadProducts();
    const addForm = document.getElementById("addProductForm");
    if (addForm) addForm.addEventListener("submit", handleAddProduct);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdmin);
} else {
  initAdmin();
}

function checkAuth() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || user.role !== "admin") {
    console.warn("Unauthorized access detected. Redirecting...");
    window.location.href =
      window.location.origin +
      "/BSIT3B/CamachoVienMabee/Webstore/shop/login.html";
  } else {
    const adminName = document.getElementById("adminName");
    if (adminName) adminName.textContent = user.username;
  }
}

function setupLogout() {
  const logoutBtn =
    document.getElementById("logoutBtn") ||
    document.getElementById("adminLogoutBtn");

  if (logoutBtn) {
    console.log("Logout button found and listener attached.");
    logoutBtn.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to logout?")) {
          console.log("Logging out...");
          localStorage.removeItem("currentUser");
          // Use origin + relative path from root
          window.location.href =
            window.location.origin +
            "/BSIT3B/CamachoVienMabee/Webstore/shop/login.html";
        }
      },
      true
    ); // Use capture phase to prevent interference
  } else {
    console.warn("Logout button NOT found on this page.");
  }
}

function loadDashboardStats() {
  if (!document.getElementById("totalOrders")) return;

  const CART_KEY = "aula-cart-history"; // Assuming orders are stored here based on 'order-tracking.html' pattern or 'aula-orders'
  // Actually, looking at order-tracking, it uses 'aula-orders'.
  const ORDERS_KEY = "aula-orders";
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  const products = 10; // Hardcoded count from HTML for now

  // Total Orders
  document.getElementById("totalOrders").textContent = orders.length;

  // Total Users (customers)
  const customers = users.filter((u) => u.role !== "admin");
  document.getElementById("totalUsers").textContent = customers.length;

  // Total Sales
  const sales = orders.reduce((sum, order) => {
    // order.total is usually a formatted string "₱ 1,234.00" or number
    let val = 0;
    if (typeof order.total === "number") val = order.total;
    else if (typeof order.total === "string") {
      val = parseFloat(order.total.replace(/[^\d.]/g, "")) || 0;
    }
    return sum + val;
  }, 0);

  document.getElementById("totalSales").textContent =
    "₱" + sales.toLocaleString(undefined, { minimumFractionDigits: 2 });

  // Recent Orders Table
  const tbody = document.getElementById("recentOrdersBody");
  if (tbody) {
    const recent = orders.slice(-5).reverse();
    tbody.innerHTML = recent
      .map(
        (o) => `
            <tr>
                <td>${o.id}</td>
                <td>${o.customer?.firstName || "Guest"}</td>
                <td>${new Date(o.date).toLocaleDateString()}</td>
                <td><span class="badge bg-${getStatusColor(o.status)}">${
          o.status
        }</span></td>
                <td>₱${(typeof o.total === "number"
                  ? o.total
                  : parseFloat(o.total?.replace(/[^\d.]/g, ""))
                ).toLocaleString()}</td>
            </tr>
        `
      )
      .join("");
  }
}

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "pending":
      return "warning";
    case "processing":
      return "info";
    case "shipped":
      return "primary";
    case "delivered":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
}

// --- Product Management (API Integration) ---

async function loadProducts() {
  const tbody = document.querySelector("tbody");
  if (!tbody) return; // Only run on pages with a table (products.html)

  try {
    const response = await fetch(`../api/products.php?t=${Date.now()}`);
    const products = await response.json();

    if (products.error) {
      console.error("API Error:", products.error);
      return;
    }

    tbody.innerHTML = products
      .map(
        (p) => `
            <tr>
                <td><img src="${p.image}" alt="${
          p.name
        }" style="width:40px;height:40px;object-fit:cover;border-radius:4px;"></td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>₱${parseFloat(p.price).toLocaleString()}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${
                      p.id
                    })"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `
      )
      .join("");
  } catch (e) {
    console.error("Fetch error:", e);
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center text-danger">Error loading products. Is the database running?</td></tr>';
  }
}

async function handleAddProduct(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  try {
    const response = await fetch("../api/products.php", {
      method: "POST",
      body: formData, // Send FormData directly for file upload
    });
    const result = await response.json();

    if (response.ok) {
      alert("Product Added!");
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addProductModal")
      );
      modal.hide();
      form.reset();
      loadProducts();
    } else {
      alert("Error: " + result.error);
    }
  } catch (e) {
    console.error("Error:", e);
    alert("Failed to connect to server.");
  }
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const response = await fetch(`../api/products.php?id=${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      loadProducts();
    } else {
      alert("Failed to delete product");
    }
  } catch (e) {
    console.error(e);
  }
}

// Initialize Product Page
if (window.location.pathname.includes("products.html")) {
  document.addEventListener("DOMContentLoaded", loadProducts);
  const addForm = document.getElementById("addProductForm");
  if (addForm) addForm.addEventListener("submit", handleAddProduct);
}
