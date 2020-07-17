const path = require('path');

module.exports = {
  entry: {
    RBTreeApp: './src/RBTree/RBTreeApp.js',
    MinBinHeapApp: './src/MinBinHeap/MinBinHeapApp.js',
    BTreeApp: './src/BTree/BTreeApp.js',
    AnyTreeApp: './src/AnyTree/AnyTreeApp.js',
    indexApp: './src/index/indexApp.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public/js'),
  },

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }

};
