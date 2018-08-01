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
        //window.location.href = '/login';
      },
      error: (res) => {
        renderErrorMessage(res);
      }
    });
  });
}

function logoutHandler() {
  $('.js-logout').on('click', (e) => {
    var token = localStorage.getItem('Token');
    if(token) {
      localStorage.removeItem('Token');
      console.log('you are logged out!');
      window.location.href = '/';
    }
    else {
      console.log('there is no token. you you are not signed in');
    }
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
        console.log('What is res.authToken Value?' + res.authToken);

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
    console.log('oh no, There\'s no token');
    //hide coupon link
    $('.js-signup').removeClass('hide');
    $('.js-login').removeClass('hide');
  }
  else{
    console.log('you are still signed in');
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

function initApp() {
  signupBtnHandler();
  loginBtnHandler();
  signupHandler();
  loginHandler();
  renderNavigationLinksListener();
  logoutHandler();
}

$(initApp);
