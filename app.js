var express = require('express');
var config = require('./config/config');
var glob = require('glob');

var app = express();

require('./config/express')(app, config);

app.listen(process.env['PORT'] || config.port);

