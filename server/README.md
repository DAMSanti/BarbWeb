# Server Wrapper

This directory exists to support legacy build commands on DigitalOcean App Platform.

- The real backend code now lives in `../backend`.
- DigitalOcean still runs `cd server && npm install && npm run build`.
- The wrapper forwards the `build` script to the root workspace backend build **and** generates `server/dist/index.js` that re-exports `../backend/dist/index.js`.

It is safe to remove this directory once the App Platform build & run commands are updated to point directly to the `backend` folder.
