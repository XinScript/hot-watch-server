const watcher = require('./watcher')
const server = require('./server')
const fs = require('fs')
const path = require('path')
const sio = require('socket.io')(server)
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
    var socket = io('http://localhost');
    socket.on('update', function (data) {
      console.log(data);
    });
    `
    const head = document.querySelector('head')
    head.append(ioScriptNode)
    head.append(logicScriptNode)
    return dom.serialize()
}

server.on('request',(req,res)=>{
    const filePath = path.join(servedDir,req.url)
    let content = null
    if(req.url === '/lib/socket.io.js'){
        const url = process.env.PWD + '/node_modules/socket.io-client/dist/socket.io.js'
        content = read(url)
    }
    else{
        content = read(filePath)
        content = req.url.endsWith('.html') ? injectWsScript(content) : content 
    }
    res.end(content)
})

server.listen(PORT)

sio.on('connection',socket=>{
    watcher.watch(servedDir,(eventType,filename)=>{
        console.log('event:',eventType)
        console.log('file:',filename)
        sio.emit('update',{url:filename})
    })
})

