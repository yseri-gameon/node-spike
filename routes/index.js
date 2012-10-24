exports.index = function(req, res){
    var app = module.parent.exports;
    var pool = app.set('pool');
    var asyncblock = app.set('asyncblock');

    asyncblock(function(flow){
        pool.acquire(flow.add());
        var conn = flow.wait();
        conn.query('SELECT id, name, gender, age FROM node_test_user', flow.add(['rows', 'fields']));
        var result = flow.wait();
        //console.log(result);

        res.render('index', { title: 'node test users', users: result['rows'] });
        pool.release(conn);
    });
};
