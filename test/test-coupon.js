'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const faker = require('faker');
const mongoose = require('mongoose');

const { User } = require('../models/User');
const { Coupon } = require('../models/Coupon');
const { closeServer, runServer, app } = require('../server');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');
// const seedUsers = require("/seed/users");
//const seedCoupon = require('../seed/seed-coupon');

const expect = chai.expect;

chai.use(chaiHttp);

const username = 'exampleUser';
const password = 'examplePass';
const firstName = 'Example';
const lastName = 'User';

const merchantName = faker.company.companyName();
const code = 'TESTCODE123';
const expirationDate = '2018-08-14';
const description = faker.lorem.sentence();
const couponUsed = true;
const couponDisplayState = 'coupon-disabled';
const companyLogo = `https://logo.clearbit.com/${faker.company.companyName()}.com?size=300`;
const companyLogoUsed = `https://logo.clearbit.com/${faker.company.companyName()}?size=300&greyscale=true`;
const companyDomain = `https://www.${faker.company.companyName()}.com`;
const couponImageLinkDisplayState = 'show-coupon-image-link-styling-disabled';
const couponImage = "exampleimage.png";
const userId = '5b43e4526930dc1c7ea780b8';

const merchantNameB = "Subway";
const codeB = "FREESUB12";
const expirationDateB = "2018-08-01";
const descriptionB = "Get a free foot long with a purchase.";
const couponUsedB = false;
const couponDisplayStateB = "coupon-active";
const companyLogoB = "https://logo.clearbit.com/subway.com?size=300";
const companyLogoUsedB = "https://logo.clearbit.com/subway.com?size=300&greyscale=true";
const companyDomainB = "https://www.subway.com";
const couponImageLinkDisplayStateB = "show-coupon-image-link-styling";
const userIdB = "5b43e4526930dc1c7ea780b8";
const couponImageB = "exampleBimage.png";
const id = "123";


function tearDownDb() {
    return new Promise((resolve, reject) => {
        console.warn('Deleting database');
        mongoose.connection.dropDatabase()
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}

function createUserProfile() {
    return User.hashPassword(password).then(password =>
        User.create({
            username,
            password,
            firstName,
            lastName
        })
    );
}


describe('Protected endpoint Coupon', function () {

  let token;

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return createUserProfile()
            .then(function () {
                token = jwt.sign(
                    {
                        user: {
                            username,
                            firstName,
                            lastName
                        }
                    },
                    JWT_SECRET,
                    {
                        algorithm: 'HS256',
                        subject: username,
                        expiresIn: '7d'
                    });
            });
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });



  describe('/coupon', function () {
    describe('GET', function () {
      it('Should return an empty array initially', function () {
        return chai.request(app)
          .get('/coupon')
          .set('Authorization', `Bearer ${token}`)
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body.coupons).to.have.length(0);
        });
      });
      /*
      it('Should return an coupons', function () {
        return Coupon.create(
          {
            id,
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
            userId,
          },
          {
            id: id,
            merchantName: merchantNameB,
            code: codeB ,
            expirationDate: expirationDateB ,
            description: descriptionB,
            couponUsed: couponUsedB ,
            couponDisplayState: couponDisplayStateB,
            companyDomain: companyDomainB ,
            companyLogo: companyLogoB,
            companyLogoUsed: companyLogoUsedB,
            couponImage: couponImageB,
            couponImageLinkDisplayState: couponImageLinkDisplayStateB,
            userId: userId
          }
        )
          .then(res => {
            chai.request(app)
            .get('/coupon')
            .set('Authorization', `Bearer ${token}`)
          })
          .then(res => {
            console.log(res.body);
            //expect(res).to.have.status(201);
          });
      });
      */
    });
    describe('POST', function () {
      it('Should reject a coupon with missing Merchant Name', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${token}`)
            .field('code', 'testCode')
            .field('expirationDate', '2019-08-23')
            .field('description', 'this is a test description.')
            .then(res => {
              expect(res).to.have.status(422);
            })
      });
      it('Should reject a coupon with missing code', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${token}`)
            .field('merchantName', 'Target')
            .field('expirationDate', '08-19-2019')
            .field('description', 'this is a test description.')
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
            })
      });
      it('Should reject a coupon with missing expiration date', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${token}`)
            .field('merchantName', 'Target')
            .field('code', 'testCode')
            .field('description', 'this is a test description.')
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
            })
      });
      it('Should reject a coupon with missing description', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${token}`)
            .field('merchantName', 'Target')
            .field('code', 'testCode')
            .field('expirationDate', '08-19-2019')
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
            })
      });
      it('Should reject a coupon with Merchant Name with less than 1', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${token}`)
            .field('merchantName', '')
            .field('code', 'testCode')
            .field('expirationDate', '08-19-2019')
            .field('description', 'this is a test description.')
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
            })
      });
      it('Should reject a coupon with code less than 1', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${token}`)
            .field('merchantName', 'company')
            .field('code', '')
            .field('expirationDate', '08-19-2019')
            .field('description', 'this is a test description.')
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
            })
      });
      it('Should reject a coupon with expirationdate less than 10 characters', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${token}`)
            .field('merchantName', 'company')
            .field('code', 'testcode123')
            .field('expirationDate', '8-19-2019')
            .field('description', 'this is a test description.')
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
            })
      });
      it('Should reject a coupon with description less than 1 characters', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${token}`)
            .field('merchantName', 'company')
            .field('code', 'testcode123')
            .field('expirationDate', '08-19-2019')
            .field('description', '')
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
            })
      });
      it('Should reject a coupon with description more than 40 characters', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${token}`)
            .field('merchantName', 'company')
            .field('code', 'testcode123')
            .field('expirationDate', '08-19-2019')
            .field('description', 'This is a test description that will go over 40 characters.')
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
            })
      });
      it('Should reject a coupon with expiration date in the past ', function () {
          return chai
            .request(app)
            .post('/coupon')
            .set('Authorization', `Bearer ${token}`)
            .field('merchantName', 'company')
            .field('code', 'testcode123')
            .field('expirationDate', '2018-08-01')
            .field('description', 'This is a test description.')
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body).to.be.an('object');
            })
      });
      it('Should add a coupon ', function () {
        return chai
          .request(app)
          .post('/coupon')
          .set('Authorization', `Bearer ${token}`)
          .field('merchantName', 'Target')
          .field('code', 'testCode')
          .field('expirationDate', '2019-08-30')
          .field('description', 'this is a test description.')
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
          })
      });

    });
    describe('DELETE', function () {
      /*
      it('Should delete a coupon', function () {
        let couponItem;

        return Coupon.create({
            id,
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
            userId
          });

        console.log(Coupon.findOne());
          //.then(_coupon => {
          //  couponItem = _coupon;
          //  console.log(couponItem);
            // return chai
            //   .request(app)
            //   .delete(`/coupon/${couponItem.id}`)
            //   .set('Authorization', `Bearer ${token}`)
          // })
          // .then(_coupon => {
          //   console.log(_coupon);
          //   expect(res).to.have.status(204);
          //   //expect(res.body).to.be.empty;
          // })

      });
      */
    });
    // describe('PUT', function () {
    //
    // });
    // describe('PATCH', function () {
    //
    // });

  });
});
