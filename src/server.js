const http = require('http')

const _this = new http.Server()

const _listen = _this.listen

_this.listen = function(){
    console.log('\x1b[36m%s\x1b[0m',`listening on ${arguments[0]}`)
    _listen.call(_this,...arguments)
}

module.exports = _this

// _this
