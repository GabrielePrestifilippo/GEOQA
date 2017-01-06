var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var FormData = require("form-data");
var multiparty = require('multiparty');

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  console.log("not auth");
  res.redirect('/');
};


router.get('/home', isAuthenticated, function(req, res){
  console.log("getting user");
  console.log(req.user.username);
  res.render('home', { user: req.user });
});


router.post('/uploadMap', function(req, response){
    var form = new multiparty.Form();

    form.on("part", function(part){
        if(part.filename)
        {
            var form = new FormData();
            form.append("upload", part);

            var r = request.post("http://ogre.adc4gis.com/convert",{ "headers": {"transfer-encoding": "chunked"}}, function(err, res, body){
                response.send(body);
                fs.writeFile('1.geojson', body, function (err) {
                    if (err) return console.log(err);
                    console.log('saving now into DB');
                });
            });

            r._form = form
        }
    });

    form.parse(req);

    //
});/*

*/


router.get('/signout', function(req, res) {
  req.logout();
  res.redirect('/login');
});





module.exports = router;
