'use strict';

let currentCouponId = null;
let currentEventListener = null;
let entireCouponElement = null;


function renderCoupons(res, company, classes) {
  return`<section role="role" class="all-coupon-container" data-id="${res._id}">
            <section role="region" class="coupon-container js-coupon-container ${classes.classes}">
              <div class="js-coupon-merchant-logo coupon-merchant-logo">
                <a href="${company.domain}" target="_blank">
                  <img src="${classes.companyLogoStates}" alt="This is an image of the ${res.merchantName} logo" class="js-logo-img" data-default-src="images/default-image.png">
                </a>
              </div>
              <h2 class="coupon-merchant-name">${res.merchantName}</h2>
              <p class="coupon-description no-margin">${res.description}</p>
              <div class="dashed">
                <img src="${classes.dashedLineImage}" alt="dashed line to seperate the sections" class="${classes.dashedStates}">
              </div>
              <p class="coupon-title no-margin">COUPON CODE</p>
              <p class="coupon-code js-coupon-code no-margin ellipse-text" data-toggle="modal" data-target="showCouponImageModal">${res.code}</p>
              <p class="coupon-expiration-date no-margin">Valid till ${res.expirationDate}</p>
            </section>
            <section role="region" class="coupon-actions-nav">

              <img src="images/tick-sign.svg" alt="mark coupon used" class="budicon icon complete-icon js-complete-icon" tabindex="4" data-toggle="tooltip" data-placement="top" title="Mark used">

              <a href="" data-toggle="tooltip" data-placement="top" title="Edit" class="icon edit-icon js-edit-icon">
                <img src="images/ui-compose.svg" alt="edit-icon" data-toggle="modal" data-target="#editCouponModal" tabindex="4" class="budicon">
              </a>

              <img src="images/trash.svg" alt="This is a trash icon to delete this coupon" class="budicon icon trash-icon js-delete-icon" tabindex="4" data-toggle="tooltip" data-placement="top" title="Delete">

            </section>
          </section>`;
}

function getCouponById(id, callback) {
  $.ajax({
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
    },
    url: `/coupon/${id}`,
    type: 'GET',
    success: callback,
    error: function(err) {
      if(token === null) {
        console.log('Token is empty and you are not logged in. Please log in!!!');
      }
      else{
        console.log('something went wrong when trying to get to the protected endpoint');
      }
    }
  });
}

function renderMerchantUsedLogo(merchantName) {
  return $.ajax({
            url: `https://company.clearbit.com/v1/domains/find`,
            type: 'GET',
            beforeSend: function(xhr) {
              xhr.setRequestHeader('Authorization', `Bearer sk_7e1d77b7b10477e9d101f3e756dac154`);
            },
            data: {
              name: `${merchantName}`
            },
            dataType: 'json',
            async: false,
            success: (res) =>{
            },
            error: function(err){
              console.log('something went wrong in getting the logo. I need to work on returning a default image');
            }
          });
}

function renderCompanyAssets(res){
  const company = {
    domain: `https://www.${res.domain}`,
    logo: res.logo+'?size=500',
    logoDisabled: res.logo+ '?size=500&greyscale=true'
  };

  return company;
}

function checkIfCouponShouldBeDisabled(res, company) {
  let classes = '';
  let dashedStates = '';
  let dashedLineImage = '';
  let companyLogoStates = '';

  if(res.couponUsed !== null && res.couponUsed !== '') {
    if(res.couponUsed === false){
      classes = 'coupon-active';
      dashedStates = 'dashed-line-active';
      dashedLineImage = 'images/dashed-line.png';
      companyLogoStates = company.logo;
    }
    if(res.couponUsed === true) {
      classes = 'coupon-disabled';
      dashedStates = 'dashed-line-disabled';
      dashedLineImage = 'images/dashed-line-disable.png';
      companyLogoStates = company.logoDisabled;
    }
  }

  const couponStates = {
    classes: classes,
    dashedStates: dashedStates,
    dashedLineImage: dashedLineImage,
    companyLogoStates: companyLogoStates
  }

  return couponStates;
}

