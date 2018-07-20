var express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const passport = require('passport');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname + '-' + new Date().toISOString());
  }
});
const upload = multer({storage: storage});
const path = require('path');
const {JWT_SECRET} = require('../config');
const CouponModel = require('../models/Coupon');
var router = express.Router();
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', { session: false });

//GETS THE USERID FROM JWT - returns the userid from a request 'authorization' header
function getUserIdFromJwt(req){
  //This removes the Bearer in front of the token and just gets token
  const token = req.headers.authorization.split(' ')[1];
  //console.log('The token is: ' + token);
	const tokenPayload = jwt.verify(token, JWT_SECRET);
	const userId = tokenPayload.user.userId;
  //console.log("This is the userId from JWT: " + userId);
  return userId;
}

// GETS ALL COUPONS
router.get('/', jwtAuth, (req, res) => {
  //console.log(req);
  const _userId = getUserIdFromJwt(req);
  //console.log(`The current user is: ${_userId}`);

  CouponModel.find({userId: _userId})
    .then(coupons => res.status(200).json({coupons, _userId}))
    .catch(err => {
        console.error(err);
        res.status(500).json({
          message: 'Internal server error'
        });
    });
});

// CREATES A NEW COUPON
router.post('/', jwtAuth, upload.single('couponImage'), (req, res) => {
  console.log(req.file);
  const _userId = getUserIdFromJwt(req);

  //console.log(`The current user is: ${_userId}`);
  console.log("This is the request from adding a coupon");

  const newCoupon = new CouponModel({
    merchantName: req.body.merchantName,
    code: req.body.code,
    expirationDate: req.body.expirationDate,
    description: req.body.description,
    couponUsed: req.body.couponUsed,
    companyLogo: req.body.companyLogo,
    couponImage: req.file.path,
    userId: _userId
  });

  //TODO: need to add expiration validation

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
  //console.log(req);
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

// UPDATES ONLY ITEMS PROVIDED OF AN IMAGE OF COUPON
router.patch('/:id', jwtAuth, upload.single('couponImage'), (req, res) => {
  console.log(req.file);

  const updateOps = {};
  const updateableFields = ['merchantName', 'code', 'expirationDate', 'description','couponImage'];

  updateableFields.forEach(field => {
    if(field in req.body) {
      updateOps[field] = req.body[field];
    }
  });

  CouponModel.findByIdAndUpdate(req.params.id, {$set: updateOps })
  .then(result => {
    res.status(200).json({
      message: 'patch request done to updated fields'
    })
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });

});

module.exports = router;
