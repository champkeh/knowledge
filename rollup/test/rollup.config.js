export default commandLineArgs => {
    // const inputBase = commandLineArgs.input || 'main.js'

    delete commandLineArgs.input
    return {
        input: 'main.js',
        output: {
            format: 'cjs'
        },
        plugins: [
            {
                buildStart(options) {
                    console.log(options)
                }
            }
        ]
    }
}
