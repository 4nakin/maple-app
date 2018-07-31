'use strict';

let currentCouponId = null;
let currentEventListener = null;
let entireCouponElement = null;

function renderCoupons(res, toggleCouponState) {
  //console.log(res);
  return`<section role="role" class="all-coupon-container" data-id="${res._id}">
            <img src ="${res.couponImage}" alt="coupon image user uploaded for ${res.merchantName}" class="hide js-coupon-image">
            <section role="region" class="coupon-container js-coupon-container ${toggleCouponState.classes}">
              <div class="js-coupon-merchant-logo coupon-merchant-logo">
                <a ${toggleCouponState.companyDomain} target="_blank" class="js-domain-url domain-url">
                  <img src="${toggleCouponState.companyLogoStates}" alt="This is an image of the ${res.merchantName} logo" class="js-logo-img">
                </a>
              </div>
              <h2 class="coupon-merchant-name">${res.merchantName}</h2>
              <p class="coupon-description no-margin">${res.description}</p>
              <div class="dashed">
                <img src="${toggleCouponState.dashedLineImage}" alt="dashed line to seperate the sections" class="${toggleCouponState.dashedStates}">
              </div>
              <p class="coupon-title no-margin">COUPON CODE</p>

              <p class="coupon-code js-coupon-code no-margin ellipse-text" data-toggle="modal" data-target="showCouponImageModal">
                <a data-toggle="tooltip" data-placement="top" title="Click to see coupon Image uploaded" class="js-show-coupon-image show-coupon-image">${res.code}</a>
              </p>

              <p class="coupon-expiration-date no-margin">Valid till ${res.expirationDate}</p>
            </section>
            <section role="region" class="coupon-actions-nav">

              <img src="images/tick-sign.svg" alt="mark coupon used" class="budicon icon complete-icon js-complete-icon" tabindex="4" data-toggle="tooltip" data-placement="top" title="Mark used">

              <a href="" data-toggle="tooltip" data-placement="top" title="Edit" class="icon edit-icon js-edit-icon ${toggleCouponState.editIconState}">
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

function checkIfCouponShouldBeDisabled(res) {
  let classes = '';
  let dashedStates = '';
  let dashedLineImage = '';
  let companyLogoStates = '';
  let companyDomain = '';
  let editIconState = '';

  //console.log(res);

  if(res.couponUsed !== null && res.couponUsed !== '') {
    if(res.couponUsed === false){
      classes = 'coupon-active';
      dashedStates = 'dashed-line-active';
      dashedLineImage = 'images/dashed-line.png';
      companyLogoStates = res.companyLogo;
      companyDomain = `href="${res.companyDomain}"`;
      editIconState = '';
    }
    if(res.couponUsed === true) {
      classes = 'coupon-disabled';
      dashedStates = 'dashed-line-disabled';
      dashedLineImage = 'images/dashed-line-disable.png';
      companyLogoStates = res.companyLogoUsed;
      companyDomain = '';
      editIconState = 'hide';
    }
  }

  const couponStates = {
    classes: classes,
    dashedStates: dashedStates,
    dashedLineImage: dashedLineImage,
    companyLogoStates: companyLogoStates,
    companyDomain: companyDomain,
    editIconState: editIconState
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

      let couponHTML = "";

      res.coupons.map((coupon) => {
        const toggleCouponState = checkIfCouponShouldBeDisabled(coupon);
        couponHTML += renderCoupons(coupon, toggleCouponState);
      });

      $('#coupons').css('opacity', '0');
      $('#coupons').html(couponHTML);

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
                      <label for="merchantName">Merchant Name <span class ="limitsOnInputs">(15 charater limit)</span></label>
                      <input type="text" name="merchantName" class="form-control input-add-merchantName" maxlength="14" required>
                    </div>

                    <div class="form-group">
                      <label for="code">Code <span class ="limitsOnInputs">(15 charater limit)</span></label>
                      <input type="text" name="code" class="form-control input-add-code" maxlength="15" required>
                    </div>

                    <div class="form-group">
                      <label for="expirationDate">Expiration Date <span class ="limitsOnInputs">(Date must be today or greater)</span></label>
                      <input type="date" name="expirationDate" class="form-control input-add-expirationDate js-date-field" min="2018-07max="2020-12-31" required>
                    </div>

                    <div class="form-group">
                      <label for="description">Description <span class ="limitsOnInputs">(40 charater limit)</span></label>
                      <input type="text" name="description" class="form-control input-add-description"  maxlength="40" required>
                    </div>

                    <div class="form-group">
                      <label for="couponImage">Upload an image of your coupon <span class ="limitsOnInputs">(only accepts png/jpeg)</span></label>
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

function renderShowCouponImageModal(imgPath){
  return `<div class="modal fade" id="showCouponImageModal" tabindex="-1" role="dialog" aria-labelledby="showCouponImageModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body block-center">
                  <h5 class="modal-title" id="showCouponImageModalLabel">Coupon Image</h5>
                  <img src="${imgPath}" alt="" class="couponImageContainer coupon-Image-Big">
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
                                    <label for="merchantName">Merchant Name <span class ="limitsOnInputs">(15 charater limit)</span></label>
                                    <input type="text" name="merchantName" class="form-control input-edit-merchantName" maxlength="14" minlength="4" required>
                                </div>

                                <div class="form-group">
                                    <label for="code">Code <span class ="limitsOnInputs">(15 charater limit)</span></label>
                                    <input type="text" name="code" class="form-control input-edit-code" maxlength="15"  minlength="4" required>
                                </div>

                                <div class="form-group">
                                    <label for="expirationDate">Expiration Date <span class ="limitsOnInputs">(Date must be today or greater)</label>
                                    <input type="date" name="expirationDate" class="form-control input-edit-expirationDate js-date-field" required>
                                </div>

                                <div class="form-group">
                                    <label for="description">Description <span class ="limitsOnInputs">(40 charater limit)</span></label>
                                    <input type="text" name="description" class="form-control input-edit-description" maxlength="40" minlength="4" required>
                                </div>

                                <div class="form-group">
                                  <div>
                                    <img src="" alt="coupon image that user uploaded" class="js-uploaded-coupon-image uploaded-coupon-image">
                                    current image
                                  </div>
                                  <label for="couponImage">Upload an image of your coupon <span class ="limitsOnInputs">(only accepts png/jpeg)</span></label>
                                  <input id="couponImage" type="file" name="couponImage" accept="image/png, image/jpeg"/>
                                  <label for="couponImage" class="custom-file-upload"></label>
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
      console.log(res);
        const toggleCouponState = checkIfCouponShouldBeDisabled(res.coupon);
        markCouponUsedonDOM(res.coupon, toggleCouponState);
    },
    error: function(err){
      console.log('something went wrong');
    }
  });
}

