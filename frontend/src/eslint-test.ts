/**
 * TEST FILE: Este archivo demuestra que ESLint detecta console.log
 * Eliminar después de verificar que ESLint funciona
 */

export function testConsoleDetection() {
  // ❌ ESLint debería detectar esto como error
  console.log('TEST: Este mensaje demuestra que ESLint está funcionando')
  
  return 'test'
}
