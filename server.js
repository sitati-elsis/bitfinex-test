const { PeerRPCServer, PeerPub } = require('grenache-nodejs-ws')
const Link = require('grenache-nodejs-link')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

// Client factory
const peer = new PeerRPCServer(link, {})
peer.init()
const init_client = peer.transport('server')
init_client.listen(1337)
setInterval(() => {
  link.announce('init_client', init_client.port, {})
}, 1000)

// Bid/Ask publisher
const publisher = new PeerPub(link, {})
publisher.init()

const servicePublisher = publisher.transport('server')
servicePublisher.listen(1338)

setInterval(function () {
  link.announce('publish_Ask/Bid', servicePublisher.port, {})
}, 1000)

// Port generator
function* portGenerator(){
    let port = 3000
    const lastPort = 5000
    while (port < lastPort) {
      yield port
      port += 1
    }
    throw new Error('No available ports')
 }

const nextPort = portGenerator()

init_client.on('request', (rid, key, initPayload, handler) => {
  // Create client oder book and instance 
  const submit_order = peer.transport('server')
  const serveId = nextPort.next().value
  submit_order.listen(serveId)

  const orderBook = {
    "Ask": {},
    "Bid": {}
  }

  // create client oder handler
  submit_order.on(`request`, (rid, key, payload, handler) => {
    console.log(`server:${serveId} received request:${rid}`)
    const book = orderBook[payload.type]
    // TODO: do the match logic here

    // update order if exists
    if (payload.price in book) {
      const p = parseFloat(payload.amount) + parseFloat(book[payload.price].amount)
      book[payload.price] = { type: payload.type, amount: p.toString()}
    }
    // add order if not exists
    else {
      book[payload.price] = { type: payload.type, amount: payload.amount }
    }

    // Broadcast order book to all clients
    if (payload.source === "user") {
      servicePublisher.pub(JSON.stringify({
        "clientId": initPayload.clientId,
        "payload": { "price": payload.price, "type": payload.type, "amount": book[payload.price].amount },
        "rid": rid
      }))
    }

    // Return current order book to client
    handler.reply(null, { orderBook, rid})
  })

  setInterval(() => {
      link.announce(`submit_order:${initPayload.clientId}`, submit_order.port, {})
  }, 1000)
  
  console.log(`Client connected with ID: ${initPayload.clientId} at server:${serveId} successfully`)
  handler.reply(null, {serveId: serveId})
})