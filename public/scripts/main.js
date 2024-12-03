import { applyStylesToStepImg } from './applyStylesToStepImg.js';
import { renderWideScreenMenu, renderHamburgerMenu } from './applyLoggedInStyles.js';
import { setupHamburgerMenu, setupModals, setupFormSubmissions, setupFetchRecipe, setupSearchSubstitutes } from './setup.js';
import { addImageEventListeners } from './imageExpansion.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed'); // Debugging log

  setupHamburgerMenu();
  setupModals();
  setupFormSubmissions();
  setupFetchRecipe();
  setupSearchSubstitutes();

  // Apply styles on initial load
  applyStylesToStepImg();

  // Call the functions to render the menus
  renderWideScreenMenu();
  renderHamburgerMenu();

  // Add event listeners to all existing images
  addImageEventListeners();

  // Reapply styles on window resize
  window.addEventListener('resize', applyStylesToStepImg);
});