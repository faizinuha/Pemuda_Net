import mysql from "mysql2/promise";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Metode tidak diizinkan." });
  }

  const data = req.body;

  const connection = await mysql.createConnection({
    host: "7ds1z.h.filess.io",
    user: "Lokasi1_tailmatter",
    password: "a79b4f71bc1db05bff75410c826992ae5e3115e2",
    database: "Lokasi1_tailmatter",
  });

  try {
    await connection.execute(
      "INSERT INTO lokasi (ip_address, isp, device_name, village, county, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        data.ipAddress,
        data.isp,
        data.deviceName,
        data.location.village,
        data.location.county,
        data.location.latitude,
        data.location.longitude,
      ]
    );
    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Gagal menyimpan data." });
  } finally {
    await connection.end();
  }
}
