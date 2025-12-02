# Optimized Images

This directory contains optimized images for better mobile performance.

## Required Images

- `chess-bg.webp` - Optimized chess background image (800px width, 75% quality)

## How to create manually

1. Download the original image:
   https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg

2. Convert to WebP using an online tool like:
   - https://squoosh.app/
   - https://cloudconvert.com/jpg-to-webp

3. Resize to 800px width and 75% quality for optimal mobile performance

4. Save as `chess-bg.webp` in this directory

## Automatic optimization

Run the optimization script:

```bash
cd frontend
npm install sharp --save-dev
node scripts/optimize-images.js
```