function markCouponUsedonDOM(res,toggleCouponState) {
  $('.js-complete-icon').tooltip('hide');
  const couponContainerObject = $(entireCouponElement);
  const couponContainer = $(couponContainerObject).find('.js-coupon-container');
  const merchantLogoLink = entireCouponElement.find('div.js-coupon-merchant-logo').children();
  const dashed = entireCouponElement.find('div.dashed');
  const editIcon = couponContainer.siblings().find('a.icon.edit-icon');

  if (res.couponUsed === false){
    merchantLogoLink.attr('href', res.companyDomain);
    couponContainer.removeClass('coupon-disabled');
    couponContainer.addClass(toggleCouponState.classes);
    merchantLogoLink.children().attr('src', toggleCouponState.companyLogoStates);
    dashed.children().attr('src', toggleCouponState.dashedLineImage);
    dashed.children().removeClass('dashed-line-disabled');
    dashed.children().addClass(toggleCouponState.dashedStates);
    editIcon.fadeIn('slow');
  }
  else if (res.couponUsed === true){
    couponContainer.removeClass('coupon-active');
    couponContainer.addClass(toggleCouponState.classes);
    merchantLogoLink.children().attr('src', toggleCouponState.companyLogoStates);
    merchantLogoLink.removeAttr('href');
    dashed.children().attr('src', toggleCouponState.dashedLineImage);
    dashed.children().removeClass('dashed-line-active');
    dashed.children().addClass(toggleCouponState.dashedStates);
    editIcon.fadeOut('slow');
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
  for (var [key, value] of formData.entries()) {
      console.log(key, value);
  }
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

      const toggleCouponState = checkIfCouponShouldBeDisabled(res);
      let couponHTML = $(renderCoupons(res, toggleCouponState));

      couponHTML.css('opacity', '0');
      $('#coupons').append(couponHTML);
      //console.log(couponHTML);

      couponHTML.animate({
        opacity: 1,
      }, 500);

       getUserCoupons();
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
      const container = $(e.currentTarget).parent().parent();
      sendCouponToDeleteFromAPI(currentCouponId, container);
    });
}

function sendCouponToDeleteFromAPI(id, container) {
  //console.log(`if I got here then i should delete this id: ${id} from the DB`);
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

        //console.log(`you successfully deleted a coupon`);

        container.animate({
          opacity: 0,
        }, 500, function(){
          container.remove();
        });

         getUserCoupons();
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
      //console.log(couponObject);
      const merchantNameText = $(couponObject).find('h2.coupon-merchant-name').text();
      const codeText = $(couponObject).find('p.coupon-code').text();
      const expirationDateText = $(couponObject).find('p.coupon-expiration-date').text();
      const descriptionText = $(couponObject).find('p.coupon-description').text();
      const couponImage = $(couponObject).find('img.hide.js-coupon-image').attr('src');

      console.log(merchantNameText);
      console.log(codeText);
      console.log(expirationDateText);
      console.log(descriptionText);
      console.log(couponImage);

      //this puts value in the fields
      $('.input-edit-merchantName').val(merchantNameText);
      $('.input-edit-code').val(codeText);
      document.querySelector('.input-edit-expirationDate').valueAsDate = new Date(expirationDateText);
      $('.input-edit-description').val(descriptionText);
      $('.js-uploaded-coupon-image').attr('src', couponImage);

      //pull the values that the user types in the inputs
      watchSubmitEditCouponHandler(currentCouponId);
  });
}

