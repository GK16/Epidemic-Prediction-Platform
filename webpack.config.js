const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const jsonfile = require("jsonfile");
const package = require("./package.json");
const IS_DEV = process.env.NODE_ENV == "development";
const IS_PROD = process.env.NODE_ENV == "production";
const props = require("./props.json");

let externals = IS_PROD
  ? {
      externals: [
        {
          react: {
            root: "React",
            commonjs2: "react",
            commonjs: "react",
            amd: "react",
          },
        },
        {
          "react-dom": {
            root: "ReactDOM",
            commonjs2: "react-dom",
            commonjs: "react-dom",
            amd: "react-dom",
          },
        },
      ],
    }
  : {};

function writePack() {
  jsonfile.writeFile(
    "./dist/config.json",
    {
      appId: package.appId,
      name: package.name,
      version: package.version,
      description: package.description,
      plugin: package.plugin,
      keywords: package.keywords,
      author: package.author,
      attributes: package.attributes,
      license: "ISC",
      props: props || [],
    },
    {
      spaces: 2,
      EOL: "\r\n",
    },
    function (err) {
      if (err) console.error(err);
    }
  );
}

writePack();

module.exports = {
  entry: IS_PROD ? "./src/index.js" : "./src/app.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    library: package.appId,
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader?cacheDirectory=true",
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "sass-loader" },
        ],
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: "file-loader?name=assets/[name].[ext]",
      },
    ],
  },
  ...externals,
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html",
    }),
    new webpack.DefinePlugin({
      COMPONENT_ENV: JSON.stringify(process.env.COMPONENT),
    }),
  ],
};
