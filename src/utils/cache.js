const cache = new Map()

export function setCache(key, value, ttl = 300_000) {
  cache.set(key, {
    value,
    expires: Date.now() + ttl
  })
}

export function getCache(key) {
  const item = cache.get(key)
  if (!item) return null

  if (Date.now() > item.expires) {
    cache.delete(key)
    return null
  }

  return item.value
}

export function clearCache(key) {
  cache.delete(key)
}