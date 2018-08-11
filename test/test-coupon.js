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
// const seedCoupons = require("/seed/coupons");

const expect = chai.expect;

chai.use(chaiHttp);


describe('Protected endpoint Coupon', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';
  const id = '1';
  const couponUsed = false;
  const couponDisplayState = 'coupon-active';
  const companyLogo = '/images/defaultImage.png';
  const companyLogoUsed = '/images/defaultImage.png';
  const companyDomain = 'www.exampledomain.com';
  const couponImage = 'exampleImage.png';
  const couponImageLinkDisplayState ='show-coupon-image-link-styling';


  const merchantName = 'Target';
  const code = 'exampleCode';
  //const expirationDate = faker.date.future();
  const expirationDate = '08-30-2019';
  const description = 'This is fake coupon description';
  const userId = '1';

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function () {
    return User.hashPassword(password).then(password =>
      User.create({
        username,
        password,
        firstName,
        lastName,
        userId
      })
    );
  });

  afterEach(function () {
    return User.remove({});
  });

  describe('/coupon', function () {
    describe('POST', function () {
      it('Should add a coupon ', function () {
        const token = jwt.sign(
          {
            user: {
              userId,
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
          }
        );

        console.log(token);
        console.log(merchantName);
        console.log(code);
        console.log(expirationDate);
        console.log(description);

        return chai
          .request(app)
          .post('/coupon')
          .set('Authorization', `Bearer ${token}`)
          .send('merchantname=Target')
          .send('code=TestCode123')
          .send('expirationDate=08-19-2019')
          .send('description=this is a test')
          .set('Content-Type', 'multipart/form-data; boundary=----WebKitFormBoundaryeLQ6lAu4UV1xBMsV')
          .then(res => {
            console.log(res);
            //expect(res).to.have.status(201);
            //expect(res.body).to.be.an('object');
            //expect(res.body.data).to.equal('rosebud');
          })
      });

      /*
      it('Should reject a coupon with missing data', function () {
        const token = jwt.sign(
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
          }
        );

        // console.log(token);
        // console.log(merchantName);
        // console.log(code);
        // console.log(expirationDate);
        // console.log(description);

        return chai
          .request(app)
          .post('/coupon')
          .set('authorization', `Bearer ${token}`)
          // .send({
          //   merchantName,
          //   code,
          //   expirationDate,
          //   description,
          //   userId
          // })
          .then(res => {
            //console.log(res);
            expect(res).to.have.status(500);
            //expect(res.body).to.be.an('object');
            //expect(res.body.data).to.equal('rosebud');
          })
      });
      */

      // it('Should add a coupon ', function () {
      //   const token = jwt.sign(
      //     {
      //       user: {
      //         username,
      //         firstName,
      //         lastName
      //       }
      //     },
      //     JWT_SECRET,
      //     {
      //       algorithm: 'HS256',
      //       subject: username,
      //       expiresIn: '7d'
      //     }
      //   );
      //
      //   console.log(token);
      //   console.log(merchantName);
      //   console.log(code);
      //   console.log(expirationDate);
      //   console.log(description);
      //
      //   return chai
      //     .request(app)
      //     .post('/coupon')
      //     .set('authorization', `Bearer ${token}`)
      //     .send({
      //       merchantName,
      //       code,
      //       expirationDate,
      //       description
      //     })
      //     .then(res => {
      //       console.log(res);
      //       //expect(res).to.have.status(201);
      //       //expect(res.body).to.be.an('object');
      //       //expect(res.body.data).to.equal('rosebud');
      //     })
      // });

      /*
      it('Should return an empty array initially', function () {
        const token = jwt.sign(
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
          }
        );

        // console.log(token);

        return chai.request(app)
          .get('/coupon')
          .set('authorization', `Bearer ${token}`)
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
          });
      });
      */
    });

    // describe('GET', function () {
    //   it('Should get to protected endpoint GET coupon', function () {
    //     const token = jwt.sign(
    //       {
    //         user: {
    //           username,
    //           firstName,
    //           lastName
    //         }
    //       },
    //       JWT_SECRET,
    //       {
    //         algorithm: 'HS256',
    //         subject: username,
    //         expiresIn: '7d'
    //       }
    //     );
    //
    //     // console.log(token);
    //
    //     return chai
    //       .request(app)
    //       .get('/coupon')
    //       .set('authorization', `Bearer ${token}`)
    //       .then(res => {
    //         //console.log(res);
    //         expect(res).to.have.status(200);
    //         //expect(res.body).to.be.an('object');
    //         //expect(res.body.data).to.equal('rosebud');
    //       })
    //   });
    //   it('Should return an empty array initially', function () {
    //     const token = jwt.sign(
    //       {
    //         user: {
    //           username,
    //           firstName,
    //           lastName
    //         }
    //       },
    //       JWT_SECRET,
    //       {
    //         algorithm: 'HS256',
    //         subject: username,
    //         expiresIn: '7d'
    //       }
    //     );
    //
    //     // console.log(token);
    //
    //     return chai.request(app)
    //       .get('/coupon')
    //       .set('authorization', `Bearer ${token}`)
    //       .then(res => {
    //         expect(res).to.have.status(200);
    //         expect(res.body).to.be.an('object');
    //       });
    //   });
    // });


  });
});
