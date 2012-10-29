module.exports = function(app, sys) {
    app.get('/mysql', function(req, res, next) {
        sys.asyncblock(function(flow){
            flow.errorCallback = function(err) { next(err); };
            var result = sys.cache.get('node_test_user_all');
            if (!result) {
                sys.pool.acquire(flow.add());
                var conn = flow.wait();
                conn.query('SELECT id, name, gender, age FROM node_test_user', flow.add(['rows', 'fields']));
                result = flow.wait();
                sys.cache.set('node_test_user_all', result);
                sys.pool.release(conn);
                console.log('from database');
            } else {
                console.log('from cache');
            }
            //console.log(result);

            res.render('index', { title: 'node test users', users: result['rows'] });
        });
    });
};
