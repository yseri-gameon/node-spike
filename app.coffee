cluster = require("cluster")
numCPUs = require("os").cpus().length
express = require("express")
http = require("http")
path = require("path")
sys = module.exports.sys = {}
asyncblock = sys.asyncblock = require("asyncblock")
mysql = require("mysql")
Memcached = require("memcached")
generic_pool = require("generic-pool")
LRU = require("lru-cache")
OAuth = require("oauth").OAuth
config = sys.config = require("./config")
sys.iconv = require('iconv-jp').Iconv
sys.dnode = require('dnode')


sys.pool = generic_pool.Pool(
  name: "mysql"
  create: (cb) ->
    conn = mysql.createConnection(
      host: "localhost"
      user: "root"
      database: "test"
    )
    conn.connect()
    cb null, conn

  destroy: (conn) ->
    conn.end()

  max: 20
  min: 5
  idleTimeoutMillis: 30000
#log     : true,
)

sys.cache = LRU(
  max: 500
  maxAge: 1000 * 60 * 10
)
sys.memcached = new Memcached("localhost:11211",
  retries: 10
  retry: 10000
)
oauth = sys.oauth = new OAuth(null, null, config.app.consumer_key, config.app.consumer_secret, "1.0", null, "HMAC-SHA1")
console.log oauth.authHeader("dummy", "token", "secret", "GET")

#
#if (cluster.isMaster) {
#    for (var i = 0; i < numCPUs; i++) {
#        cluster.fork();
#    }
#
#    cluster.on('death', function(worker) {
#        console.log('worker ' + worker.pid + ' died');
#    });
#} else {
#
console.log "worker spawn"
app = express()
require("./routes") app, sys
app.set "port", process.env.PORT or 3000
app.set "views", __dirname + "/views"
app.set "view engine", "ejs"
app.use express.favicon()
app.use express.logger("dev")
app.use express.bodyParser()
app.use express.methodOverride()
app.use express.static(path.join(__dirname, "public"))
app.use app.router
app.configure "development", ->
  app.use express.errorHandler()

app.configure "production", ->
  app.use (err, req, res, next) ->
    console.error err.stack
    res.send 500, "unexpected error."


http.createServer(app).listen app.get("port"), ->
  console.log "Express server listening on port " + app.get("port")

process.on "uncaughtException", (err) ->
  console.log "uncaughtException => " + err


#}
