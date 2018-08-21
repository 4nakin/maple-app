var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    if(req.session.username){
      res.redirect('/dashboard');
    }
    else{
      res.render('pages/index', {title: 'Coupon'});
    }
});

router.get('/signup', function(req, res) {
    res.render('pages/signup', { title: 'Register' });
});

router.get('/login', function(req, res) {
    res.render('pages/login', { title: 'Login' });
});

router.get('/dashboard', function(req, res) {
    if(req.session.username){
      res.render('pages/coupon', { title: 'Dashboard' });
    }
    else {
      res.redirect('/login');
    }
});



module.exports = router;
