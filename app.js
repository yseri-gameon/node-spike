
/**
 * Module dependencies.
 */

var express = require('express')
    , http = require('http')
    , path = require('path')
    , sys = module.exports.sys = {}
    , asyncblock = sys.asyncblock = require('asyncblock')
    , mysql = require('mysql')
    , Memcached = require('memcached')
    , generic_pool = require('generic-pool')
    , LRU = require('lru-cache')
    , OAuth = require('oauth').OAuth
    , config = sys.config = require('./config')

var app = sys.app = express();
require('./routes')(app, sys);

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.staticCache());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.configure('production', function(){
    app.use(function(err, req, res, next){
        console.error(err.stack);
        res.send(500, 'unexpected error.');
    });
});

sys.pool = generic_pool.Pool({
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

sys.cache = LRU({
    max: 500
    , maxAge: 1000 * 60 * 10
});

sys.memcached = new Memcached('localhost:11211', {retries:10,retry:10000});

var oauth = sys.oauth = new OAuth(
    null,
    null,
    config.app.consumer_key,
    config.app.consumer_secret,
    '1.0',
    null,
    'HMAC-SHA1'
);

console.log(oauth.authHeader('dummy', 'token', 'secret', 'GET'));

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

process.on('uncaughtException', function (err) {
    console.log('uncaughtException => ' + err);
});