function getUserCoupons() {
  $.ajax({
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
    },
    url: '/coupon/',
    type: 'GET',
    success: (res) => {
      const merchants = renderFilterByMerchants(res);
      displayDropDownList(merchants);
      clickedOnMerchantFilter(res, merchants);

      $('.js-logout').removeClass('hide');
      $('.js-coupon').removeClass('hide');

      $('.js-signup').addClass('hide');
      $('.js-login').addClass('hide');

      console.log(`The user made it to the Dashboard`);
      console.log(`The user id is: ${res._userId}`);

      var html = "";

      const couponContainerObject = $(entireCouponElement);
      const couponContainer = $(couponContainerObject).find('.js-coupon-container');
      const merchantLogoLink = couponContainerObject.find('div.js-coupon-merchant-logo').children();
      const dashDisabled = couponContainerObject.find('img.dashed-line-disabled');
      const dashed = couponContainerObject.find('img.dashed-line-active');


      res.coupons.map((coupon) => {
        //console.log(coupon);
        //made renderMerchantUsedLogo sync instead of async
        let responseClearbit = renderMerchantUsedLogo(coupon.merchantName).responseJSON;
        let company = renderCompanyAssets(responseClearbit);
        const toggleCouponState = checkIfCouponShouldBeDisabled(coupon, company);
        //console.log(toggleCouponState);
        html += renderCoupons(coupon, company, toggleCouponState);

      });

      $('#coupons').css('opacity', '0');
      $('#coupons').html(html);

      $('#coupons').animate({
        opacity: 1,
      }, 150);

    },
    error: function(err) {
      if(token === null) {
        console.log('Token is empty and you are not logged in. Please log in!!!');
      }
      else{
        console.log('something went wrong when trying to get to the protected endpoint');
      }
    }
  });
}

function renderAddModal() {
  return `<div class="modal fade" id="addNewCouponModal" tabindex="-1" role="dialog" aria-labelledby="addNewCouponModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                  </button>
                </div>

                <div class="modal-body">
                  <h5 class="modal-title" id="addNewCouponModalLabel">Add Coupon</h5>
                  <form id="js-add-coupon-form">
                    <div class="form-group">
                      <label for="merchantName">Merchant Name</label>
                      <input type="text" name="merchantName" class="form-control input-add-merchantName" required>
                    </div>

                    <div class="form-group">
                      <label for="code">Code</label>
                      <input type="text" name="code" class="form-control input-add-code" maxlength="15" required>
                    </div>

                    <div class="form-group">
                      <label for="expirationDate">Expiration Date</label>
                      <input type="date" name="expirationDate" class="form-control input-add-expirationDate js-date-field" min="2018-07max="2020-12-31" required>
                    </div>

                    <div class="form-group">
                      <label for="description">Description</label>
                      <input type="text" name="description" class="form-control input-add-description"  maxlength="40" required>
                    </div>

                    <div class="form-group">
                      <label for="couponImage">Upload an image of your coupon</label>
                      <input id="couponImage" type="file" name="couponImage" accept="image/png, image/jpeg" required/>
                      <label for="couponImage" class="custom-file-upload"></label>
                    </div>

                    <div class="">
                      <button type="submit" class="button solid submit-add-coupon-btn" id="js-submit-add-coupon-btn">Add</button>
                    </div>
                  </form>
              </div>
            </div>
          </div>
        </div>`;
}

function renderShowCouponImageModal(){
  return `<div class="modal fade" id="showCouponImageModal" tabindex="-1" role="dialog" aria-labelledby="showCouponImageModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <h5 class="modal-title" id="showCouponImageModalLabel">Coupon details</h5>
                  <img src="" alt="" class="couponImageContainer coupon-Image-Big">
              </div>
            </div>
          </div>
        </div>`;
}

function renderEditModal() {
  return `<div class="modal fade" id="editCouponModal" tabindex="-1" role="dialog" aria-labelledby="editCouponModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <h5 class="modal-title" id="editCouponModalLabel">Edit Coupon</h5>
                            <form id="js-edit-coupon-form">
                                <div class="form-group">
                                    <label for="merchantName">Merchant Name</label>
                                    <input type="text" name="merchantName" class="form-control input-edit-merchantName" required>
                                </div>

                                <div class="form-group">
                                    <label for="code">Code</label>
                                    <input type="text" name="code" class="form-control input-edit-code" required>
                                </div>

                                <div class="form-group">
                                    <label for="expirationDate">Expiration Date</label>
                                    <input type="date" name="expirationDate" class="form-control input-edit-expirationDate js-date-field" required>
                                </div>

                                <div class="form-group">
                                    <label for="description">Description</label>
                                    <input type="text" name="description" class="form-control input-edit-description" maxlength="40" required>
                                </div>

                                <div class="form-group">
                                  <label for="couponImage">Upload an image of your coupon</label>
                                  <img src="" alt="" class="couponImageContainer">
                                </div>

                                <div class="">
                                  <button type="submit" class="button solid submit-edit-coupon-btn" id="js-submit-edit-coupon-btn">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>`;
}

