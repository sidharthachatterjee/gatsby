const { getDb } = require(`./index`)

async function createNode(node) {
  // console.log({ id: node.id })
  const db = getDb()

  const result = await db
    .collection(`nodes`)
    .findOneAndUpdate({ id: node.id }, { $set: node }, { upsert: true })
  // console.log({ result })
  return result
}

function updateNode(node) {
  return createNode(node)
}

function deleteNode({ id }) {
  const db = getDb()

  return db.collection(`nodes`).findOneAndDelete({ id })
}

function getNode(id) {
  const db = getDb()

  return db.collection(`nodes`).findOne({ id })
}

function reducer(state, action) {
  switch (action.type) {
    case `CREATE_NODE`: {
      createNode(action.payload, action.oldNode)
      return null
    }

    case `ADD_FIELD_TO_NODE`:
    case `ADD_CHILD_NODE_TO_PARENT_NODE`:
      updateNode(action.payload)
      return null

    case `DELETE_NODE`: {
      if (action.payload) {
        deleteNode(action.payload)
      }
      return null
    }

    default:
      return null
  }
}

const getNodes = () => {
  const db = getDb()
  return db
    .collection(`nodes`)
    .find()
    .toArray()
}
const getNodesByType = type => {
  const db = getDb()
  return db
    .collection(`nodes`)
    .find({
      "internal.type": type,
    })
    .toArray()
}
const getTypes = async () => {
  const db = getDb()
  return db.collection(`nodes`).distinct(`internal.type`)
}

const hasNodeChanged = () => {}
const getNodeAndSavePathDependency = () => {}

const findNodes = query => {
  // console.log({ query })
  const db = getDb()
  return db
    .collection(`nodes`)
    .find(query)
    .toArray()
}

const findNode = query => {
  // console.log({ query })
  const db = getDb()
  return db.collection(`nodes`).findOne(query)
}

module.exports = {
  getNode,
  createNode,
  updateNode,
  deleteNode,
  reducer,
  getNodes,
  getNodesByType,
  getTypes,
  hasNodeChanged,
  getNodeAndSavePathDependency,
  findNode,
  findNodes,
}
