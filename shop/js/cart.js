// Cart & Wishlist functionality (separate from main.js)

document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'aula-cart';
  const WISHLIST_KEY = 'aula-wishlist';

  const load = (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const save = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage errors
    }
  };

  const updateCartBadge = () => {
    const cartCountEl = document.getElementById('cartCount');
    const cartCountNavEl = document.getElementById('cartCountNav');
    const cart = load(CART_KEY);
    const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    
    if (cartCountEl) cartCountEl.textContent = String(total);
    if (cartCountNavEl) cartCountNavEl.textContent = String(total);
  };

  const updateWishlistBadge = () => {
    const wishlistCountNavEl = document.getElementById('wishlistCountNav');
    if (!wishlistCountNavEl) return;
    const wishlist = load(WISHLIST_KEY);
    wishlistCountNavEl.textContent = String(wishlist.length);
  };

  const updateUserIcon = () => {
    const userIconBtn = document.querySelector('a[href="login.html"]');
    const currentUserRaw = localStorage.getItem('currentUser');
    if (currentUserRaw && userIconBtn) {
        try {
            JSON.parse(currentUserRaw);
            userIconBtn.setAttribute('href', 'account.html');
        } catch (e) {
            localStorage.removeItem('currentUser');
        }
    }
  };

  updateUserIcon();

  const getToastContainer = () => {
    let container = document.getElementById('toastStack');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastStack';
      container.className = 'toast-stack';
      document.body.appendChild(container);
    }
    return container;
  };

  const showToast = (message, type = 'info') => {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 2800);
    setTimeout(() => toast.remove(), 3300);
  };

  const addProductToCart = (product, { showMessage = true } = {}) => {
    if (!product) {
      showToast('Open a product (View Details) first.', 'warning');
      return;
    }
    const cart = load(CART_KEY);
    const existing = cart.find((p) => p.title === product.title);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({
        title: product.title,
        img: product.img,
        price: product.price,
        qty: 1,
      });
    }
    save(CART_KEY, cart);
    updateCartBadge();
    renderCart();
    if (showMessage) {
      showToast(`${product.title} added to cart.`, 'success');
    }
  };

  // RENDER: Full Page Cart
  const renderFullPageCart = () => {
    const tableBody = document.getElementById('cartTableBody');
    const emptyState = document.getElementById('cartEmptyState');
    const cartContent = document.getElementById('cartContent');
    const subtotalDisplay = document.getElementById('cartSubtotalDisplay');

    if (!tableBody || !subtotalDisplay) return; // Not on cart page

    const cart = load(CART_KEY);
    
    if (!cart.length) {
      if(emptyState) emptyState.classList.remove('d-none');
      if(cartContent) cartContent.classList.add('d-none');
      return;
    }

    if(emptyState) emptyState.classList.add('d-none');
    if(cartContent) cartContent.classList.remove('d-none');

    let total = 0;
    
    tableBody.innerHTML = cart.map((item, index) => {
      // Parse price logic
      const priceNum = parseFloat(String(item.price).replace(/[^\d.]/g, ''));
      const itemTotal = priceNum * (item.qty || 1);
      total += itemTotal;

      return `
        <tr>
          <td>
            <div class="d-flex align-items-center">
              <img src="${item.img}" alt="${item.title}" class="cart-product-img">
              <div>
                <div class="fw-bold text-dark">${item.title}</div>
                <div class="small text-muted">₱${priceNum.toLocaleString()}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="qty-selector">
              <button class="qty-btn" onclick="updateCartQty(${index}, -1)">−</button>
              <input type="number" class="qty-input" value="${item.qty || 1}" readonly>
              <button class="qty-btn" onclick="updateCartQty(${index}, 1)">+</button>
            </div>
            <i class="fas fa-trash-alt ms-3 remove-btn" onclick="removeFromCart(${index})" title="Remove item"></i>
          </td>
          <td class="text-end fw-bold">
            ₱${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </td>
        </tr>
      `;
    }).join('');

    subtotalDisplay.textContent = '₱' + total.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  // FETCH & RENDER: Featured Collection (Cart Page)
  const renderFeaturedCollection = async () => {
    const container = document.getElementById('featuredContainer');
    if (!container) return;

    try {
      const res = await fetch(`../api/products.php?t=${Date.now()}`);
      const products = await res.json();
      
      // Select 4 random or first 4 products
      const featured = products.slice(0, 4);

      container.innerHTML = featured.map(p => {
          // Parse price
          const priceNum = parseFloat(String(p.price).replace(/[^\d.]/g, ''));
          
          return `
            <div class="col">
              <div class="card h-100 border-0">
                <div class="position-relative" style="background: #f8f9fa; aspect-ratio: 1; overflow: hidden;">
                   <img src="${p.image}" class="card-img-top w-100 h-100 p-4" style="object-fit: contain;" alt="${p.name}">
                </div>
                <div class="card-body px-0 text-center">
                  <h6 class="card-title fw-bold text-dark mb-1" style="font-size: 0.9rem;">${p.name}</h6>
                  <p class="text-muted fw-bold small mb-2">₱${priceNum.toLocaleString()}</p>
                </div>
              </div>
            </div>
          `;
      }).join('');

    } catch (e) {
      console.error('Failed to load featured products', e);
    }
  };

  // Expose global helpers for inline onclicks in the generated HTML
  window.removeFromCart = (index) => {
    const cart = load(CART_KEY);
    cart.splice(index, 1);
    save(CART_KEY, cart);
    updateCartBadge();
    renderFullPageCart();
    renderCart(); // Update modal just in case
  };

  window.updateCartQty = (index, change) => {
    const cart = load(CART_KEY);
    if (!cart[index]) return;
    
    let newQty = (cart[index].qty || 1) + change;
    if (newQty < 1) return; // Prevent 0, must use trash to remove

    cart[index].qty = newQty;
    save(CART_KEY, cart);
    updateCartBadge();
    renderFullPageCart();
    renderCart();
  };
  
  // Init
  renderFeaturedCollection();

  // CART MODAL helpers (Keep for backward compatibility or small view)
  const renderCart = () => {
    renderFullPageCart(); // Also trigger full page render if on that page

    const cart = load(CART_KEY);
    const emptyMsg = document.getElementById('cartEmptyMessage');
    const itemsWrapper = document.getElementById('cartItemsWrapper');
    const itemsBody = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');

    if (!itemsBody || !totalEl || !emptyMsg || !itemsWrapper) return;

    if (!cart.length) {
      emptyMsg.classList.remove('d-none');
      itemsWrapper.classList.add('d-none');
      // ... continue modal render logic below ...
      itemsBody.innerHTML = '';
      totalEl.textContent = '₱0.00';
      // Reinitialize checkout button even when cart is empty
      setTimeout(initCheckoutButton, 100);
      return;
    }

    emptyMsg.classList.add('d-none');
    itemsWrapper.classList.remove('d-none');

    let total = 0;
    itemsBody.innerHTML = cart
      .map((item) => {
        const priceNumber = parseFloat(
          String(item.price || '0').replace(/[^\d.]/g, '')
        );
        const lineTotal = (priceNumber || 0) * (item.qty || 1);
        total += lineTotal;
        return `
          <tr>
            <td class="align-middle">
              <div class="d-flex align-items-center gap-2">
                ${item.img ? `<img src="${item.img}" alt="${item.title}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;">` : ''}
                <span>${item.title}</span>
              </div>
            </td>
            <td class="align-middle text-nowrap">${item.price || ''}</td>
            <td class="align-middle text-center">
              <button class="btn btn-sm btn-black cart-qty-btn" data-action="dec" data-title="${item.title}">−</button>
              <span class="mx-2">${item.qty || 1}</span>
              <button class="btn btn-sm btn-black cart-qty-btn" data-action="inc" data-title="${item.title}">+</button>
            </td>
            <td class="align-middle text-end">₱${lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="align-middle text-end">
              <button class="btn btn-sm btn-link text-danger cart-remove-btn" data-action="remove" data-title="${item.title}">Remove</button>
            </td>
          </tr>
        `;
      })
      .join('');

    totalEl.textContent = `₱${total.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    // Reinitialize checkout button after rendering cart
    setTimeout(initCheckoutButton, 100);
  };

  // WISHLIST MODAL helpers
  const renderWishlist = () => {
    const wishlist = load(WISHLIST_KEY);
    const emptyMsg = document.getElementById('wishlistEmptyMessage');
    const itemsWrapper = document.getElementById('wishlistItemsWrapper');
    const itemsBody = document.getElementById('wishlistItems');

    if (!emptyMsg || !itemsWrapper || !itemsBody) return;

    if (!wishlist.length) {
      emptyMsg.classList.remove('d-none');
      itemsWrapper.classList.add('d-none');
      itemsBody.innerHTML = '';
      return;
    }

    emptyMsg.classList.add('d-none');
    itemsWrapper.classList.remove('d-none');

    itemsBody.innerHTML = wishlist
      .map(
        (item) => `
        <tr>
          <td class="align-middle">
            <div class="d-flex align-items-center gap-2">
              ${item.img ? `<img src="${item.img}" alt="${item.title}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;">` : ''}
              <span>${item.title}</span>
            </div>
          </td>
          <td class="align-middle text-nowrap">${item.price || ''}</td>
          <td class="align-middle text-end">
            <button class="btn btn-sm btn-black wishlist-action-btn" data-action="add-to-cart" data-title="${item.title}">Add to Cart</button>
            <button class="btn btn-sm btn-link text-danger wishlist-action-btn" data-action="remove" data-title="${item.title}">Remove</button>
          </td>
        </tr>
      `
      )
      .join('');
  };

  // ADD TO CART button in product modal
  const addToCartBtn = document.getElementById('addToCartBtn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      addProductToCart(window.currentProduct);
    });
  }

  // ADD TO WISHLIST button in product modal (Delegation)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#addToWishlistBtn');
    if (btn) {
      handleWishlist();
    }
  });

  // Floating Cart button – open cart modal
  const cartBtn = document.getElementById('cartBtn');
  const cartModalEl = document.getElementById('cartModal');
  const cartModal = cartModalEl && window.bootstrap
    ? new window.bootstrap.Modal(cartModalEl)
    : null;

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      if (!cartModal) return;
      renderCart();
      cartModal.show();
    });
  }

  // Navbar Cart Trigger
  document.addEventListener('click', (e) => {
    const cartNav = e.target.closest('#cartBtnNav');
    if (cartNav) {
      if (!cartModal) return;
      renderCart();
      cartModal.show();
    }
  });

  // Wishlist button – toggle current product in wishlist
  const handleWishlist = () => {
    let current = window.currentProduct;

    // Fallback: Read from DOM if window.currentProduct is missing
    if (!current) {
      const titleEl = document.getElementById('productModalLabel');
      const priceEl = document.getElementById('modalProductPrice');
      const imgEl = document.getElementById('modalProductImg');

      if (titleEl && priceEl && imgEl && titleEl.textContent) {
        current = {
          title: titleEl.textContent,
          price: priceEl.textContent,
          img: imgEl.src
        };
      }
    }

    if (!current) {
      showToast('Open a product (View Details) first.', 'warning');
      return;
    }

    const wishlist = load(WISHLIST_KEY);
    const index = wishlist.findIndex((p) => p.title === current.title);
    if (index === -1) {
      wishlist.push({
        title: current.title,
        img: current.img,
        price: current.price,
      });
      showToast(`${current.title} added to wishlist.`, 'success');
    } else {
      wishlist.splice(index, 1);
      showToast(`${current.title} removed from wishlist.`, 'info');
    }
    save(WISHLIST_KEY, wishlist);
    renderWishlist();
  };

  const wishlistBtn = document.getElementById('wishlistBtn');
  const wishlistModalEl = document.getElementById('wishlistModal');
  const wishlistModal = wishlistModalEl && window.bootstrap
    ? new window.bootstrap.Modal(wishlistModalEl)
    : null;

  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      if (!wishlistModal) return;
      renderWishlist();
      wishlistModal.show();
    });
  }

  // Navbar Wishlist Trigger
  document.addEventListener('click', (e) => {
    const wishlistNav = e.target.closest('#wishlistBtnNav');
    if (wishlistNav) {
      if (!wishlistModal) return;
      renderWishlist();
      wishlistModal.show();
    }
  });

  document.addEventListener('wishlist:add-current', handleWishlist);

  // Cart modal item actions (qty / remove / clear)
  const itemsBody = document.getElementById('cartItems');
  if (itemsBody) {
    itemsBody.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.getAttribute('data-action');
      const title = target.getAttribute('data-title');
      if (!action || !title) return;
      const cart = load(CART_KEY);
      const item = cart.find((p) => p.title === title);
      if (!item) return;

      if (action === 'inc') {
        item.qty = (item.qty || 1) + 1;
      } else if (action === 'dec') {
        item.qty = Math.max(1, (item.qty || 1) - 1);
      } else if (action === 'remove') {
        const idx = cart.indexOf(item);
        if (idx !== -1) cart.splice(idx, 1);
      }
    }); // Close itemsBody click listener
  }

  // --- DELETE OBSOLETE cartTrigger listener (handled by href="cart.html") ---

  // Checkout Button (Modal)
  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
      if (modal) modal.hide();
      
      const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
      checkoutModal.show();
    });
  }

  // Checkout Button (Full Page)
  const mainCheckoutBtn = document.getElementById('mainCheckoutBtn');
  if (mainCheckoutBtn) {
      mainCheckoutBtn.addEventListener('click', () => {
          if (!localStorage.getItem('currentUser')) {
              window.location.href = 'login.html';
              return;
          }
           const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
           if(checkoutModal) checkoutModal.show();
      });
  }

  const wishlistBody = document.getElementById('wishlistItems');
  if (wishlistBody) {
    wishlistBody.addEventListener('click', (e) => {
      const target = e.target.closest('.wishlist-action-btn');
      if (!target) return;
      const action = target.getAttribute('data-action');
      const title = target.getAttribute('data-title');
      const wishlist = load(WISHLIST_KEY);
      const item = wishlist.find((p) => p.title === title);
      if (!item) return;

      if (action === 'add-to-cart') {
        addProductToCart(item, { showMessage: false });
        const idx = wishlist.indexOf(item);
        if (idx !== -1) wishlist.splice(idx, 1);
        save(WISHLIST_KEY, wishlist);
        renderWishlist();
        showToast(`${item.title} moved to cart.`, 'success');
      } else if (action === 'remove') {
        const idx = wishlist.indexOf(item);
        if (idx !== -1) wishlist.splice(idx, 1);
        save(WISHLIST_KEY, wishlist);
        renderWishlist();
        showToast(`${item.title} removed from wishlist.`, 'info');
      }
    });
  }

  // Checkout functionality
  const initCheckoutButton = () => {
    const checkoutBtn = document.getElementById('cartCheckoutBtn') || document.getElementById('mainCheckoutBtn');
    console.log('Checkout button found:', !!checkoutBtn);

    if (checkoutBtn) {
      // Remove existing listeners to prevent duplicates
      const newCheckoutBtn = checkoutBtn.cloneNode(true);
      checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);

      newCheckoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Checkout button clicked');
        const cart = load(CART_KEY);
        if (cart.length === 0) {
          showToast('Your cart is empty.', 'warning');
          return;
        }
        showCheckoutModal();
      });
    }
  };

  // Initialize checkout button
  initCheckoutButton();

  const showCheckoutModal = () => {
    console.log('showCheckoutModal called');
    try {
      // Create checkout modal if it doesn't exist
      let checkoutModal = document.getElementById('checkoutModal');
      if (!checkoutModal) {
        console.log('Creating checkout modal');
        checkoutModal = createCheckoutModal();
        document.body.appendChild(checkoutModal);
      }

      const modal = new window.bootstrap.Modal(checkoutModal);
      modal.show();
      renderOrderSummary();

      // Add listeners for courier changes
      const courierOptions = checkoutModal.querySelectorAll('.courier-option');
      courierOptions.forEach(option => {
        option.addEventListener('change', () => {
          renderOrderSummary();
        });
      });

      const courierSelect = document.getElementById('courierSelect');
      if (courierSelect) {
        courierSelect.addEventListener('change', () => {
          renderOrderSummary();
        });
      }
    } catch (error) {
      console.error('Error showing checkout modal:', error);
      showToast('Error opening checkout form. Please try again.', 'error');
    }
  };

  const createCheckoutModal = () => {
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = `
      <div class="modal fade" id="checkoutModal" tabindex="-1" aria-labelledby="checkoutModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
          <div class="modal-content" style="border-radius: 0;">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold" id="checkoutModalLabel">CHECKOUT</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="checkoutForm">
                <div class="row">
                  <!-- Contact Information -->
                  <div class="col-md-6 border-end">
                    <h6 class="fw-bold text-uppercase mb-4">Contact Information</h6>
                    <div class="mb-3">
                      <label for="firstName" class="form-label small fw-bold">First Name *</label>
                      <input type="text" class="form-control rounded-0" id="firstName" required>
                    </div>
                    <div class="mb-3">
                      <label for="lastName" class="form-label small fw-bold">Last Name *</label>
                      <input type="text" class="form-control rounded-0" id="lastName" required>
                    </div>
                    <div class="mb-3">
                      <label for="email" class="form-label small fw-bold">Email Address *</label>
                      <input type="email" class="form-control rounded-0" id="email" required>
                    </div>
                    <div class="mb-4">
                      <label for="phone" class="form-label small fw-bold">Phone Number *</label>
                      <input type="tel" class="form-control rounded-0" id="phone" placeholder="+63 XXX XXX XXXX" required>
                    </div>

                    <h6 class="fw-bold text-uppercase mt-5 mb-4">Shipping Address</h6>
                    <div class="mb-3">
                      <label for="address" class="form-label small fw-bold">Street Address *</label>
                      <input type="text" class="form-control rounded-0" id="address" required>
                    </div>
                    <div class="mb-3">
                      <label for="barangay" class="form-label small fw-bold">Barangay *</label>
                      <input type="text" class="form-control rounded-0" id="barangay" required>
                    </div>
                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="city" class="form-label small fw-bold">City *</label>
                          <input type="text" class="form-control rounded-0" id="city" required>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="province" class="form-label small fw-bold">Province *</label>
                          <input type="text" class="form-control rounded-0" id="province" required>
                        </div>
                      </div>
                    </div>
                    <div class="mb-3">
                      <label for="postalCode" class="form-label small fw-bold">Postal Code *</label>
                      <input type="text" class="form-control rounded-0" id="postalCode" required>
                    </div>
                  </div>
                  
                  <div class="col-md-6 ps-md-4">
                    <h6 class="fw-bold text-uppercase mb-4">Order Summary</h6>
                    <div class="mb-4" id="checkoutOrderSummary"></div>

                    <h6 class="fw-bold text-uppercase mb-4">Courier</h6>
                    <div class="mb-4">
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="radio" name="courier" id="courierStandard" value="Standard" data-fee="150" checked>
                          <label class="form-check-label d-flex justify-content-between small" for="courierStandard">
                            <span>Standard (J&T Express)</span>
                            <span>₱150.00</span>
                          </label>
                        </div>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="radio" name="courier" id="courierExpress" value="Express" data-fee="250">
                          <label class="form-check-label d-flex justify-content-between small" for="courierExpress">
                            <span>Express (LBC)</span>
                            <span>₱250.00</span>
                          </label>
                        </div>
                    </div>

                    <h6 class="fw-bold text-uppercase mb-4">Payment</h6>
                    <div class="mb-4">
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="radio" name="paymentMethod" id="cod" value="cod" checked>
                          <label class="form-check-label small" for="cod">Cash on Delivery</label>
                        </div>
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="radio" name="paymentMethod" id="gcash" value="gcash">
                          <label class="form-check-label small" for="gcash">GCash</label>
                        </div>
                    </div>

                    <div class="mt-5">
                        <button type="button" class="btn btn-black w-100 py-3" id="placeOrderBtn">COMPLETE ORDER</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
    return modalDiv.firstElementChild;
  };

  const renderOrderSummary = () => {
    const cart = load(CART_KEY);
    const summaryContainer = document.getElementById('checkoutOrderSummary');



    let subtotal = 0;

    // Get selected shipping fee
    let shippingFee = 150;
    const selectedCourier = document.querySelector('input[name="courier"]:checked');
    const courierDropdown = document.getElementById('courierSelect');

    if (selectedCourier) {
      shippingFee = parseFloat(selectedCourier.getAttribute('data-fee'));
    } else if (courierDropdown) {
      const optionText = courierDropdown.options[courierDropdown.selectedIndex].text;
      const feeMatch = optionText.match(/\d+/g);
      shippingFee = feeMatch ? parseFloat(feeMatch[feeMatch.length - 1]) : 150;
    }

    cart.forEach(item => {
      const priceNumber = parseFloat(String(item.price || '0').replace(/[^\d.]/g, ''));
      subtotal += (priceNumber || 0) * (item.qty || 1);
    });

    const total = subtotal + shippingFee;

    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div class="bg-light p-3">
          <table class="table table-sm table-borderless mb-0 small">
            <tbody>
              ${cart.map(item => {
        const priceNumber = parseFloat(String(item.price || '0').replace(/[^\d.]/g, ''));
        const lineTotal = (priceNumber || 0) * (item.qty || 1);
        return `
                  <tr>
                    <td>${item.title} <span class="text-muted">x${item.qty || 1}</span></td>
                    <td class="text-end">₱${lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                `;
      }).join('')}
              <tr class="border-top">
                <td class="pt-3">Subtotal</td>
                <td class="text-end pt-3">₱${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Shipping</td>
                <td class="text-end">₱${shippingFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr class="fw-bold h5">
                <td class="pt-3">TOTAL</td>
                <td class="text-end pt-3">₱${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    const totalDisplay = document.getElementById('checkoutTotalDisplay');
    if (totalDisplay) {
      totalDisplay.textContent = `₱${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // Payment method toggle (Legacy: Reference field removed in favor of simulation)
  /*
  document.addEventListener('change', (e) => {
    // Logic removed
  });
  */

  // Place order functionality
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#placeOrderBtn') || e.target.closest('#confirmOrderBtn');
    if (btn) {
      handlePlaceOrder(btn);
    }
  });

  const handlePlaceOrder = async (btn) => {
    console.log('handlePlaceOrder started');
    const originalText = btn.textContent;
    
    try {
      const cart = load(CART_KEY);

      if (cart.length === 0) {
        showToast('Your cart is empty.', 'warning');
        return;
      }

      // Validate form
      if (!validateCheckoutForm()) {
        console.log('Validation failed');
        return;
      }

      // Update button state
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

      // Check payment method for simulation
      const paymentRadio = document.querySelector('input[name="paymentMethod"]:checked');
      if (!paymentRadio) {
          showToast('Please select a payment method.', 'warning');
          btn.disabled = false;
          btn.textContent = originalText;
          return;
      }
      const paymentMethod = paymentRadio.value.toLowerCase();

      if (paymentMethod === 'gcash' || paymentMethod === 'paymaya') {
        // Trigger simulation
        showPaymentSimulationModal(paymentMethod, async (referenceNumber) => {
          // Continue with order placement after success
          await completeOrderPlacement(referenceNumber);
        });
      } else {
        // COD - direct placement
        await completeOrderPlacement();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('An error occurred during checkout: ' + err.message);
      btn.disabled = false;
      btn.textContent = originalText;
    }
  };

  const completeOrderPlacement = async (referenceNumber = null) => {
    console.log('completeOrderPlacement started');
    try {
      const cart = load(CART_KEY);
      if (cart.length === 0) throw new Error('Cart is empty.');

      // Get selected courier info
      const selectedCourier = document.querySelector('input[name="courier"]:checked');
      const courierDropdown = document.getElementById('courierSelect');
      
      let courierName = 'Standard';
      let shippingFee = 150;

      if (selectedCourier) {
        courierName = selectedCourier.value;
        shippingFee = parseFloat(selectedCourier.getAttribute('data-fee'));
      } else if (courierDropdown) {
        courierName = courierDropdown.value;
        const optionText = courierDropdown.options[courierDropdown.selectedIndex].text;
        const feeMatch = optionText.match(/\d+/g);
        shippingFee = feeMatch ? parseFloat(feeMatch[feeMatch.length - 1]) : 150;
      }

      // Get User ID safely
      let userId = null;
      try {
          const currentUserRaw = localStorage.getItem('currentUser');
          if (currentUserRaw && currentUserRaw !== 'undefined') {
              const currentUser = JSON.parse(currentUserRaw);
              userId = currentUser.id || null;
          }
      } catch (e) { console.warn('User session invalid', e); }

      const safeGet = (id1, id2) => {
        const el = document.getElementById(id1) || document.getElementById(id2);
        return el ? el.value.trim() : '';
      };

      // Collect order data
      const orderData = {
        id: generateOrderId(),
        userId: userId,
        date: new Date().toISOString(),
        customer: {
          firstName: safeGet('checkoutFirstName', 'firstName'),
          lastName: safeGet('checkoutLastName', 'lastName'),
          email: safeGet('checkoutEmail', 'email'),
          phone: safeGet('checkoutPhone', 'phone')
        },
        shipping: {
          address: safeGet('checkoutAddress', 'address'),
          barangay: safeGet('checkoutBarangay', 'barangay'),
          city: safeGet('checkoutCity', 'city'),
          province: safeGet('checkoutProvince', 'province'),
          postalCode: safeGet('checkoutPostal', 'postalCode')
        },
        payment: {
          method: (document.querySelector('input[name="paymentMethod"]:checked') || {value: 'COD'}).value,
          referenceNumber: referenceNumber
        },
        items: cart,
        notes: document.getElementById('orderNotes') ? document.getElementById('orderNotes').value : '',
        status: 'Pending',
        courier: courierName,
        shippingFee: shippingFee,
        total: calculateOrderTotal(cart, shippingFee)
      };

      console.log('Order data prepared:', orderData);

      // Save order to LocalStorage
      saveOrder(orderData);

      // Save order to Backend API
      const response = await fetch('../api/place_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const responseText = await response.text();
      console.log('Backend Response:', responseText);

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}\n${responseText}`);
      }

      // Success! Clear cart
      save(CART_KEY, []);
      updateCartBadge();
      renderCart();

      // Close modal safely
      const checkoutModalEl = document.getElementById('checkoutModal');
      if (checkoutModalEl && window.bootstrap) {
          const instance = window.bootstrap.Modal.getInstance(checkoutModalEl) || new window.bootstrap.Modal(checkoutModalEl);
          instance.hide();
      }

      // Show success message
      showOrderConfirmation(orderData);

    } catch (error) {
      console.error('completeOrderPlacement failed:', error);
      alert("Order Placement Error: " + error.message);
      
      // Reset button if we have access to it
      const btn = document.getElementById('confirmOrderBtn') || document.getElementById('placeOrderBtn');
      if (btn) {
          btn.disabled = false;
          btn.textContent = 'PLACE ORDER';
      }
    }
  };

  const validateCheckoutForm = () => {
    const form = document.getElementById('checkoutForm');

    // Basic required field validation
    const requiredFields = [
      'checkoutFirstName', 'firstName', 
      'checkoutLastName', 'lastName', 
      'checkoutEmail', 'email', 
      'checkoutPhone', 'phone', 
      'checkoutAddress', 'address', 
      'checkoutBarangay', 'barangay', 
      'checkoutCity', 'city', 
      'checkoutProvince', 'province', 
      'checkoutPostal', 'postalCode'
    ];

    for (const fieldId of requiredFields) {
      const field = document.getElementById(fieldId);
      if (field) {
        if (!field.value.trim()) {
          field.classList.add('is-invalid');
          field.focus();
          showToast(`Please fill in all required fields.`, 'warning');
          return false;
        }
        field.classList.remove('is-invalid');
      }
    }

    // Email validation
    const email = document.getElementById('checkoutEmail') || document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email) {
      if (!emailRegex.test(email.value)) {
        email.classList.add('is-invalid');
        email.focus();
        showToast('Please enter a valid email address.', 'warning');
        return false;
      }
      email.classList.remove('is-invalid');
    }

    // Phone validation (basic Philippines format)
    const phone = document.getElementById('checkoutPhone') || document.getElementById('phone');
    const phoneRegex = /^(\+63|0)[0-9]{10}$/;
    if (phone) {
      if (!phoneRegex.test(phone.value.replace(/[\s-]/g, ''))) {
        phone.classList.add('is-invalid');
        phone.focus();
        showToast('Please enter a valid phone number (e.g., +63 912 345 6789 or 0912 345 6789).', 'warning');
        return false;
      }
      phone.classList.remove('is-invalid');
    }

    return true;
  };

  const showPaymentSimulationModal = (provider, onSuccess) => {
    let modal = document.getElementById('paymentSimulationModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.innerHTML = `
        <div class="modal fade" id="paymentSimulationModal" tabindex="-1" data-bs-backdrop="static">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header justify-content-center">
                <h5 class="modal-title fw-bold" id="simTitle">Login to Pay</h5>
              </div>
              <div class="modal-body text-center">
                <div id="simStep1">
                  <div class="payment-logo mb-4 mx-auto display-4 fw-bold">
                    ${provider === 'gcash' ? 'G' : 'P'}
                  </div>
                  <h4 class="mb-4">Pay with <span id="simProviderName">Provider</span></h4>
                  <div class="form-group mb-4 text-start">
                    <label class="mb-2 text-muted small">Mobile Number</label>
                    <input type="text" class="form-control form-control-lg" value="0912 345 6789" readonly>
                  </div>
                  <button class="btn btn-primary btn-lg mb-3" id="simNextBtn">NEXT</button>
                  <button class="btn btn-link text-decoration-none text-muted" data-bs-dismiss="modal">Cancel Transaction</button>
                </div>

                <div id="simStep2" class="d-none">
                  <div class="mb-4">
                    <h4 class="mb-2">Authentication</h4>
                    <p class="text-muted small">Enter the 6-digit code sent to your number.</p>
                  </div>
                  <div class="otp-inputs mb-4">
                    <input type="text" maxlength="1" class="otp-field">
                    <input type="text" maxlength="1" class="otp-field">
                    <input type="text" maxlength="1" class="otp-field">
                    <input type="text" maxlength="1" class="otp-field">
                    <input type="text" maxlength="1" class="otp-field">
                    <input type="text" maxlength="1" class="otp-field">
                  </div>
                  <button class="btn btn-primary btn-lg mb-3" id="simPayBtn">PAY PHP <span id="simAmount">0.00</span></button>
                  <div class="spinner-border text-primary d-none" role="status" id="simSpinner"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Auto-focus OTP
      modal.querySelectorAll('.otp-field').forEach((input, index, inputs) => {
        input.addEventListener('input', (e) => {
          if (e.target.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
          }
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs[index - 1].focus();
          }
        });
      });
    } else {
      // Reset state
      document.getElementById('simStep1').classList.remove('d-none');
      document.getElementById('simStep2').classList.add('d-none');
      modal.querySelectorAll('.otp-field').forEach(i => i.value = '');
    }

    const modalEl = modal.firstElementChild;
    const bsModal = new window.bootstrap.Modal(modalEl);

    // Theme
    modalEl.classList.remove('gcash-theme', 'paymaya-theme');
    modalEl.classList.add(`${provider}-theme`);

    document.getElementById('simProviderName').textContent = provider === 'gcash' ? 'GCash' : 'PayMaya';
    document.getElementById('simTitle').textContent = `Login to ${provider === 'gcash' ? 'GCash' : 'PayMaya'}`;
    const cart = load(CART_KEY);
    const total = calculateOrderTotal(cart);
    document.getElementById('simAmount').textContent = total.toLocaleString(undefined, { minimumFractionDigits: 2 });

    // Step 1 Logic
    const nextBtn = document.getElementById('simNextBtn');
    nextBtn.onclick = () => {
      nextBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing...';
      setTimeout(() => {
        document.getElementById('simStep1').classList.add('d-none');
        document.getElementById('simStep2').classList.remove('d-none');
        // document.querySelector('.otp-field').focus(); // Focus quirk in modals
        nextBtn.innerHTML = 'NEXT';
      }, 1000);
    };

    // Step 2 Logic
    const payBtn = document.getElementById('simPayBtn');
    payBtn.hidden = false;
    document.getElementById('simSpinner').classList.add('d-none');

    payBtn.onclick = () => {
      // Check OTP
      const otp = Array.from(document.querySelectorAll('.otp-field')).map(i => i.value).join('');
      if (otp.length < 6) {
        showToast('Please enter the full 6-digit OTP.', 'warning');
        return;
      }

      payBtn.hidden = true;
      document.getElementById('simSpinner').classList.remove('d-none');

      setTimeout(() => {
        bsModal.hide();
        const refNum = 'REF' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
        onSuccess(refNum);
      }, 2000);
    };

    bsModal.show();
  };

  const generateOrderId = () => {
    return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const calculateOrderTotal = (cart, shippingFee = 150) => {
    let subtotal = 0;

    cart.forEach(item => {
      const priceNumber = parseFloat(String(item.price || '0').replace(/[^\d.]/g, ''));
      subtotal += (priceNumber || 0) * (item.qty || 1);
    });

    return subtotal + shippingFee;
  };

  const saveOrder = (orderData) => {
    const orders = load('aula-orders');
    orders.push(orderData);
    save('aula-orders', orders);
  };

  const showOrderConfirmation = (orderData) => {
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = `
      <div class="modal fade" id="orderConfirmationModal" tabindex="-1" aria-labelledby="orderConfirmationModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="orderConfirmationModalLabel">Order Confirmed!</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
              <div class="mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="text-success" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
              </div>
              <h6>Thank you for your order!</h6>
              <p class="text-muted">Your order has been successfully placed.</p>
              <div class="card" style="background-color: var(--aula-surface); border: 1px solid var(--aula-border);">
                <div class="card-body">
                  <p class="mb-1"><strong>Order ID:</strong> ${orderData.id}</p>
                  <p class="mb-1"><strong>Total Amount:</strong> ₱${orderData.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p class="mb-0"><strong>Payment Method:</strong> ${orderData.payment.method === 'cod' ? 'Cash on Delivery' : orderData.payment.method.toUpperCase()}</p>
                </div>
              </div>
              <p class="text-muted small mt-3">A confirmation email has been sent to ${orderData.customer.email}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalDiv);
    const modal = new window.bootstrap.Modal(modalDiv.firstElementChild);
    modal.show();

    // Remove modal from DOM after hidden
    modalDiv.firstElementChild.addEventListener('hidden.bs.modal', () => {
      document.body.removeChild(modalDiv);
    });
  };

  // Initialize cart badge & modal on load
  updateCartBadge();
  updateWishlistBadge();
  renderCart();
  renderWishlist();

  // Also try to add checkout listener after DOM is fully loaded
  setTimeout(() => {
    const checkoutBtn = document.getElementById('cartCheckoutBtn') || document.getElementById('mainCheckoutBtn');
    if (checkoutBtn && !checkoutBtn.onclick) {
        // Consolidate: if it doesn't have a listener, add one. 
        // But initCheckoutButton should have handled it.
        initCheckoutButton();
    }
  }, 500);

  // Global test function for debugging
  window.testCheckout = () => {
    console.log('Test checkout called');
    const cart = load(CART_KEY);
    if (cart.length === 0) {
      showToast('Your cart is empty.', 'warning');
      return;
    }
    showCheckoutModal();
  };
});