function sendUpdateDataToAPI(id, formData){
  $.ajax({
    url: `/coupon/${id}`,
    type: 'PATCH',
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
    },
    data: formData,
    contentType: false,
    processData: false,
    success: (res) => {
      console.log('updated field(s) is a success ');
      let responseClearbit = renderMerchantUsedLogo(res.coupon.merchantName).responseJSON;
      let company = renderCompanyAssets(responseClearbit);
      const toggleCouponState = checkIfCouponShouldBeDisabled(res.coupon, company);
      markCouponUsedonDOM(res.coupon, company, toggleCouponState);
    },
    error: function(err){
      console.log('something went wrong');
    }
  });
}

function markCouponUsedonDOM(res, company, toggleCouponState) {
  $('.js-complete-icon').tooltip('hide');

  const couponContainerObject = $(entireCouponElement);
  const couponContainer = $(couponContainerObject).find('.js-coupon-container');
  const merchantLogoLink = entireCouponElement.find('div.js-coupon-merchant-logo').children();
  // const dashed = entireCouponElement.find('div.dashed').children();
  const dashed = entireCouponElement.find('div.dashed');

  console.log(res.couponUsed);
  console.log(toggleCouponState.dashedStates);
  console.log(toggleCouponState.dashedLineImage);

  // classes: classes,
  // dashedStates: dashedStates,
  // dashedLineImage: dashedLineImage,
  // companyLogoStates: companyLogoStates

  if (res.couponUsed === false){
    merchantLogoLink.attr('href', company.domain);
    couponContainer.removeClass('coupon-disabled');
    couponContainer.addClass(toggleCouponState.classes);
    merchantLogoLink.children().attr('src', toggleCouponState.companyLogoStates);
    dashed.children().attr('src', toggleCouponState.dashedLineImage);
    dashed.children().removeClass('dashed-line-disabled');
    dashed.children().addClass(toggleCouponState.dashedStates);
  }
  else if (res.couponUsed === true){
    couponContainer.removeClass('coupon-active');
    couponContainer.addClass(toggleCouponState.classes);
    merchantLogoLink.children().attr('src', toggleCouponState.companyLogoStates);
    merchantLogoLink.removeAttr('href');
    dashed.children().attr('src', toggleCouponState.dashedLineImage);
    dashed.children().removeClass('dashed-line-active');
    dashed.children().addClass(toggleCouponState.dashedStates);
  }
  else {
    console.log('something is up in the patch request conditionals');
  }

}

function watchAddBtnHandler() {
  $('.js-add-new-coupon-btn').on('click', (e) => {
    $('#addNewCouponModelSection').html(renderAddModal());
    $('#addNewCouponModal').modal('show');
    setMinDateToTodaysDate();
    watchSubmitAddNewCouponHandler();
  });
}

function watchSubmitAddNewCouponHandler() {
  $('#js-add-coupon-form').on('submit', (e) => {
    e.preventDefault();
    console.log('you added a coupon');
    sendAddCouponDataToAPI(e);
  });
}

function sendAddCouponDataToAPI(e) {
  const formData = new FormData(e.target);
  // for (var value of formData.values()) {
  //    console.log(value);
  // }
  const companyname = $('.input-add-merchantName').val();
  $.ajax({
    url: '/coupon',
    type: 'POST',
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
    },
    data: formData,
    processData: false,
    contentType: false,
    success: (res) => {

      $('#addNewCouponModal').modal('hide');
      $('.input-add-merchantName').val('');
      $('.input-add-code').val('');
      $('.input-add-expirationDate').val('');
      $('.input-add-description').val('');

      console.log(res.merchantName);

      let responseClearbit = renderMerchantUsedLogo(res.merchantName).responseJSON;
      console.log(responseClearbit);
      let company = renderCompanyAssets(responseClearbit);
      console.log(company);

      const toggleCouponState = checkIfCouponShouldBeDisabled(res, company);
      console.log(toggleCouponState);

      const couponHTML = $(renderCoupons(res, company, toggleCouponState));
      couponHTML.css('opacity', '0');
      $('#coupons').append(couponHTML);
      //$('#coupons').prepend(couponHTML);

      couponHTML.animate({
        opacity: 1,
      }, 500);

      updateMerchantTofilter();
    },
    error: function(err){
      console.log('something went wrong');
    }
  });

}

