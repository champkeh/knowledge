const memory = new WebAssembly.Memory({initial: 1})

const importObject = {
    console: {
        log: function(offset, length) {
            const bytes = new Uint8Array(memory.buffer, offset, length)
            const string = new TextDecoder('utf8').decode(bytes)
            console.log(string)
        }
    },
    js: {
        mem: memory
    }
}

WebAssembly.instantiateStreaming(fetch('func.wasm'), importObject)
    .then(obj => {
        obj.instance.exports.writeHi()
    })
