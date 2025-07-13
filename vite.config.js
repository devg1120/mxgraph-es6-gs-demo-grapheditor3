/*
export default  {
  root: 'src/grapheditor'
}
*/

import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src/grapheditor',
  resolve: {
    alias: {
      '@mxgraph': resolve(__dirname, './mxgraph-es6-gs/src')    // local
      //'@mxgraph':  'mxgraph-es6-gs'                               // git node_modules
    }
  },
})

