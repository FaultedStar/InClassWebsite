// script.js

// Tiny helper: fetch with timeout
function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options; // 8s timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(resource, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

// Build a friendly, privacy-conscious greeting
function buildGreeting(data) {
  // GeoJS commonly returns: country, country_code, region, region_code, city, ip
  // We'll progressively fall back if some parts are missing.
  const city = (data.city || "").trim();
  const region = (data.region || data.region_name || "").trim(); // some clients use region_name
  const country = (data.country || data.country_name || "").trim();

  // Choose the most specific available
  let place = "";
  if (city && region && country) {
    place = `${city}, ${region}, ${country}`;
  } else if (city && country) {
    place = `${city}, ${country}`;
  } else if (region && country) {
    place = `${region}, ${country}`;
  } else if (country) {
    place = country;
  }

  // Local flavor greeting :)
  if (place) {
    return `Kia ora! 👋 You’re visiting from ${place}.`;
  }
  return `Kia ora! 👋 Great to have you here.`;
}

// Update the UI safely
function setGreeting(text) {
  const el = document.getElementById("location-greeting");
  if (el) el.textContent = text;
}

// Main init
async function initGeoGreeting() {
  const url = "https://get.geojs.io/v1/ip/geo.json";

  // Try once, then retry once if it fails (network hiccups happen)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetchWithTimeout(url, { timeout: 8000, cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setGreeting(buildGreeting(data));
      return; // success
    } catch (err) {
      if (attempt === 2) {
        // Final fallback
        setGreeting("Kia ora! 👋 Great to have you here.");
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Button demo (from your original)
  const btn = document.getElementById("myButton");
  if (btn) {
    btn.addEventListener("click", () => {
      alert("Button clicked!");
    });
  }

  // Start the greeting
  initGeoGreeting();
});