#!/usr/bin/env node

/**
 * Test-Script um Backend-Verbindung zu überprüfen
 */

const http = require('http');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║                                                                ║');
console.log('║     🔍 BACKEND-VERBINDUNG TESTEN                              ║');
console.log('║                                                                ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Test 1: Health Check
console.log('Test 1: Health-Endpoint testen...');
const healthOptions = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/v1/health',
  method: 'GET',
  timeout: 5000,
};

const healthReq = http.request(healthOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('✅ Health-Check erfolgreich!');
    console.log('   Status:', res.statusCode);
    console.log('   Response:', data);
    console.log('');
    
    // Test 2: Login testen
    testLogin();
  });
});

healthReq.on('error', (error) => {
  console.log('❌ Health-Check fehlgeschlagen!');
  console.log('   Fehler:', error.message);
  console.log('');
  console.log('🔧 LÖSUNG:');
  console.log('   1. Starte das Backend: cd ../backend && npm run dev');
  console.log('   2. Stelle sicher, dass es auf Port 5001 läuft');
  console.log('');
  process.exit(1);
});

healthReq.on('timeout', () => {
  console.log('⏱️  Timeout - Backend antwortet nicht');
  healthReq.destroy();
  process.exit(1);
});

healthReq.end();

function testLogin() {
  console.log('Test 2: Login-Endpoint testen (mit falschen Daten)...');
  
  const loginData = JSON.stringify({
    email: 'test@test.com',
    password: 'test123'
  });
  
  const loginOptions = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/v1/users/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    },
    timeout: 5000,
  };
  
  const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('✅ Login-Endpoint erreichbar!');
      console.log('   Status:', res.statusCode);
      console.log('   Response:', data);
      console.log('');
      
      if (res.statusCode === 401 || res.statusCode === 400) {
        console.log('✅ Das ist OK - Backend antwortet korrekt auf ungültige Login-Daten');
      } else if (res.statusCode === 200) {
        console.log('⚠️  Warnung: Login war erfolgreich mit Test-Daten!');
      }
      
      console.log('');
      console.log('╔════════════════════════════════════════════════════════════════╗');
      console.log('║                                                                ║');
      console.log('║     ✅ BACKEND IST ERREICHBAR                                 ║');
      console.log('║                                                                ║');
      console.log('╚════════════════════════════════════════════════════════════════╝');
      console.log('');
      console.log('🔍 NÄCHSTE SCHRITTE:');
      console.log('   1. Überprüfe ob dein User im Backend existiert');
      console.log('   2. Überprüfe ob isApproved = true ist');
      console.log('   3. Schaue in die Metro-Logs für detaillierte Fehler');
      console.log('');
    });
  });
  
  loginReq.on('error', (error) => {
    console.log('❌ Login-Endpoint nicht erreichbar!');
    console.log('   Fehler:', error.message);
    process.exit(1);
  });
  
  loginReq.on('timeout', () => {
    console.log('⏱️  Timeout beim Login-Test');
    loginReq.destroy();
    process.exit(1);
  });
  
  loginReq.write(loginData);
  loginReq.end();
}
