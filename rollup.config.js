import typescript2 from 'rollup-plugin-typescript2'
export default {
    input: './src/index.ts',
    output: [
        {
            file: `dist/index.js`,
            format: 'es'
        },
        {
            file: `dist/index.js`,
            format: 'cjs'
        }],
    plugins: [typescript2()]
}

