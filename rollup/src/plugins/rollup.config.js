import first from './rollup-plugin-hooks'
import paintWorkletPlugin from "./rollup-plugin-register-paint-worklet";

export default {
    input: 'main.js',
    output: {
        dir: 'dist',
        format: 'es',
    },
    plugins: [
        first(),
        paintWorkletPlugin(),
    ]
}
