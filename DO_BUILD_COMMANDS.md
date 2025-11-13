# DigitalOcean Build Configuration

## Build Command (COPY THIS EXACTLY):

```bash
bash backend/build.sh
```

## Run Command (COPY THIS EXACTLY):

```bash
cd /workspace/backend && npm start
```

---

## Explanation

### Build Command
The `backend/build.sh` script handles:
1. ✅ Root npm install (with legacy-peer-deps)
2. ✅ Frontend build
3. ✅ Backend npm install (with legacy-peer-deps)
4. ✅ Prisma client generation
5. ✅ Database schema push

### Run Command
- Navigates to backend directory
- Runs the start script which compiles TypeScript and starts the server

---

## Alternative (if bash script fails):

### Build Command Alternative:
```bash
npm install --legacy-peer-deps && npm run build:frontend && cd backend && npm install --legacy-peer-deps && npx prisma generate && npx prisma db push --skip-generate --accept-data-loss || true
```

### Run Command Alternative:
```bash
cd /workspace/backend && node dist/index.js
```

---

## If Still Failing:

1. Check `.npmrc` exists in root with:
   ```
   legacy-peer-deps=true
   unsafe-perm=true
   ```

2. Check `backend/package.json` has engines:
   ```json
   "engines": {
     "node": "22.x",
     "npm": "10.x"
   }
   ```

3. Check that `backend/package.json` includes:
   - `express-rate-limit`
   - `helmet`

---

Last Updated: November 13, 2025
