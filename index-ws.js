const express = require('express')
const server = require('http').createServer()
const app = express()

app.get('/', (_req, res) => {
  res.sendFile('index.html', { root: __dirname })
})

server.on('request', app)
server.listen(3000, () => console.log('Listening on port 3000'))

// SIGNAL INTERRUPT... DO, SOMETHING...
process.on('SIGINT', () => {
  wss.clients.forEach(function each(client) {
    client.close()
  })
  server.close(() => {
    shutdownDB()
  })
})
/** Begin Web Socket */
const WebSocketServer = require('ws').Server

const wss = new WebSocketServer({ server })

wss.on('connection', function connection(ws) {
  const numClients = wss.clients.size
  console.log('Clients connected: ', { numClients })

  wss.broadcast(`Current visitors ${numClients}`)

  // "ws" has a state for every connection which is pulled from
  // an enum of connection states
  if (ws.readyState === ws.OPEN) {
    ws.send('Welcome to my server')

    db.run(`
      INSERT INTO visitors (count, time)
      VALUES (${numClients}, datetime('now'))
    `)
  }

  ws.on('close', function close() {
    wss.broadcast(`Current visitors ${numClients}`)
    console.log('A client has disconnected')
  })
})

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data)
  })
}

/** End Web Socket */
/** Begin Database */
const sqlite = require('sqlite3')
// can also use fsfe.db (.db is a convention, not requirement)
const db = new sqlite.Database(':memory:')

// Setup the DB before it runs
db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
  `)
})

// Typically we want to use "PREPARED STATEMENTS", not just free-hand SQL...
// BIG seurity concern!
function getCounts() {
  db.each('SELECT * FROM visitors', (_err, row) => {
    console.log(row)
  })
}

function shutdownDB() {
  getCounts()
  console.log('Shutting down 👋')
  db.close()
}
