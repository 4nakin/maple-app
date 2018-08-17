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
let moment = require('moment');

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
        //console.error(err);
        res.status(500).json({
          message: 'Internal server error'
        });
    });
});

// CREATES A NEW COUPON
router.post('/', jwtAuth, upload.single('couponImage'), (req, res) => {
  const _userId = getUserIdFromJwt(req);
  const requiredFields = ['merchantName', 'code','expirationDate','description'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['merchantName', 'code', 'expirationDate', 'description'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  if(nonStringField) {
    const message = `Incorrect field type: expected string`;
    console.error(message);
    return res.status(422).send(message);
  }

  const explicityTrimmedFields = ['merchantName', 'code', 'expirationDate', 'description'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    merchantName: {
      min: 1,
      max: 14
    },
    code: {
      min: 1,
      max: 15
    },
    expirationDate: {
      min: 10,
      max: 10
    },
    description: {
      min: 1,
      max: 40
    }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let {merchantName ='', code ='', expirationDate = '', description = ''} = req.body;
  // come in pre-trimmed, otherwise we throw an error
  // before this
  merchantName = merchantName.trim();
  code = code.trim();
  expirationDate = expirationDate.trim();
  description = description.trim();

  let now = (moment(new Date()).format()).slice(0,10);
  if(expirationDate < now) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Cannot add a date in the past',
        location: 'expirationDate'
      });
  }

  let newCoupon;
  let couponImageFile;

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
    console.log(apiData);

    console.log('req.file: ' + req.file);

    if(req.file == undefined){
      couponImageFile = '';
      //no image was uploaded
    }
    else {
      couponImageFile = req.file.path;
    }

    if(apiData.logo === null){
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
        couponImage: couponImageFile,
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
        couponImage: couponImageFile,
        couponImageLinkDisplayState:'show-coupon-image-link-styling',
        userId: _userId
      });
    }

  })
  .catch(function(error) {
    let couponImageFile;
    // handle error
    console.log(req.file);
    console.log(error);
    console.log('did i get here? is there an error' + error);

    if(req.file == undefined){
      couponImageFile = '';
    }
    else {
      couponImageFile = req.file.path;
    }

      if(error.response.status === 404 || error.response.status === 422) {
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
          couponImage: couponImageFile,
          couponImageLinkDisplayState:'show-coupon-image-link-styling',
          userId: _userId
        });
      }
  })
  .then(function(response) {
    newCoupon.save()
      .then(function(coupon) {
        const savedCoupon = coupon.toObject();
        res.status(201).json(savedCoupon);
      })
      .catch(function(err) {
        res.status(500).send(err);
      });
  })
  .catch(function(err){
    console.error(err);
    res.status(500).send(err);
  })
});

// EDITS A NEW COUPON
router.put('/:id', jwtAuth, upload.single('couponImage'), (req, res) => {
  // console.log(`req.params.id:  ${req.params.id}`);
  // console.log(`req.body.id: ${req.body.id}`);
  // console.log(req.body);
  // console.log('couponImage: ' + req.file.path);

  const stringFields = ['merchantName', 'code', 'expirationDate', 'description'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  if(nonStringField) {
    const message = `Incorrect field type: expected string`;
    return res.status(422).send(message);
  }

  let explicityTrimmedFields = [];
  let sizedFields = {};

  if(req.body.merchantName) {
    explicityTrimmedFields.push('merchantName');
    sizedFields.merchantName = {
      min: 1,
      max: 14
    }
  }
  if(req.body.code) {
    explicityTrimmedFields.push('code');
    sizedFields.code = {
      min: 1,
      max: 15
    }
  }
  if(req.body.expirationDate) {
    explicityTrimmedFields.push('expirationDate');
    sizedFields.expirationDate = {
      min: 10,
      max: 10
    }
  }
  if(req.body.description) {
    explicityTrimmedFields.push('description');
    sizedFields.description = {
      min: 1,
      max: 40
    }
  }

  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }


  let {merchantName ='', code ='', expirationDate = '', description = ''} = req.body;
  merchantName = merchantName.trim();
  code = code.trim();
  expirationDate = expirationDate.trim();
  description = description.trim();

  if(expirationDate){
    let now = (moment(new Date()).format()).slice(0,10);
    if(expirationDate < now) {
        return res.status(422).json({
          code: 422,
          reason: 'ValidationError',
          message: 'Cannot add a date in the past',
          location: 'expirationDate'
        });
    }
  }


  //console.log('************** User Edited **************');
  Object.keys(req.body).forEach(function eachKey(key) {
  //console.log(key + ' : ' + req.body[key]); // alerts key and value
    if(key === 'merchantName'){
      req.body[key] = formatMerchantName(req.body[key]);
      //console.log('** Formatted Merchant Name  ' + req.body[key] + '  **');
    }
  });
  //console.log('was the image file provided? ' + req.file.path);
  //console.log('************** End of User Edited **************\n');

  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['merchantName', 'code', 'expirationDate', 'description', 'couponImage'];

  //console.log('************** Updated Fields **************');
  updateableFields.forEach(field => {
    if(field in req.body) {
      updated[field] = req.body[field];
    }
  });

   if(req.file !== undefined ){
    updated.couponImage = req.file.path;
   }
  //console.log(updated);
  //console.log('************** End of Updated Fields **************\n');

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
    //console.log(response.data);
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
    //console.log('There was an error ' + error.response.status);
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
      //console.log(updateOps[field]);
    }
  });

  //console.log(updateOps);

  CouponModel.findByIdAndUpdate(req.params.id, {$set: updateOps },{ new: true })
  .then(coupon => {
    res.status(200).json({
      coupon: coupon
    });
  })
  .catch(err => {
    //console.log(err);
    res.status(500).json({
      error: err
    });
  });

});

// DELETES A NEW COUPON
router.delete('/:id', jwtAuth, (req, res) => {
  CouponModel.findByIdAndRemove(req.params.id)
  .then(coupon => res.status(204).end())
  .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;
