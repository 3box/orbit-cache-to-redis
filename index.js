const leveldown = require('leveldown')
const iteratorStream = require('level-iterator-stream')
const { readdirSync, statSync } = require('fs')
const { join } = require('path')

const path = './orbitpath/QmRKsg1bAu9Q6GabQvmkA36RV28X928bdAQLYMQUkkSVWJ/12202b1e16eed4fae4e03c16dcfca812208e7ba8699c50a13c9ca917d4b614b17124.root'

const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())

// console.log(dirs('./orbitpath'))

// For each dir
  // get subfolder - (will there be multiple ever???)
  // creates orbit name
  // create and open a redis orbit db cache instance, pass name  (need to update orbidb redis to namespace by store name)
  // open as level down db and read create stream
  // on data from stream, put to redis cache instance


const db = leveldown(path)

db.open(function (err) {
  if (err) throw err
  const stream = iteratorStream(db.iterator({limit: -1 }))
  stream.on('data', (kv) => {
    console.log('%s -> %s', kv.key, kv.value)
  })
})

setInterval(function() {}, 1000);
