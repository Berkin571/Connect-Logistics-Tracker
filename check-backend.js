#!/usr/bin/env node

/**
 * Backend-Verbindungstest
 * Prüft, ob das Backend erreichbar ist und die erwarteten Routen bereitstellt
 */

const https = require("http");

// Lade Umgebungsvariablen
require("dotenv").config();

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001/api/v1";
const WS_URL = process.env.EXPO_PUBLIC_WS_URL || "http://localhost:5001";

console.log("🔍 Backend-Verbindungstest\n");
console.log("API URL:", API_URL);
console.log("WebSocket URL:", WS_URL);
console.log("");

// Extrahiere Host und Port aus der URL
const apiUrl = new URL(API_URL);
const healthUrl = new URL(
  "/api/v1/health",
  `${apiUrl.protocol}//${apiUrl.host}`
);

console.log("Testing Health Endpoint:", healthUrl.href);

const options = {
  hostname: healthUrl.hostname,
  port: healthUrl.port || 5001,
  path: healthUrl.pathname,
  method: "GET",
  timeout: 5000,
};

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("\n✅ Backend ist erreichbar!");
    console.log("Status Code:", res.statusCode);
    console.log("Response:", data);
    console.log("\n🎉 Die App sollte sich mit dem Backend verbinden können.");
  });
});

req.on("error", (error) => {
  console.log("\n❌ Backend ist NICHT erreichbar!");
  console.log("Fehler:", error.message);
  process.exit(1);
});

req.on("timeout", () => {
  console.log(
    "\n⏱️  Timeout - Backend antwortet nicht innerhalb von 5 Sekunden"
  );
  console.log("\n🔧 Lösungsvorschläge:");
  console.log("1. Backend ist möglicherweise langsam oder hängt");
  console.log("2. Netzwerkverbindung überprüfen");
  req.destroy();
  process.exit(1);
});

req.end();
