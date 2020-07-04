const PAGE_TOKEN ="EAACNbZCLb8Y0BAFbmmnPqnV8aDG7LgcIYY96P14H6eUuG6FruZB7bO6Q0zTrYApfbaRJf5DLN1VPmvENa4IwLmfBU5ZBKJzRZA65DdUFdzRnDco6vftMezij2NY2EkyFX0zcHlXiZCb47RqaLCurT16emH7AErJWHDO7ydTMhJpEJQJKiLnZAk";

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
  let imageDiv = document.createElement('div')
  let imageElement = new Image()
  let caption = addCaption(image.caption, image.like_count, image.comments_count);
  imageDiv.setAttribute('class', 'imageDiv')
  imageElement.src = image.media_url
  imageElement.setAttribute('class', 'image')
  imageDiv.appendChild(imageElement);
  imageDiv.appendChild(caption);
  imageDiv.setAttribute('id', image.id);
  app.appendChild(imageDiv);
}

function addCarouselImageToScreen(image) {  
  let slideArrayId = slideIndex.length;
  let carouselClass = image.id;
  let caption = addCaption(image.caption, image.like_count, image.comments_count);
  slideId.push(carouselClass);
  slideIndex.push(1);  
  let div = document.createElement('div');
  div.setAttribute('class', 'carousel')
  image.children.data.forEach(child => {
    let imageElement = new Image()
    imageElement.src = child.media_url
    imageElement.setAttribute('class', 'child ' + carouselClass)
    div.appendChild(imageElement);
  })
  let innerDiv = document.createElement('div')
  let prev = document.createElement('a');
  let next = document.createElement('a');
  prev.setAttribute('class', 'prev');
  next.setAttribute('class', 'next');
  prev.setAttribute("onclick", `plusSlides(-1, ${slideArrayId})`);
  next.setAttribute("onclick", `plusSlides(1, ${slideArrayId})`);
  prev.innerHTML = '&#10094;';
  next.innerHTML = '&#10095;';
  innerDiv.appendChild(prev);
  innerDiv.appendChild(next);
  div.appendChild(innerDiv);
  div.appendChild(caption);
  div.setAttribute('id', image.id);
  app.appendChild(div);  
  showSlides(1, slideArrayId);
}

function plusSlides(n, no) {
  showSlides(slideIndex[no] += n, no);
}

function showSlides(n, no) {    
  let i;
  var x = document.getElementsByClassName(slideId[no]);  
  if (n > x.length) {slideIndex[no] = 1}  
  if (n < 1) {slideIndex[no] = x.length}  
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }    
  x[slideIndex[no]-1].style.display = "block";
}

function addVideoToScreen(image) {
  let videoDiv = document.createElement('div');
  let videoElement = document.createElement('video');
  let caption = addCaption(image.caption, image.like_count, image.comments_count);
  videoElement.src = image.media_url;
  videoElement.controls = true;
  videoDiv.appendChild(videoElement);
  videoDiv.appendChild(caption);
  videoDiv.setAttribute('class', 'videoDiv')
  videoDiv.setAttribute('id', image.id);
  app.appendChild(videoDiv);  
}

function addCaption(caption, likes, comments) {
  let captionDiv = document.createElement('div');
  let captionInnerDiv = document.createElement('div');
  let statsDiv = document.createElement('div');
  let paragraph = document.createElement('p');
  let likesEl = document.createElement('span')
  let commentsEl = document.createElement('span')
  captionDiv.setAttribute('class', 'captionDiv')
  captionInnerDiv.setAttribute('class', 'caption')
  statsDiv.setAttribute('class', 'stats')
  paragraph.innerHTML = caption;
  likesEl.innerHTML = `${likes} &#x1F49B`;
  commentsEl.innerHTML = `${comments} &#x1F4AC`;
  statsDiv.append(commentsEl, likesEl)
  captionInnerDiv.append(paragraph, statsDiv);
  captionDiv.appendChild(captionInnerDiv) 
  return captionDiv;
}

getMediaNodes()


// User Access Token
window.fbAsyncInit = function() {
  FB.init({
    appId            : '155511955386765',
    autoLogAppEvents : true,
    xfbml            : true,
    version          : 'v7.0'
  });
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      var accessToken = response.authResponse.accessToken;
      console.log(accessToken);
      
    } 
  });
};
