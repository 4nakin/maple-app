var express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const passport = require('passport');
const multer = require('multer');
const axios = require('axios');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({storage: storage});
const path = require('path');
const {JWT_SECRET} = require('../config');
const CouponModel = require('../models/Coupon');
var router = express.Router();
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', { session: false });

function capitalizeFirstLetterOfEveryWord(str){
  var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length, as your for does that for you
       // Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
   }
   // Directly return the joined string
   return splitStr.join(' ');
}

function formatMerchantName(string){
  string.toLowerCase();
  console.log(string.toLowerCase());
  const newstring = string.toLowerCase();
  return capitalizeFirstLetterOfEveryWord(newstring);
}

//GETS THE USERID FROM JWT - returns the userid from a request 'authorization' header
function getUserIdFromJwt(req){
  const token = req.headers.authorization.split(' ')[1];
	const tokenPayload = jwt.verify(token, JWT_SECRET);
	const userId = tokenPayload.user.userId;
  return userId;
}

// GETS ALL COUPONS
router.get('/', jwtAuth, (req, res) => {
  const _userId = getUserIdFromJwt(req);
  CouponModel.find({userId: _userId})
    .then(coupons => res.status(200).json({coupons, _userId}))
    .catch(err => {
        console.error(err);
        res.status(500).json({
          message: 'Internal server error'
        });
    });
});

// GETS SPECIFIC COUPON
router.get('/:id', jwtAuth, (req, res) => {
  const _userId = getUserIdFromJwt(req);
  CouponModel.findById(req.params.id)
    .then(coupons => res.status(200).json(coupons))
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

  let newCoupon;

  axios(
  {
    url: 'https://company.clearbit.com/v1/domains/find',
    params: { name: req.body.merchantName },
    headers: {
      'Authorization': 'Bearer sk_7e1d77b7b10477e9d101f3e756dac154'
    }
  })
  .then(function (response) {
    // handle success
    const apiData = response.data;

    if(apiData.logo === null){
      console.log(`company logo is ${apiData.logo}`);
      newCoupon = new CouponModel({
        merchantName: apiData.name,
        code: req.body.code.trim(),
        expirationDate: req.body.expirationDate,
        description: req.body.description.trim(),
        couponUsed: false,
        couponDisplayState: 'coupon-active',
        companyLogo: '/images/defaultImage.png',
        companyLogoUsed: '/images/defaultImage.png',
        companyDomain: '',
        couponImage: req.file.path,
        couponImageLinkDisplayState:'show-coupon-image-link-styling',
        userId: _userId
      });
    }
    else {
      newCoupon = new CouponModel({
        merchantName: apiData.name,
        code: req.body.code.trim(),
        expirationDate: req.body.expirationDate,
        description: req.body.description.trim(),
        couponUsed: false,
        couponDisplayState: 'coupon-active',
        companyLogo: apiData.logo + '?size=300',
        companyLogoUsed: apiData.logo + '?size=300&greyscale=true',
        companyDomain: 'https://www.' + apiData.domain,
        couponImage: req.file.path,
        couponImageLinkDisplayState:'show-coupon-image-link-styling',
        userId: _userId
      });
    }

  })
  .catch(function (error) {
    // handle error
    console.log('There was an error ' + error.response.status);
    if(error.response.status === 404) {
      newCoupon = new CouponModel({
        merchantName: req.body.merchantName.trim(),
        code: req.body.code.trim(),
        expirationDate: req.body.expirationDate,
        description: req.body.description.trim(),
        couponUsed: false,
        couponDisplayState: 'coupon-active',
        companyLogo: '/images/defaultImage.png',
        companyLogoUsed: '/images/defaultImage.png',
        companyDomain: '',
        couponImage: req.file.path,
        couponImageLinkDisplayState:'show-coupon-image-link-styling',
        userId: _userId
      });
    }
  })
  .then(function() {
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
  })
});

