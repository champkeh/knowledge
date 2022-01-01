export default {
    input: 'main.js',
    output: {
        dir: 'dist',
        format: 'cjs',
        exports: 'named'
    },
    plugins: [
        {
            name: '1',
            options(options) {
                console.log('options 1')
            },
            resolveId(source, importer) {
                console.log('resolveId 1')
                console.log(source, importer)
            },
            load(id) {
                console.log('load 1')
                if (id === 'hello') {
                    return `export default 'hello';`
                }
            }
        },
        {
            name: '2',
            options(options) {
                console.log('options 2')
            },
            async resolveId(source, importer) {
                console.log('resolveId 2')
                console.log(source, importer)
                if (!importer) {
                    const resolution = await this.resolve(source, undefined, { skipSelf: true })
                    console.log(resolution)
                    if (!resolution) return null
                }
            },
            load(id) {
                console.log('load 2')
                if (id === 'main') {
                    return 'export default "hello world"'
                }
            }
        },
        {
            name: '3',
            options(options) {
                console.log('options 3')
            },
            resolveId(source, importer) {
                console.log('resolveId 3')
                console.log(source, importer)
            }
        },
    ]
}