function watchDeleteBtnHandler() {
  $('#js-list-coupons-section').on('click','.js-delete-icon', (e) => {
      e.preventDefault();
      currentCouponId = $(e.currentTarget).parent().parent().attr('data-id');
      console.log(`The coupon id: ${currentCouponId}`);
      const container = $(e.currentTarget).parent().parent();
      sendCouponToDeleteFromApi(currentCouponId, container);
    });
}

function sendCouponToDeleteFromApi(id, container) {
  console.log(`if I got here then i should delete this id: ${id} from the DB`);
    $.ajax({
      url: `/coupon/${id}`,
      type: 'DELETE',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
      },
      dataType: 'json',
      success: (res) => {

        $('.js-delete-icon').tooltip('hide');
        $('.js-complete-icon').tooltip('hide');
        $('.js-upload-icon').tooltip('hide');
        $('.js-edit-icon').tooltip('hide');

        console.log(`you successfully deleted a coupon`);

        container.animate({
          opacity: 0,
        }, 500, function(){
          container.remove();
        });

        updateMerchantTofilter();
      },
      error: function(err) {
        console.log(`Something happened when trying to delete ${err}`);
      }
    });
}

function watchEditBtnHandler() {
  $('#coupons').on('click','.js-edit-icon', (e) => {
      e.preventDefault();

      $('.js-delete-icon').tooltip('hide');
      $('.js-complete-icon').tooltip('hide');
      $('.js-edit-icon').tooltip('hide');

      $('#editCouponModelSection').html(renderEditModal());
      setMinDateToTodaysDate();

      currentCouponId = $(e.currentTarget).parent().parent().attr('data-id');
      console.log(`The coupon id: ${currentCouponId}`);

      //get the values currently in the input fields for that getCouponid
      const couponObject = $(e.currentTarget).parent().parent();
      const merchantNameText = $(couponObject).find('h2.coupon-merchant-name').text();
      const codeText = $(couponObject).find('p.coupon-code').text();
      const expirationDateText = $(couponObject).find('p.coupon-expiration-date').text();
      const descriptionText = $(couponObject).find('p.coupon-description').text();

      $('.input-edit-merchantName').val(merchantNameText);
      $('.input-edit-code').val(codeText);
      document.querySelector('.input-edit-expirationDate').valueAsDate = new Date(expirationDateText);
      $('.input-edit-description').val(descriptionText);

      //pull the values that the user types in the inputs
      watchSubmitEditCouponHandler(currentCouponId);
  });
}

function watchSubmitEditCouponHandler(id) {
  $('#js-edit-coupon-form').on('submit', (e) => {
      e.preventDefault();
      console.log('you want to update a coupon');
      $('#editCouponModal').modal('hide');
      sendCouponToEditFromApi(id, e);
  });
}

function sendCouponToEditFromApi(id, e) {
  const formData = new FormData(e.target);

  const companyname = $('.input-edit-merchantName').val();
  var str = companyname;
  var newStr = str.replace(/\s+/g, '');
  console.log(`merchant name inside edit function ${newStr}`);
  const companyLogoImage = `https://logo.clearbit.com/${newStr}.com?size=500`;
  const companyUrl = `https://www.${newStr}.com`;
  console.log(formData.get('couponImage'));

  let _couponId = id;

  console.log(`If I got here then I should edit this id: ${id} on the DB`);
    $.ajax({
      url: `/coupon/${id}`,
      type: 'PUT',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
      },
      data: formData,
      processData: false,
      contentType: false,
      // data: {
      //   merchantName: $('.input-edit-merchantName').val(),
      //   code: $('.input-edit-code').val(),
      //   expirationDate: $('.input-edit-expirationDate').val(),
      //   description: $('.input-edit-description').val()
      // },
      // dataType: 'json',
      success: function(res) {
        console.log(`you successfully updated a coupon: ${_couponId}`);

        var merchantName = $('.input-edit-merchantName').val();
        var inputCode = $('.input-edit-code').val();
        var expirationDate = $('.input-edit-expirationDate').val();
        var inputDescription = $('.input-edit-description').val();

        console.log('upon success of edit ' + merchantName + ' ' + companyUrl);

        $(`[data-id = ${_couponId}] .js-coupon-merchant-logo a`).attr('href', companyUrl);
        $(`[data-id = ${_couponId}] .js-logo-img`).attr('src', companyLogoImage);
        $(`[data-id = ${_couponId}] .coupon-merchant-name`).html(merchantName);
        $(`[data-id = ${_couponId}] .coupon-code`).html(inputCode);
        $(`[data-id = ${_couponId}] .coupon-expiration-date`).html(`Valid til ${expirationDate}`);
        $(`[data-id = ${_couponId}] .coupon-description`).html(inputDescription);

        updateMerchantTofilter();
      },
      error: function(err) {
        console.log(`Something happened when trying to edit ${err}`);
      }
    });
}