// EDITS A NEW COUPON
router.put('/:id', jwtAuth, upload.single('couponImage'), (req, res) => {
  console.log(`req.params.id:  ${req.params.id}`);
  console.log(`req.body.id: ${req.body.id}`);

  console.log('************** User Edited **************');
  Object.keys(req.body).forEach(function eachKey(key) {
  console.log(key + ' : ' + req.body[key]); // alerts key and value
    if(key === 'merchantName'){
      req.body[key] = formatMerchantName(req.body[key]);
      console.log('** Formatted Merchant Name  ' + req.body[key] + '  **');
    }
  });
  console.log('was the image file provided? ' + req.file);
  console.log('************** End of User Edited **************\n');

  // if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
  //   res.status(400).json({
  //     error: 'Request path id and request body id values must match'
  //   });
  // }

  const updated = {};
  const updateableFields = ['merchantName', 'code', 'expirationDate', 'description', 'couponImage'];

  console.log('************** Updated Fields **************');
  updateableFields.forEach(field => {
    if(field in req.body) {
      updated[field] = req.body[field];
    }
  });

   if(req.file !== undefined ){
    updated.couponImage = req.file.path;
   }
  console.log(updated);
  console.log('************** End of Updated Fields **************\n');

  axios(
  {
    url: 'https://company.clearbit.com/v1/domains/find',
    params: { name: req.body.merchantName },
    headers: {
      'Authorization': 'Bearer sk_7e1d77b7b10477e9d101f3e756dac154'
    }
  })
  .then(function (response) {
    // handle success
    console.log(response.data);
    const apiData = response.data;

    if (response.data.logo == null){
      updated.companyLogo = '/images/defaultImage.png';
      updated.companyLogoUsed = '/images/defaultImage.png';
      updated.companyDomain = '';
      updated.couponDisplayState = 'coupon-active';
    }
    else {
      updated.companyDomain = 'https://www.' + response.data.domain;
      updated.companyLogo = response.data.logo + '?size=300';
      updated.companyLogoUsed = response.data.logo + '?size=300&greyscale=true' ;
      updated.couponDisplayState = 'coupon-active';
    }
  })
  .catch(function (error) {
    // handle error
    console.log('There was an error ' + error.response.status);
    if(error.response.status === 404) {
      updated.companyLogo = '/images/defaultImage.png';
      updated.companyLogoUsed = '/images/defaultImage.png';
      updated.companyDomain = '';
      updated.couponDisplayState = 'coupon-active';
    }
  })
  .then(function() {
    CouponModel.findByIdAndUpdate(req.params.id, {$set: updated }, { new: true })
    .then(coupon => {
      const updatedCoupon = coupon.toObject();
      //console.log(updatedCoupon);
      res.status(200).json(updatedCoupon);
    })
    .catch(err => res.status(500).json({ message: 'Something went wrong'}));
  })


  // CouponModel.findByIdAndUpdate(req.params.id, {$set: updated }, { new: true })
  // .then(coupon => {
  //   const updatedCoupon = coupon.toObject();
  //   console.log(updatedCoupon);
  //   res.status(200).json(updatedCoupon);
  // })
  // .catch(err => res.status(500).json({ message: 'Something went wrong'}));
});

// UPDATES ONLY ITEMS PROVIDED OF AN IMAGE OF COUPON
router.patch('/:id', jwtAuth, upload.single('couponImage'), (req, res) => {
  const updateOps = {};
  const updateableFields = ['merchantName', 'code', 'expirationDate', 'description','couponImage', 'couponUsed','couponDisplayState', 'couponImageLinkDisplayState'];

  updateableFields.forEach(field => {
    if(field in req.body) {
      updateOps[field] = req.body[field];
      console.log(updateOps[field]);
    }
  });

  console.log(updateOps);

  CouponModel.findByIdAndUpdate(req.params.id, {$set: updateOps },{ new: true })
  .then(coupon => {
    res.status(200).json({
      coupon: coupon
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });

});

// DELETES A NEW COUPON
router.delete('/:id', jwtAuth, (req, res) => {
  //console.log(req);
  CouponModel.findByIdAndRemove(req.params.id)
  .then(coupon => res.status(204).end())
  .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;
