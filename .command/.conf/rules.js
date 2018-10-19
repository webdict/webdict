const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const babelOptions = {
  "presets": [
    [
      "env",
      {
        "targets": {
          "browsers": [
            "last 2 Firefox versions",
            "last 4 Chrome versions"
          ]
        }
      }
    ],
    "react",
    "stage-0"
  ],
  "plugins": [
    [
      "import",
        {
          "libraryName": "antd",
          "style": "css"
        }
    ],
    [
      "transform-runtime",
      {
        "helpers": false,
        "polyfill": false,
        "regenerator": true,
        "moduleName": "babel-runtime"
      }
    ]
  ]
};
module.exports = [{
  test: /\.(ts|tsx)$/i,
  exclude: /(node_modules|bower_components)/,
  use: [{
    loader: 'babel-loader',
    options: babelOptions
  },
    'ts-loader'
  ]
}, {
  test: /\.(js|jsx)$/i,
  exclude: /(node_modules|bower_components)/,
  use: {
    loader: 'babel-loader',
    options: babelOptions
  }
}, {
  test: /\.css$/i,
  use: [MiniCssExtractPlugin.loader, 'css-loader']
}, {
  test: /\.s[ac]ss$/i,
  use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
}, {
  test: /\.less$/i,
  use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
}, {
  test: /\.(svg|png|jpg|gif)$/i,
  loader: 'file-loader',
  options: {
    name: '[name].[ext]?[hash]',
    outputPath: 'static/'
  }
}];;
