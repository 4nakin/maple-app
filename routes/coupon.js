var express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const passport = require('passport');
const {JWT_SECRET} = require('../config');
const CouponModel = require('../models/Coupon');

var router = express.Router();
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', { session: false });

//GETS THE USERID FROM JWT - returns the userid from a request 'authorization' header
function getUserIdFromJwt(req){
  //This removes the Bearer in front of the token and just gets token
  const token = req.headers.authorization.split(' ')[1];
  console.log('The token is: ' + token);
	const tokenPayload = jwt.verify(token, JWT_SECRET);
	const userId = tokenPayload.user.userId;
  console.log("This is the userId from JWT: " + userId);
  return userId;
}

// GETS ALL COUPONS
router.get('/', jwtAuth, (req, res) => {
  console.log(req);

  const _userId = getUserIdFromJwt(req);
  console.log(`The current user is: ${_userId}`);

  CouponModel.find({userId: _userId})
    .then(coupons => res.json({coupons, _userId}))
    .catch(err => {
        console.error(err);
        res.status(500).json({
        message: 'Internal server error'
        });
    });
});

// CREATES A NEW COUPON
router.post('/', jwtAuth, (req, res) => {

  const _userId = getUserIdFromJwt(req);

  console.log(`The current user is: ${_userId}`);
  console.log("This is the request from adding a coupon");

  const newCoupon = new CouponModel({
    merchantName: req.body.merchantName,
    code: req.body.code,
    expirationDate: req.body.expirationDate,
    description: req.body.description,
    couponUsed: this.couponUsed,
    companyLogo: this.companyLogo,
    userId: _userId
  });


  // var today = new Date();
  // console.log(today);
  // var dd = today.getDate();
  // var mm = today.getMonth()+1; //January is 0!
  // var yyyy = today.getFullYear();
  //
  // if(dd<10) {
  //     dd = '0'+dd
  //   }
  //
  //   if(mm<10) {
  //     mm = '0'+mm
  // }
  //
  // today = mm + '/' + dd + '/' + yyyy;
  // console.log(`Today is: ${today}`);
  //
  // //need to do validations on expirationDate: req.body.expirationDate
  // console.log(`The date entered in form is ${req.body.expirationDate}`);
  // if(req.body.expirationDate < today){
  //   console.log('Invalid Date. This date is in the past');
  //   res.status(400).json({
  //       error: 'Invalid Date. This date is in the past'
  //   });
  // }

  newCoupon.save()
      .then(function(coupon) {
        const savedCoupon = coupon.toObject();
        console.log(savedCoupon);
        res.status(201).json(savedCoupon);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send(err);
      });
});

// DELETES A NEW COUPON
router.delete('/:id', jwtAuth, (req, res) => {
  console.log(req);
  CouponModel.findByIdAndRemove(req.params.id)
  .then(coupon => res.status(204).end())
  .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// EDITS A NEW COUPON
router.put('/:id', jwtAuth, (req, res) => {
  console.log(`req.params.id:  ${req.params.id}`);
  console.log(`req.body.id: ${req.body.id}`);
  console.log(`The request on the put coupon endpoint is: ${Object.values(req.body)}`);
  console.log(Object.values(req.body));


  // if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
  //   res.status(400).json({
  //     error: 'Request path id and request body id values must match'
  //   });
  // }


  const updated = {};
  const updateableFields = ['merchantName', 'code', 'expirationDate', 'description'];

  updateableFields.forEach(field => {
    if(field in req.body) {
      updated[field] = req.body[field];
    }
  });

  CouponModel.findByIdAndUpdate(req.params.id, {$set: updated }, { new: true})
  .then(updatedCoupon => res.status(204).end())
  .catch(err => res.status(500).json({ message: 'Something went wrong'}));

});


module.exports = router;
