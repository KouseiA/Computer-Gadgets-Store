// Main UI interactions for ROTOBOX Webstore

document.addEventListener('DOMContentLoaded', () => {
  // --- Product Modal Handling ---
  const productModalEl = document.getElementById('productModal');
  const modalProductImg = document.getElementById('modalProductImg');
  const modalTitle = document.getElementById('productModalLabel');
  const modalPrice = document.getElementById('modalProductPrice');
  const modalDesc = document.getElementById('modalProductDesc');
  const modalFeatures = document.getElementById('modalProductFeatures');

  let productModalInstance = null;
  if (productModalEl && window.bootstrap) {
    productModalInstance = new window.bootstrap.Modal(productModalEl);
  }

  const viewDetailsBtns = document.querySelectorAll('.view-details-trigger');

  viewDetailsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title');
      const img = btn.getAttribute('data-img');
      const price = btn.getAttribute('data-price');
      const desc = btn.getAttribute('data-desc');
      const featuresRaw = btn.getAttribute('data-features');

      const stock = parseInt(btn.getAttribute('data-stock') || '0');

      // Update Modal Content
      if (modalTitle) modalTitle.textContent = title;
      if (modalProductImg) modalProductImg.src = img;
      if (modalPrice) modalPrice.textContent = price;
      if (modalDesc) modalDesc.textContent = desc;

      // Parse and display features
      if (modalFeatures && featuresRaw) {
        try {
          const features = JSON.parse(featuresRaw);
          modalFeatures.innerHTML = features.map(f => `<li>${f}</li>`).join('');
        } catch (e) {
          modalFeatures.innerHTML = '';
          console.error('Error parsing features JSON', e);
        }
      }

      // Set global context for cart.js
      window.currentProduct = {
        title,
        img,
        price,
        desc,
        stock
      };

      // Handle Add to Cart Button
      const addToCartBtn = document.getElementById('addToCartBtn');
      if (addToCartBtn) {
          if (stock <= 0) {
              addToCartBtn.disabled = true;
              addToCartBtn.textContent = 'Out of Stock';
              addToCartBtn.classList.replace('btn-primary', 'btn-secondary');
          } else {
              addToCartBtn.disabled = false;
              addToCartBtn.textContent = 'Add to Cart';
              addToCartBtn.classList.replace('btn-secondary', 'btn-primary');
          }
      }

      // Show Modal
      if (productModalInstance) {
        productModalInstance.show();
      }
    });
  });

  // --- Social Media FAB Toggle ---
  const socialToggleBtn = document.getElementById('socialToggleBtn');
  const socialItems = document.getElementById('socialItems');

  if (socialToggleBtn && socialItems) {
    socialToggleBtn.addEventListener('click', () => {
      socialItems.classList.toggle('show');
      // Optional: Rotate button icon or switch icon states
    });
  }

  // Re-initialize tooltips if needed
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new window.bootstrap.Tooltip(tooltipTriggerEl)
  });

  // Social Media FAB logic (if any) or other global UI can go here
});

