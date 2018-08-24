'use strict';

let currentCouponId = null;
let currentEventListener = null;
let entireCouponElement = null;


/* ADD COUPON */
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
                  <h2 class="modal-title" id="addNewCouponModalLabel">Add Coupon</h2>
                  <section role ="region" id="js-err-output" class="container"></section>
                  <form id="js-add-coupon-form">
                    <div class="form-group">
                      <label for="merchantName">Merchant Name <span class ="limitsOnInputs">(14 charater limit)</span></label>
                      <input type="text" name="merchantName" class="form-control input-add-merchantName" maxlength="14" minlength="1" id="merchantName" required/>
                    </div>
                    <div class="form-group">
                      <label for="code">Code <span class ="limitsOnInputs">(15 charater limit)</span></label>
                      <input type="text" name="code" class="form-control input-add-code" maxlength="15" minlength="1" id="code" required/>
                    </div>
                    <div class="form-group">
                      <label for="expirationDate">Expiration Date <span class ="limitsOnInputs">(Date must be today or greater)</span></label>
                      <input type="text" name="expirationDate" class="form-control input-add-expirationDate js-date-field" id="datepicker" autocomplete="off" minlength="10" maxlength="10" required/>
                    </div>
                    <div class="form-group">
                      <label for="description">Description <span class ="limitsOnInputs">(40 charater limit)</span></label>
                      <input type="text" name="description" class="form-control input-add-description" maxlength="40" minlength="1" id="description" required/>
                    </div>
                    <div class="form-group">
                      <label for="couponImage" class="custom-file-upload"><p>Upload an image of your coupon <span class ="limitsOnInputs">(only accepts image formats)</span></p></label>
                      <input id="couponImage" type="file" name="couponImage" accept="image/*" />
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
function watchAddBtnHandler() {
  $('.js-add-new-coupon-btn').on('click', (e) => {
    e.preventDefault();
    $('#addNewCouponModalSection').html(renderAddModal());
    $("#datepicker").datepicker({
       dateFormat: 'yy-mm-dd',
       minDate: 0,
       maxDate: "+1Y"
    });
    watchSubmitAddNewCouponHandler();
  });
}
function watchSubmitAddNewCouponHandler() {
  let field = $('#js-add-coupon-form');
  field.on('keypress','.input-add-code', (e) => {
     var key = e.keyCode;
      if (key === 32) {
        e.preventDefault();
      }
  });

  $('#js-add-coupon-form').on('submit', (e) => {
    e.preventDefault();
    $('#js-submit-add-coupon-btn').attr("disabled", true);
    sendAddCouponDataToAPI(e);
  });
}
function sendAddCouponDataToAPI(e) {
  let formData = new FormData(e.target);

  let couponImageLength = $('#couponImage')[0].files.length;

  if(couponImageLength <= 0){
    formData.delete('couponImage');
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

      couponHTML.animate({
        opacity: 1,
      }, 500);

       getUserCoupons();
    },
    error: (err) => {
      $('#js-submit-add-coupon-btn').attr("disabled", false);
      let errorMsg = `<div class="alert alert-danger fade show text-center" role="alert">
                        ${err.responseJSON.message}
                      </div>`;

      return $('#js-err-output').html(errorMsg);
    }
  });
}


