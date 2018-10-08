const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    app: './app/js/app.js'
    // testcontract: './app/js/test-contract.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/index.html', to: "index.html" },
      { from: './app/lib/jquery.min.js', to: "jquery.min.js" },
      { from: './app/lib/bootstrap.min.js', to: "bootstrap.min.js" },
      { from: './app/lib/web3.min.js', to: "web3.min.js" },
      { from: './app/js/contract.js', to: "contract.js" },
      { from: './app/css/bootstrap.min.css', to: "bootstrap.min.css" },
      { from: './app/css/style.css', to: "style.css" }
    ])
  ],
  module: {
    rules: [
      {
       test: /\.css$/,
       use: [ 'style-loader', 'css-loader' ]
      }
    ]
  }

  // node: {
	 //  fs: 'empty',
	 //  module: 'empty'
  // }  
}
