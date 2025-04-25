import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import { getCache, setCache } from '../utils/cache.js'
import { loadCollectionsMeta, getAllCollectionNames } from '../utils/iconify.js'
import { ApiResponse } from "../utils/apiErrorHandler.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const iconsDir = path.join(__dirname, '..', '..', 'node_modules', '@iconify', 'json')


function buildSVG({ body, width = 16, height = 16 }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${body}</svg>`
}

function svgToDataURI(svg) {
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

export async function getCollections(req, res, next) {
  const { page = 1, limit = 10 } = req.query
  try {
    const data = await loadCollectionsMeta()

    // Получаем список всех коллекций
    const collectionNames = Object.keys(data)

    // Пагинация
    const total = collectionNames.length
    const startIndex = (page - 1) * limit
    const paginatedCollectionNames = collectionNames.slice(startIndex, startIndex + limit)

    // Для каждой коллекции берем топ-3 популярных иконки
    const collectionsWithPreview = await Promise.all(
      paginatedCollectionNames.map(async (collection) => {
        const filePath = path.join(iconsDir, 'json', `${collection}.json`)
        const collectionData = JSON.parse(await fs.readFile(filePath, 'utf-8'))

        // Получаем 3 самых популярных иконки
        const sortedIcons = Object.keys(collectionData.icons)
          .map((iconName) => ({
            name: iconName,
            ...collectionData.icons[iconName],
          }))
          .sort()
          .slice(0, 3) // Берем топ-3

        const previewUris = sortedIcons.map((icon) => {
          const svg = buildSVG(icon)
          return svgToDataURI(svg)
        })

        return {
          collection,
          name: data[collection].name,
          previews: previewUris, // 3 превью иконок
        }
      })
    )

    return next(ApiResponse.goodRequest(200, {
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      result: collectionsWithPreview
    }))
  } catch (err) {
    console.error(err)
    return next(ApiResponse.internal('Не удалось загрузить коллекции'))
  }
}

export async function getIconsByCollection(req, res, next) {
  const { collection } = req.params
  const filePath = path.join(iconsDir, 'json', `${collection}.json`)

  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return next(ApiResponse.goodRequest(200, JSON.parse(data)))
  } catch {
    return next(ApiResponse.badRequest(404, 'Коллекция не найдена'))
  }
}

export async function searchIconsInCollection(req, res, next) {
  const { q, page = 1, limit = 20, collections } = req.query

  const collectionList = collections
    ? collections.split(',').map(c => c.trim())
    : await getAllCollectionNames()

  const cacheKey = `search:${collectionList.join(',')}:${q.toLowerCase()}`
  const cached = getCache(cacheKey)

  let results

  if (cached) {
    results = cached
  } else {
    results = []

    for (const collection of collectionList) {
      try {
        const filePath = path.join(iconsDir, 'json', `${collection}.json`)
        const data = JSON.parse(await fs.readFile(filePath, 'utf-8'))
        const allIcons = Object.keys(data.icons)
        const query = q.toLowerCase()

        const matchedIcons = query?.length ? allIcons.filter(name => name.toLowerCase().includes(query)) : allIcons
        for (const name of matchedIcons) {
          const icon = data.icons[name]
          const svg = buildSVG(icon)
          results.push({
            name,
            fullName: `${collection}:${name}`,
            collection,
            title: icon.title || null,
            tags: icon.tags || [],
            svg,
          })
        }
      } catch {
        console.warn(`Коллекция ${collection} не загружена`)
      }
    }

    // Сохраняем в кэш на 5 минут (300000 мс)
    setCache(cacheKey, results, 300_000)
  }

  const p = parseInt(page)
  const l = parseInt(limit)
  const paginated = results.slice((p - 1) * l, p * l)

  return next(ApiResponse.goodRequest(200, {
    meta: {
      total: results.length,
      page: p,
      limit: l,
    },
    result: paginated
  }))
}
