import path from 'path'
import fs from 'fs'

export default function svgResolverPlugin() {
    return {
        name: 'svg',

        resolveId(source, importer, options) {
            if (source.endsWith('.svg')) {
                return path.resolve(path.dirname(importer), source)
            }
        },

        load(id) {
            if (id.endsWith('.svg')) {
                const referenceId = this.emitFile({
                    type: 'asset',
                    name: path.basename(id),
                    source: fs.readFileSync(id)
                })
                return `export default import.meta.ROLLUP_FILE_URL_${referenceId}`
            }
        }
    }
}