// --- Product Rendering (Dynamic) ---
async function fetchAndRenderProducts() {
  const containerById = document.getElementById('productsContainer');
  // Fallback to class selector if ID missing, but use ID as primary check
  const productGrid = document.querySelector('.row.row-cols-1.row-cols-sm-2.row-cols-lg-3.g-4');

  if (!containerById && !productGrid) return; // Not on products page

  const target = containerById || productGrid;

  try {
    const response = await fetch(`../api/products.php?t=${Date.now()}`);

    // Check for HTTP errors
    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `HTTP error! status: ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error) errMsg += ` - ${errJson.error}`;
      } catch (e) {
        errMsg += ` - ${errText.substring(0, 100)}`;
      }
      throw new Error(errMsg);
    }

    const text = await response.text(); // Get raw text first
    let products;
    try {
      products = JSON.parse(text);
    } catch (e) {
      console.error('JSON Parse Error:', e);
      console.error('Raw Response:', text);
      target.innerHTML = `<div class="col-12 text-center text-danger">
            <p>Error loading products (Invalid Data).</p>
            <small class="text-muted">Technical Details: ${e.message}</small>
            <!-- Hidden raw response for debug: ${text.replace(/</g, '&lt;')} -->
        </div>`;
      return;
    }

    if (products.error) {
      console.error('API Error:', products.error);
      target.innerHTML = `<div class="col-12 text-center text-danger">Error loading products: ${products.error}</div>`;
      return;
    }

    if (!Array.isArray(products) || products.length === 0) {
      target.innerHTML = '<div class="col-12 text-center">No products available in the database.</div>';
      return;
    }

    // STRICT FILTERING: If the page has a default category, strictly show ONLY that category.
    // This allows separate pages (e.g. mice.html) to only render relevant products.
    if (target.dataset.defaultCategory) {
        const strictCat = target.dataset.defaultCategory.toLowerCase();
        // Filter logic: Check if product category includes the strict category key
        // e.g. "Gaming Mouse" includes "mouse"
        products = products.filter(p => (p.category || '').toLowerCase().includes(strictCat));
        
        if (products.length === 0) {
             target.innerHTML = '<div class="col-12 text-center">No products found for this category.</div>';
             return;
        }
    }

    target.innerHTML = products.map(p => `
            <div class="col">
                <div class="card h-100 product-card" 
                     data-category="${(p.category || 'all').toLowerCase()}" 
                     data-title="${(p.name || '').replace(/"/g, '&quot;')}" 
                     data-brand="${(p.brand || 'aula').toLowerCase()}" 
                     data-stock="${p.stock || 0}"
                     data-price="${p.price}">
                    <div style="cursor: pointer; position: relative;" class="view-details-trigger" 
                         data-title="${p.name}"
                         data-img="${p.image}" 
                         data-price="₱${parseFloat(p.price).toLocaleString()}"
                         data-desc="${p.description || 'No description.'}"
                         data-stock="${p.stock || 0}"
                         data-features='${JSON.stringify(["Category: " + p.category, "Brand: " + p.brand, "Stock: " + p.stock])}'>
                        ${(parseInt(p.stock || 0) <= 0) ? '<span class="position-absolute top-0 end-0 badge bg-danger m-2 shadow-sm" style="z-index: 5;">SOLD OUT</span>' : ''}
                        <img src="${p.image}" class="card-img-top" alt="${p.name}" style="height: 250px; object-fit: contain; padding: 20px; ${(parseInt(p.stock || 0) <= 0) ? 'opacity: 0.6; filter: grayscale(100%);' : ''}">
                    </div>
                    <div class="card-body text-center">
                        <h6 class="text-uppercase text-muted small mb-1">${p.category}</h6>
                        <h5 class="card-title mb-2">${p.name}</h5>
                        <p class="fw-bold mb-3">₱${parseFloat(p.price).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        `).join('');

    attachDynamicListeners();

    // Initialize logic from search-filter.js now that items exist
    if (window.initializeSearchFilters) {
      window.initializeSearchFilters();
    }

  } catch (e) {
    console.error('Fetch error:', e);
    target.innerHTML = `<div class="col-12 text-center text-danger">
      <p>Failed to load products.</p>
      <small>Error: ${e.message}</small>
      <br>
      <small class="text-muted">Ensure XAMPP is running and database 'aula_db' exists.</small>
    </div>`;
  }
}

function attachDynamicListeners() {
  const viewDetailsBtns = document.querySelectorAll('.view-details-trigger');
  const productModalEl = document.getElementById('productModal');
  const modalProductImg = document.getElementById('modalProductImg');
  const modalTitle = document.getElementById('productModalLabel');
  const modalPrice = document.getElementById('modalProductPrice');
  const modalDesc = document.getElementById('modalProductDesc');
  const modalFeatures = document.getElementById('modalProductFeatures');

  let productModalInstance = null;
  if (productModalEl && window.bootstrap) {
    productModalInstance = new window.bootstrap.Modal(productModalEl);
  }

  viewDetailsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title');
      const img = btn.getAttribute('data-img');
      const price = btn.getAttribute('data-price');
      const desc = btn.getAttribute('data-desc');
      const featuresRaw = btn.getAttribute('data-features');

      const stock = parseInt(btn.getAttribute('data-stock') || '0');

      if (modalTitle) modalTitle.textContent = title;
      if (modalProductImg) modalProductImg.src = img;
      if (modalPrice) modalPrice.textContent = price;
      if (modalDesc) modalDesc.textContent = desc;

      if (modalFeatures && featuresRaw) {
        try {
          const features = JSON.parse(featuresRaw);
          modalFeatures.innerHTML = features.map(f => `<li>${f}</li>`).join('');
        } catch (e) {
          modalFeatures.innerHTML = '';
        }
      }

      window.currentProduct = { title, img, price, desc, stock };

      // Handle Add to Cart Button based on Stock
      const addToCartBtn = document.getElementById('addToCartBtn');
      if (addToCartBtn) {
          if (stock <= 0) {
              addToCartBtn.disabled = true;
              addToCartBtn.textContent = 'Out of Stock';
              addToCartBtn.classList.replace('btn-primary', 'btn-secondary');
          } else {
              addToCartBtn.disabled = false;
              addToCartBtn.textContent = 'Add to Cart';
              addToCartBtn.classList.replace('btn-secondary', 'btn-primary');
          }
      }

      if (productModalInstance) productModalInstance.show();
    });
  });
}

// --- Home Page Rendering ---
async function fetchAndRenderHomeProducts() {
  const bestSellersContainer = document.getElementById('bestSellersContainer');
  const recommendationsContainer = document.getElementById('recommendationsContainer');

  if (!bestSellersContainer && !recommendationsContainer) return;

  try {
    const response = await fetch(`../api/products.php?t=${Date.now()}`);
    const products = await response.json();

    if (products.error || !Array.isArray(products) || products.length === 0) {
      console.error('API Error or Empty:', products);
      if (bestSellersContainer) bestSellersContainer.innerHTML = '<div class="col-12 text-center">No products found.</div>';
      return;
    }

    // Simulate "Best Sellers" (first 4) and "Recommendations" (next 3 shuffled or just next 3)
    const bestSellers = products.slice(0, 4);
    const recommendations = products.slice(4, 10); 

    if (bestSellersContainer) {
            bestSellersContainer.innerHTML = bestSellers.map(p => `
                <div class="col">
                  <div class="card h-100 product-card border-0">
                    <div style="cursor: pointer; position: relative;" class="view-details-trigger"
                         data-title="${p.name}"
                         data-img="${p.image}" 
                         data-price="₱${parseFloat(p.price).toLocaleString()}"
                         data-desc="${p.description || 'No description.'}"
                         data-stock="${p.stock || 0}"
                         data-features='${JSON.stringify(["Category: " + p.category, "Brand: " + p.brand, "Stock: " + p.stock])}'>
                        ${(parseInt(p.stock || 0) <= 0) ? '<span class="position-absolute top-0 end-0 badge bg-danger m-2 shadow-sm" style="z-index: 5;">SOLD OUT</span>' : ''}
                        <img src="${p.image}" class="card-img-top" alt="${p.name}" style="height: 200px; object-fit: contain; padding: 10px; ${(parseInt(p.stock || 0) <= 0) ? 'opacity: 0.6; filter: grayscale(100%);' : ''}">
                    </div>
                    <div class="card-body text-center">
                      <h6 class="text-uppercase text-muted small mb-1">${p.category}</h6>
                      <h5 class="card-title mb-2">${p.name}</h5>
                      <p class="fw-bold mb-3">₱${parseFloat(p.price).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
            `).join('');
    }

    if (recommendationsContainer && recommendations.length > 0) {
      const chunkSize = 3;
      let carouselHtml = '';

      for (let i = 0; i < recommendations.length; i += chunkSize) {
        const chunk = recommendations.slice(i, i + chunkSize);
        const isActive = i === 0 ? 'active' : '';

        carouselHtml += `<div class="carousel-item ${isActive}"><div class="row">`;

        chunk.forEach((p, idx) => {
          const responsiveClass = idx > 0 ? 'd-none d-md-block' : '';

          carouselHtml += `
                      <div class="col-md-4 ${responsiveClass}">
                        <div class="card h-100 product-card border-0 text-center p-2">
                          <div style="cursor: pointer; position: relative;" class="view-details-trigger"
                               data-title="${p.name}"
                               data-img="${p.image}" 
                               data-price="₱${parseFloat(p.price).toLocaleString()}"
                               data-desc="${p.description}"
                               data-stock="${p.stock || 0}"
                               data-features='${JSON.stringify(["Category: " + p.category, "Brand: " + p.brand, "Stock: " + p.stock])}'>
                              ${(parseInt(p.stock || 0) <= 0) ? '<span class="position-absolute top-0 end-0 badge bg-danger m-2 shadow-sm" style="z-index: 5;">SOLD OUT</span>' : ''}
                              <img src="${p.image}" class="card-img-top" alt="${p.name}" style="height: 200px; object-fit: contain; padding: 10px; ${(parseInt(p.stock || 0) <= 0) ? 'opacity: 0.6; filter: grayscale(100%);' : ''}">
                          </div>
                          <div class="card-body">
                            <h6 class="text-uppercase text-muted small mb-1">${p.category}</h6>
                            <h5 class="card-title mb-2">${p.name}</h5>
                            <p class="fw-bold mb-3">₱${parseFloat(p.price).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    `;
        });

        carouselHtml += `</div></div>`;
      }

      recommendationsContainer.innerHTML = carouselHtml;
    } else if (recommendationsContainer) {
        recommendationsContainer.innerHTML = '<div class="text-center py-5"><p class="text-muted">No hot deals available at the moment.</p></div>';
    }

    attachDynamicListeners(); // Reuse the listener attacher

  } catch (e) {
    console.error('Fetch error:', e);
  }
}

// Check paths
if (document.getElementById('productsContainer')) {
  fetchAndRenderProducts();
} else if (document.getElementById('bestSellersContainer')) {
  fetchAndRenderHomeProducts();
}
