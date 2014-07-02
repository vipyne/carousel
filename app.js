$(document).ready(function(){
/////////////////////////////


// ajax api call ////////////
/////////////////////////////
/////////////////////////////

var apiKey = '0a40a13fd9d531110b4d6515ef0d6c529acdb59e81194132356a1b8903790c18'
var tokenQuery = '?auth_token='
var apiCall = 'https://photorankapi-a.akamaihd.net/customers/215757/media/recent'
var url = apiCall + tokenQuery + apiKey

$.ajaxSetup({
  headers: { 'Accept': 'application/vnd.olapic.v2.1+json' }
})

$.ajax({
  type: 'get',
  url: url,
  dataType: 'json'
})
  .done(function (data){
    getCustomerName(data)
    var olapicImages = data.data._embedded.media
    $.each(olapicImages, function(index, object){
      if(object !== undefined){
        $('.slider').append("<li class='lists'><img class='image-to-slide' src=" + object.images.thumbnail + "></li>")
      }
    })
    imageSliderInit()
  })
  .error(function(msg){
    console.log('error', msg.responseText)
  })




function getCustomerName(data){
  var customer = data.data._embedded.customer
  var customerName = customer.name.toUpperCase()
  $('.customer').append(customerName + '\'s recent media feed'.toUpperCase() )
}


// image slider /////////////
/////////////////////////////
/////////////////////////////

var allImages = {
  numberOfCarouselImages: 2,
  conformImageWidth: 150,
  wrapperHeight: 150,
  rightSlideClicks: 0,
  leftSlideClicks: 0,
  numberOfImages: 0
}

function imageSliderInit(){
  var imageWidth, imageHeight, newImageHeight, arrowPosition

  $.each($('.image-to-slide'), function(index, value){
    imageWidth = $('.image-to-slide')[index].offsetWidth
    var getHeight = allImages.conformImageWidth/imageWidth
    imageHeight = $('.image-to-slide')[index].offsetHeight
    newImageHeight = imageHeight * getHeight
    $('.image-to-slide')[index].style.height = newImageHeight + 'px'
  })

  allImages.numberOfImages = $('.slider')[0].children.length
  $('.wrapper').css('width', allImages.conformImageWidth * allImages.numberOfCarouselImages)
  $('.wrapper').css('height', allImages.wrapperHeight)
  $('.slider').css('width', allImages.conformImageWidth * allImages.numberOfImages)
  arrowPosition = (allImages.wrapperHeight / 2) - 15 // arrows are 30px tall
  $('#triangle-right').css('margin-bottom', arrowPosition)
  $('#triangle-left').css('margin-bottom', arrowPosition)
}

function rightSlide(){
  var differenceInClicks = allImages.rightSlideClicks - allImages.leftSlideClicks
  if((allImages.rightSlideClicks == 0 && allImages.leftSlideClicks == 0) ||
    (allImages.rightSlideClicks != 0 && differenceInClicks % allImages.numberOfImages == 0) ||
    differenceInClicks == 0){
    var $loop = $('.slider').clone()
    var $width = $('.slider').css('width')
    var w = widthFix($width)
    $('.slider').css('width', w + (allImages.conformImageWidth * allImages.numberOfImages) )
    $.each($loop.children(), function(index, pic){
      $('.slider').append(pic)
    })
    $('.slider').css('margin-left', -w)
  }
  $('.slider').animate({
    marginLeft: '+=' + allImages.conformImageWidth + 'px'
  }, 'slow')
}

function leftSlide(){
  if(allImages.leftSlideClicks % allImages.numberOfImages - allImages.numberOfCarouselImages == 0){
    var $loop = $('.slider').clone()
    var $width = $('.slider').css('width')
    var w = widthFix($width)
    $('.slider').css('width', w + (allImages.conformImageWidth * allImages.numberOfImages) )
    $.each($loop.children(), function(index, pic){
      $('.slider').append(pic)
    })
  }
  $('.slider').animate({
    marginLeft: '-=' + allImages.conformImageWidth + 'px'
  }, 'slow')
}

function widthFix(width){
  num = []
  for ( var i = 0; i < width.length; i++ ){
    var n = Number(width[i])
    if(isNaN(n) != true){
      num.push(n)
    }
  }
  return Number(num.join(''))
}



// controllers //////////////
/////////////////////////////
/////////////////////////////

$('#triangle-right').on('click', function(){
  rightSlide()
  allImages.rightSlideClicks += 1
})

$('#triangle-left').on('click', function(){
  leftSlide()
  allImages.leftSlideClicks += 1
})

/////////////////////////////
})