'use strict';

//ajax call

//render results

function getCompanyLogoImageDataFromApi(searchTerm) {
  const companyDomain = "";
  $.ajax({
    url: `https://logo.clearbit.com/${searchTerm}.com`,
    type: 'GET',
    dataType: 'json',
    success: (res) => {
      console.log(res);
    }
  });
}

//need to get the data(merchantName) from form
//then call getCompanyLogoImageDataFromApi with searchTerm(merchantName)
//place the icon on the DOM.
