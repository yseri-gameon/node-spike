
/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path')
    , asyncblock = require('asyncblock')
    , mysql = require('mysql')
    , generic_pool = require('generic-pool');

var app = module.exports = express();

var pool = generic_pool.Pool({
    name    : 'mysql',
    create  : function(cb) {
        var conn = mysql.createConnection({
            host    : 'localhost',
            user    : 'root',
            database : 'test',
        });
        conn.connect();
        cb(null, conn);
    },
    destroy : function(conn) { conn.end(); },
    max     : 20,
    min     : 5,
    idleTimeoutMillis : 30000,
    log     : true,
});

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('pool', pool);
app.set('asyncblock', asyncblock);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

process.on('uncaughtException', function (err) {
    console.log('uncaughtException => ' + err);
});
