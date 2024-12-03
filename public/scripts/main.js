import { applyStylesToStepImg } from './applyStylesToStepImg.js';
import { addImageEventListeners, observeNewImages } from './eventListeners.js';
import { renderWideScreenMenu, renderHamburgerMenu } from './applyLoggedInStyles.js';
import { setupHamburgerMenu, setupModals, setupFormSubmissions, setupFetchRecipe, setupSearchSubstitutes, setupImageModals } from './setup.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed'); // Debugging log

  setupHamburgerMenu();
  setupModals();
  setupFormSubmissions();
  setupFetchRecipe();
  setupSearchSubstitutes();
  setupImageModals();

  // Apply styles on initial load
  applyStylesToStepImg();

  // Call the functions to render the menus
  renderWideScreenMenu();
  renderHamburgerMenu();

  // Add event listeners to all existing images
  addImageEventListeners();

  // Use MutationObserver to watch for new images
  observeNewImages();
});