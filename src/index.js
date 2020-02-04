const watcher = require('./watcher')
const server = require('./server')
const fs = require('fs')
const path = require('path')
const SIO = require('socket.io')
const { JSDOM } = require('jsdom')
const logger = console

const servedDir = path.resolve(process.env.PWD,process.argv[2] || '')

const PORT = 9527

const read = path => fs.existsSync(path) && fs.lstatSync(path).isFile()? fs.readFileSync(path,{encoding: 'utf8' }) : 'NOT FOUND'

const injectWsScript = content =>{
    const dom = new JSDOM(content)
    const document = dom.window.document    
    const ioScriptNode = document.createElement('script')
    ioScriptNode.setAttribute('src','lib/socket.io.js')
    const logicScriptNode = document.createElement('script')
    logicScriptNode.textContent = `
    var socket = io.connect('http://localhost:3000');
    socket.on('update', function (data) {
        // console.log(data)
        // console.log(window.location.pathname)
        window.location.pathname === '/'+data.url && location.reload()
    });
    socket.on('connect', function (data) {
        console.log('socket connected')
    });
    `
    const head = document.querySelector('head')
    head.append(ioScriptNode)
    head.append(logicScriptNode)
    return dom.serialize()
}
const injectHtmlTemplate = content =>{
    const dom = new JSDOM(`<html>
        <head>
        </head>
        <body>
        <pre>${content}</pre>
        </body>
    </html>`)
    return dom.serialize()
}

server.on('request',(req,res)=>{
    const filePath = path.join(servedDir,req.url)
    let content = null
    if(req.method === 'GET'){
        if(req.url === '/lib/socket.io.js'){
            const url = process.env.PWD + '/node_modules/socket.io-client/dist/socket.io.js'
            content = read(url)
        }
        else{
            content = read(filePath)
            content = req.url.endsWith('.html') ? injectWsScript(content) : content
            // content = injectWsScript(content)
        }
        res.statusCode = 200
        res.end(content)
    }
    else if (req.method === 'POST'){
        res.statusCode = 200
        res.end('')
    }

})

server.listen(3000)

let watched = false

const subscribers = []

watcher.watch(servedDir,(eventType,filename)=>{
    console.log('event:',eventType,',filename:',filename)
    subscribers.forEach(subscriber=>subscriber.emit('update',{url:filename}))
})

SIO.listen(server)
.on('connection',csock=>{
    csock.on('disconnect',()=>subscribers.splice(subscribers.indexOf(csock),1))
    subscribers.push(csock)
})
















