const EXPRESS = require('express');
var app = EXPRESS();

require('./src/setupProxy')(app);