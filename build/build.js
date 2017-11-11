const Rollup = require('rollup')
const Uglify = require('uglify-js')
const fs = require('fs')
const path = require('path')
const buble = require('rollup-plugin-buble')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')
const vue = require('rollup-plugin-vue')
const version = require('../package.json').version

const outputPath = path.join(__dirname, '/../', 'dist')

async function main () {
  const bundle = await Rollup.rollup({
    input: 'src/builder.js',
    plugins: [
      replace({ __VERSION__: version }),
      nodeResolve({ extensions: ['.js', '.json', '.vue'], preferBuiltins: false }),
      commonjs(),
      vue({ compileTemplate: true, css: 'dist/builder.css' }),
      buble()
    ]
  })

  const { code } = await bundle.generate({
    format: 'umd',
    name: 'Builder'
  })

  const output = path.join(outputPath, 'builder.js')

  fs.writeFileSync(output, code)
  fs.writeFileSync(path.join(outputPath, 'builder.min.js'), Uglify.minify(code, {
    compress: true,
    mangle: true,
  }).code)
}

main()
