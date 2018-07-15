'use strict';

function getUserCoupons() {
  $.ajax({
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
    },
    url: '/coupon/',
    type: 'GET',
    success: function(res) {

      $('.js-logout').removeClass('hide');
      $('.js-coupon').removeClass('hide');

      $('.js-signup').addClass('hide');
      $('.js-login').addClass('hide');

      console.log(`The user made it to the Dashboard`);
      console.log(`The user id is: ${res._userId}`);
      var html = "";
      res.coupons.map(function(coupon){
        html +=`<section role="role" class="all-coupon-container" data-id="${coupon._id}">
                  <section role="region" class="coupon-container js-coupon-container">
                    <div class="coupon-merchant-logo"></div>
                    <h2 class="coupon-merchant-name">${coupon.merchantName}</h2>
                    <p class="coupon-description">${coupon.description}</p>
                    <div class="dashed">
                      <img src="images/dashed-line.png">
                    </div>
                    <p class="coupon-title">COUPON CODE</p>
                    <p class="coupon-code js-coupon-code">${coupon.code}</p>
                    <p class="coupon-expiration-date">${coupon.expirationDate}</p>
                  </section>
                  <section role="region" class="coupon-actions-nav">
                    <img src="images/ui-compose.svg" alt="edit-icon" class="icon edit-icon js-edit-icon" data-toggle="modal" data-target="#editCouponModal" tabindex="4">
                    <img src="images/uploading-ui.svg" alt="" class="icon upload-icon js-upload-icon" tabindex="4">
                    <img src="images/notification.svg" alt="" class="icon notification-icon js-notification-icon" tabindex="4">
                    <img src="images/trash.svg" alt="" class="icon delete-icon js-delete-icon" tabindex="4">
                  </section>
                </section>`;
      });
      $('#coupons').html(html);
    },
    error: function(err) {
      if(token === null) {
        console.log('Token is empty and you are not logged in. Please log in!!!');
      }
      else{
        console.log('something went wrong when trying to get to the protected endpoint');
      }
    }
  })
}

function renderCoupons(res) {
  return`<section role="role" class="all-coupon-container" data-id="${res._id}">
            <section role="region" class="coupon-container js-coupon-container">
              <div class="coupon-merchant-logo"></div>
              <h2 class="coupon-merchant-name">${res.merchantName}</h2>
              <p class="coupon-description">${res.description}</p>
              <div class="dashed">
                <img src="images/dashed-line.png">
              </div>
              <p class="coupon-title">COUPON CODE</p>
              <p class="coupon-code js-coupon-code">${res.code}</p>
              <p class="coupon-expiration-date">${res.expirationDate}</p>
            </section>
            <section role="region" class="coupon-actions-nav">
              <img src="images/ui-compose.svg" alt="edit-icon" class="icon edit-icon js-edit-icon" data-toggle="modal" data-target="#editCouponModal" tabindex="4">
              <img src="images/uploading-ui.svg" alt="" class="icon upload-icon js-upload-icon" tabindex="4">
              <img src="images/notification.svg" alt="" class="icon notification-icon js-notification-icon" tabindex="4">
              <img src="images/trash.svg" alt="" class="icon trash-icon js-delete-icon" tabindex="4">
            </section>
          </section`;
}

