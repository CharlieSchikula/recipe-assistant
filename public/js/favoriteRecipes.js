import { setupHamburgerMenu, setupModals } from './setup.js';
import { renderWideScreenMenu, renderHamburgerMenu } from './applyLoggedInStyles.js';

let recipeIdToDelete = null;
let currentPage = 1;
const recipesPerPage = 10;
let searchQuery = ''; // Initialize searchQuery as an empty string
let allRecipes = []; // Store all recipes

// Function to check token validity
function isAuthorized() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('トークンが存在しません。ログインし直してください');
    localStorage.setItem('showLoginModal', 'true');
    window.location.href = '/';
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    if (Date.now() >= exp) {
      alert('トークンの有効期限が切れました。ログインし直してください');
      localStorage.removeItem('token');
      localStorage.setItem('showLoginModal', 'true');
      window.location.href = '/';
      return false;
    }
  } catch (e) {
    console.error('Invalid token:', e);
    alert('トークンが無効です。ログインし直してください');
    localStorage.removeItem('token');
    localStorage.setItem('showLoginModal', 'true');
    window.location.href = '/';
    return false;
  }

  return true;
}


if (isAuthorized()) {
  setupHamburgerMenu();
  setupModals();
  renderWideScreenMenu('favorite-recipes');
  renderHamburgerMenu('favorite-recipes');

  // Function to make an authenticated API call
  async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Unauthorized: ' + response.statusText);
      } else {
        console.error('Network response was not ok: ' + response.statusText);
      }
      return;
    }

    return response.json();
  }

  // Function to fetch favorite recipes
  async function fetchFavoriteRecipes(page = 1, searchQuery = '') {
    try {
      const loadingIndicator = document.getElementById('loadingIndicator');
      loadingIndicator.style.display = 'block'; // Show loading indicator

      if (allRecipes.length === 0) {
        // Fetch all recipes only if not already fetched
        console.log('Fetching Favorite Recipes'); // Log the function call
        const data = await fetchWithAuth('/api/favorites/all');
        allRecipes = data || [];
        console.log('Favorite Recipes: ', allRecipes);
      }

      const favoriteList = document.getElementById('favoriteList');
      const noFavoritesMessage = document.getElementById('noFavoritesMessage');
      const noFilteredRecipesMessage = document.getElementById('noFilteredRecipesMessage');
      const prevButton = document.getElementById('prevButton');
      const nextButton = document.getElementById('nextButton');
      const pageIndicator = document.getElementById('pageIndicator');
      const deleteSelectedButton = document.getElementById('deleteSelectedButton');
      const deleteSelectedButtonDesc = document.getElementById('deleteSelectedButtonDesc');

      if (allRecipes.length > 0) {
        favoriteList.innerHTML = '';

        // Filter recipes based on search query
        const filteredRecipes = allRecipes.filter(recipe => recipe.title.includes(searchQuery));

        if (filteredRecipes.length === 0) {
          // No recipes found after filtering
          noFilteredRecipesMessage.style.display = 'block';
          prevButton.style.display = 'none';
          nextButton.style.display = 'none';
          pageIndicator.style.display = 'none';
          noFavoritesMessage.style.display = 'none';
          loadingIndicator.style.display = 'none';
          deleteSelectedButton.style.display = 'none';
          deleteSelectedButtonDesc.style.display = 'none';
          return;
        } else {
          noFilteredRecipesMessage.style.display = 'none';
        }

        const startIndex = (page - 1) * recipesPerPage;
        const endIndex = startIndex + recipesPerPage;
        const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);

        // Display current index before fetching titles
        const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
        pageIndicator.textContent = `Page ${page}/${totalPages}`;

        // Display all recipes at once
        paginatedRecipes.forEach(({ recipeId, url, title }) => {
          const listItem = document.createElement('li');
          listItem.className = 'favorite-item'; // Add a class for styling
          listItem.innerHTML = `
            <div class="favorite-item-content">
              <div class="left-content">
                <input type="checkbox" class="favorite-checkbox" data-recipe-id="${recipeId}">
                <a href="${url}" target="_blank" class="recipe-title">${title}</a>
              </div>
              <div class="right-content fav-recipe-buttons">
                <button class="fav-search-recipe-button" data-recipe-url="${url}">検索</button>
                <button class="delete-button" data-recipe-id="${recipeId}">削除</button>
              </div>
            </div>
          `;
          favoriteList.appendChild(listItem);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-button').forEach(button => {
          button.addEventListener('click', (event) => {
            const recipeId = event.target.getAttribute('data-recipe-id');
            const recipeUrl = allRecipes.find(recipe => recipe.recipeId === recipeId).url;
            console.log ("Trying To Remove Recipe From Favorites: ", recipeUrl);
            openConfirmDeleteModal('削除してもよろしいですか？', async () => {
              try {
                await removeFromFavorites(recipeUrl);
                closeConfirmDeleteModal();
                window.location.reload();
              } catch (error) {
                console.error('Error deleting favorite:', error);
              }
            });
          });
        });

        // Add event listener to the deleteSelectedButton
        deleteSelectedButton.addEventListener('click', () => {
          const selectedFavorites = Array.from(document.querySelectorAll('.favorite-checkbox:checked'))
            .map(checkbox => checkbox.closest('li'));

          if (selectedFavorites.length === 0) {
            alert('一つ以上の項目を選択してください。');
            return;
          }

          // Get the array of data-recipe-id attributes
          const selectedRecipeIds = selectedFavorites.map(favoriteItem => favoriteItem.querySelector('.favorite-checkbox').getAttribute('data-recipe-id'));
          console.log("Trying To Remove Selected Recipes From Favorites: ", selectedRecipeIds);

          // Open the confirm delete modal
          openConfirmDeleteModal('選択された項目が全て削除されます。<br>よろしいですか？', async () => {
            // Function to delete favorites sequentially
            for (const favoriteItem of selectedFavorites) {
              const recipeId = favoriteItem.querySelector('.favorite-checkbox').getAttribute('data-recipe-id');
              const recipeUrl = allRecipes.find(recipe => recipe.recipeId === recipeId).url;
              try {
                const response = await removeFromFavorites(recipeUrl);
                if (response.success) {
                  console.log("Removed URL: " + recipeUrl);
                  // Remove the favorite item from the DOM
                  favoriteItem.remove();
                } else {
                  console.error('Error deleting favorite:', response.message);
                }
              } catch (error) {
                console.error('Error deleting favorite:', error);
              }
            }

            closeConfirmDeleteModal();
            window.location.reload(); // Reload the page after all deletions are completed
          });
        });

        // Add event listeners to search recipe buttons for favorite page
        document.querySelectorAll('.fav-search-recipe-button').forEach(button => {
          button.addEventListener('click', (event) => {
            const recipeUrl = event.target.getAttribute('data-recipe-url');
            localStorage.setItem('recipeUrl', recipeUrl);
            window.location.href = '/';
          });
        });

        // Update pagination buttons
        prevButton.disabled = page === 1;
        nextButton.disabled = page === totalPages;

        prevButton.onclick = () => fetchFavoriteRecipes(page - 1, searchQuery);
        nextButton.onclick = () => fetchFavoriteRecipes(page + 1, searchQuery);

        // Show pagination and page indicator
        prevButton.style.display = 'inline-block';
        nextButton.style.display = 'inline-block';
        pageIndicator.style.display = 'inline-block';
        deleteSelectedButton.style.display = 'block';
        deleteSelectedButtonDesc.style.display = 'block';
        noFavoritesMessage.style.display = 'none';
      } else {
        // No favorite recipes found
        favoriteList.innerHTML = '';
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        pageIndicator.style.display = 'none';
        deleteSelectedButton.style.display = 'none';
        deleteSelectedButtonDesc.style.display = 'none';
        noFavoritesMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('Error fetching favorite recipes:', error);
    } finally {
      const loadingIndicator = document.getElementById('loadingIndicator');
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none'; // Hide loading indicator
      }
    }
  }

  // Function to open the confirm delete modal
  function openConfirmDeleteModal(message, onConfirm) {
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const confirmDeleteMessage = document.getElementById('confirmDeleteMessage');
    confirmDeleteMessage.innerHTML = message;
    confirmDeleteModal.style.display = 'block';

    // Remove any existing event listeners on the confirm button
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    const newConfirmDeleteButton = confirmDeleteButton.cloneNode(true);
    confirmDeleteButton.parentNode.replaceChild(newConfirmDeleteButton, confirmDeleteButton);

    // Add the new event listener
    newConfirmDeleteButton.addEventListener('click', onConfirm);
  }

  // Function to close the confirm delete modal
  function closeConfirmDeleteModal() {
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    if (confirmDeleteModal) {
      confirmDeleteModal.style.display = 'none';
    }
  }

 // Add event listeners for closing modals
  document.getElementById('closeConfirmDeleteModal').addEventListener('click', closeConfirmDeleteModal);

  // Close the confirm delete modal when clicking outside of it
  window.addEventListener('click', (event) => {
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    if (event.target === confirmDeleteModal) {
      closeConfirmDeleteModal();
    }
  });

  // Handle cancel delete action
  document.getElementById('cancelDeleteButton').addEventListener('click', () => {
    recipeIdToDelete = null;
    closeConfirmDeleteModal();
  });

  // Function to remove a favorite recipe from the database
  async function removeFromFavorites(url) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/favorites?url=${encodeURIComponent(url)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log("Response For Deleting Favorite: ", data);
    return data;
  }

  // Debounce function to limit the rate at which a function can fire
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Add event listener for search input with debounce
  document.getElementById('filterInput').addEventListener('input', debounce(() => {
    searchQuery = document.getElementById('filterInput').value.trim();
    fetchFavoriteRecipes(1, searchQuery);
  }, 300));

  // Fetch and display favorite recipes on page load
  document.addEventListener('DOMContentLoaded', () => fetchFavoriteRecipes(currentPage));
}
window.closeConfirmDeleteModal = closeConfirmDeleteModal;