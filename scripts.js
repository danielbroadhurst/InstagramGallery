const PAGE_TOKEN = "EAACNbZCLb8Y0BAFbmmnPqnV8aDG7LgcIYY96P14H6eUuG6FruZB7bO6Q0zTrYApfbaRJf5DLN1VPmvENa4IwLmfBU5ZBKJzRZA65DdUFdzRnDco6vftMezij2NY2EkyFX0zcHlXiZCb47RqaLCurT16emH7AErJWHDO7ydTMhJpEJQJKiLnZAk";

let fbMediaNodeUrl = `https://graph.facebook.com/v7.0/17841408168194339?fields=media&access_token=${PAGE_TOKEN}`
let fbMediaDataUrl = `https://graph.facebook.com/v7.0/{{media}}?fields=children%7Bmedia_url%7D,media_url,timestamp,id,username,media_type,caption,like_count,comments_count&access_token=${PAGE_TOKEN}`

let app = document.getElementById('app');

let mediaNodes = [];
let usersImages = [];
let slideIndex = [];
let slideId = []

function getMediaNodes() {
  fetch(fbMediaNodeUrl)
    .then(results => {
      return results.json()
    })
    .then(response => {
      mediaNodes = response.media.data;
      if (mediaNodes.length > 0) {
        getMediaData();
      }
    })
}

async function getMediaData() {
  const promises = mediaNodes.map(async node => {
    let url = fbMediaDataUrl.replace('{{media}}', node.id);
    const mediaData = await storeMediaData(url)
    return mediaData
  })
  usersImages = await Promise.all(promises);
  for (const image of usersImages) {
    if (image.media_type === "VIDEO") {
      addVideoToScreen(image)
    } else if (image.media_type === "CAROUSEL_ALBUM") {      
      addCarouselImageToScreen(image)
    } else {
      addImageToScreen(image);
    }
  }
}

async function storeMediaData(url) {
  const results = await fetch(url);
  const response = await results.json();
  return response;
}

function addImageToScreen(image) {
  let imageOptions = {
    type: 'div',
    attributes: {
      id: image.id,
      class: 'imageDiv'
    },
    children: [
      createMediaEl('img', 'image', image.media_url),
      createCaption(image.caption, image.like_count, image.comments_count)
    ]
  }
  app.appendChild(createDomElements(imageOptions));
}

function addCarouselImageToScreen(image) {    
  let slideArrayId = slideIndex.length;
  let carouselClass = image.id;
  let carouselOptions = {
    type: 'div',
    attributes: {
      id: image.id,
      class: 'carousel'
    },
    children: [
      ...createImageArray(image.children.data, carouselClass),
      createSlideDiv(slideArrayId),
      createCaption(image.caption, image.like_count, image.comments_count)
    ]
  }  
  slideId.push(carouselClass);
  slideIndex.push(1);
  showSlides(1, slideArrayId);
  app.appendChild(createDomElements(carouselOptions));
}

function addVideoToScreen(image) {
  let videoOptions = {
    type: 'div',
    attributes: {
      id: image.id,
      class: 'videoDiv'
    },
    children: [
      createMediaEl('video', '', image.media_url),
      createCaption(image.caption, image.like_count, image.comments_count)
    ]
  }
  app.appendChild(createDomElements(videoOptions));
}

getMediaNodes()

// Helper Functions
function createDomElements(options) {
  console.log(options);
  let element = document.createElement(options.type)
  for (const attr in options.attributes) {
    if (attr === 'text') {
      element.innerHTML = options.attributes[attr];
    } else {
      element.setAttribute(attr, options.attributes[attr])
    }
  }
  if (options.children) {
    options.children.forEach(child => {
      element.appendChild(createDomElements(child))
    });
  }
  return element;
}

function createMediaEl(type, classStr, imageUrl) {
  return {
    type: type,
    attributes: {
      class: classStr,
      src: imageUrl,
      controls: type == 'video' ? true : false
    }
  }
}

function createImageArray(images, carouselClass) {
  let imagesArray = [];
  images.forEach(child => {
    imagesArray.push(createMediaEl('img', 'child ' + carouselClass, child.media_url));
  })
  return imagesArray;
}

function createCaption(caption, likes, comments) {
  let captionDiv = {
    type: 'div',
    attributes: {
      class: 'captionDiv',
    },
    children: [{
      type: 'div',
      attributes: {
        class: 'caption'
      },
      children: [{
        type: 'p',
        attributes: {
          text: caption
        },
        children: [{
          type: 'div',
          attributes: {
            class: 'stats'
          },
          children: [{
              type: 'span',
              attributes: {
                text: `${likes} &#x1F49B`
              }
            },
            {
              type: 'span',
              attributes: {
                text: `${comments} &#x1F4AC`
              }
            }
          ]
        }]
      }]
    }]
  }
  return captionDiv;
}

function createSlideDiv(slideid) {
  return {
    type: 'div',
    attributes: {},
    children: [
      {
        type: 'a',
        attributes: {
          class: 'prev',
          onclick: `plusSlides(-1, ${slideid})`,
          text: '&#10094;'
        }
      },
      {
        type: 'a',
        attributes: {
          class: 'next',
          onclick: `plusSlides(1, ${slideid})`,
          text: '&#10095;'
        }
      }
    ]
  }
}

function plusSlides(n, no) {
  showSlides(slideIndex[no] += n, no);
}

function showSlides(n, no) {
  let i;
  var x = document.getElementsByClassName(slideId[no]);
  if (n > x.length) {
    slideIndex[no] = 1
  }
  if (n < 1) {
    slideIndex[no] = x.length
  }
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  x[slideIndex[no] - 1].style.display = "block";
}

// User Access Token
// window.fbAsyncInit = function() {
//   FB.init({
//     appId            : '155511955386765',
//     autoLogAppEvents : true,
//     xfbml            : true,
//     version          : 'v7.0'
//   });
//   FB.getLoginStatus(function(response) {
//     if (response.status === 'connected') {
//       var accessToken = response.authResponse.accessToken;
//       console.log(accessToken);

//     } 
//   });
// };
