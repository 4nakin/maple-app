'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const faker = require('faker');
const mongoose = require('mongoose');

const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { closeServer, runServer, app } = require('../server');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');
let moment = require('moment');

const expect = chai.expect;

chai.use(chaiHttp);

const merchantName = 'Best Buy';
const code = 'TESTCODE123';
const expirationDate = moment(new Date()).format().slice(0,10);
const description = 'This is a test description sentence';
const couponUsed = true;
const couponDisplayState = 'coupon-disabled';
const companyLogo = `https://logo.clearbit.com/bestbuy.com?size=300`;
const companyLogoUsed = `https://logo.clearbit.com/bestbuy?size=300&greyscale=true`;
const companyDomain = `https://www.bestbuy.com`;
const couponImageLinkDisplayState = 'show-coupon-image-link-styling-disabled';
const couponImage = "exampleimage.png";

const merchantNameB = "Subway";
const codeB = "FREESUB12";
let date = new Date();
const expirationDateB = moment(date.setDate(date.getDate() + 1)).format().slice(0,10);
const descriptionB = "Get a free foot long with a purchase.";
const couponUsedB = false;
const couponDisplayStateB = "coupon-active";
const companyLogoB = "https://logo.clearbit.com/subway.com?size=300";
const companyLogoUsedB = "https://logo.clearbit.com/subway.com?size=300&greyscale=true";
const companyDomainB = "https://www.subway.com";
const couponImageLinkDisplayStateB = "show-coupon-image-link-styling";
const couponImageB = "exampleBimage.png";


let userObject;
let token;
let userId;
let res;
let currentCouponId;