/* EDIT COUPON */
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
                            <h2 class="modal-title" id="editCouponModalLabel">Edit Coupon</h2>
                            <section role ="region" id="js-err-output" class="container"></section>
                            <form id="js-edit-coupon-form">
                                <div class="form-group">
                                    <label for="merchantName">Merchant Name <span class ="limitsOnInputs">(14 charater limit)</span></label>
                                    <input type="text" name="merchantName" class="form-control input-edit-merchantName" maxlength="14" minlength="1"  id="merchantName" required />
                                </div>

                                <div class="form-group">
                                    <label for="code">Code <span class ="limitsOnInputs">(15 charater limit)</span></label>
                                    <input type="text" name="code" class="form-control input-edit-code" maxlength="15"  minlength="1"  id="code" required />
                                </div>

                                <div class="form-group">
                                    <label for="expirationDate">Expiration Date <span class ="limitsOnInputs">(Date must be today or greater)</label>
                                    <input type="text" name="expirationDate" class="form-control input-edit-expirationDate js-date-field" id="datepicker2" autocomplete="off" maxlength="10" required />
                                </div>

                                <div class="form-group">
                                    <label for="description">Description <span class ="limitsOnInputs">(40 charater limit)</span></label>
                                    <input type="text" name="description" class="form-control input-edit-description" maxlength="40" minlength="1"  id="description" required/>
                                </div>

                                <div class="form-group">
                                  <div>
                                    <img src="" alt="coupon image that user uploaded" class="js-uploaded-coupon-image uploaded-coupon-image">
                                    current image
                                  </div>
                                  <label for="couponImage" class="custom-file-upload"><p>Upload an image of your coupon <span class ="limitsOnInputs">(only accepts image formats)</span></p></label>
                                  <input id="couponImage" type="file" name="couponImage" accept="image/*" />
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
function watchEditBtnHandler() {
  $('#coupons').on('click','.js-edit-icon', (e) => {
      e.preventDefault();
      $('.js-delete-icon').tooltip('hide');
      $('.js-complete-icon').tooltip('hide');
      $('.js-edit-icon').tooltip('hide');

      $('#editCouponModalSection').html(renderEditModal());

      $("#datepicker2").datepicker({
         dateFormat: 'yy-mm-dd',
         minDate: 0,
         maxDate: "+1Y"
      });

      currentCouponId = $(e.currentTarget).parent().parent().attr('data-id');

      getCouponById(currentCouponId, getValues);
      watchSubmitEditCouponHandler(currentCouponId);
  });
}
function getCouponById(id, callback) {
  $.ajax({
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
    },
    url: `/coupon/${id}`,
    type: 'GET',
    success: callback,
    error: (err) => {
      renderErrorMessage(err);
    }
  });
}
function getValues(res) {
  const merchantNameText = res.merchantName;
  const codeText = res.code;
  const expirationDateText = res.expirationDate;
  const descriptionText = res.description;
  const couponImage = res.couponImage;

  $('.input-edit-merchantName').val(merchantNameText);
  $('.input-edit-code').val(codeText);
  $('.input-edit-expirationDate').val(expirationDateText);
  $('.input-edit-description').val(descriptionText);
  $('.js-uploaded-coupon-image').attr('src', couponImage);
}
function watchSubmitEditCouponHandler(id) {
  let field = $('#js-edit-coupon-form');
  field.on('keypress','.input-edit-code', (e) => {
     var key = e.keyCode;
      if (key === 32) {
        e.preventDefault();
      }
  });

  $('#js-edit-coupon-form').on('submit', (e) => {
      e.preventDefault();
      $('#js-submit-edit-coupon-btn').attr("disabled", true);

      sendCouponToEditFromAPI(id, e);
  });
}
function sendCouponToEditFromAPI(id, e) {
  let formData = new FormData(e.target);
  formData.append('id', id);

  let couponImageLength = $('#couponImage')[0].files.length;

  if(couponImageLength <= 0){
    formData.delete('couponImage');
  }

    let _couponId = id;

    $.ajax({
      url: `/coupon/${id}`,
      type: 'PUT',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
      },
      data: formData,
      processData: false,
      contentType: false,
      success: (res) => {
        $('#editCouponModal').modal('hide');
        if(res.companyDomain !== '' || res.companyDomain !== null){
          $(`[data-id = ${_couponId}] .js-coupon-merchant-logo a`).attr('href', res.companyDomain);
        }
        else {
          $(`[data-id = ${_couponId}] .js-coupon-merchant-logo a`).removeAttr("href");
        }

        $(`[data-id = ${_couponId}] .js-logo-img`).attr('src', res.companyLogo);
        $(`[data-id = ${_couponId}] .coupon-merchant-name`).html(res.merchantName);
        $(`[data-id = ${_couponId}] .coupon-code`).html(res.code);
        $(`[data-id = ${_couponId}] .coupon-expiration-date`).html(`Valid til ${res.expirationDate}`);
        $(`[data-id = ${_couponId}] .coupon-description`).html(res.description);

        getUserCoupons();
      },
      error:(err) => {

        let errorMsg = `<div class="alert alert-danger fade show text-center" role="alert">
                          ${err.responseJSON.message}
                        </div>`;
        $('#js-submit-edit-coupon-btn').attr("disabled", false);
        return $('#js-err-output').html(errorMsg);
      }
    });
}


