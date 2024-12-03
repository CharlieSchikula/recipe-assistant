// Apply styles to each step based on the number of images in the step
export function applyStylesToStepImg() {
  const stepList = document.getElementById('stepList');
  const steps = stepList.querySelectorAll('.step-item');

  steps.forEach(step => {
    const imageContainer = step.querySelector('.image-container');
    const images = imageContainer.querySelectorAll('img');

    // Clear existing arrows and indicators
    const leftArrow = imageContainer.querySelector('.left-arrow');
    const rightArrow = imageContainer.querySelector('.right-arrow');
    const indicators = imageContainer.querySelector('.image-indicators');
    if (leftArrow) leftArrow.remove();
    if (rightArrow) rightArrow.remove();
    if (indicators) indicators.remove();

    if (images.length > 1) {
      imageContainer.classList.add('multiple-images');

      if (window.innerWidth >= 769) {
        // Apply styles for wide screens
        let currentIndex = 0;

        // Add left and right arrow elements
        const newLeftArrow = document.createElement('div');
        newLeftArrow.classList.add('left-arrow');
        newLeftArrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left-circle" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"/></svg>';
        imageContainer.appendChild(newLeftArrow);

        const newRightArrow = document.createElement('div');
        newRightArrow.classList.add('right-arrow');
        newRightArrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-circle" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"/></svg>';
        imageContainer.appendChild(newRightArrow);

        const newIndicators = document.createElement('div');
        newIndicators.classList.add('image-indicators');
        images.forEach((_, index) => {
          const indicator = document.createElement('div');
          indicator.classList.add('image-indicator');
          if (index === currentIndex) {
            indicator.classList.add('active');
          }
          newIndicators.appendChild(indicator);
        });
        imageContainer.appendChild(newIndicators);

        const showImage = (index) => {
          images.forEach((img, i) => {
            img.style.display = i === index ? 'block' : 'none';
          });
          imageContainer.classList.toggle('has-prev', index > 0);
          imageContainer.classList.toggle('has-next', index < images.length - 1);
          newIndicators.querySelectorAll('.image-indicator').forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
          });
        };
        showImage(currentIndex);

        newLeftArrow.addEventListener('click', () => {
          currentIndex = (currentIndex - 1 + images.length) % images.length;
          showImage(currentIndex);
        });

        newRightArrow.addEventListener('click', () => {
          currentIndex = (currentIndex + 1) % images.length;
          showImage(currentIndex);
        });
      } else {
        // Apply styles for narrow screens
        images.forEach(img => {
          img.style.display = 'block';
        });
      }
    } else {
      // Apply styles for narrow screens
      images.forEach(img => {
        img.style.display = 'block';
      });
    }
  });
}