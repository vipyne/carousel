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

var slider = {
  numOfImages: 4,
  imageWidth: 150,
  wrapperHeight: 150,
  rightClicks: 0,
  leftClicks: 0,
  totalImages: 0,
  sWidth: 0,
  loop: null,
  loopCopy: null
}

function imageSliderInit(){
  processImages()
  setArrowPosition()
  slider.totalImages = $('.slider')[0].children.length
  $('.wrapper').css('width', slider.imageWidth * slider.numOfImages)
  $('.wrapper').css('height', slider.wrapperHeight)
  $('.slider').css('width', slider.imageWidth * slider.totalImages)
  $('.arrow').css('display', 'inherit')
  slider.sWidth = slider.numOfImages * slider.imageWidth
  slider.loop = $('.slider').clone()
  slider.loopCopy = $('.slider').clone()
}

function processImages(){
  var originalWidth, imageHeight, newImageHeight
  $.each($('.image-to-slide'), function(index, image){
    originalWidth = image.offsetWidth
    var getHeight = slider.imageWidth / originalWidth
    imageHeight = image.offsetHeight
    newImageHeight = imageHeight * getHeight
    image.style.height = newImageHeight + 'px'
  })
}

function setArrowPosition(){
  var arrowPosition = (slider.wrapperHeight / 2) - 15 // arrows are 30px tall
  $('#triangle-right').css('margin-bottom', arrowPosition)
  $('#triangle-left').css('margin-bottom', arrowPosition)
}



// image slider animation ///
/////////////////////////////
/////////////////////////////

function rightSlide(){
  var marginLeft = Math.abs(numFix($('.slider').css('margin-left')))
  var sliderOriginalWidth = slider.totalImages * slider.imageWidth
  if((slider.rightClicks == 0 && slider.leftClicks == 0) ||
    (slider.rightClicks != 0 && differenceInClicks() % slider.totalImages == 0) ||
    differenceInClicks() == 0 || marginLeft <= slider.sWidth){
    reUp()
    $('.slider').css('width', $('.slider').children().length * slider.imageWidth)
    var ml = $('.slider').css('margin-left')
    var basicMove = numFix(ml)
    $('.slider').css('margin-left', -(basicMove + sliderOriginalWidth) )
  }
  animateRight()
}

function leftSlide(){
  var totalWidth = numFix($('.slider').css('width'))
  var marginLeft = Math.abs(numFix($('.slider').css('margin-left')))
  if(totalWidth < marginLeft + slider.sWidth * 2){
    reUp()
    $('.slider').css('width', $('.slider').children().length * slider.imageWidth)
  }
  animateLeft()
}

function animateRight(){
  $('.slider').animate({
    marginLeft: '+=' + slider.imageWidth * slider.numOfImages + 'px'
  }, 'slow')
}

function animateLeft(){
  $('.slider').animate({
    marginLeft: '-=' + slider.imageWidth * slider.numOfImages + 'px'
  }, 'slow')
}



// image slider util ////////
/////////////////////////////
/////////////////////////////

function numFix(width){
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
  $.each(loop.children(), function(index, image){
    $('.slider').append(image)
  })
}

function makeMoreImages(){
  slider.loop = slider.loopCopy.clone()
}

function reUp(){
  getMoreImages(slider.loop)
  makeMoreImages(slider.loop)
}

function getWidth(){
  var $width = $('.slider').css('width')
  return numFix($width)
}

function enoughImagesMoved(){
  var imagesMoved = (Math.abs(slider.leftClicks - slider.rightClicks) + 1) * slider.numOfImages + slider.numOfImages
  return imagesMoved % slider.totalImages
}

function differenceInClicks(){
  return slider.rightClicks - slider.leftClicks
}



// clicks ///////////////////
/////////////////////////////
/////////////////////////////

$('#triangle-right').on('click', function(){
  leftSlide()
  slider.leftClicks += 1
})

$('#triangle-left').on('click', function(){
  rightSlide()
  slider.rightClicks += 1
})


/////////////////////////////
})