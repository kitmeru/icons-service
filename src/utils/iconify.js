import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const iconsDir = path.join(__dirname, '..', '..', 'node_modules', '@iconify', 'json')

export async function loadCollectionsMeta() {
  try {
    const file = path.join(iconsDir, 'collections.json')
    const data = await fs.readFile(file, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    throw err;
  }
}

export async function getAllCollectionNames() {
  const meta = await loadCollectionsMeta()
  return Object.keys(meta)
}