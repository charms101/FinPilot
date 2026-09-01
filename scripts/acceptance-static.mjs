import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const html = readFileSync(join(root, 'out', 'index.html'), 'utf8')
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const allDependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
}

const requiredBuiltCopy = [
  'See your finances like a bank statement',
  'No signup. No account linking.',
  'This is an educational simulation',
  'not a real bank',
  'not FDIC-insured',
  'not personalized financial advice',
  'All figures you enter stay in your browser',
  'Nothing is sent to a server unless you choose to export a file yourself',
]

for (const copy of requiredBuiltCopy) {
  assert.equal(html.includes(copy), true, `Built HTML is missing required copy: ${copy}`)
}

const removedStarterAssets = ['file.svg', 'globe.svg', 'next.svg', 'vercel.svg', 'window.svg']

for (const asset of removedStarterAssets) {
  assert.equal(existsSync(join(root, 'public', asset)), false, `Starter asset still exists in public/: ${asset}`)
  assert.equal(existsSync(join(root, 'out', asset)), false, `Starter asset still exists in out/: ${asset}`)
}

const forbiddenPackages = [
  '@clerk/nextjs',
  '@prisma/client',
  '@prisma/adapter-pg',
  'openai',
  'pg',
  'plaid',
  'react-hook-form',
  'tesseract.js',
]

for (const packageName of forbiddenPackages) {
  assert.equal(packageName in allDependencies, false, `Forbidden package is installed: ${packageName}`)
}

const forbiddenFiles = [
  'src/middleware.ts',
  'prisma/schema.prisma',
  'prisma.config.ts',
]

for (const filePath of forbiddenFiles) {
  assert.equal(existsSync(join(root, filePath)), false, `Forbidden backend/auth file exists: ${filePath}`)
}

function hasFiles(directoryPath) {
  if (!existsSync(directoryPath)) {
    return false
  }

  return readdirSync(directoryPath).some((entry) => {
    const entryPath = join(directoryPath, entry)
    return statSync(entryPath).isDirectory() ? hasFiles(entryPath) : true
  })
}

assert.equal(hasFiles(join(root, 'src', 'app', 'api')), false, 'Forbidden API route files exist in src/app/api')

console.log('Static acceptance checks passed.')
