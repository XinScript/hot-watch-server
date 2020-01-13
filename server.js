const http = require('http')

const PORT = 9527

const _this = new http.Server()

const _listen = _this.listen

_this.listen = function(){
    console.log('\x1b[36m%s\x1b[0m',`listening on ${PORT}`)
    _listen.call(_this,...arguments)
}

_this

// module.exports = {
//     _server,
//     listen(port=9527){
//         if(this._server.listening){
//             this._server.close()
//         }
//         console.log('\x1b[36m%s\x1b[0m',`listening on ${port}`)
//         this._server.listen(port)
//     },
// }