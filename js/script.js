// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('button');
const gallery = document.getElementById('gallery');

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

  // Build the API URL with the selected dates
  const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch images from NASA API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Remove the placeholder
      gallery.innerHTML = '';

      // If the API returns a single object, put it in an array
      const images = Array.isArray(data) ? data : [data];

      // Only show up to 9 images and only images (not videos)
      const imagesToShow = images.filter(item => item.media_type === 'image').slice(0, 9);

      // If no images, show a message
      if (imagesToShow.length === 0) {
        gallery.innerHTML = '<p>No images found for this date range.</p>';
        return;
      }

      // Loop through each image and add it to the gallery
      imagesToShow.forEach(item => {
        // Create a div for each image
        const imgDiv = document.createElement('div');
        imgDiv.className = 'gallery-item';

        // Create the image element
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.title;

        // Create a caption
        const caption = document.createElement('p');
        caption.textContent = item.title;

        // Add image and caption to the div
        imgDiv.appendChild(img);
        imgDiv.appendChild(caption);

        // Add click event to open modal with details
        imgDiv.addEventListener('click', () => {
          openModal(item);
        });

        // Add the div to the gallery
        gallery.appendChild(imgDiv);
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
  modalImg.src = item.hdurl || item.url;
  modalImg.alt = item.title;
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
});
