import { expandImage } from './imageExpansion.js';

// Function to add event listeners to images
export function addImageEventListeners() {
  const images = document.querySelectorAll('img');
  console.log('Total images found:', images.length); // Debugging log
  images.forEach(image => {
    console.log('Adding click event listener to image:', image.src); // Debugging log
    image.addEventListener('click', expandImage);
  });
}

// Function to observe new images
export function observeNewImages() {
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'IMG') {
            console.log('New image added:', node.src); // Debugging log
            node.addEventListener('click', expandImage);
          }
        });
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}