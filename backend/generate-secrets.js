// Script para generar JWT secrets seguros
const crypto = require('crypto');

console.log('\n🔐 Generando JWT Secrets Seguros...\n');

const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');

console.log('✅ JWT_SECRET:');
console.log(jwtSecret);

console.log('\n✅ JWT_REFRESH_SECRET:');
console.log(jwtRefreshSecret);

console.log('\n📋 Copia estos valores a tu .env o DigitalOcean:\n');
console.log('JWT_SECRET=' + jwtSecret);
console.log('JWT_REFRESH_SECRET=' + jwtRefreshSecret);

console.log('\n✨ Cada vez que ejecutes este script, obtendrás valores diferentes.\n');
