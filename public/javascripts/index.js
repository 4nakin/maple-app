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
    console.log("signup form submitted");

    $.ajax({
      url: '/api/users',
      type: 'POST',
      data: {
        firstName: $('#input-firstName').val(),
        lastName: $('#input-lastName').val(),
        username: $('#input-username').val(),
        password: $('#input-password').val()
      },
      success: function(res) {
        //display message to user stating account has been successfully created
        $('#input-firstName').val('');
        $('#input-lastName').val('');
        $('#input-username').val('');
        $('#input-password').val('');

        // $('#js-msg-output').html(`<div class="alert alert-success alert-dismissible fade show text-center" role="alert">Your Account has been registered!
        //   <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        //     <span aria-hidden="true">&times;</span>
        //   </button>
        //   </div`);

        window.location.href = '/login';
      },
      error: (err) => {
        $('#js-msg-output').html(`<div class="alert alert-danger text-center" role="alert">This username is taken or the password is invalid</div>`);
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

      // $('#js-msg-output').show();
      //
      // $('#js-msg-output').html(`<div class="alert alert-success alert-dismissible fade show text-center" role="alert">You have successfully Logged out!
      //   <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      //     <span aria-hidden="true">&times;</span>
      //   </button>
      //   </div`);

      window.location.href = '/';

      // setTimeout(() => {
      //   $('#js-msg-output').hide();
      // }, 1000);
    }
    else{
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
      success: function(res) {
        //this saves the authToken that comes from response to the Token variable
        localStorage.setItem('Token', res.authToken);
        console.log('What is res.authToken Value?' + res.authToken);

        $('.js-logout').removeClass('hide');
        $('.js-coupon').removeClass('hide');

        window.location.href = '/dashboard';
      },
      error: (err) => {
        console.log(err);
        // $('#js-msg-output').html(`<div class="alert alert-danger alert-dismissible fade show text-center" role="alert">Something is wrong!
        //   <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        //     <span aria-hidden="true">&times;</span>
        //   </button>
        //   </div`);
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

function initApp() {
  signupBtnHandler();
  loginBtnHandler();
  signupHandler();
  loginHandler();
  renderNavigationLinksListener();
  logoutHandler();
}


$(initApp);
