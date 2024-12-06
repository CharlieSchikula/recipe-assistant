import { setupHamburgerMenu, setupModals } from './setup.js';
import { renderWideScreenMenu, renderHamburgerMenu } from './applyLoggedInStyles.js';

let currentPage = 1;
const mySubstitutesPerPage = 5;
let searchQueryIngredients = ''; // Initialize searchQueryIngredients as an empty string
let searchQuerySubstitutes = ''; // Initialize searchQuerySubstitutes as an empty string
let allMySubstitutes = []; // Store all substitutes
let isAuthorized = false; // Store authorization status
let substituteIdToDelete = null;
let substituteIdToEdit = null;
let originalIngredient = ''; // Store the original ingredient value

// Function to check token validity
function checkToken() {
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

if (checkToken()) {
  isAuthorized = true; // Set authorization status
  setupHamburgerMenu();
  setupModals();
  renderWideScreenMenu('my-substitutes');
  renderHamburgerMenu('my-substitutes');

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

  // Function to fetch my substitutes
  async function fetchMySubstitutes() {
    try {
      console.log('Fetching my substitutes'); // Log the function call
      const loadingIndicator = document.getElementById('loadingIndicator');
      loadingIndicator.style.display = 'block'; // Show loading indicator

      // Fetch all substitutes
      const data = await fetchWithAuth('/api/my-substitutes');
      console.log('Fetched substitutes:', data); // Log the fetched data
      allMySubstitutes = data || [];

      filterAndDisplaySubstitutes(); // Filter and display substitutes
    } catch (error) {
      console.error('Error fetching my substitutes:', error);
    } finally {
      const loadingIndicator = document.getElementById('loadingIndicator');
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none'; // Hide loading indicator
      }
    }
  }

  // Function to filter and display substitutes
  function filterAndDisplaySubstitutes() {
    const mySubstitutesList = document.getElementById('mySubstitutesList');
    const noMySubstitutesMessage = document.getElementById('noMySubstitutesMessage');
    const noFilteredSubstitutesMessage = document.getElementById('noFilteredSubstitutesMessage');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const pageIndicator = document.getElementById('pageIndicator');

    if (allMySubstitutes.length > 0) {
      mySubstitutesList.innerHTML = '';

      // Filter substitutes based on search query
      const filteredSubstitutes = allMySubstitutes.filter(substitute => 
        substitute.ingredient.includes(searchQueryIngredients)
      ).map(substitute => ({
        ...substitute,
        mySubstitutes: substitute.mySubstitutes.filter(sub => sub.substituteName.includes(searchQuerySubstitutes))
      })).filter(substitute => substitute.mySubstitutes.length > 0);

      if (filteredSubstitutes.length === 0) {
        // No substitutes found after filtering
        noFilteredSubstitutesMessage.style.display = 'block';
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        pageIndicator.style.display = 'none';
        noMySubstitutesMessage.style.display = 'none';
        return;
      } else {
        noFilteredSubstitutesMessage.style.display = 'none';
      }

      const startIndex = (currentPage - 1) * mySubstitutesPerPage;
      const endIndex = startIndex + mySubstitutesPerPage;
      const paginatedSubstitutes = filteredSubstitutes.slice(startIndex, endIndex);

      // Display current index before fetching titles
      const totalPages = Math.ceil(filteredSubstitutes.length / mySubstitutesPerPage);
      pageIndicator.textContent = `Page ${currentPage}/${totalPages}`;

      // Display all substitutes at once
      paginatedSubstitutes.forEach(({ _id, ingredient, mySubstitutes }) => {
        const listItem = document.createElement('div');
        listItem.className = 'ingredient-box';
        listItem.innerHTML = `
          <div class="ingredient-header">
            材料:　<span class="underline">${ingredient}</span>
          </div>
          <table class="substitute-table">
            <thead>
              <tr>
                <th>元の分量</th>
                <th>代用品名</th>
                <th>代用品の分量</th>
                <th class="veg">ベジ</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${mySubstitutes.map(sub => `
                <tr>
                  <td>${sub.originalPortion}</td>
                  <td>${sub.substituteName}</td>
                  <td>${sub.substitutePortion}</td>
                  <td>${sub.vegetarian ? '<span class="veg">✔</span>' : ''}</td>
                  <td class="my-substitutes-button">
                    <button class="edit-substitute-button" data-substitute-id="${sub._id}">編集</button>
                    <button class="delete-substitute-button" data-substitute-id="${sub._id}">削除</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        mySubstitutesList.appendChild(listItem);
      });

      // Add event listeners to edit buttons
      document.querySelectorAll('.edit-substitute-button').forEach(button => {
        button.addEventListener('click', (event) => {
          const substituteId = event.target.getAttribute('data-substitute-id');
          console.log('Editing substitute:', substituteId);
          let foundSubstitute = null;
          let foundSub = null;

          allMySubstitutes.forEach(substitute => {
            const sub = substitute.mySubstitutes.find(s => s._id === substituteId);
            console.log("listing substitutes substitute:" + substitute + "sub: " + sub);
            if (sub) {
              foundSubstitute = substitute;
              foundSub = sub;
            }
          });

          if (foundSubstitute && foundSub) {
            handleEditSubstitute(foundSubstitute, foundSub);
          } else {
            console.error('Substitute not found');
          }
        });
      });

      // Add event listeners to delete buttons
      document.querySelectorAll('.delete-substitute-button').forEach(button => {
        button.addEventListener('click', (event) => {
          if (!isAuthorized) return; // Check authorization status before proceeding
          substituteIdToDelete = event.target.getAttribute('data-substitute-id');
          openDeleteSubstituteModal();
        });
      });

      // Update pagination buttons
      prevButton.disabled = currentPage === 1;
      nextButton.disabled = currentPage === totalPages;

      prevButton.onclick = () => {
        currentPage--;
        filterAndDisplaySubstitutes();
      };
      nextButton.onclick = () => {
        currentPage++;
        filterAndDisplaySubstitutes();
      };

      // Show pagination and page indicator
      prevButton.style.display = 'inline-block';
      nextButton.style.display = 'inline-block';
      pageIndicator.style.display = 'inline-block';
      noMySubstitutesMessage.style.display = 'none';
    } else {
      // No substitutes found
      mySubstitutesList.innerHTML = '';
      prevButton.style.display = 'none';
      nextButton.style.display = 'none';
      pageIndicator.style.display = 'none';
      noMySubstitutesMessage.style.display = 'block';
    }
  }

  // Function to add a new substitute
  async function addNewSubstitute(substitute) {
    const token = localStorage.getItem('token');
    console.log('Adding new substitute:', substitute);
    const response = await fetch('/api/my-substitutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(substitute)
    });
    const data = await response.json();
    console.log("Completed adding:", data);
    return data;
  }

  // Function to update a substitute
  async function updateSubstitute(id, substitute) {
    const token = localStorage.getItem('token');
    console.log('Updating substitute:', id, substitute);
    const response = await fetch(`/api/my-substitutes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(substitute)
    });
    const data = await response.json();
    console.log("Completed updating:", data);
    return data;
  }

  // Function to remove a substitute
  async function removeSubstitute(id) {
    const token = localStorage.getItem('token');
    console.log('Removing substitute:', id);
    const response = await fetch(`/api/my-substitutes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log("Completed deleting:", data);
    return data;
  }

  // Function to open the add substitute modal
  function openAddSubstituteModal() {
    document.getElementById('modalTitle').textContent = '新規登録';
    document.getElementById('substituteFormSubmitButton').textContent = '登録';
    clearSubstituteForm();
    clearSubstituteIdToEdit(); // Clear substituteIdToEdit
    openSubstituteModal();
  }

  // Function to open the edit substitute modal
  function handleEditSubstitute(substitute, sub) {
    document.getElementById('modalTitle').textContent = 'my代用品 を編集';
    document.getElementById('substituteFormSubmitButton').textContent = '更新';
    document.getElementById('ingredient').value = substitute.ingredient;
    document.getElementById('ingredient').readOnly = true; // Make ingredient input read-only
    originalIngredient = substitute.ingredient; // Store the original ingredient value
    document.getElementById('originalPortion').value = sub.originalPortion;
    document.getElementById('substituteName').value = sub.substituteName;
    document.getElementById('substitutePortion').value = sub.substitutePortion;
    document.getElementById('vegetarian').checked = sub.vegetarian;
    substituteIdToEdit = sub._id;
    openSubstituteModal();
  }

  // Function to open the substitute modal
  function openSubstituteModal() {
    const substituteModal = document.getElementById('substituteModal');
    if (substituteModal) {
      substituteModal.style.display = 'block';
    }
  }

  // Function to close the substitute modal
  function closeSubstituteModal() {
    const substituteModal = document.getElementById('substituteModal');
    if (substituteModal) {
      substituteModal.style.display = 'none';
    }
    document.getElementById('ingredient').readOnly = false; // Make ingredient input editable
  }

  // Function to clear the substitute form
  function clearSubstituteForm() {
    document.getElementById('ingredient').value = '';
    document.getElementById('originalPortion').value = '';
    document.getElementById('substituteName').value = '';
    document.getElementById('substitutePortion').value = '';
    document.getElementById('vegetarian').checked = false;
  }

  // Function to clear substituteIdToEdit
  function clearSubstituteIdToEdit() {
    substituteIdToEdit = null;
  }

  // Function to open the delete substitute modal
  function openDeleteSubstituteModal() {
    const deleteSubstituteModal = document.getElementById('deleteSubstituteModal');
    if (deleteSubstituteModal) {
      deleteSubstituteModal.style.display = 'block';
    }
  }

  // Function to close the delete substitute modal
  function closeDeleteSubstituteModal() {
    const deleteSubstituteModal = document.getElementById('deleteSubstituteModal');
    if (deleteSubstituteModal) {
      deleteSubstituteModal.style.display = 'none';
    }
  }

  // Handle add new substitute action
  document.getElementById('addNewSubstituteButton').addEventListener('click', openAddSubstituteModal);

  document.getElementById('substituteForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const ingredient = document.getElementById('ingredient').value.trim();
    const originalPortion = document.getElementById('originalPortion').value.trim();
    const substituteName = document.getElementById('substituteName').value.trim();
    const substitutePortion = document.getElementById('substitutePortion').value.trim();
    const vegetarian = document.getElementById('vegetarian').checked;
    const newSubstitute = { ingredient, mySubstitutes: [{ originalPortion, substituteName, substitutePortion, vegetarian }] };

    // Check for duplicate ingredient and substitute combination
    const duplicate = allMySubstitutes.some(substitute => 
      substitute.ingredient === ingredient && 
      substitute.mySubstitutes.some(sub => sub.substituteName === substituteName && sub._id !== substituteIdToEdit)
    );

    if (duplicate) {
      alert('その材料と代用品の組み合わせはすでに登録されています');
      return;
    }

    if (substituteIdToEdit) {
      if (ingredient !== originalIngredient) {
        alert('材料は変更できません');
        return;
      }
      await updateSubstitute(substituteIdToEdit, newSubstitute);
      substituteIdToEdit = null;
    } else {
      await addNewSubstitute(newSubstitute);
    }
    closeSubstituteModal();
    fetchMySubstitutes(); // Refresh the list
  });
  
  // Handle confirm delete action
  document.getElementById('confirmDeleteSubstituteButton').addEventListener('click', async () => {
    if (substituteIdToDelete) {
      await removeSubstitute(substituteIdToDelete);
      substituteIdToDelete = null;
      closeDeleteSubstituteModal();
      fetchMySubstitutes(); // Refresh the list
    }
  });

  // Handle cancel delete action
  document.getElementById('cancelDeleteSubstituteButton').addEventListener('click', () => {
    substituteIdToDelete = null;
    closeDeleteSubstituteModal();
  });

  // Add event listener for search input with debounce
  document.getElementById('filterInputForIngredients').addEventListener('input', debounce(() => {
    searchQueryIngredients = document.getElementById('filterInputForIngredients').value.trim();
    filterAndDisplaySubstitutes();
  }, 300));
  document.getElementById('filterInputForSubstitutes').addEventListener('input', debounce(() => {
    searchQuerySubstitutes = document.getElementById('filterInputForSubstitutes').value.trim();
    filterAndDisplaySubstitutes();
  }, 300));

  // Fetch and display my substitutes on page load
  document.addEventListener('DOMContentLoaded', fetchMySubstitutes);

  // Add event listeners to close buttons for modals
  document.getElementById('closeSubstituteModal').addEventListener('click', closeSubstituteModal);
  document.getElementById('closeDeleteSubstituteModal').addEventListener('click', closeDeleteSubstituteModal);

  // Add event listener to close delete modal when clicking outside of it
  window.addEventListener('click', (event) => {
    const deleteSubstituteModal = document.getElementById('deleteSubstituteModal');
    if (event.target === deleteSubstituteModal) {
      closeDeleteSubstituteModal();
    }
  });
}

// Debounce function to limit the rate at which a function can fire
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}