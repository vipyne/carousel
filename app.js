$(document).ready(function(){
/////////////////////////////



// ajax api call ////////////

var apiKey = '0a40a13fd9d531110b4d6515ef0d6c529acdb59e81194132356a1b8903790c18'
var tokenQuery = '?auth_token='
var apiCall = 'https://photorankapi-a.akamaihd.net/customers/215757/media/recent'

var url = apiCall + tokenQuery + apiKey

$.ajaxSetup({
  headers: { 'Accept': 'application/vnd.olapic.v2.1+json'}
})

$.ajax({
  type: 'get',
  url: url,
  // headers: {
  //   Accept: {
  //     json: 'application/json'
  //   }
  // },
  // headers: {"Accept":"application/json"},
  // contentType: 'application/json; charset=utf-8',
  // contentType: 'application/vnd.olapic.v2.1+json',
  // contentType: 'application/json',
  dataType: 'json'
})
  .done(function (data){
    console.log('media', data.data._embedded.media)
    // debugger
    // $.each(data.data._embedded, function(key,value){
      // console.log('_embedded key', key)
      // console.log('_embedded value', value)
      var poop = data.data._embedded.media
      console.log('poop', poop)
      debugger
      $.each(poop, function(index, object){

        console.log('index',index)
        console.log(object[index])
        if(object[index] !== undefined){
        $('.slider').append("<li class='lists'><img class='image-to-slide' src=" + object.images.normal + "></li>")
        // console.log('v.images.normal', v.images.normal)
        }
      })
    // })

  })
  .error(function(msg){
    console.log('error', msg)
  })


// image slider //////////////

var allImages = {
  conformImageWidth: 200,
  wrapperHeight: 1000000, // just a starting value
  rightSlideClicks: 0,
  leftSlideClicks: 0,
  lists: $('.slider')[0].children,
  numberOfImages: $('.slider')[0].children.length,
  images: $('.image-to-slide')
}

function imageSliderInit(){
  var imageWidth, imageHeight, newImageHeight, arrowPosition

  $.each(allImages.images, function(index, value){
    imageWidth = allImages.images[index].offsetWidth
    var getHeight = allImages.conformImageWidth/imageWidth
    imageHeight = allImages.images[index].offsetHeight
    newImageHeight = imageHeight * getHeight
    allImages.images[index].style.height = newImageHeight + 'px'
    if(newImageHeight < allImages.wrapperHeight){
      allImages.wrapperHeight = newImageHeight
    }
  })

  $('.wrapper').css('width', allImages.conformImageWidth * 3)
  $('.wrapper').css('height', allImages.wrapperHeight)
  $('.slider').css('width', allImages.conformImageWidth * allImages.numberOfImages)
  arrowPosition = (allImages.wrapperHeight / 2) - 15 // arrows are 30px tall
  $('#triangle-right').css('margin-bottom', arrowPosition)
  $('#triangle-left').css('margin-bottom', arrowPosition)
}

function rightSlide(){
  if((allImages.rightSlideClicks == 0 && allImages.leftSlideClicks == 0) || allImages.rightSlideClicks % allImages.numberOfImages == 0){
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
  if(allImages.leftSlideClicks % allImages.numberOfImages - 3 == 0){
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


// controllers and init //////

$('#triangle-right').on('click', function(){
  rightSlide()
  allImages.rightSlideClicks += 1
  console.log('rightSlideClicks',allImages.rightSlideClicks)
})

$('#triangle-left').on('click', function(){
  leftSlide()
  allImages.leftSlideClicks += 1
  console.log('leftSlideClicks',allImages.leftSlideClicks)
})

imageSliderInit()

/////////////////////////////
})