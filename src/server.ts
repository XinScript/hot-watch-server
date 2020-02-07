import http from 'http'

const _this:http.Server = new http.Server()

const _listen:Function = _this.listen

_this.listen = function():http.Server{
    let args:IArguments = arguments
    console.log('\x1b[36m%s\x1b[0m',`listening on ${args[0]}`)
    return _listen.call(_this,...Array.from(args))
}

export default _this

