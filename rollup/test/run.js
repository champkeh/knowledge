const rollup = require('../src/v0.3/rollup')

const entry = 'test/import-default-binding/main'
// const entry = 'test/form/self-contained-bundle/main'
// const entry = 'test/code'

rollup.rollup(entry, {}).then(bundle => {
    const res = bundle.generate()
    console.log(res)
})
