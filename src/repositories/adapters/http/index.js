// Phase-2 stub. Will mirror dexieAdapter against a REST API.
// Endpoints planned:
//   GET    /:table             -> list
//   POST   /:table             -> create
//   GET    /:table/:uuid       -> getByUuid
//   PUT    /:table/:uuid       -> update
//   DELETE /:table/:uuid       -> remove

const notImplemented = (op) => () => {
  throw new Error(`httpAdapter.${op} not implemented yet (Phase 2)`)
}

export const httpAdapter = {
  list: notImplemented('list'),
  get: notImplemented('get'),
  getByUuid: notImplemented('getByUuid'),
  create: notImplemented('create'),
  update: notImplemented('update'),
  remove: notImplemented('remove'),
  query: notImplemented('query'),
  where: notImplemented('where'),
  count: notImplemented('count'),
}

export default httpAdapter
