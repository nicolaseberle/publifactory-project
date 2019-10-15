/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const express = require('express');
const http = require('http');
const favicon = require('express-favicon');
const config = require('../config').backend;
const serveStatic = require('serve-static');
const path = require('path');
const url = require('url');
const fs = require('fs');

// insure DB with admin user data
// require('./config/seed')

/**
 * Initiate SSL/TLS
 * We verify certbot's certificate and private keys.
 * If doesn't exist, we take an unsecured certificate.
 */
/*
const credentials = {
  key: (fs.existsSync('/etc/letsencrypt/live/api.publifactory.co/privkey.pem') === true
      ? fs.readFileSync('/etc/letsencrypt/live/api.publifactory.co/privkey.pem')
      : fs.readFileSync(path.join(__dirname, '../ssl/key.pem'))),
  cert: (fs.existsSync('/etc/letsencrypt/live/api.publifactory.co/fullchain.pem') === true
      ? fs.readFileSync('/etc/letsencrypt/live/api.publifactory.co/fullchain.pem')
      : fs.readFileSync(path.join(__dirname, '../ssl/server.crt')))
};
*/

// Setup server
const app = express();
const WebSocket = require('ws');

const server = http.createServer(app);

const ws = new WebSocket.Server({ noServer: true });

// TODO Move and + build class
ws.on('connection', socket => {
	console.log(socket);
	socket.on('message', msg => {});
});

server.on('upgrade', (request, socket, head) => {
	console.log('########### UPGRADE########');
	const pathname = url.parse(request.url).pathname;

	if (pathname === '/collaboration') {
		ws.handleUpgrade(request, socket, head, function done(ws, socket) {
			ws.emit('connection', ws, request);
			setInterval(() => {
				ws.send(JSON.stringify({ event: 'SECTION_UPDATE', msg: 'toto' }));
			}, 6000);
		});
	}
});

const socketIo = require('socket.io')(server);
const shareDB = require('./config/sharedb/sharedb');

require('./config/database')();
require('./config/socketio')(socketIo);
require('./config/express')(app);
require('./routes')(app);

if (process.env.NODE_ENV === 'production') {
	//app.use('/static', express.static(path.join(__dirname, '/../client/dist/static')))
	//app.use(favicon(path.join(__dirname, '/../client/dist/static/favicon.ico')));
	app.use(serveStatic(__dirname + '/../client/dist'));
	console.log(__dirname + '/../client/dist');
	console.log('listen port :' + config.port);
}

server.listen(config.port, config.ip, function() {
	console.log('Express side server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
