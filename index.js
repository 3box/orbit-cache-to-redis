const leveldown = require('leveldown')
const iteratorStream = require('level-iterator-stream')
const { readdirSync, statSync } = require('fs')
const { join } = require('path')
const redisCache = require('orbit-db-cache-redis')

const path = './orbitpath'
const redisHost = '127.0.0.1'

const orbitRedisCache = redisCache({host: redisHost})

const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())

const getDBStream = async (db) => {
  return new Promise((resolve, reject) => {
    db.open( err => {
      if (err) reject(err)
      resolve(iteratorStream(db.iterator({limit: -1 })))
    })
  })
}

let streamCloseCount = 0

const streamClose = (stream) => {
  return new Promise(function(resolve, reject) {
    stream.on('close', () => {
      stream.destroy()
      streamCloseCount++
      resolve()
    })
  })
}

let closeDBCount = 0

const closeDb = (db) => {
  return new Promise(function(resolve, reject) {
    db.close(err => {
      if (err) console.log(err)
      closeDBCount++
      resolve()
    })
  })
}

const syncStore = async (store) => {
  const subPath = dirs(`${path}/${store}`)[0] // ever more than 1?
  if (subPath === 'keystore') return
  const storeName = `${store}/${subPath}`
  console.log(`Copying Store: ${storeName} \n`)
  const dbpath = `${path}/${storeName}`
  const dbRedisCache = await orbitRedisCache.load('', {root: store, path: subPath})
  const db = leveldown(dbpath)
  const dbStream = await getDBStream(db)
  let keyCount = 0
  dbStream.on('data', (kv) => {
    // console.log('%s -> %s \n', kv.key, kv.value)
    dbRedisCache.set(kv.key.toString(), kv.value.toString())
    keyCount++
  })
  await streamClose(dbStream)
  console.log(`Copied ${keyCount} entries: ${storeName} \n`)
  await closeDb(db)
}

const run = async (path) => {
  const stores = dirs(path)
  // 1 store is keys for orbit node
  console.log(`Attempting to copy ${stores.length - 1} store caches ....\n`)
  for (i = 0; i < stores.length; i++) {
    await syncStore(stores[i])
  }
  console.log(`Finished: Copied ${streamCloseCount} store caches \n`)
  console.log(`Closed ${closeDBCount} caches \n`)
}

run(path)
