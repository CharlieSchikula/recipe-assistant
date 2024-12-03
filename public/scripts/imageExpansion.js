// Function to expand image
export function expandImage(event) {
  console.log('Image clicked:', event.target.src); // Debugging log
  const modal = document.getElementById('expandedImageModal');
  const modalImg = document.getElementById('expandedImage');
  modal.style.display = 'block';
  modalImg.src = event.target.src;
}

// Function to close expanded image
export function closeExpandedImage() {
  console.log('Closing expanded image modal'); // Debugging log
  const modal = document.getElementById('expandedImageModal');
  modal.style.display = 'none';
}