function tearDownDb() {
    return new Promise((resolve, reject) => {
        console.warn('Deleting database');
        mongoose.connection.dropDatabase()
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}

describe('Protected endpoint Coupon', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  before(function () {
    let res;
    let password= 'password123';

    return chai
        .request(app)
        .post('/api/users')
        .send({
          username: 'testUser',
          password: password,
          firstName: 'user',
          lastName: 'user'
        })
        .then(function(_res) {
          res = _res;

          let userId = res.body.userId;
          let username = res.body.username;
          let firstName = res.body.firstName;
          let lastName = res.body.lastName;

          userObject = {
             userId: userId
           }

          return chai
              .request(app)
              .post('/api/auth/login')
              .send({
                username: username,
                password: password,
              })
        })
        .then(function(_res) {
          res = _res;
          userObject.token = res.body.authToken;
          return userObject;
        })
        .catch(function(err) {
          console.log('there is an error ' + err);
        })
   });

  beforeEach(function () {
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

  describe('testing routes for CRUD on /coupon', function () {

    describe('GET', function () {
      it('Should return an empty coupon array', function () {
        return chai.request(app)
          .get('/coupon')
          .set('Authorization', `Bearer ${userObject.token}`)
          .then(function(_res) {
            res = _res;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body.coupons).to.have.length(0);
            expect(res.body.coupons).to.be.an('array');
        });
      });
      it('Should return an array of coupons', function () {
        return Coupon.create(
          {
            merchantName,
            code,
            expirationDate,
            description,
            couponUsed,
            couponDisplayState,
            companyDomain,
            companyLogo,
            companyLogoUsed,
            couponImage,
            couponImageLinkDisplayState,
            userId: userObject.userId
          },
          {
            merchantName: merchantNameB,
            code: codeB,
            expirationDate: expirationDateB,
            description: descriptionB,
            couponUsed: couponUsedB,
            couponDisplayState: couponDisplayStateB,
            companyDomain: companyDomainB,
            companyLogo: companyLogoB,
            companyLogoUsed: companyLogoUsedB,
            couponImage: couponImageB,
            couponImageLinkDisplayState: couponImageLinkDisplayStateB,
            userId: userObject.userId
          }
        )
        .then(function(){
          return chai.request(app)
          .get('/coupon')
          .set('Authorization', `Bearer ${userObject.token}`)
        })
        .then(function(_res) {
          delete _res.body.coupons[0]._id;
          delete _res.body.coupons[1]._id;
          delete _res.body.coupons[0].__v;
          delete _res.body.coupons[1].__v;
          delete _res.body.userId;

          res = _res;

          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body.coupons).to.be.an('array');
          expect(res.body.coupons).to.have.length(2);
          expect(res.body.coupons[0]).to.deep.equal({
            merchantName,
            code,
            expirationDate,
            description,
            couponUsed,
            couponDisplayState,
            companyDomain,
            companyLogo,
            companyLogoUsed,
            couponImage,
            couponImageLinkDisplayState,
            userId: res.body.coupons[0].userId
          });
          expect(res.body.coupons[1]).to.deep.equal({
            merchantName: merchantNameB,
            code: codeB,
            expirationDate: expirationDateB,
            description: descriptionB,
            couponUsed: couponUsedB,
            couponDisplayState: couponDisplayStateB,
            companyDomain: companyDomainB,
            companyLogo: companyLogoB,
            companyLogoUsed: companyLogoUsedB,
            couponImage: couponImageB,
            couponImageLinkDisplayState: couponImageLinkDisplayStateB,
            userId: res.body.coupons[1].userId
          });

        });
      });
    });

    describe('POST', function () {
      it('Should reject a coupon with missing merchant name', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${userObject.token}`)
            .field('code', 'testCode')
            .field('expirationDate', '2019-08-23')
            .field('description', 'this is a test description.')
            .then(function(_res){
              res = _res;
              expect(res).to.have.status(422);
              expect(res.body.reason).to.equal('ValidationError');
              expect(res.body.message).to.equal('Missing field');
              expect(res.body.location).to.equal('merchantName');
            })
      });
      it('Should reject a coupon with missing code', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${userObject.token}`)
            .field('merchantName', 'Target')
            .field('expirationDate', '08-19-2019')
            .field('description', 'this is a test description.')
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
              expect(res.body.reason).to.equal('ValidationError');
              expect(res.body.message).to.equal('Missing field');
              expect(res.body.location).to.equal('code');
            })
      });
      it('Should reject a coupon with missing expiration date', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${userObject.token}`)
            .field('merchantName', 'Target')
            .field('code', 'testCode')
            .field('description', 'this is a test description.')
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
              expect(res.body.reason).to.equal('ValidationError');
              expect(res.body.message).to.equal('Missing field');
              expect(res.body.location).to.equal('expirationDate');
            })
      });
      it('Should reject a coupon with missing description', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${userObject.token}`)
            .field('merchantName', 'Target')
            .field('code', 'testCode')
            .field('expirationDate', '08-19-2019')
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
              expect(res.body.reason).to.equal('ValidationError');
              expect(res.body.message).to.equal('Missing field');
              expect(res.body.location).to.equal('description');
            })
      });
      it('Should reject a coupon with merchant name with less than 1 characters', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${userObject.token}`)
            .field('merchantName', '')
            .field('code', 'testCode')
            .field('expirationDate', '08-19-2019')
            .field('description', 'this is a test description.')
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
              expect(res.body.reason).to.equal('ValidationError');
              expect(res.body.message).to.equal('Must be at least 1 characters long');
              expect(res.body.location).to.equal('merchantName');
            })
      });
      it('Should reject a coupon with code less than 1 characters', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${userObject.token}`)
            .field('merchantName', 'company')
            .field('code', '')
            .field('expirationDate', '08-19-2019')
            .field('description', 'this is a test description.')
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
              expect(res.body.reason).to.equal('ValidationError');
              expect(res.body.message).to.equal('Must be at least 1 characters long');
              expect(res.body.location).to.equal('code');
            })
      });
      it('Should reject a coupon with expiration date less than 10 characters', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${userObject.token}`)
            .field('merchantName', 'company')
            .field('code', 'testcode123')
            .field('expirationDate', '8-19-2019')
            .field('description', 'this is a test description.')
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
              expect(res.body.reason).to.equal('ValidationError');
              expect(res.body.message).to.equal('Must be at least 10 characters long');
              expect(res.body.location).to.equal('expirationDate');
            })
      });
      it('Should reject a coupon with description less than 1 characters', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${userObject.token}`)
            .field('merchantName', 'company')
            .field('code', 'testcode123')
            .field('expirationDate', '08-19-2019')
            .field('description', '')
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
              expect(res.body.reason).to.equal('ValidationError');
              expect(res.body.message).to.equal('Must be at least 1 characters long');
              expect(res.body.location).to.equal('description');
            })
      });
      it('Should reject a coupon with description more than 40 characters', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${userObject.token}`)
            .field('merchantName', 'company')
            .field('code', 'testcode123')
            .field('expirationDate', '08-19-2019')
            .field('description', 'This is a test description that will go over 40 characters.')
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
              expect(res.body.reason).to.equal('ValidationError');
              expect(res.body.message).to.equal('Must be at most 40 characters long');
              expect(res.body.location).to.equal('description');
            })
      });
      it('Should reject a coupon with expiration date in the past', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${userObject.token}`)
            .field('merchantName', 'company')
            .field('code', 'testcode123')
            .field('expirationDate', '2018-08-01')
            .field('description', 'This is a test description.')
            .then(function(_res){
              res = _res;
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
              expect(res.body.reason).to.equal('ValidationError');
              expect(res.body.message).to.equal('Cannot add a date in the past');
              expect(res.body.location).to.equal('expirationDate');
            })
      });
      it('Should add a coupon ', function () {
        return chai
          .request(app)
          .post('/coupon')
          .set('Authorization', `Bearer ${userObject.token}`)
          .field('merchantName', 'TestCompany')
          .field('code', 'testCode123')
          .field('expirationDate', expirationDateB)
          .field('description', 'this is a test description.')
          .attach('couponImage', './uploads/coupons1.jpg', 'coupon.jpg')
          .then(function(_res) {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('_id','merchantName','code','expirationDate','description','couponUsed','couponDisplayState', 'companyLogo','companyLogoUsed', 'companyDomain','couponImageLinkDisplayState');
            expect(res.body.merchantName).to.equal('TestCompany');
            expect(res.body.code).to.equal('testCode123');
            expect(res.body.expirationDate).to.equal(expirationDateB);
            expect(res.body.description).to.equal('this is a test description.');
            expect(res.body.couponImage).to.equal('uploads/coupon.jpg');
          })
      });
    });

    describe('DELETE', function () {
      it('Should delete a coupon', function () {
        return Coupon.create(
          {
            merchantName,
            code,
            expirationDate,
            description,
            couponUsed,
            couponDisplayState,
            companyDomain,
            companyLogo,
            companyLogoUsed,
            couponImage,
            couponImageLinkDisplayState,
            userId: userObject.userId
          })
          .then(function(_res) {
            res = _res;
            currentCouponId = res._id;

            return chai
              .request(app)
              .delete(`/coupon/${res._id}`)
              .set('Authorization', `Bearer ${userObject.token}`)
          })
          .then(function(_res) {
            res = _res;
            expect(res).to.have.status(204);
            return Coupon.findOne(currentCouponId)
          })
          .then(function(_res) {
            res = _res;
            expect(res).to.equal(null);
          })
      });
    });

    describe('PUT', function () {
      it('should update the send over fields', function () {
        return Coupon.create(
          {
            merchantName,
            code,
            expirationDate,
            description,
            couponUsed,
            couponDisplayState,
            companyDomain,
            companyLogo,
            companyLogoUsed,
            couponImage,
            couponImageLinkDisplayState,
            userId: userObject.userId
          })
          .then(function(_res) {
            res = _res;
            currentCouponId = res._id;

            return chai
              .request(app)
              .put(`/coupon/${res._id}`)
              .set('Authorization', `Bearer ${userObject.token}`)
              .field('id', `${res._id}`)
              .field('merchantName', 'Soothe')
              .field('expirationDate', expirationDateB)
              .field('description', 'Use your soothe coupon today.')
              .attach('couponImage', './uploads/c1.png', 'test.png')
          })
          .then(function(_res) {
            res = _res;
            expect(res).to.have.status(200);
            return Coupon.findById(currentCouponId);
          })
          .then(function(_res) {
            res = _res;
            expect(res.merchantName).to.equal('Soothe');
            expect(res.code).to.equal(code);
            expect(res.expirationDate).to.equal(expirationDateB);
            expect(res.description).to.equal('Use your soothe coupon today.');
          })
      });
      it('should update the image file uploaded', function () {
        return Coupon.create(
          {
            merchantName,
            code,
            expirationDate,
            description,
            couponUsed,
            couponDisplayState,
            companyDomain,
            companyLogo,
            companyLogoUsed,
            couponImage,
            couponImageLinkDisplayState,
            userId: userObject.userId
          })
          .then(function(_res) {
            res = _res;
            currentCouponId = res._id;

            return chai
              .request(app)
              .put(`/coupon/${res._id}`)
              .set('Authorization', `Bearer ${userObject.token}`)
              .field('id', `${res._id}`)
              .attach('couponImage', './uploads/coupons1.jpg', 'coupon.jpg')
          })
          .then(function(_res) {
            res = _res;
            //console.log(res.body);
            expect(res).to.have.status(200);
            expect(res.body.couponImage).to.equal('uploads/coupon.jpg');
          });
      });
    });

    describe('PATCH', function () {
      it('marking used', function () {
        return Coupon.create(
          {
            merchantName,
            code,
            expirationDate,
            description,
            couponUsed,
            couponDisplayState,
            companyDomain,
            companyLogo,
            companyLogoUsed,
            couponImage,
            couponImageLinkDisplayState,
            userId: userObject.userId
          })
        .then(function(_res) {
          res = _res;
          currentCouponId = res._id;

          return chai
            .request(app)
            .patch(`/coupon/${res._id}`)
            .set('Authorization', `Bearer ${userObject.token}`)
            .field('couponUsed', true)
            .field('couponDisplayState', 'coupon-disabled')
            .field('couponImageLinkDisplayState', 'show-coupon-image-link-styling-disabled')
        })
      });
    });
  });

});
