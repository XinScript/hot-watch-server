const watcher = require('./watcher')
// const server = require('./server')
const fs = require('fs')
const path = require('path')
const logger = console
const targetPath = process.argv[3] || '.'
const sourcePath = path.resolve(__dirname,targetPath)

const readServerCode = () => fs.readFileSync('./server.js',{encoding:'utf8'})

let server = eval(readServerCode())

server.listen()

watcher.watch(sourcePath,(eventType,filename)=>{
    logger.log('restart the server...')
    server.listening ? server.stop : null
    server = eval(readServerCode())
    server.listen()
})

// server._server.on('request',(req,res)=>{
//     console.log(req.path)
//     res.end('fuck')
// })
