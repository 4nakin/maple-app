'use strict';
const mongoose = require('mongoose');
const User = require('./User');

const CouponSchema = mongoose.Schema({
    merchantName: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    expirationDate: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    couponUsed: {
      type: Boolean
    },
    couponDisplayState: {
      type: String
    },
    companyDomain: {
      type: String
    },
    companyLogo: {
      type: String
    },
    companyLogoUsed: {
      type: String
    },
    couponImage: {
      type: String
    },
    couponImageLinkDisplayState: {
      type: String
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId
    }
});

CouponSchema.methods.serialize = function () {
    return {
        id: this._id,
        merchantName: this.merchantName,
        code: this.code,
        expirationDate: this.expirationDate,
        description: this.description,
        couponUsed: this.couponUsed,
        couponDisplayState: this.couponDisplayState,
        companyDomain: this.companyDomain,
        companyLogo: this.companyLogo,
        companyLogoUsed: this.companyLogo,
        couponImage: this.couponImage,
        couponImageLinkDisplayState: this.couponImageLinkDisplayState,
        userId: this.userId
    };
}

module.exports = mongoose.model('Coupon', CouponSchema);
