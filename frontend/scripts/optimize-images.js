#!/usr/bin/env node
/**
 * Image Optimization Script
 * Downloads and converts images to WebP format for better mobile performance
 * 
 * Usage: node scripts/optimize-images.js
 * 
 * Requirements: 
 * - npm install sharp
 * - Node.js 16+
 */

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGES_DIR = path.join(__dirname, '../public/images')
const IMAGES_TO_OPTIMIZE = [
  {
    url: 'https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg',
    outputName: 'chess-bg',
    width: 800, // Optimized for mobile
    quality: 75,
  },
]

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        return downloadImage(response.headers.location).then(resolve).catch(reject)
      }
      
      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    }).on('error', reject)
  })
}

async function optimizeImages() {
  // Ensure images directory exists
  await fs.mkdir(IMAGES_DIR, { recursive: true })

  // Try to import sharp
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch (e) {
    console.log('⚠️  Sharp not installed. Installing now...')
    console.log('   Run: npm install sharp --save-dev')
    console.log('')
    console.log('   Alternatively, manually convert the image to WebP and place it in:')
    console.log(`   ${IMAGES_DIR}/chess-bg.webp`)
    
    // Create a placeholder README
    await fs.writeFile(
      path.join(IMAGES_DIR, 'README.md'),
      `# Optimized Images

This directory contains optimized images for better mobile performance.

## Required Images

- \`chess-bg.webp\` - Optimized chess background image

## How to create

1. Download the original image:
   https://t3.ftcdn.net/jpg/04/29/98/02/360_F_429980259_3jA8o7Zw4UVIRrWQxRKf3sZrnQTIX4ZR.jpg

2. Convert to WebP using an online tool like:
   - https://squoosh.app/
   - https://cloudconvert.com/jpg-to-webp

3. Resize to 800px width and 75% quality for optimal mobile performance

4. Save as \`chess-bg.webp\` in this directory
`
    )
    return
  }

  console.log('🖼️  Optimizing images for mobile performance...\n')

  for (const img of IMAGES_TO_OPTIMIZE) {
    console.log(`  Downloading: ${img.url}`)
    
    try {
      const buffer = await downloadImage(img.url)
      
      // Convert to WebP
      const webpPath = path.join(IMAGES_DIR, `${img.outputName}.webp`)
      await sharp(buffer)
        .resize(img.width, null, { withoutEnlargement: true })
        .webp({ quality: img.quality })
        .toFile(webpPath)
      
      const stats = await fs.stat(webpPath)
      console.log(`  ✅ Created: ${img.outputName}.webp (${(stats.size / 1024).toFixed(1)} KB)`)
      
      // Also create AVIF for even better compression (modern browsers)
      const avifPath = path.join(IMAGES_DIR, `${img.outputName}.avif`)
      await sharp(buffer)
        .resize(img.width, null, { withoutEnlargement: true })
        .avif({ quality: img.quality })
        .toFile(avifPath)
      
      const avifStats = await fs.stat(avifPath)
      console.log(`  ✅ Created: ${img.outputName}.avif (${(avifStats.size / 1024).toFixed(1)} KB)`)
      
    } catch (error) {
      console.error(`  ❌ Failed to optimize ${img.outputName}:`, error.message)
    }
  }

  console.log('\n✅ Image optimization complete!')
}

optimizeImages().catch(console.error)