function setMinDateToTodaysDate(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    }

    if(mm<10){
        mm='0'+mm
    }

    today = yyyy+'-'+mm+'-'+dd;
    $('.js-date-field').attr("min", today);
}

function companyMaker(merchantName) {
  var str = merchantName;
  var newStr = str.replace(/\s+/g, '');

  const companyInfo = {
    url: `https://www.${newStr}.com`,
    logoImage: `https://logo.clearbit.com/${newStr}.com?size=500`,
    logoImageIsDisabled: `https://logo.clearbit.com/${newStr}.com?size=500&greyscale=true`
  };

  return companyInfo;
}

function renderDropDownlist(merchant, index) {
  return `<a class="dropdown-item" href="#" data-index="${index}">${merchant}</a>`
}

function renderDropDown(htmlCode) {
  return `<div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Filter by Merchant
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <a class="dropdown-item" href="#" data-index="-1">Show All Merchants</a>
              ${htmlCode}
            </div>
          </div>`;
}

function renderFilterByMerchants(res) {
  const coupons = res.coupons;
  let merchants = [];
  // Generate unique list of merchants
  coupons.map(function(coupon) {
    if(!merchants.includes(coupon.merchantName)) {
        merchants.push(coupon.merchantName);
    }
  });
  //console.log(merchants);
  return merchants;
}

function displayDropDownList(merchants) {
  var htmlCode = "";
  merchants.map(function(coupon, index){
    htmlCode += renderDropDownlist(coupon, index);
  });

  return $('#filter').html(renderDropDown(htmlCode));
}

function clickedOnMerchantFilter(res, merchants) {
  const coupons = res.coupons;
  let filteredCoupons = [];
  let currentMerchant = 0;

  $('.dropdown').on('click','.dropdown-item', (e) => {
    e.preventDefault();

    let currentTarget = $(e.currentTarget);

    const clickedIndex = currentTarget.attr('data-index');

    currentMerchant = clickedIndex;

    if(currentMerchant >= 0) {
      // Generate filtered coupons to then be rendered
      filteredCoupons = coupons.filter(function(coupon, index) {
        return coupon.merchantName === merchants[currentMerchant];
      });
    }
    else {
      $.ajax({
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
        },
        url: '/coupon/',
        type: 'GET',
        success: (res) => {

          var html = "";
          res.coupons.map((coupon) => {
            let responseClearbit = renderMerchantUsedLogo(coupon.merchantName).responseJSON;
            let company = renderCompanyAssets(responseClearbit);
            const toggleCouponState = checkIfCouponShouldBeDisabled(coupon, company);
            html += renderCoupons(coupon, company, toggleCouponState);
          });

          $('#coupons').css('opacity', '0');
          $('#coupons').html(html);

          //check to see if get request is Valid
          //if not then replace with another image

          $('#coupons').animate({
            opacity: 1,
          }, 150);
        },
        error: function(err) {
        }
      });
    }

    renderSpecificMerchantCouponsOnDOM(filteredCoupons);
  });
}

function renderSpecificMerchantCouponsOnDOM(filteredByMerchantCoupons){
  var html = "";

  filteredByMerchantCoupons.map(function(coupon){
    let responseClearbit = renderMerchantUsedLogo(coupon.merchantName).responseJSON;
    let company = renderCompanyAssets(responseClearbit);
    const toggleCouponState = checkIfCouponShouldBeDisabled(coupon, company);
    html += renderCoupons(coupon, company, toggleCouponState);
  });

  $('#coupons').css('opacity', '0');

  //replace it with filtered ones
  $('#coupons').html(html);
  $('#coupons').animate({
    opacity: 1,
  }, 150);

}

function updateMerchantTofilter() {
  $.ajax({
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
    },
    url: '/coupon/',
    type: 'GET',
    success: (res) => {
      const merchants = renderFilterByMerchants(res);
      displayDropDownList(merchants);
      clickedOnMerchantFilter(res, merchants);
    },
    error: function(err) {
    }
  });
}

