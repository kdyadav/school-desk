import { db } from '../../../db/dexie'

const table = (name) => {
  const t = db.table(name)
  if (!t) throw new Error(`Unknown table: ${name}`)
  return t
}

export const dexieAdapter = {
  async list(tableName, { limit, offset } = {}) {
    let q = table(tableName).toCollection()
    if (offset) q = q.offset(offset)
    if (limit) q = q.limit(limit)
    return q.toArray()
  },

  async get(tableName, id) {
    return table(tableName).get(id)
  },

  async getByUuid(tableName, uuid) {
    return table(tableName).where('uuid').equals(uuid).first()
  },

  async create(tableName, data) {
    const id = await table(tableName).add(data)
    return table(tableName).get(id)
  },

  async update(tableName, id, patch) {
    await table(tableName).update(id, patch)
    return table(tableName).get(id)
  },

  async remove(tableName, id) {
    await table(tableName).delete(id)
    return true
  },

  async query(tableName, predicate) {
    return table(tableName).filter(predicate).toArray()
  },

  async where(tableName, indexField, value) {
    return table(tableName).where(indexField).equals(value).toArray()
  },

  async count(tableName) {
    return table(tableName).count()
  },
}

export default dexieAdapter
