/*
 * This program reads a sourcemap from stdin and replaces the
 * "mappings" property with human read-able content. It writes
 * the output to stdout.
 *
 * 1. install the dependencies:
 *    npm i concat-stream vlq
 *
 * 2. optional: install jq for pretty printing json
 *    npm i jq -g
 *
 * 3. run the command line so:
 *
 *    cat my-source-map.js.map | node decode | jq .
 */

const concat = require('concat-stream')
const vlq = require('vlq')

const formatMappings = (mappings, sources, names) => {
    const vlqState = [ 0, 0, 0, 0, 0 ]
    return mappings.split(';').reduce((accum, line, i) => {
        accum[i + 1] = formatLine(line, vlqState, sources, names)
        vlqState[0] = 0
        return accum
    }, {})
}

const formatLine = (line, state, sources, names) => {
    const segs = line.split(',')
    return segs.map(seg => {
        if (!seg) return ''
        const decoded = vlq.decode(seg)
        for (let i = 0; i < 5; i++) {
            state[i] = typeof decoded[i] === 'number' ? state[i] + decoded[i] : state[i]
        }
        return formatSegment(...state.concat([ sources, names ]))
    })
}

const formatSegment = (col, source, sourceLine, sourceCol, name, sources, names) =>
    `${col + 1} => ${sources[source]} ${sourceLine + 1}:${sourceCol + 1}${names[name] ? ` ${names[name]}` : ``}`

process.stdin.pipe(concat(json => {
    const map = JSON.parse(json)
    process.stdout.write(JSON.stringify({
        ...map,
        mappings: formatMappings(map.mappings, map.sources, map.names)
    }))
}))
