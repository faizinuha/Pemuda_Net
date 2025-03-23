// Get URL parameters
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    paket: params.get("paket"),
    speed: params.get("speed"),
    price: params.get("price"),
  };
}

// Set initial form values
document.addEventListener("DOMContentLoaded", function () {
  const params = getUrlParams();
  if (params.paket) {
    document.getElementById("paket").value = params.paket;
  }
});

// Handle form submission - langsung ke WhatsApp
document
  .getElementById("registrationForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Ambil data form
    const orderData = {
      Tanggal: new Date().toLocaleString("id-ID"),
      Paket: document.getElementById("paket").value,
      Nama: document.getElementById("name").value,
      Email: document.getElementById("email").value,
      Telepon: document.getElementById("phone").value,
      Alamat: document.getElementById("address").value
    };

    // Baca file Excel yang sudah ada
    try {
      const existingWb = XLSX.readFile('../excel/Data_pesanan.xlsx');
      const ws = existingWb.Sheets[existingWb.SheetNames[0]];
      
      // Konversi sheet ke array
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Tambah data baru
      data.push(orderData);
      
      // Konversi kembali ke sheet
      const newWs = XLSX.utils.json_to_sheet(data);
      existingWb.Sheets[existingWb.SheetNames[0]] = newWs;
      
      // Simpan kembali ke file yang sama
      XLSX.writeFile(existingWb, '../excel/Data_pesanan.xlsx');
    } catch (error) {
      console.error('Error akses file:', error);
    }

    // Format pesan WhatsApp
    const message = `Halo, saya ingin berlangganan Mynet:%0A%0A
*Data Pendaftaran*%0A
👤 Nama: ${orderData.Nama}%0A
📧 Email: ${orderData.Email}%0A
📱 Telepon: ${orderData.Telepon}%0A
📍 Alamat: ${orderData.Alamat}%0A%0A
*Paket Dipilih*%0A
📦 ${orderData.Paket}`;

    // Redirect ke WhatsApp
    window.location.href = `https://wa.me/+6281234567890?text=${message}`;
  });
