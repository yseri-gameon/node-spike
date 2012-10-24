
/*
 * GET home page.
 */

exports.index = function(req, res){
    var app = module.parent.exports;
    var conn = app.set('conn');
    conn.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
      if (err) throw err;
      console.log('The solution is: ', rows[0].solution);
      res.render('index', { title: rows[0].solution });
      //conn.end();
    });
};