function clickedOnMarkUsed() {
  $('#coupons').on('click','.js-complete-icon', (e) => {
    e.preventDefault();
    currentCouponId = $(e.currentTarget).parent().parent().attr('data-id');
    getCouponById(currentCouponId, renderCouponAsUsed);
    currentEventListener = e;
    entireCouponElement = $(e.currentTarget).parent().parent();
  });
}

function renderCouponAsUsed(res) {
  currentCouponId = res._id;
  let couponUsedBoolVal = res.couponUsed;
  let couponImagePath = res.couponImage;
  let couponExpirationDate = res.expirationDate;

  const formData = new FormData();

  const completeIconElement = entireCouponElement.find('section.coupon-actions-nav img.budicon.icon.complete-icon');

  // active coupon
  if (couponUsedBoolVal === false) {
      formData.append('couponUsed', Boolean(1));
      sendUpdateDataToAPI(currentCouponId, formData);

  }
  // disable coupon
  else if (couponUsedBoolVal === true) {
    formData.append('couponUsed', Boolean(0));
    sendUpdateDataToAPI(currentCouponId, formData);

  }
  else {
    console.log("something went wrong with marking coupon!");
  }

}
//STILL HAVE TO WORK ON!!!!!!
function checkIfCouponIsPastDue() {
  console.log('checking if coupon is past due based on date');//this should be done in the backend.
  //check coupons get responseJSON
  //from coupons array get expiration Date
  //then compare if value of expirationDate and today's current date.
}
//STILL HAVE TO WORK ON!!!!!!
function showCoupondetails(){
  $('#coupons').on('click', '.js-coupon-code', (e) => {
      //alert('yes you made it');
      $('#showuploadedImageModelSection').html(renderShowCouponImageModal());
      $('#showCouponImageModal').modal('show');
  });
}
/*
function markingCouponUsed() {
  $('#coupons').on('click','.coupon-container', (e) => {
    console.log('Do you want to mark this coupon as used');
    //const couponId = $(e.currentTarget).data('id');
    const couponContainerObject = $(e.currentTarget).children().children();
    //console.log(couponContainerObject);
    const merchantLogo = $(couponContainerObject).find('img.coupon-merchant-logo.js-logo-img').addClass('test');
    //console.log(merchantLogo);

    if($(e.currentTarget).hasClass('coupon-disabled')){
      $(e.currentTarget).removeClass('coupon-disabled');
      $(e.currentTarget).addClass('coupon-active');
      console.log('toggle and turn to coupon active');
    }
    else if($(e.currentTarget).hasClass('coupon-active')){
      $(e.currentTarget).removeClass('coupon-active');
      $(e.currentTarget).addClass('coupon-disabled');
      console.log('toggle and turn to coupon disabled');
    }
    else{
      console.log("something went wrong with marking coupon!");
    }
  });
}
*/

/* NOT USING BC OF COMPLEXITY THIS ASK MENTOR....
function getCompanyLogoImageDataFromApi(searchTerm) {
  var str = searchTerm;
  var newStr = str.replace(/\s+/g, '');
  //console.log(`This string should not have spaces ${newStr}`);
  $.ajax({
    url: `https://logo.clearbit.com/${newStr}.com?size=134`,
    type: 'GET',
    mimeType: 'text/plain; charset=x-user-defined',
    success: function(res){
      const baseEncoded = base64Encode(res);
    },
    error: function(res) {
      console.log('There is an err at getCompanyLogoImageDataFromApi. Load a default image that is 134px wide.');
    }
  });
}
function base64Encode(str) {
  var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var out = "", i = 0, len = str.length, c1, c2, c3;
  while (i < len) {
      c1 = str.charCodeAt(i++) & 0xff;
      if (i == len) {
          out += CHARS.charAt(c1 >> 2);
          out += CHARS.charAt((c1 & 0x3) << 4);
          out += "==";
          break;
      }
      c2 = str.charCodeAt(i++);
      if (i == len) {
          out += CHARS.charAt(c1 >> 2);
          out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
          out += CHARS.charAt((c2 & 0xF) << 2);
          out += "=";
          break;
      }
      c3 = str.charCodeAt(i++);
      out += CHARS.charAt(c1 >> 2);
      out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
      out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
      out += CHARS.charAt(c3 & 0x3F);
  }
  return out;
}
*/

function initalizeCouponApp() {
    getUserCoupons();
    watchAddBtnHandler();
    watchDeleteBtnHandler();
    watchEditBtnHandler();
    showCoupondetails();
    clickedOnMarkUsed();
}

$(initalizeCouponApp);