function renderAddModal() {
  return`<div class="modal fade" id="addNewCouponModal" tabindex="-1" role="dialog" aria-labelledby="addNewCouponModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                  <div class="modal-content">
                      <div class="modal-header">
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                          </button>
                      </div>
                      <div class="modal-body">
                          <h5 class="modal-title" id="addNewCouponModalLabel">Add new coupon</h5>
                          <form id="js-add-coupon-form">
                              <div class="form-group">
                                  <label for="merchantName">Merchant Name</label>
                                  <input type="text" name="merchantName" class="form-control input-add-merchantName" required>
                              </div>

                              <div class="form-group">
                                  <label for="code">Code</label>
                                  <input type="text" name="code" class="form-control input-add-code" required>
                              </div>

                              <div class="form-group">
                                  <label for="expirationDate">Expiration Date</label>
                                  <input type="text" name="expirationDate" class="form-control input-add-expirationDate" data-toggle="datepicker" required>
                              </div>

                              <div class="form-group">
                                  <label for="description">Description</label>
                                  <input type="text" name="description" class="form-control input-add-description" required>
                              </div>

                              <div class="test-btn">
                                  <button type="submit" class="button solid submit-add-coupon-btn" id="js-submit-add-coupon-btn">Add new coupon</button>
                              </div>
                          </form>
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
                            <h5 class="modal-title" id="editCouponModalLabel">Edit existing coupon</h5>
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
                                    <input type="text" name="expirationDate" class="form-control input-edit-expirationDate" data-toggle="datepicker" required>
                                </div>

                                <div class="form-group">
                                    <label for="description">Description</label>
                                    <input type="text" name="description" class="form-control input-edit-description" required>
                                </div>

                                <div class="center">
                                    <button type="submit" class="button solid submit-edit-coupon-btn" id="js-submit-edit-coupon-btn">save edited coupon</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>`;
}

function watchAddBtnHandler() {
  $('.js-add-new-coupon-btn').on('click', (e) => {
    $('#addNewCouponModelSection').html(renderAddModal());
    $('#addNewCouponModal').modal('show');

    var date = new Date();
    // date.setDate(date.getDate()-1); //to get previous day
    date.setDate(date.getDate());

    $('[data-toggle="datepicker"]').datepicker({
      autoHide: true,
      zIndex: 2048,
      startDate: date
    });

    watchSubmitAddNewCouponHandler();
  })
}

function watchSubmitAddNewCouponHandler() {
    $('#js-add-coupon-form').on('submit', (e) => {
        e.preventDefault();
        console.log('you added a coupon');
        $('#addNewCouponModal').modal('hide');
        sendAddCouponDataToAPI();
    });
}

function sendAddCouponDataToAPI() {
    $.ajax({
  		url: '/coupon',
      type: 'POST',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
      },
      data: {
        merchantName: $('.input-add-merchantName').val(),
        code: $('.input-add-code').val(),
        expirationDate: $('.input-add-expirationDate').val(),
        description: $('.input-add-description').val()
      },
      dataType:'json',
  		success: function(res){

        //const companyname = $('.input-add-merchantName').val();
        //getCompanyLogoImageDataFromApi(companyname);

        $('.input-add-merchantName').val('');
        $('.input-add-code').val('');
        $('.input-add-expirationDate').val('');
        $('.input-add-description').val('');

        const couponHTML = $(renderCoupons(res));
        couponHTML.css('opacity', '0');
        $('#coupons').append(couponHTML);

        couponHTML.animate({
          opacity: 1,
        }, 500);


        $('#js-msg-output').show();

        $('#js-msg-output').html(`<div class="alert alert-success alert-dismissible fade show text-center" role="alert">You have successfully added a coupon!
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          </div`);

          setTimeout(() => {
             $('#js-msg-output').hide();
          }, 2000);
  		},
  		error: function(err){
        console.log('something went wrong');
  		}
  	});
}

function watchDeleteBtnHandler() {
    $('#js-list-coupons-section').on('click','.js-delete-icon', function(e) {
        e.preventDefault();
        //console.log($(this).parent().parent().attr('data-id'));
        const couponId = $(this).parent().parent().attr('data-id')
        console.log(`The coupon id: ${couponId}`);
        const container = $(this).parent().parent();
        sendCouponToDeleteFromApi(couponId, container);
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
      success: function(res) {
        console.log(`you successfully deleted a coupon`);

        container.animate({
          opacity: 0,
        }, 500, function(){
          container.remove();
        });

      },
      error: function(err) {
        console.log(`Something happened when trying to delete ${err}`);
      }
    });
}

