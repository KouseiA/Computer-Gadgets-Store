// Search and Filter functionality for Products page

// Advanced Search and Filter functionality (Rotobox Style)

window.initializeSearchFilters = function () {
  console.log('Advanced Search Filters Initializing...');

  const productsContainer = document.getElementById('productsContainer');
  // We allow init even if container is missing to ensure UI interactions work (e.g. on empty pages)

  // -- FILTER UI: DROPDOWNS --
  // Use Event Delegation on Document for toggling to ensure it works even if elements are replaced
  // and to avoid multiple listener issues.
  
  // We only attach this ONCE. 
  if (!window.searchFiltersInitialized) {
      window.searchFiltersInitialized = true;
      
      document.addEventListener('click', function(e) {
          // 1. Handle Toggle Click
          const toggle = e.target.closest('.filter-toggle');
          if (toggle) {
              e.preventDefault();
              e.stopPropagation();
              const dropdown = toggle.nextElementSibling;
              
              if (dropdown && dropdown.classList.contains('filter-dropdown')) {
                  // Check current state
                  const isVisible = dropdown.style.display === 'block'; // check inline style
                  
                  // Close all other dropdowns
                  document.querySelectorAll('.filter-dropdown').forEach(d => {
                      if (d !== dropdown) d.style.display = 'none';
                  });

                  // Toggle current
                  dropdown.style.display = isVisible ? 'none' : 'block';
                  console.log('Toggled dropdown:', isVisible ? 'off' : 'on');
              }
              return;
          }

          // 2. Handle Click Outside
          // If we clicked inside a filter group, do nothing (allow interaction with inputs)
          if (e.target.closest('.filter-group')) {
              return;
          }
          
          // Otherwise, close all dropdowns
          document.querySelectorAll('.filter-dropdown').forEach(d => {
              d.style.display = 'none';
          });
      });
      
      console.log('Filter click listeners attached.');
  }

  // -- FILTER LOGIC: APPLYING FILTERS --
  const applyFilters = () => {
    // Inputs might be dynamic or static, re-query them
    const inStockChecked = document.getElementById('filterInStock')?.checked;
    const outStockChecked = document.getElementById('filterOutStock')?.checked;
    
    // Price
    const priceFromInput = document.getElementById('filterPriceFrom');
    const priceToInput = document.getElementById('filterPriceTo');
    let minPrice = parseFloat(priceFromInput?.value);
    let maxPriceInput = parseFloat(priceToInput?.value);
    
    if (isNaN(minPrice)) minPrice = 0;
    if (isNaN(maxPriceInput)) maxPriceInput = Infinity;

    // Items
    const productItems = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    // --- Dynamic Max Price Calculation ---
    let maxProductPrice = 0;
    productItems.forEach(item => {
        const p = parseFloat(item.dataset.price || '0');
        if (p > maxProductPrice) maxProductPrice = p;
    });
    
    // Update Max Price Display
    const maxPriceDisplay = document.querySelector('#filterPriceDropdown .text-muted.small');
    if (maxPriceDisplay) {
        // Format with commas currency
        const formattedMax = maxProductPrice.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
        // Update text
        maxPriceDisplay.textContent = `The highest price is ${formattedMax}`;
    }
    // -------------------------------------

    productItems.forEach(item => {
      let price = parseFloat(item.dataset.price || '0');
      let stock = parseInt(item.dataset.stock || '0');

      // Availability Logic
      let matchesAvailability = true;
      if (inStockChecked || outStockChecked) {
        if (inStockChecked && outStockChecked) {
            matchesAvailability = true; // Both checked = show all
        } else if (inStockChecked) {
            matchesAvailability = stock > 0;
        } else if (outStockChecked) {
            matchesAvailability = stock <= 0;
        }
      }

      // Price Logic
      const matchesPrice = price >= minPrice && price <= maxPriceInput;

      // Result
      if (matchesAvailability && matchesPrice) {
        item.parentElement.style.display = 'block';
        visibleCount++;
      } else {
        item.parentElement.style.display = 'none';
      }
    });

    // Update Counts
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) resultsCount.textContent = visibleCount;

    // Update Dropdown Label ("X selected")
    const checkedCount = document.querySelectorAll('input[name="filter_availability"]:checked').length;
    const availHeader = document.querySelector('#filterAvailabilityDropdown .selected-count');
    if (availHeader) availHeader.textContent = `${checkedCount} selected`;
  };

  // -- ATTACH INPUT LISTENERS --
  // We need to re-attach these if the DOM is replaced, or just attach them now.
  // Since inputs are usually static in the header, attaching once is fine, but safe to re-attach.
  
  const availabilityInputs = document.querySelectorAll('input[name="filter_availability"]');
  availabilityInputs.forEach(i => {
      i.onchange = applyFilters;
  });

  const pFrom = document.getElementById('filterPriceFrom');
  const pTo = document.getElementById('filterPriceTo');
  if (pFrom) pFrom.oninput = applyFilters;
  if (pTo) pTo.oninput = applyFilters;

  // Reset Buttons
  const resetAvail = document.getElementById('resetAvailability');
  if (resetAvail) {
      resetAvail.onclick = (e) => {
          e.preventDefault();
          availabilityInputs.forEach(i => i.checked = false);
          applyFilters();
      };
  }
  
  const resetPrice = document.getElementById('resetPrice');
  if (resetPrice) {
      resetPrice.onclick = (e) => {
          e.preventDefault();
          if (pFrom) pFrom.value = '';
          if (pTo) pTo.value = '';
          applyFilters();
      };
  }

  // Initial Run
  applyFilters();
};

// Auto-run
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeSearchFilters);
} else {
    window.initializeSearchFilters();
}