const REGISTER_WORKLET = 'register-paint-worklet:'

export default function paintWorkletPlugin() {
    return {
        name: 'paint-worklet',

        resolveId(source, importer, options) {
            // We remove the prefix, resolve everything to absolute ids and add the prefix again
            // This makes sure that you can use relative imports to define worklets
            if (source.startsWith(REGISTER_WORKLET)) {
                return this.resolve(source.slice(REGISTER_WORKLET.length), importer).then(
                    resolveId => REGISTER_WORKLET + resolveId.id
                )
            }
            return null
        },

        load(id) {
            if (id.startsWith(REGISTER_WORKLET)) {
                return `CSS.paintWorklet.addModule(import.meta.ROLLUP_FILE_URL_${this.emitFile({
                    type: 'chunk',
                    fileName: 'worklet.js',
                    id: id.slice(REGISTER_WORKLET.length)
                })});`
            }
        }
    }
}
