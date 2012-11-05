module.exports = function(app, sys) {
    app.get('/iconv-jp', function(req, res, next) {
        sys.asyncblock(function(flow){
            flow.errorCallback = function(err) { next(err); };
            res.render('iconv-jp', { title: 'iconv-jpテスト' }, flow.add());
            var html = flow.wait();
            var iconv = new sys.iconv('UTF-8', 'Windows-31J');
            res.header('Content-Type', 'text/html; charset=shift_jis');
            res.send(iconv.convert(html));
        });
    });
};
