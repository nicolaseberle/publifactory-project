/**
 * Project config file includes dev/prod and frontend/backend
 */
var path = require('path')
var _ = require('lodash')

var backendBase = {
  // Root path of server
  root: path.normalize(__dirname),

  // Server port
  port: process.env.PORT || 4000,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: process.env.SECRET || 'publifactory-project-secret'
  },

  // List of user roles
  userRoles: ['admin', 'editor','user'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  }
}

var development = {
  email : {
    host: "smtp.ethereal.email",//'ssl0.ovh.net',//
    port : 587,//465,
    secure: false,//true,
    auth: {
      'user' : "janice.lang@ethereal.email",
      'pass' : "q9NeaMEEJbxpBRaW5j"
    }
  },
  frontend: {
    port: 9001,
    assetsRoot: path.resolve(__dirname, './client/src'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      '/api': { target: 'http://localhost:' + backendBase.port, changeOrigin: true },
      '/socket.io': { target: 'http://localhost:' + backendBase.port, changeOrigin: true, ws: true }
    },
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  },
  backend: _.merge({}, backendBase, {
    mongo: {
      uri: 'mongodb://localhost:27017/mevn-dev'
    }
  })
}
var production = {
  email : {
    host: "smtp.ethereal.email",
    port : 587,
    secure: false,
    auth: {
      "user": "janice.lang@ethereal.email",
      "pass": "q9NeaMEEJbxpBRaW5j"
    }
  },
  frontend: {
    index: path.resolve(__dirname, './client/dist/index.html'),
    assetsRoot: path.resolve(__dirname, './client/dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    cssSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css']
  },
  backend: _.merge({}, backendBase, {
    // whether backend servers the frontend, you can use nginx to server frontend and proxy to backend services
    // if set to true, you need no web services like nginx
    serverFrontend: true,

    // Server IP
    ip: process.env.OPENSHIFT_NODEJS_IP
      || process.env.ip
      || undefined,
    // ip: process.env.APP_HOST || process.env.APP_IP || process.env.HOST || process.env.IP,
    // Server port
    port: process.env.APP_PORT || process.env.PORT || 8080,
    // MongoDB connection options
    mongo: {
      uri: 'mongodb://admin:admin42@ds129904.mlab.com:29904/publifactory-project'
      // uri: process.env.MONGODB_URI || process.env.MONGOHQ_URI
    },

    // frontend folder
    frontend: path.resolve(__dirname, './client/dist')
  })
}

var config = process.env.NODE_ENV === 'production' ? production : development

module.exports = _.assign({}, config)
