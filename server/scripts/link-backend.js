import fs from 'fs'
import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.join(__dirname, '..', 'dist')
const targetFile = path.join(distDir, 'index.js')
const backendEntry = path.join(__dirname, '../../backend/dist/index.js')
let relativeImportPath = path.relative(distDir, backendEntry).replace(/\\/g, '/')

if (!relativeImportPath.startsWith('.')) {
	relativeImportPath = `./${relativeImportPath}`
}

fs.mkdirSync(distDir, { recursive: true })

const fileContents = `// Auto-generated to support legacy DigitalOcean run command\nimport('${relativeImportPath}').catch((error) => {\n  console.error('Failed to load backend entry point:', error)\n  process.exit(1)\n})\n`

fs.writeFileSync(targetFile, fileContents, 'utf8')

console.log(`[server-wrapper] Linked backend dist entry to ${targetFile}`)
