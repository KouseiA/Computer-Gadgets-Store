document.addEventListener('DOMContentLoaded', () => {
    loadStock();
    loadLogs();
    loadSuppliers();
    loadCategories();

    // Event Listeners for Forms
    document.getElementById('stockForm').addEventListener('submit', handleStockAdjustment);
    document.getElementById('addSupplierForm').addEventListener('submit', handleAddSupplier);
    document.getElementById('addCategoryForm').addEventListener('submit', handleAddCategory);
});

// --- STOCK MANAGEMENT ---

async function loadStock() {
    const tbody = document.getElementById('stockTableBody');
    try {
        const response = await fetch(`../api/products.php?t=${Date.now()}`);
        const products = await response.json();

        if (products.error || !Array.isArray(products)) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error loading products</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>
                    <span class="badge ${p.stock < 10 ? 'bg-danger' : 'bg-success'}">${p.stock}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-success" onclick="openStockModal(${p.id}, '${p.name}', 'IN')">
                        <i class="fas fa-plus"></i> In
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="openStockModal(${p.id}, '${p.name}', 'OUT')">
                        <i class="fas fa-minus"></i> Out
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Connection Failed</td></tr>';
    }
}

window.openStockModal = (id, name, type) => {
    document.getElementById('stockProductId').value = id;
    document.getElementById('stockType').value = type;
    document.getElementById('stockProductName').textContent = `${type === 'IN' ? 'Stock In' : 'Stock Out'}: ${name}`;
    document.getElementById('stockModalTitle').textContent = type === 'IN' ? 'Add Stock' : 'Reduce Stock';
    new bootstrap.Modal(document.getElementById('stockModal')).show();
};

async function handleStockAdjustment(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('../api/inventory.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.ok) {
            alert('Stock Updated!');
            bootstrap.Modal.getInstance(document.getElementById('stockModal')).hide();
            e.target.reset();
            loadStock();
            loadLogs();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (e) {
        console.error(e);
        alert('Failed to update stock');
    }
}

async function loadLogs() {
    const list = document.getElementById('stockLogsList');
    try {
        const response = await fetch('../api/inventory.php');
        const logs = await response.json();

        if (!Array.isArray(logs) || logs.length === 0) {
            list.innerHTML = '<li class="list-group-item text-center text-muted">No logs found.</li>';
            return;
        }

        list.innerHTML = logs.map(log => `
            <li class="list-group-item bg-transparent text-white border-secondary">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="fw-bold text-primary">
                        <i class="fas fa-box me-2"></i>${log.product_name}
                    </div>
                    <span class="badge ${log.type === 'IN' ? 'bg-success' : 'bg-danger'} rounded-pill">
                        <i class="fas fa-${log.type === 'IN' ? 'arrow-down' : 'arrow-up'} me-1"></i>
                        ${log.type} ${log.quantity}
                    </span>
                </div>
                <div class="row small">
                    <div class="col-8 text-white-50">
                        <i class="fas fa-sticky-note me-1"></i> ${log.reason || 'No specific reason provided'}
                    </div>
                    <div class="col-4 text-end text-white-50">
                        ${new Date(log.created_at).toLocaleDateString()}
                        <br>
                        ${new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </li>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

// --- SUPPLIERS ---

async function loadSuppliers() {
    const tbody = document.getElementById('suppliersTableBody');
    try {
        const response = await fetch('../api/suppliers.php');
        const suppliers = await response.json();

        if (!Array.isArray(suppliers) || suppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No suppliers found.</td></tr>';
            return;
        }

        tbody.innerHTML = suppliers.map(s => `
            <tr>
                <td>${s.name}</td>
                <td>${s.contact_person || '-'}</td>
                <td>${s.email || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSupplier(${s.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

async function handleAddSupplier(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    try {
        const response = await fetch('../api/suppliers.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Supplier Added');
            bootstrap.Modal.getInstance(document.getElementById('addSupplierModal')).hide();
            e.target.reset();
            loadSuppliers();
        }
    } catch (e) {
        console.error(e);
    }
}

window.deleteSupplier = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    await fetch(`../api/suppliers.php?id=${id}`, { method: 'DELETE' });
    loadSuppliers();
};

// --- CATEGORIES ---

async function loadCategories() {
    const tbody = document.getElementById('categoriesTableBody');
    try {
        const response = await fetch('../api/categories.php');
        const categories = await response.json();

        if (!Array.isArray(categories) || categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No categories found.</td></tr>';
            return;
        }

        tbody.innerHTML = categories.map(c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.description || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${c.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

async function handleAddCategory(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    try {
        const response = await fetch('../api/categories.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Category Added');
            bootstrap.Modal.getInstance(document.getElementById('addCategoryModal')).hide();
            e.target.reset();
            loadCategories();
        }
    } catch (e) {
        console.error(e);
    }
}

window.deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    await fetch(`../api/categories.php?id=${id}`, { method: 'DELETE' });
    loadCategories();
};
