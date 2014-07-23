$(document).ready(function(){
/////////////////////////////


// ajax api calls ///////////
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
    processAjax.getImages(data)
    processAjax.getCustomerName(data)
    imageSliderInit()
    processAjax.getNextUrl(data)
    $('a').imageLightbox()
  })
  .fail(function(msg){
    console.log('error', msg.responseText)
  })




// process ajax /////////////
/////////////////////////////
/////////////////////////////
var processAjax = (function(){

  var getCustomerName = function(data){
    var customer = data.data._embedded.customer
    var customerName = customer.name.toUpperCase()
    $('.customer').append(customerName + '\'s recent media feed'.toUpperCase() )
  }

  var getImages = function(data){
    if(data.data._embedded.media != undefined){
      var olapicImages = data.data._embedded.media
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
      $('.slider').css('width', $('.slider').children().length * slider.imageWidth)
    })
  }

  var getNextUrl = function(data){
    var link = data.data._links.next.href
    slider.next = '&next_id=' + link.match(/next_id=(.*)/)[1]
  }

  var getNewImages = function(){
    $.ajax({
    type: 'get',
    url: url + slider.next,
    dataType: 'json'
  })
    .done(function(data){
      processAjax.getImages(data)
      processAjax.getNextUrl(data)
      $('a').imageLightbox()
    })
    .fail(function(msg){
      console.log('error', msg.responseText)
    })
  }

  return {
    getCustomerName: getCustomerName,
    getImages: getImages,
    getNextUrl: getNextUrl,
    getNewImages: getNewImages
  }

})()


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
  loopCopy: null,
  next: '',
  onTheMove: false
}

function imageSliderInit(){
  processImages() // moot for now cause of thumbnails in api, but useful if api changes
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
var sliderAnimate = (function(){

  var rightSlide = function(){`
    var marginLeft = Math.abs(sliderUtilities.numFix($('.slider').css('margin-left')))
    var sliderOriginalWidth = slider.totalImages * slider.imageWidth
    if((slider.rightClicks == 0 && slider.leftClicks == 0) ||
      (slider.rightClicks != 0 && differenceInClicks() % slider.totalImages == 0) ||
      differenceInClicks() == 0 || marginLeft <= slider.sWidth){
      sliderUtilities.reUpRight()
      $('.slider').css('width', $('.slider').children().length * slider.imageWidth)
      var ml = $('.slider').css('margin-left')
      var basicMove = sliderUtilities.numFix(ml)
      $('.slider').css('margin-left', -(basicMove + sliderOriginalWidth) )
    }
    this.animateRight()
  }

  var leftSlide = function(){
    var totalWidth =sliderUtilities.numFix($('.slider').css('width'))
    var marginLeft = Math.abs(sliderUtilities.numFix($('.slider').css('margin-left')))
    if(totalWidth < marginLeft + slider.sWidth * 2){
      sliderUtilities.reUpLeft()
    }
    this.animateLeft()
  }

  var animateRight = function(){
    $('.slider').animate({
      marginLeft: '+=' + slider.imageWidth * slider.numOfImages + 'px'
    }, 'slow')
    setTimeout(function(){
      slider.onTheMove = false
    }, 750)
  }

  var animateLeft = function(){
    $('.slider').animate({
      marginLeft: '-=' + slider.imageWidth * slider.numOfImages + 'px'
    }, 'slow')
    setTimeout(function(){
      slider.onTheMove = false
    }, 750)
  }

  return {
    rightSlide: rightSlide,
    leftSlide: leftSlide,
    animateRight: animateRight,
    animateLeft: animateLeft
  }

})()


// image slider util ////////
/////////////////////////////
/////////////////////////////
var sliderUtilities = (function(){

  var numFix = function(width){
    num = []
    for ( var i = 0; i < width.length; i++ ){
      var n = Number(width[i])
      if(isNaN(n) != true){
        num.push(n)
      }
    }
    return Number(num.join(''))
  }

  var getMoreImages = function(loop){
    $.each(loop.children(), function(index, image){
      $('.slider').append(image)
    })
  }

  var makeMoreImages = function(){
    slider.loop = slider.loopCopy.clone()
  }

  var reUpLeft = function(){
    processAjax.getNewImages()
  }

  var reUpRight = function(){
    this.getMoreImages(slider.loop)
    this.makeMoreImages()
  }

  var getWidth = function(){
    var $width = $('.slider').css('width')
    return this.numFix($width)
  }

  var enoughImagesMoved = function(){
    var imagesMoved = (Math.abs(slider.leftClicks - slider.rightClicks) + 1) * slider.numOfImages + slider.numOfImages
    return imagesMoved % slider.totalImages
  }

  var differenceInClicks = function(){
    return slider.rightClicks - slider.leftClicks
  }

  return {
    numFix: numFix,
    getMoreImages: getMoreImages,
    makeMoreImages: makeMoreImages,
    reUpLeft: reUpLeft,
    reUpRight: reUpRight,
    getWidth: getWidth,
    enoughImagesMoved: enoughImagesMoved,
    differenceInClicks: differenceInClicks
  }

})()

// clicks ///////////////////
/////////////////////////////
/////////////////////////////

$('#triangle-right').on('click', function(){
  if(slider.onTheMove){
    return
  }else{
    slider.onTheMove = true
    sliderAnimate.leftSlide()
    slider.leftClicks += 1
  }
})

$('#triangle-left').on('click', function(){
  if(slider.onTheMove){
    return
  }else{
    slider.onTheMove = true
    sliderAnimate.rightSlide()
    slider.rightClicks += 1
  }
})


/////////////////////////////
})