/* DELETE COUPON */
function renderDeleteConfirmationModal(){
  return `<div class="modal fade" id="showConfirmDeleteModal" tabindex="-1" role="dialog" aria-labelledby="showConfirmDeleteModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body inlineBlock-center">
                  <section role ="region" id="js-err-output" class="container"></section>
                  <h5 class="modal-title" id="showConfirmDeleteModalLabel">Are you sure you want to delete?</h5>
                  <button type="submit" class="btn btn-danger" id="js-submit-delete-coupon-yes">Yes</button>
                  <button type="submit" class="btn btn-secondary" id="js-submit-delete-coupon-no">No</button>
              </div>
            </div>
          </div>
        </div>`;
}
function watchDeleteBtnHandler() {
  $('#js-list-coupons-section').on('click','.js-delete-icon', (e) => {
      e.preventDefault();
      currentCouponId = $(e.currentTarget).parent().parent().attr('data-id');
      $('#showConfirmDeleteModalSection').html(renderDeleteConfirmationModal());
      const container = $(e.currentTarget).parent().parent();
      watchSubmitDeleteCouponHandler(currentCouponId,container);
      watchSubmitDeletePressedNoHandler();
    });
}
function watchSubmitDeletePressedNoHandler() {
  $('#js-submit-delete-coupon-no').on('click', (e) => {
      e.preventDefault();
      $('#showConfirmDeleteModal').modal('hide');
  });
}
function watchSubmitDeleteCouponHandler(currentCouponId, container){
  $('#js-submit-delete-coupon-yes').on('click', (e) => {
      e.preventDefault();
      $('#showConfirmDeleteModal').modal('hide');
      sendCouponToDeleteFromAPI(currentCouponId, container);
  });
}
function sendCouponToDeleteFromAPI(id, container) {
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

        container.animate({
          opacity: 0,
        }, 500, function(){
          container.remove();
        });

         getUserCoupons();
      },
      error: (err) => {
        let errorMsg = `<div class="alert alert-danger fade show text-center" role="alert">
                          ${err.responseJSON.message}
                        </div>`;

        return $('#js-err-output').html(errorMsg);
      }
    });
}


