module.exports = function(app, sys) {
    app.get('/users', function(req, res){
      res.send("respond with a resource");
    });
};
