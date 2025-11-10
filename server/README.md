# Server Wrapper

This directory exists to support legacy build commands on DigitalOcean App Platform.

- The real backend code now lives in `../backend`.
- DigitalOcean still runs `cd server && npm install && npm run build`.
- The wrapper forwards the `build` script to the root workspace backend build.

It is safe to remove this directory once the App Platform build command is updated to point directly to the `backend` folder.
