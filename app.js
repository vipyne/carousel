$(document).ready(function(){
/////////////////////////////

var $slider = $('.slider')

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



// ajax api call ////////////
/////////////////////////////
/////////////////////////////

var api = (function(){

  var apiKey = '0a40a13fd9d531110b4d6515ef0d6c529acdb59e81194132356a1b8903790c18'
  var tokenQuery = '?auth_token='
  var apiCall = 'https://photorankapi-a.akamaihd.net/customers/215757/media/recent'
  var url = apiCall + tokenQuery + apiKey

  $.ajaxSetup({
    headers: { 'Accept': 'application/vnd.olapic.v2.1+json' }
  })

  var caller = function(url, action){
    $.ajax({
      type: 'get',
      url: url,
      dataType: 'json',
      success: function(data){
        action(data)
      },
      fail: function(message){
        console.log('error', message.responseText)
      }
    })
  }

  return {
    url: url,
    caller: caller
  }

})()



// process ajax /////////////
/////////////////////////////
/////////////////////////////

var processAjax = (function(){

  var init = function(data){
    getImages(data)
    getCustomerName(data)
    sliderInit.set()
    getNextUrl(data)
    $('a').imageLightbox() // vendor
    // this breaks things...
    // api.caller(slider.next, processAjax.getNewImages)
    // but want to add more images a click before they are needed,
    // so prolly have to toy with the logic below..
  }

  var getCustomerName = function(data){
    var customer = data.data._embedded.customer
    if(customer != undefined){
      var customerName = customer.name.toUpperCase()
    }
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
        var thumb, full, img, a, li
        thumb = object.images.thumbnail
        full = object.images.normal
        img = document.createElement('img')
        img.src = thumb
        img.className = 'image-to-slide'
        a = document.createElement('a')
        a.href = full
        a.appendChild(img)
        li = document.createElement('li')
        li.className = 'lists'
        li.appendChild(a)
        $('.slider').append(li)
      }
      $slider.css('width', $slider.children().length * slider.imageWidth)
    })
  }

  var getNewImages = function(data){
    getImages(data)
    getNextUrl(data)
  }

  var getNextUrl = function(data){
    var link = data.data._links.next.href
    slider.next = api.url + '&next_id=' + link.match(/next_id=(.*)/)[1]
  }

  return {
    init: init,
    getNextUrl: getNextUrl,
    getNewImages: getNewImages
  }

})()



// image slider init ////////
/////////////////////////////
/////////////////////////////

var sliderInit = (function(){

  var set = function(){
    processImages() // moot for now cause of thumbnails in api, but useful if api changes
    setArrowPosition()
    slider.totalImages = $slider[0].children.length
    $('.wrapper').css('width', slider.imageWidth * slider.numOfImages)
    $('.wrapper').css('height', slider.wrapperHeight)
    $slider.css('width', slider.imageWidth * slider.totalImages)
    $('.arrow').css('display', 'inherit')
    slider.sWidth = slider.numOfImages * slider.imageWidth
    slider.loop = $slider.clone()
    slider.loopCopy = $slider.clone()
  }

  var processImages = function(){
    var originalWidth, imageHeight, newImageHeight
    $.each($('.image-to-slide'), function(index, image){
      originalWidth = image.offsetWidth
      var getHeight = slider.imageWidth / originalWidth
      imageHeight = image.offsetHeight
      newImageHeight = imageHeight * getHeight
      image.style.height = newImageHeight + 'px'
    })
  }

  var setArrowPosition = function(){
    var arrowPosition = (slider.wrapperHeight / 2) - 15 // arrows are 30px tall
    $('#triangle-right').css('margin-bottom', arrowPosition)
    $('#triangle-left').css('margin-bottom', arrowPosition)
  }

  return {
    set: set
  }

})()



// image slider animation ///
/////////////////////////////
/////////////////////////////
var sliderAnimate = (function(){

  var rightSlide = function(){
    var marginLeft = Math.abs(utility.numFix($slider.css('margin-left')))
    var sliderOriginalWidth = slider.totalImages * slider.imageWidth
    if((slider.rightClicks == 0 && slider.leftClicks == 0) ||
      (slider.rightClicks != 0 && utility.differenceInClicks() % slider.totalImages == 0) ||
      utility.differenceInClicks() == 0 || marginLeft <= slider.sWidth){
      utility.reUpRight()
      $slider.css('width', $slider.children().length * slider.imageWidth)
      var ml = $slider.css('margin-left')
      var basicMove = utility.numFix(ml)
      $slider.css('margin-left', -(basicMove + sliderOriginalWidth) )
    }
    animateRight()
  }

  var leftSlide = function(){
    var totalWidth = utility.numFix($slider.css('width'))
    var marginLeft = Math.abs(utility.numFix($slider.css('margin-left')))
    if(totalWidth - slider.sWidth < marginLeft + slider.sWidth * 2){
      setTimeout(function(){
        utility.reUpLeft()
      }, 300)
    }
    animateLeft()
  }

  var animateRight = function(){
    $slider.animate({
      marginLeft: '+=' + slider.imageWidth * slider.numOfImages + 'px'
    }, 'slow')
    setTimeout(function(){
      slider.onTheMove = false
    }, 750)
  }

  var animateLeft = function(){
    $slider.animate({
      marginLeft: '-=' + slider.imageWidth * slider.numOfImages + 'px'
    }, 'slow')
    setTimeout(function(){
      slider.onTheMove = false
    }, 750)
  }

  var MoveLeft = function(){
    if(slider.onTheMove){
      setTimeout(function(){
        return
      }, 300)
    }else{
      slider.onTheMove = true
      leftSlide()
      slider.leftClicks += 1
    }
  }

  var MoveRight = function(){
    if(slider.onTheMove){
      setTimeout(function(){
        return
      }, 300)
    }else{
      slider.onTheMove = true
      rightSlide()
      slider.rightClicks += 1
    }
  }

  return {
    MoveLeft: MoveLeft,
    MoveRight: MoveRight
  }

})()



// image slider util ////////
/////////////////////////////
/////////////////////////////
var utility = (function(){

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
      $slider.append(image)
    })
  }

  var makeMoreImages = function(){
    slider.loop = slider.loopCopy.clone()
  }

  var reUpLeft = function(){
    api.caller(slider.next, processAjax.getNewImages)
  }

  var reUpRight = function(){
    getMoreImages(slider.loop)
    makeMoreImages()
  }

  var getWidth = function(){
    var $width = $slider.css('width')
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



// brains ///////////////////
/////////////////////////////
/////////////////////////////

api.caller(api.url, processAjax.init) // initial call

$('#triangle-right').on('click', function(){
  sliderAnimate.MoveLeft()
})

$('#triangle-left').on('click', function(){
  sliderAnimate.MoveRight()
})

/////////////////////////////
})