function watchEditBtnHandler() {
  $('#js-list-coupons-section').on('click','.js-edit-icon', function(e) {
      e.preventDefault();

      $('#editCouponModelSection').html(renderEditModal());
      $('#editCouponModal').modal('show');

      var date = new Date();
      // date.setDate(date.getDate()-1); //to get previous day
      date.setDate(date.getDate());

      $('[data-toggle="datepicker"]').datepicker({
        autoHide: true,
        zIndex: 2048,
        startDate: date
      });

      const couponId = $(this).parent().parent().attr('data-id');
      console.log(`The coupon id of the edit coupon ${couponId}`);

      //get the values currently in the input fields for that getCouponid
      const couponObject = $(this).parent().parent();
      const merchantNameText = $(couponObject).find('h2.coupon-merchant-name').text();
      const codeText = $(couponObject).find('p.coupon-code').text();
      const expirationDateText = $(couponObject).find('p.coupon-expiration-date').text();
      const descriptionText = $(couponObject).find('p.coupon-description').text();


      $('.input-edit-merchantName').val(merchantNameText);
      $('.input-edit-code').val(codeText);
      $('.input-edit-expirationDate').val(expirationDateText);
      $('.input-edit-description').val(descriptionText);

      //pull the values that the user types in the inputs
      watchSubmitEditCouponHandler(couponId)
  });
}

function watchSubmitEditCouponHandler(id) {
  $('#js-submit-edit-coupon-btn').on('submit', function(e) {
      e.preventDefault();
      console.log('you want to update a coupon');
      $('#editCouponModal').modal('toggle');
      sendCouponToEditFromApi(id);
  });
}

function sendCouponToEditFromApi(id) {
  let _couponId = id;
  console.log(`If I got here then I should edit this id: ${id} on the DB`);
    $.ajax({
      url: `/coupon/${id}`,
      type: 'PUT',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
      },
      data: {
        merchantName: $('.input-edit-merchantName').val(),
        code: $('.input-edit-code').val(),
        expirationDate: $('.input-edit-expirationDate').val(),
        description: $('.input-edit-description').val()
      },
      dataType: 'json',
      success: function(res) {
        console.log(`you successfully updated a coupon: ${_couponId}`);

        var merchantName = $('.input-edit-merchantName').val();
        var inputCode = $('.input-edit-code').val();
        var expirationDate = $('.input-edit-expirationDate').val();
        var inputDescription = $('.input-edit-description').val();

        $(`[data-id = ${_couponId}] .coupon-merchant-name`).html(merchantName);
        $(`[data-id = ${_couponId}] .coupon-code`).html(inputCode);
        $(`[data-id = ${_couponId}] .coupon-expiration-date`).html(expirationDate);
        $(`[data-id = ${_couponId}] .coupon-description`).html(inputDescription);

        $('#js-msg-output').show();

        $('#js-msg-output').html(`<div class="alert alert-success alert-dismissible fade show text-center" role="alert">You have successfully edited a coupon!
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          </div`);

        setTimeout(() => {
          $('#js-msg-output').hide();
        }, 2000);
      },
      error: function(err) {
        console.log(`Something happened when trying to edit ${err}`);
      }
    });
}

function getCompanyLogoImageDataFromApi(searchTerm) {
  console.log(`Get Company function ${searchTerm}`);
  $.ajax({
    url: `https://logo.clearbit.com/${searchTerm}.com`,
    type: 'GET',
    dataType: 'html',
    success: function(res) {
      console.log('the get company call was successful' + res);
      $('#test').html('<img src="data:image/png;base64,' + res + '" />');
    },
    error: function(res) {
      console.log('there is an err');
    }
  });
}

function displaySearchData(data) {
  console.log("This is gets returned" + data);
}


/*
//HAVE TO GET THIS WORKING
function copyCouponCodeToClipboard() {
  $('.js-coupon-container').on('click','.js-coupon-code', (e) => {
    e.stopPropagation();
    console.log('coupon code copied to clipboard.');
  });
}

*/

function initalizeCouponApp() {
    getUserCoupons();
    watchAddBtnHandler();
    watchDeleteBtnHandler();
    watchEditBtnHandler();
}

$(initalizeCouponApp);
