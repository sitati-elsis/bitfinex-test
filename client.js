const { PeerRPCClient, PeerSub  }  = require('grenache-nodejs-ws')
const Link = require('grenache-nodejs-link')
const inquirer = require('inquirer')
var Table = require('cli-table3');

const link = new Link({
  grape: 'http://127.0.0.1:30001',
  requestTimeout: 10000
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()

// generate random client Ids
const clientPayload = { clientId: Math.floor(Math.random() * Date.now()) }

peer.request('init_client', clientPayload, { timeout: 100000 }, (err, result) => {
  if (err) throw err
  console.log(`\n Client with ID ${clientPayload.clientId} initialized successfully at ${result.serveId} \n`)
  Promise.all([handleInput()])
})

const seen = new Set()
const handleInput = async () => {
  // subscribe to other clients events Ask and Bids
  const subscriber = new PeerSub(link, {})
  subscriber.init()
  subscriber.sub('publish_Ask/Bid', { timeout: 10000 })

  subscriber.on('message', (data) => {
    const msg = JSON.parse(data)
    if (msg.clientId !== clientPayload.clientId && !seen.has(msg.rid)) {
      seen.add(msg.rid)
      const payload = { ...msg.payload, "source": "event" }
      peer.request(`submit_order:${clientPayload.clientId}`,payload,{ timeout: 100000 },(err, result) => {
        if (err) throw err
        console.log(`\n Order from client ${msg.clientId} with ID: ${result.rid} submitted successfully \n`)
      })
    }
  })

  // wait for user input
  const answers = await inquirer.prompt([
    { name: 'Order', message: 'Enter your Order: ', type: 'input' }
  ])

  // TODO: validate input
  const [type, amount, price] = answers.Order.split(' ')
  const payload = { type, amount, price, "source": "user"}

  peer.request(`submit_order:${clientPayload.clientId}`, payload, { timeout: 100000 }, (err, result) => {
    if (err) throw err
    console.log(`Order with ID: ${result.rid} submitted successfully \n`)

    // instantiate
    var table = new Table({
        head: ['Type', 'Amount', 'Price']
      , colWidths: [16, 16, 16]
    });

    Object.keys(result.orderBook["Ask"])
      .map((key) => ["ASK", result.orderBook["Ask"][key].amount, key])
      .forEach((row) => table.push(row))
    
    Object.keys(result.orderBook["Bid"])
      .map((key) => ["BID", result.orderBook["Bid"][key].amount, key])
      .forEach((row) => table.push(row))
    console.log(table.toString());

    Promise.all([handleInput()])
  })
}
