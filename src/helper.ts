import fs from 'fs'
const { JSDOM } = require('jsdom')

const read = (path: string) => fs.existsSync(path) && fs.lstatSync(path).isFile() ? fs.readFileSync(path, {
  encoding: 'utf8'
}) : 'OOPS, NOT FOUND'

const injectWsScript = (content: String): String => {
  const dom = new JSDOM(content)
  const document = dom.window.document
  const ioScriptNode = document.createElement('script')
  ioScriptNode.setAttribute('src', 'lib/socket.io.js')
  const logicScriptNode = document.createElement('script')
  logicScriptNode.textContent = `
    var socket = io.connect('http://localhost:3000');
    socket.on('update', function (data) {
        // logger.log(data)
        // logger.log(window.location.pathname)
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

module.exports = {
  read,
  injectWsScript
}