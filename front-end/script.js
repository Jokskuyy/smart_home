const BASE_URL = "http://localhost:3000/api"; // ganti sesuai host jika beda

async function fetchData(endpoint) {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`);
    return await res.json();
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
    return null;
  }
}

function updateSensor(data) {
  document.getElementById("gas_level").textContent = data.gas_level;
  document.getElementById("gas_ppm").textContent = data.gas_ppm;
  document.getElementById("fire_status").textContent = data.fire_alarm_active
    ? "ACTIVE"
    : "Normal";
}

function updateClimate(data) {
  document.getElementById("temperature").textContent = data.temperature;
  document.getElementById("humidity").textContent = data.humidity;
}

function updateDevice(data) {
  document.getElementById("wifi_rssi").textContent = data.wifi_rssi;
  document.getElementById("device_status").textContent = data.status;
}
async function fetchSecurity() {
  const res = await fetch("/api/security/latest");
  const data = await res.json();
  if (data.success) {
    document.getElementById("security_event").textContent =
      data.data.event_type;
    document.getElementById("security_location").textContent =
      data.data.location;
  }
}

async function fetchAlert() {
  const res = await fetch("/api/alerts/latest");
  const data = await res.json();
  if (data.success) {
    document.getElementById("alert_title").textContent = data.data.title;
    document.getElementById("alert_message").textContent = data.data.message;
  }
}

async function refreshDashboard() {
  const sensor = await fetchData("sensors/latest");
  if (sensor?.success) updateSensor(sensor.data);

  const climate = await fetchData("climate/latest");
  if (climate?.success) updateClimate(climate.data);

  const device = await fetchData("devices/status");
  if (device?.success) updateDevice(device.data);

  document.getElementById(
    "timestamp"
  ).textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
}
async function setLight(mode) {
  await fetch(`${BASE_URL}/control/lights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: mode }),
  });
}

async function setFan(mode) {
  await fetch(`${BASE_URL}/control/fan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: mode }),
  });
}

async function setLock(mode) {
  await fetch(`${BASE_URL}/control/lock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: mode }),
  });
}

// Auto refresh every 5 seconds
refreshDashboard();
setInterval(refreshDashboard, 5000);

window.onload = () => {
  refreshDashboard();
  fetchSecurity();
  fetchAlert();
  setInterval(refreshDashboard, 5000);
};
