// Get URL parameters
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    paket: params.get("paket"),
    speed: params.get("speed"),
    price: params.get("price"),
  };
}

// Form validation
function validateForm(formData) {
  const errors = {};
  
  if (!formData.Nama.trim()) {
    errors.name = 'Nama harus diisi';
  }
  
  if (!formData.Email.trim()) {
    errors.email = 'Email harus diisi';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
    errors.email = 'Format email tidak valid';
  }
  
  if (!formData.Telepon.trim()) {
    errors.phone = 'Nomor telepon harus diisi';
  } else if (!/^(\+62|62|0)[0-9]{9,12}$/.test(formData.Telepon.replace(/[-\s]/g, ''))) {
    errors.phone = 'Format nomor telepon tidak valid';
  }
  
  if (!formData.Alamat.trim()) {
    errors.address = 'Alamat harus diisi';
  }
  
  return errors;
}

// Show error message
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.style.display = 'block';
  errorDiv.textContent = message;
  
  // Remove existing error message if any
  const existing = element.parentElement.querySelector('.invalid-feedback');
  if (existing) {
    existing.remove();
  }
  
  element.classList.add('is-invalid');
  element.parentElement.appendChild(errorDiv);
}

// Clear error message
function clearError(elementId) {
  const element = document.getElementById(elementId);
  element.classList.remove('is-invalid');
  const errorDiv = element.parentElement.querySelector('.invalid-feedback');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// Format price
function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
}

// Set initial form values
document.addEventListener("DOMContentLoaded", function () {
  const params = getUrlParams();
  if (params.paket) {
    document.getElementById("paket").value = params.paket;
  }

  // Clear errors on input
  ['name', 'email', 'phone', 'address'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => clearError(id));
  });
});

// Handle form submission
document.getElementById("registrationForm").addEventListener("submit", function (e) {
  e.preventDefault();
  
  // Disable submit button and show loading
  const submitBtn = this.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Memproses...';

  // Get form data
  const orderData = {
    Tanggal: new Date().toLocaleString("id-ID"),
    Paket: document.getElementById("paket").value,
    Nama: document.getElementById("name").value,
    Email: document.getElementById("email").value,
    Telepon: document.getElementById("phone").value,
    Alamat: document.getElementById("address").value
  };

  // Validate form
  const errors = validateForm(orderData);
  if (Object.keys(errors).length > 0) {
    // Show errors
    Object.entries(errors).forEach(([field, message]) => {
      showError(field, message);
    });
    
    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
    return;
  }

  // Get package details
  const paketSelect = document.getElementById("paket");
  const selectedPackage = paketSelect.options[paketSelect.selectedIndex].text;

  // Format WhatsApp message
  const message = `Halo, saya ingin berlangganan Mynet!%0A%0A
*Data Pendaftaran*%0A
👤 Nama: ${orderData.Nama}%0A
📧 Email: ${orderData.Email}%0A
📱 Telepon: ${orderData.Telepon}%0A
📍 Alamat: ${orderData.Alamat}%0A%0A
*Paket Dipilih*%0A
📦 ${selectedPackage}%0A%0A
Mohon informasi lebih lanjut untuk proses pemasangan. Terima kasih!`;

  // Redirect to WhatsApp
  window.location.href = `https://wa.me/+6288991715346?text=${message}`;
});
