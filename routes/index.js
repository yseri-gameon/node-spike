var fs = require('fs');

module.exports = function(app, sys) {
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file === "index.js" || file.substr(file.lastIndexOf('.') + 1) !== 'js')
            return;
        var name = file.substr(0, file.indexOf('.'));
        require('./' + name)(app, sys);
    });

    app.get('/', function(req, res) {
        res.send("root page");
    });
};
