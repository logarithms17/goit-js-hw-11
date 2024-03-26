import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { BASE_URL, options } from './pixabay-api.js';

///////////////////////////////////////////////////////////////

// DOM LINKS
const galleryEl = document.querySelector('.gallery');
const searchInputEl = document.querySelector('input[name="searchQuery"');
const searchFormEl = document.getElementById('search-form');

///////////////////////////////////////////////////////////////

// instantiate simplelightbox
const lightbox = new SimpleLightbox('.lightbox', { //creating a preview of images with "next" and "previous" buttons
  captionsData: 'alt',
  captionDelay: 250,
});

///////////////////////////////////////////////////////////////
let totalHits = 0; //initial hits before search
let reachedEnd = false; 

function renderGallery(hits) { //function that creates the gallery based from the searched data
  const markup = hits //hits.map loops the the data from "hits" and just choose the specified data needed and the creates a mark up
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
              <a href="${largeImageURL}" class="lightbox">
                  <div class="photo-card">
                      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                      <div class="info">
                          <p class="info-item">
                              <b>Likes</b>
                              ${likes}
                          </p>
                          <p class="info-item">
                              <b>Views</b>
                              ${views}
                          </p>
                          <p class="info-item">
                              <b>Comments</b>
                              ${comments}
                          </p>
                          <p class="info-item">
                              <b>Downloads</b>
                              ${downloads}
                          </p>
                      </div>
                  </div>
              </a>
              `;
      }
    )
    .join(''); //to remove the comma's, to combine the looped markups

  galleryEl.insertAdjacentHTML('beforeend', markup); //inserts the variable markup with the created markups to div gallery

  //   If the user has reached the end of the collection
  if (options.params.page * options.params.per_page >= totalHits) { //if the product is equal to totalhits then we have reached  the end of the searched data
    if (!reachedEnd) { //reachedend is initially false, so ! means its true hence it reached the end
      Notify.info("We're sorry, but you've reached the end of search results."); //creates a notification when it reached end
      reachedEnd = true; //change reachedend to true 
    }
  }
  lightbox.refresh(); //code needed to implement simple light box
}

///////////////////////////////////////////////////////////////

async function handleSubmit(e) { //fetching data using aync/await
  e.preventDefault(); //prevents reload of page once submitted
  options.params.q = searchInputEl.value.trim(); //removes the white spaces
  if (options.params.q === '') { //if the searched bar is blank, then do nothing
    return; 
  }
  options.params.page = 1; 
  galleryEl.innerHTML = ''; //when researching something, this removes the previous searched data. like a refresh
  reachedEnd = false; // changed reached end to false, cause starts a new data list

  try { //using try and catch to access axios
    const res = await axios.get(BASE_URL, options); //using axios to fetch the data
    totalHits = res.data.totalHits; //update totalhits from the fetched data

    const { hits } = res.data; //destructuring data to efficiently use hits
    console.log(hits); //data of the searched item that we need

    if (hits.length === 0) {//using if else to do something if success or failed
      Notify.failure( //notify something when failed
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else { 
      Notify.success(`Hooray! We found ${totalHits} images.`); //notify something when success
      renderGallery(hits); // then activate the function that has the markup so that the needed info will be displayed on the webpage
    }
    searchInputEl.value = ''; //once hit search, it will automatically put blank on the search bar
  } catch (err) { //notify when there's an error during fetching
    console.log(err)
    Notify.failure(err);
  }
}

///////////////////////////////////////////////////////////////

async function loadMore() { //when the limit has been reached during scrolling, it will add more data
  options.params.page += 1; //adds a page per loadmore
  try { 
    const res = await axios.get(BASE_URL, options);//using axios again to fetch the datas
    const hits = res.data.hits; //adds new hits
    renderGallery(hits); //renders the fetched data to be viewed in the page
  } catch (err) { //notify if failed to fetch
    Notify.failure(err);
  }
}

function handleScroll() {  //function when scrolling
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement; //fetch data from document/window itself
  if (scrollTop + clientHeight >= scrollHeight) { //formula when reaching the end of the window
    loadMore(); //activate loadmore function to add more data
  }
}
searchFormEl.addEventListener('submit', handleSubmit); //event listener to activate the submit
window.addEventListener('scroll', handleScroll); //event listener every scroll you do
