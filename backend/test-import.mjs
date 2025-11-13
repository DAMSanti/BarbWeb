#!/usr/bin/env node
// Quick test to find the error

console.log('1. Testing dotenv...')
try {
  const dotenv = await import('dotenv')
  console.log('✓ dotenv imported')
  dotenv.config()
  console.log('✓ dotenv.config() called')
} catch (e) {
  console.error('✗ dotenv error:', e.message)
}

console.log('\n2. Testing path...')
try {
  const path = await import('path')
  console.log('✓ path imported')
} catch (e) {
  console.error('✗ path error:', e.message)
}

console.log('\n3. Testing Express...')
try {
  const express = await import('express')
  console.log('✓ express imported')
  const app = express.default()
  console.log('✓ app created')
} catch (e) {
  console.error('✗ express error:', e.message)
  console.error('Stack:', e.stack)
}

console.log('\n4. All tests passed!')
