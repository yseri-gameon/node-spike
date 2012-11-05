module.exports = function(app, sys) {
    app.get('/dnode', function(req, res, next) {
        sys.asyncblock(function(flow){
            flow.errorCallback = function(err) { next(err); };

            flow.firstArgIsError = true;
            res.render('iconv-jp', { title: 'iconv-jpテスト' }, flow.add());
            var html = flow.wait();
            console.log(html);

            flow.firstArgIsError = false;
            sys.dnode.connect(5004, flow.add(['remote', 'conn']));
            var ret = flow.wait();
            ret.remote.fpnize(html, flow.add());
            html = flow.wait();

            res.header('Content-Type', 'text/html; charset=shift_jis');
            console.log(html);
            res.send(html);
        });
    });
};
