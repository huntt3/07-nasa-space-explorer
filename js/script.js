//Credits
//https://www.astronomy.com/astronomy-for-beginners/20-unusual-space-facts/


// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('button');
const gallery = document.getElementById('gallery');

document.getElementById("spaceFactContainer").style.display = "none";

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// NASA API key and endpoint
const API_KEY = 'mppRHU7tQ1qFGUwhhZSq3rw8cgEpMc2iAcgvnuYY';
const API_URL = 'https://api.nasa.gov/planetary/apod';

// Listen for button click
getImagesButton.addEventListener('click', () => {
  // Get the selected start and end dates
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Check if both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both a start and end date.');
    return;
  }
  document.getElementById("spaceFactContainer").style.display = "inline-flex";
  // Build the API URL with the selected dates
  const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Show loading message before fetching
  gallery.innerHTML = `
    <div class="loading-message">
      <span class="material-symbols-outlined" style="font-size:2.2rem;vertical-align:middle;">rocket_launch</span>
      <span style="margin-left:8px;vertical-align:middle;">Loading space photos…</span>
    </div>
  `;

  // Fetch images from NASA API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Remove the loading message
      gallery.innerHTML = '';

      // If the API returns a single object, put it in an array
      const images = Array.isArray(data) ? data : [data];

      // Only show up to 9 entries (images or videos)
      const entriesToShow = images.slice(0, 9);

      // If no entries, show a message
      if (entriesToShow.length === 0) {
        gallery.innerHTML = '<p>No images or videos found for this date range.</p>';
        return;
      }

      // Loop through each entry and add it to the gallery
      entriesToShow.forEach(item => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'gallery-item';

        // Show image or video thumbnail
        let img = null;
        if (item.media_type === 'image') {
          img = document.createElement('img');
          img.src = item.url;
          img.alt = item.title;
        } else if (item.media_type === 'video') {
          // Try to get YouTube thumbnail if possible
          let thumbUrl = '';
          let videoId = '';
          if (item.url.includes('youtube.com')) {
            videoId = getYouTubeVideoId(item.url);
          } else if (item.url.includes('youtu.be')) {
            videoId = item.url.split('youtu.be/')[1];
          }
          if (videoId) {
            thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          } else if (item.thumbnail_url) {
            thumbUrl = item.thumbnail_url;
          } else {
            // fallback: use a generic video icon or NASA logo
            thumbUrl = 'img/NASA-Logo-Large.jpg';
          }
          img = document.createElement('img');
          img.src = thumbUrl;
          img.alt = item.title + ' (video)';
          // Add a play icon overlay for clarity
          img.style.position = 'relative';
        }
        if (img) {
          entryDiv.appendChild(img);
        }

        // Create a caption
        const caption = document.createElement('p');
        caption.textContent = item.title;
        entryDiv.appendChild(caption);

        // Add click event to open modal with details (for both images and videos)
        entryDiv.addEventListener('click', (e) => {
          // Prevent modal from opening if user clicks a link or iframe
          if (e.target.tagName === 'A' || e.target.tagName === 'IFRAME') return;
          openModal(item);
        });

        // Add the div to the gallery
        gallery.appendChild(entryDiv);
      });
    })
    .catch(error => {
      // Show an error message if something goes wrong
      gallery.innerHTML = `<p>Sorry, something went wrong. Please try again later.</p>`;
      console.error(error);
    });

// Modal logic
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const modalClose = document.getElementById('modalClose');

// Function to open the modal and fill in details
function openModal(item) {
  // Always hide both modalImg and modalVideo at first
  modalImg.style.display = 'none';
  const modalVideo = document.getElementById('modalVideo');
  modalVideo.style.display = 'none';
  modalVideo.src = '';

  if (item.media_type === 'image') {
    modalImg.style.display = '';
    modalImg.src = item.hdurl || item.url;
    modalImg.alt = item.title;
    modalImg.style.maxHeight = '350px';
    modalImg.style.width = '100%';
  } else if (item.media_type === 'video') {
    let videoId = '';
    let isYouTube = false;
    if (item.url.includes('youtube.com')) {
      const urlObj = new URL(item.url);
      videoId = urlObj.searchParams.get('v');
      if (videoId && videoId.includes('&')) {
        videoId = videoId.split('&')[0];
      }
      isYouTube = true;
    } else if (item.url.includes('youtu.be')) {
      videoId = item.url.split('youtu.be/')[1];
      if (videoId && videoId.includes('?')) {
        videoId = videoId.split('?')[0];
      }
      isYouTube = true;
    }
    if (isYouTube && videoId) {
      modalVideo.style.display = '';
      modalVideo.src = `https://www.youtube.com/embed/${videoId}`;
      modalVideo.width = '100%';
      modalVideo.height = '350';
      modalVideo.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      modalVideo.allowFullscreen = true;
      modalVideo.frameBorder = '0';
    } else if (item.url) {
      // For non-YouTube videos, embed the video URL directly
      modalVideo.style.display = '';
      modalVideo.src = item.url;
      modalVideo.width = '100%';
      modalVideo.height = '350';
      modalVideo.allow = '';
      modalVideo.allowFullscreen = true;
      modalVideo.frameBorder = '0';
    } else {
      modalVideo.style.display = 'none';
    }
  }
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  modal.classList.add('show');
}

// Close modal on X click
modalClose.addEventListener('click', () => {
  modal.classList.remove('show');
});

// Close modal when clicking outside modal content
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('show');
  }
});

// Show a random space fact in the spaceFactContainer

// Fetch the spaceFacts.json file
fetch('spaceFacts.json')
  .then(response => response.json()) // Parse the JSON data
  .then(facts => {
    // Get the element where we want to show the fact
    const factText = document.getElementById('spaceFactText');
    // Check if we got an array of facts
    if (Array.isArray(facts) && facts.length > 0) {
      // Pick a random fact from the array
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      // Show the random fact in the page
      factText.textContent = randomFact;
    } else {
      // If no facts, show a default message
      factText.textContent = 'Explore the universe with NASA!';
    }
  })
  .catch(() => {
    // If there was an error, show a default message
    const factText = document.getElementById('spaceFactText');
    factText.textContent = 'Explore the universe with NASA!';
  });
});

function getYouTubeVideoId(url) {
  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1].split("/[?&]/")[0];
  } else if (url.includes("youtube.com/watch?v=")) {
    return url.split("v=")[1].split("&")[0];
  } else if (url.includes("youtube.com/embed/")) {
    return url.split("embed/")[1].split("?")[0];
  }
  return null;
}