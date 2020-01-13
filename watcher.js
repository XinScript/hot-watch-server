const fs = require('fs')
module.exports = {
    watch(dirPath='.',listener){
        if(!fs.existsSync('src')){
            throw Error('src directory not exist')
        }else{
            fs.watch(dirPath,{recursive:true,persistent:true},listener)
        }
    }
}