/* SHOW UPLOADED COUPON IMAGE */
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
                  <img src="${imgPath}" alt="uploaded coupon image" class="couponImageContainer coupon-Image-Big">
              </div>
            </div>
          </div>
        </div>`;
}
function showCoupondetails(){
  $('#coupons').on('click', '.js-coupon-code', (e) => {
    e.preventDefault();
    const couponContainer = $(e.target).parent().parent().parent().parent();
    currentCouponId = $(couponContainer).attr('data-id');
    let currentCouponImage = $(couponContainer).find('img.hide.js-coupon-image').attr('src');
    $('#showUploadedImageModalSection').html(renderShowCouponImageModal(currentCouponImage));
    $('.js-show-coupon-image').tooltip('hide');
  });
}


/* MARKING COUPON USED */
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

  // changing styles to used coupon
  if (couponUsedBoolVal === false) {
      formData.append('couponUsed', Boolean(1));
      formData.append('couponDisplayState', 'coupon-disabled');
      formData.append('couponImageLinkDisplayState', 'show-coupon-image-link-styling-disabled');
      sendUpdateDataToAPI(currentCouponId, formData);
  }
  // changing styles to active coupon
  else if (couponUsedBoolVal === true) {
    formData.append('couponUsed', Boolean(0));
    formData.append('couponDisplayState', 'coupon-active');
    formData.append('couponImageLinkDisplayState', 'show-coupon-image-link-styling');
    sendUpdateDataToAPI(currentCouponId, formData);
  }
  else {
    //something went wrong with marking coupon!
  }

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
      const toggleCouponState = checkIfCouponShouldBeDisabled(res.coupon);
      markCouponUsedonDOM(res.coupon, toggleCouponState);
    },
    error: (err) => {
      renderErrorMessage(err);
    }
  });
}
function checkIfCouponShouldBeDisabled(res) {
  let classes = '';
  let dashedStates = '';
  let dashedLineImage = '';
  let companyLogoStates = '';
  let companyDomain = '';
  let couponImageLinkDisplayState = '';
  let editIconState = '';

  if(res.couponUsed !== null && res.couponUsed !== '') {
    if(res.couponUsed === false){
      if(res.companyDomain === ''){
        classes = 'coupon-active';
        dashedStates = 'dashed-line-active';
        dashedLineImage = 'images/dashed-line.png';
        companyLogoStates = res.companyLogo;
        companyDomain = '';
        couponImageLinkDisplayState = res.couponImageLinkDisplayState;
        editIconState = '';
      }
      else {
        classes = 'coupon-active';
        dashedStates = 'dashed-line-active';
        dashedLineImage = 'images/dashed-line.png';
        companyLogoStates = res.companyLogo;
        companyDomain = `href="${res.companyDomain}"`;
        couponImageLinkDisplayState = res.couponImageLinkDisplayState;
        editIconState = '';
      }
    }
    if(res.couponUsed === true) {
      classes = 'coupon-disabled';
      dashedStates = 'dashed-line-disabled';
      dashedLineImage = 'images/dashed-line-disable.png';
      companyLogoStates = res.companyLogoUsed;
      companyDomain = '';
      couponImageLinkDisplayState = 'show-coupon-image-link-styling-disabled';
      editIconState = 'hide';
    }
  }

  const couponStates = {
    classes: classes,
    dashedStates: dashedStates,
    dashedLineImage: dashedLineImage,
    companyLogoStates: companyLogoStates,
    companyDomain: companyDomain,
    couponImageLinkDisplayState: couponImageLinkDisplayState,
    editIconState: editIconState
  }

  return couponStates;
}
function markCouponUsedonDOM(res,toggleCouponState) {
  $('.js-complete-icon').tooltip('hide');

  const couponContainerObject = $(entireCouponElement);
  const couponNav = $(couponContainerObject).find('a.icon.complete-icon');
  const completeIconElement = $(couponNav)[0];
  const couponContainer = $(couponContainerObject).find('.js-coupon-container');
  const merchantLogoLink = couponContainerObject.find('div.js-coupon-merchant-logo').children();
  const dashed = couponContainerObject.find('div.dashed');
  const editIcon = couponContainer.siblings().find('a.icon.edit-icon');
  const couponCodeTitle = couponContainerObject.find('p.coupon-title');
  const couponImageDisplayLink = couponContainerObject.find('p.coupon-code');
  const uploadedCouponImageLink = couponContainerObject.find('p.coupon-code a');

  //put the image modal back
  const couponImageStates = (res.couponImage) ? '' : '';

  if (res.couponUsed === false){ //coupon not used
    merchantLogoLink.attr('href', res.companyDomain);
    couponContainer.removeClass('coupon-disabled');
    couponContainer.addClass(toggleCouponState.classes);
    merchantLogoLink.children().attr('src', toggleCouponState.companyLogoStates);
    dashed.children().attr('src', toggleCouponState.dashedLineImage);
    dashed.children().removeClass('dashed-line-disabled');
    dashed.children().addClass(toggleCouponState.dashedStates);
    couponImageDisplayLink.removeClass('show-coupon-image-link-styling-disabled');
    couponImageDisplayLink.addClass(toggleCouponState.couponImageLinkDisplayState);
    couponContainerObject.find('p.coupon-code a').tooltip('enable');
    editIcon.fadeIn('slow');
    $(completeIconElement).attr('data-original-title', 'Mark used');
  }
  else if (res.couponUsed === true){ //coupon is used
    couponContainer.removeClass('coupon-active');
    couponContainer.addClass(toggleCouponState.classes);
    merchantLogoLink.children().attr('src', toggleCouponState.companyLogoStates);
    merchantLogoLink.removeAttr('href');
    dashed.children().attr('src', toggleCouponState.dashedLineImage);
    dashed.children().removeClass('dashed-line-active');
    dashed.children().addClass(toggleCouponState.dashedStates);
    couponImageDisplayLink.removeClass('show-coupon-image-link-styling');
    couponImageDisplayLink.addClass(toggleCouponState.couponImageLinkDisplayState);
    uploadedCouponImageLink.removeAttr('href');
    couponContainerObject.find('p.coupon-code a').tooltip('disable');
    editIcon.fadeOut('slow');
    $(completeIconElement).attr('data-original-title', 'Mark unused');
  }
  else {
    //something is up in the patch request conditionals
  }
}


/* RENDERS COUPONS */
function renderCoupons(res, toggleCouponState) {
  const modalAttributes = (res.couponImage) && (res.couponUsed === false) ? 'data-toggle="modal" data-target="#showCouponImageModal"' : '';
  const beginningLinkAttributes = (res.couponImage) && (res.couponUsed === false) ? '<a href="" class="js-show-coupon-image show-coupon-image" ' : '';
  const toolTipAttributes = (res.couponImage) && (res.couponUsed === false) ? 'data-toggle="tooltip" data-placement="top" title="Click to see coupon Image uploaded">' : '';
  const endLinkAttributes = (res.couponImage) && (res.couponUsed === false) ? '</a>' : '';
  const couponImageAttributes = (res.couponImage) ? `${res.couponImage}` : '';
  const toolTipTextCompleteIcon = (res.couponUsed) ? 'title="Mark un-used"' : 'title="Mark used"';

  return `<section role="region" class="all-coupon-container" data-id="${res._id}">
            <img src ="${couponImageAttributes}" alt="coupon image user uploaded for ${res.merchantName}" class="hide js-coupon-image">
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
              <p class="coupon-code js-coupon-code no-margin ${res.couponImageLinkDisplayState}" ${modalAttributes}>${beginningLinkAttributes}${toolTipAttributes}<span>${res.code}</span>${endLinkAttributes}</p>
              <p class="coupon-expiration-date no-margin">Valid till ${res.expirationDate}</p>
            </section>
            <section role="region" class="coupon-actions-nav">

              <a href="" data-toggle="tooltip" data-placement="top" ${toolTipTextCompleteIcon} class="icon complete-icon js-complete-icon">
                <img src="images/tick-sign.svg" alt="complete icon" class="budicon">
              </a>

              <a href="" data-toggle="tooltip" data-placement="top" title="Edit" class="icon edit-icon js-edit-icon ${toggleCouponState.editIconState}">
                <img src="images/ui-compose.svg" alt="edit icon" data-toggle="modal" data-target="#editCouponModal" class="budicon">
              </a>

              <a href="" data-toggle="tooltip" data-placement="top" title="Delete" class="icon trash-icon js-delete-icon">
                <img src="images/trash.svg" alt="trash icon" data-toggle="modal" data-target="#showConfirmDeleteModal" class="budicon">
              </a>
            </section>
          </section>`;
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

      res.coupons.reverse().map((coupon) => {
        const toggleCouponState = checkIfCouponShouldBeDisabled(coupon);
        couponHTML += renderCoupons(coupon, toggleCouponState);
      });


      $('#coupons').css('opacity', '0');
      $('#coupons').html(couponHTML);

      $('#coupons').animate({
        opacity: 1,
      }, 150);

    },
    error: (err) => {
      renderErrorMessage(err);
    }
  });
}


/* FILTER MERCHANTS */
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
  const coupons = res.coupons;
  let merchants = [];
  // Generate unique list of merchants
  coupons.map((coupon) => {
    if(!merchants.includes(coupon.merchantName)) {
        merchants.push(coupon.merchantName);
    }
  });

  return merchants;
}
function displayDropDownList(merchants) {
  var htmlCode = "";
  merchants.map((coupon, index) => {
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
        const coupons = res.coupons;
        let filteredCoupons = [];
        let currentMerchant = 0;

        let currentTarget = $(e.currentTarget);
        const clickedIndex = currentTarget.attr('data-index');
        currentMerchant = clickedIndex;

        if(currentMerchant >= 0) {
          // Generate filtered coupons to then be rendered
          filteredCoupons = coupons.filter((coupon, index) => {
            return coupon.merchantName === merchants[currentMerchant];
          });
          renderSpecificMerchantCouponsOnDOM(filteredCoupons);
        }
        else {
          getUserCoupons();
        }
      },
      error: (err) => {
        renderErrorMessage(err);
      }
    });
  });
}
function renderSpecificMerchantCouponsOnDOM(filteredByMerchantCoupons){
  let couponHTML = "";

  filteredByMerchantCoupons.map((coupon) => {
    const toggleCouponState = checkIfCouponShouldBeDisabled(coupon);
    couponHTML += renderCoupons(coupon, toggleCouponState);
  });

  $('#coupons').css('opacity', '0');
  $('#coupons').html(couponHTML);

  $('#coupons').animate({
    opacity: 1,
  }, 150);

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
