import { ServerResponse } from "http";
import server from './server'

const watcher = require('./watcher')
// const server = require('./server')
const helper = require('./helper')
const path = require('path')
const SIO = require('socket.io')
const logger = console

const servedDir = path.resolve(process.env.PWD, process.argv[2] || '')

const PORT: Number = 3000

server.on('request', (req: Request, res: ServerResponse) => {
    const filePath = path.join(servedDir, req.url)
    let content: String = ''
    if (req.method === 'GET') {
        if (req.url === '/lib/socket.io.js') {
            const url = process.env.PWD + '/node_modules/socket.io-client/dist/socket.io.js'
            content = helper.read(url)
        }
        else {
            content = helper.read(filePath)
            content = req.url.endsWith('.html') ? helper.injectWsScript(content) : content
        }
        res.statusCode = 200
        res.end(content)
    }
    else if (req.method === 'POST') {
        res.statusCode = 200
        res.end('')
    }

})

server.listen(PORT)

const subscribers: Array<any> = []

watcher.watch(servedDir, (eventType: String, filename: String) => {
    logger.log('event:', eventType, ',filename:', filename)
    subscribers.forEach(subscriber => subscriber.emit('update', { url: filename }))
})

SIO
    .listen(server)
    .on('connection', (csock: any) => {
        csock.on('disconnect', () => subscribers.splice(subscribers.indexOf(csock), 1))
        subscribers.push(csock)
    })
















