#!/bin/bash

# Script para crear usuario admin
# Uso: ./setup-admin.sh [email] [password] [name] [api_url]

EMAIL="${1:-santi@test.com}"
PASSWORD="${2:-Test12345!!}"
NAME="${3:-Santiago Admin}"
API_URL="${4:-http://localhost:3000}"

echo "📝 Creando usuario admin..."
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo "  Name: $NAME"
echo "  API URL: $API_URL"
echo ""

curl -X POST "$API_URL/auth/setup-admin" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"name\": \"$NAME\"
  }"

echo ""
echo "✅ Usuario admin creado/actualizado"
