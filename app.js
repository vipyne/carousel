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
  .done(function(data){
    getImages(data)
    imageSliderInit()
    $('a').imageLightbox()
  })
  .fail(function(msg){
    console.log('error', msg.responseText)
  })



// process ajax /////////////
/////////////////////////////
/////////////////////////////

function getCustomerName(data){
  var customer = data.data._embedded.customer
  var customerName = customer.name.toUpperCase()
  $('.customer').append(customerName + '\'s recent media feed'.toUpperCase() )
}

function getImages(data){
  if(data.data._embedded.media != undefined){
    var olapicImages = data.data._embedded.media
    getCustomerName(data)
  }else{
    var olapicImages = data.data._embedded
  }
  $.each(olapicImages, function(index, object){
    if(object !== undefined){
      var thumb = object.images.thumbnail
      var full = object.images.normal
      var thumbDOMString = "<img class='image-to-slide' src=" + thumb + ">"
      var fullDOMString = "<li class='lists'><a href=" + full + ">" + thumbDOMString + "</a></li>"
      $('.slider').append(fullDOMString)
    }
  })
}



// image slider init ////////
/////////////////////////////
/////////////////////////////

var allImages = {
  numberOfCarouselImages: 7,
  conformImageWidth: 150,
  wrapperHeight: 150,
  rightSlideClicks: 0,
  leftSlideClicks: 0,
  numberOfImages: 0
}

function imageSliderInit(){
  processImages()
  setArrowPosition()
  allImages.numberOfImages = $('.slider')[0].children.length
  $('.wrapper').css('width', allImages.conformImageWidth * allImages.numberOfCarouselImages)
  $('.wrapper').css('height', allImages.wrapperHeight)
  $('.slider').css('width', allImages.conformImageWidth * allImages.numberOfImages)
}

function processImages(){
  var imageWidth, imageHeight, newImageHeight
  $.each($('.image-to-slide'), function(index, value){
    imageWidth = $('.image-to-slide')[index].offsetWidth
    var getHeight = allImages.conformImageWidth/imageWidth
    imageHeight = $('.image-to-slide')[index].offsetHeight
    newImageHeight = imageHeight * getHeight
    $('.image-to-slide')[index].style.height = newImageHeight + 'px'
  })
}

function setArrowPosition(){
  var arrowPosition = (allImages.wrapperHeight / 2) - 15 // arrows are 30px tall
  $('#triangle-right').css('margin-bottom', arrowPosition)
  $('#triangle-left').css('margin-bottom', arrowPosition)
}



// image slider animation ///
/////////////////////////////
/////////////////////////////

function rightSlide(){
  // console.log('right', allImages.rightSlideClicks)
  var imagesMoved = (allImages.rightSlideClicks - allImages.leftSlideClicks + 1) * allImages.numberOfCarouselImages
  var differenceInClicks = allImages.rightSlideClicks - allImages.leftSlideClicks
  // console.log('differenceInClicks', differenceInClicks)
  // if(differenceInClicks == -1)
  // console.log('imagesMoved', imagesMoved)
  if((allImages.rightSlideClicks == 0 && allImages.leftSlideClicks == 0) ||
    (allImages.rightSlideClicks != 0 && differenceInClicks % allImages.numberOfImages == 0) ||
    differenceInClicks == 0){
    changeSliderWidth(makeLoop())
  console.log('here')
    if(differenceInClicks == 0){
      console.log('here 2222222')
    $('.slider').css('margin-left', -makeLoop())
      // changeSliderWidth(makeLoop())
    }
    // var $loop = $('.slider').clone()
    // var $width = $('.slider').css('width')
    // var w = widthFix($width)
    // changeSliderWidth()
    // getMoreImages($loop)
    $('.slider').css('margin-left', -makeLoop())

  }else if (imagesMoved > allImages.numberOfImages) {
    // console.log('numberOfImages', allImages.numberOfImages)
    var difference = imagesMoved % allImages.numberOfImages
    var offSetNegative = difference * allImages.conformImageWidth
    var offSetPositive = (allImages.numberOfCarouselImages * allImages.conformImageWidth) - offSetNegative
    // console.log('difference', difference)
    // console.log('offSetNegative', offSetNegative)
    // console.log('offSetPositive', offSetPositive)
    changeSliderWidth(makeLoop())
    // var $loop = $('.slider').clone()
    // var $width = $('.slider').css('width')
    // var w = widthFix($width)
    // getMoreImages($loop)
    $('.slider').css('margin-left', (-makeLoop() - offSetPositive))
  }
  animateRight()
}

function leftSlide(){
  // console.log('pooposifuasoid')
  var imagesMoved = (allImages.leftSlideClicks - allImages.rightSlideClicks + 1) * allImages.numberOfCarouselImages + allImages.numberOfCarouselImages
  if(allImages.leftSlideClicks != 0 && (imagesMoved % allImages.numberOfImages - allImages.numberOfCarouselImages == 0) ||
    imagesMoved > allImages.numberOfImages){
    changeSliderWidth(makeLoop())
  }
  animateLeft()
}

function animateRight(){
  $('.slider').animate({
    marginLeft: '+=' + allImages.conformImageWidth * allImages.numberOfCarouselImages + 'px'
  }, 'slow')
}

function animateLeft(){
  $('.slider').animate({
    marginLeft: '-=' + allImages.conformImageWidth * allImages.numberOfCarouselImages + 'px'
  }, 'slow')
}



// image slider util ////////
/////////////////////////////
/////////////////////////////

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

function getMoreImages(loop){
  $.each(loop.children(), function(index, pic){
    $('.slider').append(pic)
  })
}

function changeSliderWidth(w){
  $('.slider').css('width', w + (allImages.conformImageWidth * allImages.numberOfImages) )
}

function makeLoop(){
  var $width = $('.slider').css('width')
  var w = widthFix($width)
  changeSliderWidth()
  var $loop = $('.slider').clone()
  getMoreImages($loop)
  return w
}

// clicks ///////////////////
/////////////////////////////
/////////////////////////////

$('#triangle-right').on('click', function(){
  leftSlide()
  allImages.leftSlideClicks += 1
})

$('#triangle-left').on('click', function(){
  rightSlide()
  allImages.rightSlideClicks += 1
})

/////////////////////////////
})