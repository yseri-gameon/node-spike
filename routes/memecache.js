module.exports = function(app, sys) {
    app.get('/memcache', function(req, res, next) {
        sys.asyncblock(function(flow){
            flow.errorCallback = function(err) { next(err); };
            sys.memcached.get('node_test_user_all', flow.add());
            var result = flow.wait();
            if (!result) {
                sys.pool.acquire(flow.add());
                var conn = flow.wait();
                conn.query('SELECT id, name, gender, age FROM node_test_user', flow.add(['rows', 'fields']));
                result = flow.wait();
                sys.memcached.set('node_test_user_all', result, 10, flow.add());
                var dummy = flow.wait();
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
