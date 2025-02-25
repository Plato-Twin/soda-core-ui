import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
export default {
  // entry: 'src/index.tsx',
  esm: {
    type: 'rollup'
  },
  extraExternals: ['antd', '@ant-design/icons', 'react'],
  extraRollupPlugins: [peerDepsExternal(), resolve()],
  extraBabelPlugins: [
    [
      'file-loader',
      {
        name: '[hash].[ext]',
        extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
        publicPath: './src/assets',
        outputPath: './dist/assets',
        context: '',
        limit: 10000
      }
    ],
    [
      'babel-plugin-import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true
      },
      'antd'
    ]
  ]
}
