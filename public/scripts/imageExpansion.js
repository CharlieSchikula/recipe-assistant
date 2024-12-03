// Function to expand the image
export function expandImage(event) {
  const clickedImage = event.target;
  console.log('Image clicked:', clickedImage.src); // Debugging log

  // Get the modal and the modal image elements
  const modal = document.getElementById('imageModal');
  const modalImgContainer = document.createElement('div');
  modalImgContainer.classList.add('modal-img-container');
  const modalImg = document.createElement('img');
  modalImg.id = 'expandedImage';

  // Check if modal elements exist
  if (!modal) {
    console.error('Modal element not found');
    return;
  }

  // Extract the unique part of the URL
  const urlParts = clickedImage.src.split('/');
  const uniquePart = urlParts[4]; // Assuming the unique part is always at this position

  // Construct the new URL
  const newUrl = `https://img-global-jp.cpcdn.com/steps/${uniquePart}/480x480sq70/photo.webp`;

  // Set the source of the modal image to the new URL
  modalImg.src = newUrl;

  // Clear previous content in the modal
  modal.innerHTML = '';

  // Append the image to the container
  modalImgContainer.appendChild(modalImg);

  // Display the modal
  modal.style.display = 'flex';

  // Add the expandedImage class to the clicked image
  clickedImage.classList.add('expandedImage');

  // Add event listener to close the modal when clicking outside the image
  modal.addEventListener('click', closeExpandedImage);

  // Handle multiple images
  const stepImages = Array.from(document.querySelectorAll(`img[data-step="${clickedImage.dataset.step}"]`));
  if (stepImages.length > 1) {
    let currentIndex = stepImages.indexOf(clickedImage);

    // Check screen width and add arrows only if the screen width is >= 769px
    if (window.innerWidth >= 769) {
      // Clear existing arrows if they exist
      const existingLeftArrow = modalImgContainer.querySelector('.left-arrow');
      const existingRightArrow = modalImgContainer.querySelector('.right-arrow');
      if (existingLeftArrow) existingLeftArrow.remove();
      if (existingRightArrow) existingRightArrow.remove();

      const leftArrow = document.createElement('div');
      leftArrow.classList.add('left-arrow');
      leftArrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left-circle" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"/></svg>';
      modalImgContainer.appendChild(leftArrow);

      const rightArrow = document.createElement('div');
      rightArrow.classList.add('right-arrow');
      rightArrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-circle" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"/></svg>';
      modalImgContainer.appendChild(rightArrow);

      const showImage = (index) => {
        const newUrl = stepImages[index].src.replace(/160x128cq70/, '480x480sq70').replace(/\.jpg$/, '.webp');
        modalImg.src = newUrl;
      };

      leftArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + stepImages.length) % stepImages.length;
        showImage(currentIndex);
      });

      rightArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % stepImages.length;
        showImage(currentIndex);
      });
    }
  }

  // Append the container to the modal
  modal.appendChild(modalImgContainer);
}

// Function to close the expanded image modal
export function closeExpandedImage(event) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('expandedImage');

  // Check if the click is outside the image
  if (event.target !== modalImg) {
    modal.style.display = 'none';

    // Remove the expandedImage class from the image
    const expandedImage = document.querySelector('.expandedImage');
    if (expandedImage) {
      expandedImage.classList.remove('expandedImage');
    }

    // Remove the event listener to prevent multiple bindings
    modal.removeEventListener('click', closeExpandedImage);
  }
}

// Function to add event listeners to images
export function addImageEventListeners() {
  const images = document.querySelectorAll('img');
  console.log('Total images found:', images.length); // Debugging log
  images.forEach(image => {
    console.log('Adding click event listener to image:', image.src); // Debugging log
    image.addEventListener('click', expandImage);
  });
}