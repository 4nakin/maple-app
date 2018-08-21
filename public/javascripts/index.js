'use strict';

function signupBtnHandler() {
  $('.js-signup-btn').on('click', (e) => {
    window.location.href = '/signup';
  });
}

function loginBtnHandler() {
  $('.js-login-btn').on('click', (e) => {
    window.location.href = '/login';
  });
}

function signupHandler() {
  $('#signup-section').on('submit', '#js-signup-form', (e) => {
    e.preventDefault();
    $.ajax({
      url: '/api/users',
      type: 'POST',
      data: {
        firstName: $('#input-firstName').val(),
        lastName: $('#input-lastName').val(),
        username: $('#input-username').val(),
        password: $('#input-password').val()
      },
      success: (res) => {
        console.log(res);
        $('#input-firstName').val('');
        $('#input-lastName').val('');
        $('#input-username').val('');
        $('#input-password').val('');
        renderSuccessMessage(res);
      },
      error: (res) => {
        renderErrorMessage(res);
      }
    });
  });
}

function logoutHandler() {
  $('.js-logout').on('click', (e) => {
    e.preventDefault();
    $.ajax({
      url: '/api/auth/logout',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('Token')}`);
      },
      type: 'GET',
      success: (res) => {

        var token = localStorage.getItem('Token');
        if(token) {
          localStorage.removeItem('Token');
        }
        window.location.href = '/dashboard';
      },
      error: (res) => {
        renderErrorMessage(res);
      }
    });
  });
}

function loginHandler() {
  $('#login-section').on('submit', '#js-login-form', (e) => {
    e.preventDefault();
    $.ajax({
      url: '/api/auth/login',
      data: {
        username: $('#input-username').val(),
        password: $('#input-password').val()
      },
      type: 'POST',
      success: (res) => {
        //this saves the authToken that comes from response to the Token variable
        localStorage.setItem('Token', res.authToken);

        $('.js-logout').removeClass('hide');
        $('.js-coupon').removeClass('hide');

        window.location.href = '/dashboard';
      },
      error: (res) => {
        renderErrorMessage(res);
      }
    });
  });
}

function renderNavigationLinksListener() {
  var token = localStorage.getItem('Token');
  if(!token) {
    //hide coupon link
    $('.js-signup').removeClass('hide');
    $('.js-login').removeClass('hide');
  }
  else {
    //show coupon link
    $('.js-logout').removeClass('hide');
    $('.js-coupon').removeClass('hide');
    $('.js-signup').addClass('hide');
    $('.js-login').addClass('hide');
  }
}

function renderSuccessMessage(res){
  let successfulMsg = `<div class="alert alert-success fade show text-center" role="alert">
                        You've been successfully registered ${res.username}. You can now <a href="/login">login</a>.
                       </div>`;

  return $('#js-msg-output').html(successfulMsg);
}

function renderErrorMessage(res){
  let errorMsg = '';

  if(res.statusText === 'Unauthorized') {
    console.log(res.statusText);
    errorMsg = `<div class="alert alert-danger fade show text-center" role="alert">
                  ${res.statusText}. Please Login.
                </div>`;
  } else {
      errorMsg = `<div class="alert alert-danger fade show text-center" role="alert">
                    ${res.responseJSON.message}
                  </div>`;
  }

  return $('#js-msg-output').html(errorMsg);
}

function clickonMapleLogo() {
  //if signed on then redirect to dashboard if not redirect to /
  $('.navbar-brand').on('click', (e) => {
    e.preventDefault();
    var token = localStorage.getItem('Token');

    if(!token) {
        window.location.href = '/';
    }
    else {
      window.location.href = '/dashboard';
    }
  });
}

function initApp() {
  clickonMapleLogo();
  renderNavigationLinksListener();
  signupBtnHandler();
  loginBtnHandler();
  signupHandler();
  loginHandler();
  logoutHandler();
}

$(initApp);