function watchSubmitEditCouponHandler(id) {
  $('#js-edit-coupon-form').on('submit', (e) => {
      e.preventDefault();
      console.log('you want to update a coupon');
      $('#editCouponModal').modal('hide');
      sendCouponToEditFromAPI(id, e);
  });
}

function sendCouponToEditFromAPI(id, e) {
  var formData = new FormData(e.target);
    for (var [key, value] of formData.entries()) {
        console.log(key, value);
    }

  let _couponId = id;

  //console.log(`If I got here then I should edit this id: ${id} on the DB`);
    $.ajax({
      url: `/coupon/${id}`,
      type: 'PUT',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
      },
      data: formData,
      processData: false,
      contentType: false,
      success: function(res) {
        console.log(res);

        $(`[data-id = ${_couponId}] .js-coupon-merchant-logo a`).attr('href', res.companyDomain);
        $(`[data-id = ${_couponId}] .js-logo-img`).attr('src', res.companyLogo);
        $(`[data-id = ${_couponId}] .coupon-merchant-name`).html(res.merchantName);
        $(`[data-id = ${_couponId}] .coupon-code`).html(res.code);
        $(`[data-id = ${_couponId}] .coupon-expiration-date`).html(`Valid til ${res.expirationDate}`);
        $(`[data-id = ${_couponId}] .coupon-description`).html(res.description);

        console.log(`you successfully updated a coupon: ${_couponId}`);

        getUserCoupons();
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

function renderDropDownlist(merchant, index) {
  return `<a class="dropdown-item" href="#" data-index="${index}">${merchant}</a>`
}

function renderDropDown(htmlCode) {
  return `<div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Filter by Merchant
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <a class="dropdown-item" href="/" data-index="-1">Show All Merchants</a>
              ${htmlCode}
            </div>
          </div>`;
}

function renderFilterByMerchants(res) {
  console.log(res);
  const coupons = res.coupons;
  let merchants = [];
  // Generate unique list of merchants
  coupons.map(function(coupon) {
    if(!merchants.includes(coupon.merchantName)) {
        merchants.push(coupon.merchantName);
    }
  });

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
  //make sure you have the most recent states of everything.
  $('.dropdown').on('click','.dropdown-item', (e) => {
    e.preventDefault();

    $.ajax({
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
      },
      url: '/coupon/',
      type: 'GET',
      success: (res) => {
        console.log(res);
        const coupons = res.coupons;
        let filteredCoupons = [];
        let currentMerchant = 0;

        let currentTarget = $(e.currentTarget);
        const clickedIndex = currentTarget.attr('data-index');
        currentMerchant = clickedIndex;

        if(currentMerchant >= 0) {
          // Generate filtered coupons to then be rendered
          filteredCoupons = coupons.filter(function(coupon, index) {
            return coupon.merchantName === merchants[currentMerchant];
          });
          renderSpecificMerchantCouponsOnDOM(filteredCoupons);
        }
        else {
          //alert('user wants to reload all merchants. ');
          getUserCoupons();
        }

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
  });
}

function renderSpecificMerchantCouponsOnDOM(filteredByMerchantCoupons){
  console.log(filteredByMerchantCoupons);
  let couponHTML = "";

  filteredByMerchantCoupons.map(function(coupon){
    const toggleCouponState = checkIfCouponShouldBeDisabled(coupon);
    couponHTML += renderCoupons(coupon, toggleCouponState);
  });

  $('#coupons').css('opacity', '0');
  $('#coupons').html(couponHTML);

  $('#coupons').animate({
    opacity: 1,
  }, 150);

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

function showCoupondetails(){
  $('#coupons').on('click', '.js-coupon-code', (e) => {
    e.preventDefault();
    const couponContainer = $(e.target).parent().parent().parent();
    currentCouponId = $(couponContainer).attr('data-id');
    // I want to get the img element and pass it to renderShowCouponImageModal
    let currentCouponImage = $(couponContainer).find('img.hide.js-coupon-image').attr('src');
    $('#showuploadedImageModelSection').html(renderShowCouponImageModal(currentCouponImage));
    $('#showCouponImageModal').modal('show');
  });
}

//STILL HAVE TO WORK ON!!!!!!
function checkIfCouponIsPastDue() {
  console.log('checking if coupon is past due based on date');//this should be done in the backend.
  //check coupons get responseJSON
  //from coupons array get expiration Date
  //then compare if value of expirationDate and today's current date.
}

function initalizeCouponApp() {
    getUserCoupons();
    watchAddBtnHandler();
    watchDeleteBtnHandler();
    watchEditBtnHandler();
    showCoupondetails();
    clickedOnMarkUsed();
}

$(initalizeCouponApp);
