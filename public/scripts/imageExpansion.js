// Function to expand the image
export function expandImage(event) {
  const clickedImage = event.target;
  console.log('Image clicked:', clickedImage.src); // Debugging log

  // Get the modal and the modal image elements
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('expandedImage');

  // Check if modal elements exist
  if (!modal || !modalImg) {
    console.error('Modal elements not found');
    return;
  }

  // Set the source of the modal image to the clicked image's source
  modalImg.src = clickedImage.src;

  // Display the modal
  modal.style.display = 'flex';

  // Add the expandedImage class to the clicked image
  clickedImage.classList.add('expandedImage');

  // Add event listener to close the modal when clicking outside the image
  modal.addEventListener('click', closeExpandedImage);
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