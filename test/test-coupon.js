/*Need to perform the following for COUPONS

GET
POST
PUT
PATCH

Test required Fields for post coupon req
  Should reject user with missing merchantName
  Should reject user with missing code
  Should reject user with missing expirationDate
  Should reject user with missing description
  Should reject user with missing coupon Image
  Should reject users with non-string merchantName
  Should reject users with non-string code
  Should reject users with non-string expirationDate
  Should reject users with non-string description
  Should reject users with non image  couponImage
  Should reject user with merchant with more than a size of________
  Should reject user with code with more than a size of________
  Should reject user with expirationDate in the in the past


Test required fields for put req for coupons
  Should reject user with missing merchantName
  Should reject user with missing code
  Should reject user with missing expirationDate
  Should reject user with missing description
  Should reject user with missing coupon Image
  Should reject users with non-string merchantName
  Should reject users with non-string code
  Should reject users with non-string expirationDate
  Should reject users with non-string description
  Should reject users with non image  couponImage
  Should reject user with merchant with more than a size of________
  Should reject user with code with more than a size of________
  Should reject user with expirationDate in the in the past

*/

const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

const { Coupon } = require('../models/Coupon');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');


//chai.use(chaiHttp);

// function tearDownDb() {
//   return new Promise((resolve, reject) => {
//     console.warn('Deleting database');
//     mongoose.connection.dropDatabase()
//       .then(result => resolve(result))
//       .catch(err => reject(err));
//   });
// }

// function seedCouponData() {
//   console.info('seeding blog post data');
//   const seedData = [];
//   for (let i = 1; i <= 10; i++) {
//     seedData.push({
//       merchantName: faker.company.companyName(),
//       code: faker.lorem.words(),
//       expirationDate: faker.date.future(),
//       description: faker.lorem.text(),
//     });
//   }
//   // this will return a promise
//   return Coupon.insertMany(seedData);
// }
