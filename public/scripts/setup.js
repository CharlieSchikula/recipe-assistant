import { addImageEventListeners } from './imageExpansion.js';
import { displaySubstitutes } from './substitutes.js';
import { validateEmail, validatePassword } from './validateEmailAndPassword.js';
import { applyStylesToStepImg } from './applyStylesToStepImg.js';

document.addEventListener('DOMContentLoaded', () => {
  setupModals();
});

export function setupHamburgerMenu() {
  const hamburgerButton = document.getElementById('hamburgerButton');
  const closeMenuButton = document.getElementById('closeMenuButton');
  const hamburgerMenu = document.getElementById('hamburgerMenu');

  function toggleMenu() {
    hamburgerMenu.classList.toggle('open');
  }

  hamburgerButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Stop the click event from propagating
    toggleMenu();
  });

  closeMenuButton.addEventListener('click', toggleMenu);

  // Ensure the menu is closed when resizing to a wider screen
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 769) {
      hamburgerMenu.classList.remove('open');
    }
  });

  // Close the hamburger menu when clicking outside of it
  window.addEventListener('click', (event) => {
    if (!hamburgerMenu.contains(event.target) && !hamburgerButton.contains(event.target)) {
      hamburgerMenu.classList.remove('open');
    }
  });
}

export function setupModals() {
  const registerModal = document.getElementById('registerModal');
  const loginModal = document.getElementById('loginModal');
  const logoutModal = document.getElementById('logoutModal');
  const closeRegisterModal = document.getElementById('closeRegisterModal');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const closeLogoutModal = document.getElementById('closeLogoutModal');
  const confirmLogoutButton = document.getElementById('confirmLogoutButton');
  const cancelLogoutButton = document.getElementById('cancelLogoutButton');

  // Open registration modal
  const hamburgerRegisterLink = document.getElementById('hamburgerRegisterLink');
  const registerButton = document.getElementById('registerButton');
  if (hamburgerRegisterLink) {
    hamburgerRegisterLink.addEventListener('click', (event) => {
      event.preventDefault();
      registerModal.style.display = 'block';
    });
  }

  if (registerButton) {
    registerButton.addEventListener('click', (event) => {
      event.preventDefault();
      registerModal.style.display = 'block';
    });
  }

  // Open login modal
  const hamburgerLoginLink = document.getElementById('hamburgerLoginLink');
  const loginButton = document.getElementById('loginButton');
  if (hamburgerLoginLink) {
    hamburgerLoginLink.addEventListener('click', (event) => {
      event.preventDefault();
      loginModal.style.display = 'block';
    });
  }

  if (loginButton) {
    loginButton.addEventListener('click', (event) => {
      event.preventDefault();
      loginModal.style.display = 'block';
    });
  }

  // Redirect to register modal
  const redirectToRegister = document.getElementById('redirectToRegister');
  if (redirectToRegister) {
    redirectToRegister.addEventListener('click', (event) => {
      event.preventDefault();
      loginModal.style.display = 'none';
      registerModal.style.display = 'block';
      document.getElementById('loginForm').reset(); // Clear input fields
      document.getElementById('loginEmailError').style.display = 'none'; // Hide email error
      document.getElementById('loginPasswordError').style.display = 'none'; // Hide password error
    });
  }

  // Close registration modal
  if (closeRegisterModal) {
    closeRegisterModal.addEventListener('click', () => {
      registerModal.style.display = 'none';
      document.getElementById('registerForm').reset(); // Clear input fields
      registerEmailError.style.display = 'none'; // Hide email error
      registerPasswordError.style.display = 'none'; // Hide password error
    });
  }

  // Close login modal
  if (closeLoginModal) {
    closeLoginModal.addEventListener('click', () => {
      loginModal.style.display = 'none';
      document.getElementById('loginForm').reset(); // Clear input fields
      emailError.style.display = 'none'; // Hide email error
      passwordError.style.display = 'none'; // Hide password error
    });
  }

  // Open logout modal
  const logoutLink = document.getElementById('hamburgerLogoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', (event) => {
      event.preventDefault();
      logoutModal.style.display = 'block';
    });
  }

  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      logoutModal.style.display = 'block';
    });
  }

  // Close logout modal
  if (closeLogoutModal) {
    closeLogoutModal.addEventListener('click', () => {
      logoutModal.style.display = 'none';
    });
  }

  // Close logout modal when clicking outside of it
  window.addEventListener('click', (event) => {
    if (event.target === logoutModal) {
      logoutModal.style.display = 'none';
    }
  });

  // Confirm logout
  if (confirmLogoutButton) {
    confirmLogoutButton.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/'; // Redirect to home page
    });
  }

  // Cancel logout
  if (cancelLogoutButton) {
    cancelLogoutButton.addEventListener('click', () => {
      logoutModal.style.display = 'none';
    });
  }
}

export function setupFormSubmissions() {
  // Define email input elements
  const loginEmailInput = document.getElementById('loginEmail');
  const registerEmailInput = document.getElementById('registerEmail');
  const loginPasswordInput = document.getElementById('loginPassword');
  const registerPasswordInput = document.getElementById('registerPassword');
  const loginEmailError = document.getElementById('emailError');
  const loginPasswordError = document.getElementById('passwordError');
  const registerEmailError = document.getElementById('registerEmailError');
  const registerPasswordError = document.getElementById('registerPasswordError');
  
  // Email validation on blur
  loginEmailInput.addEventListener('blur', () => {
    validateEmail(loginEmailInput.value, emailError);
  });

  loginPasswordInput.addEventListener('blur', () => {
    validatePassword(loginPasswordInput.value, passwordError);
  });

  registerEmailInput.addEventListener('blur', () => {
    validateEmail(registerEmailInput.value, registerEmailError);
  });

  registerPasswordInput.addEventListener('blur', () => {
    validatePassword(registerPasswordInput.value, registerPasswordError);
  });

  // Handle registration form submission
  document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;

    const isEmailValid = validateEmail(email, registerEmailError);
    const isPasswordValid = validatePassword(password, registerPasswordError);

    if (isEmailValid && isPasswordValid) {
      // Log the email and password being sent
      console.log('Registration request:', { email, password });

      // Submit the form if valid
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('アカウントが登録されました');
        registerModal.style.display = 'none';
        document.getElementById('registerForm').reset(); // Clear input fields
        registerEmailError.style.display = 'none'; // Hide email error
        registerPasswordError.style.display = 'none'; // Hide password error

        // Automatically log in the user after successful registration
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginResponse.json();
        if (loginResponse.ok) {
          localStorage.setItem('token', loginData.token);
          window.location.reload(); // Reload the page to update the menu
        } else {
          alert(loginData.message);
        }
      } else {
        alert(data.message);
      }
    }
  });

  // Handle login form submission
  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    const isEmailValid = validateEmail(email, loginEmailError);
    const isPasswordValid = validatePassword(password, loginPasswordError);

    if (isEmailValid && isPasswordValid) {
      // Log the email and password being sent
      console.log('Login request:', { email, password });

      // Submit the form if valid
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        alert('ログインに成功しました。');
        loginModal.style.display = 'none';
        document.getElementById('loginForm').reset(); // Clear input fields
        window.location.reload(); // Reload the page to update the menu
      } else {
        alert(data.message);
      }
    }
  });
}

export function setupFetchRecipe() {
  // Function to fetch recipe
  async function fetchRecipe(url) {
    try {
      const response = await fetch(`/api/recipe?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`Network response was not ok. Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    }
  }

  // Function to check if the user is logged in
  function isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  // Function to toggle favorite status
  async function toggleFavorite(recipeId, button) {
    const isFavorite = await checkIfFavorite(recipeId);
    if (isFavorite) {
      await fetch(`/api/favorites?recipeId=${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      button.querySelector('#emptyHeart').style.display = 'block';
      button.querySelector('#filledHeart').style.display = 'none';
    } else {
      await addToFavorites(recipeId);
      button.querySelector('#emptyHeart').style.display = 'none';
      button.querySelector('#filledHeart').style.display = 'block';
    }
  }

  // Function to check if a recipe is in the favorite list
  async function checkIfFavorite(recipeId) {
    try {
      const token = localStorage.getItem('token');
      // console.log('Token from localStorage:', token); // Log the token from localStorage
      const response = await fetch(`/api/favorites?recipeId=${recipeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.isFavorite;
    } catch (error) {
      console.error('Error checking if favorite:', error);
      return false;
    }
  }

  // Function to add a recipe to the favorite list
  async function addToFavorites(recipeId) {
    const token = localStorage.getItem('token');
    // console.log('Token from localStorage:', token); // Log the token from localStorage
    const response = await fetch(`/api/favorites?recipeId=${recipeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ recipeId })
    });
    const data = await response.json();
    return data;
  }

  // Function to remove a recipe from the favorite list
  async function removeFromFavorites(recipeId) {
    const token = localStorage.getItem('token');
    // console.log('Token from localStorage:', token); // Log the token from localStorage
    const response = await fetch(`/api/favorites?recipeId=${recipeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data;
  }
  
  // Add event listener for Fetch Recipe button
  document.getElementById('fetchRecipe').addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    const recipeNameBox = document.querySelector('.recipe-name-box');
    const checkAllButton = document.getElementById('checkAll');
    const searchSubstitutesButton = document.getElementById('searchSubstitutesButton');

    // Clear previous error message
    errorMessage.textContent = '';

    if (!url) {
      alert('URLを入力して「送信」を押して下さい');
      return;
    }

    const cookpadUrlPattern = /^https:\/\/cookpad\.com\/jp\/recipes\/\d+/;
    if (!cookpadUrlPattern.test(url)) {
      alert('クックパッドのレシピURLを入力してください');
      return;
    }

    const cleanedUrl = "https://cookpad.com/jp/recipes/"+url.match(/\/recipes\/(\d+)-/)[1];

    console.log(`Fetching recipe from URL: ${cleanedUrl}`);
    try {
      const data = await fetchRecipe(url);
      console.log('Recipe data received:', data);
      const ingredientList = document.getElementById('ingredientList');
      const stepList = document.getElementById('stepList');
      const servingsInfo = document.getElementById('servingsInfo');
      const adviceInfo = document.getElementById('adviceInfo');

      // Clear previous content
      ingredientList.innerHTML = '';
      stepList.innerHTML = '';
      servingsInfo.innerHTML = '';
      adviceInfo.innerHTML = '';
      recipeNameBox.innerHTML = '';

      // Display recipe name
      if (data.title) {
        const recipeNameText = document.createElement('h1');
        recipeNameText.id = 'recipeName';
        const cleanedUrl = "https://cookpad.com/jp/recipes/"+url.match(/\/recipes\/(\d+)-/)[1];
        recipeNameText.innerHTML = `<a href="${cleanedUrl}" target="_blank" style="color: inherit; text-decoration: none;">${data.title}</a>`;
        recipeNameBox.appendChild(recipeNameText);
        
        if (isLoggedIn()) {
          const favoriteButton = document.createElement('button');
          favoriteButton.classList.add('favorite-button');
          favoriteButton.innerHTML = `
            <svg id="emptyHeart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <svg id="filledHeart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="feather feather-heart" style="display: none;">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
            </svg>
          `;
          recipeNameBox.appendChild(favoriteButton);
          favoriteButton.addEventListener('click', () => toggleFavorite(data.id, favoriteButton));

          // Check if the recipe is already a favorite
          if (await checkIfFavorite(url)) {
            favoriteButton.querySelector('#emptyHeart').style.display = 'none';
            favoriteButton.querySelector('#filledHeart').style.display = 'block';
          }
        }
      }

      // Display servings information
      if (data.servings) {
        const servingsText = document.createElement('p');
        servingsText.textContent = `分量: ${data.servings}`;
        servingsInfo.appendChild(servingsText);
      }

      // Display ingredients
      if (!data.ingredients) {
        const noIngredientsMessage = document.createElement('p');
        noIngredientsMessage.textContent = '材料が見つかりませんでした。';
        noIngredientsMessage.classList.add('error-text');
        ingredientList.appendChild(noIngredientsMessage);
        checkAllButton.style.display = 'none'; // Hide the check-all button
        searchSubstitutesButton.style.display = 'none'; // Hide the search substitutes button
      } else {
        checkAllButton.style.display = 'inline-block';
        searchSubstitutesButton.style.display = 'inline-block'; 
        data.ingredients.forEach(ingredient => {
          const li = document.createElement('li');
          li.className = ingredient.class; // Set the class of the li element

          const ingredientContainer = document.createElement('div');
          ingredientContainer.classList.add('ingredient-container');

          const ingredientName = document.createElement('span');
          ingredientName.classList.add('ingredient-name');
          ingredientName.textContent = ingredient.name;

          if (li.classList.contains('not-headline')) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('ingredient-checkbox');

            const ingredientQuantity = document.createElement('bdi');
            ingredientQuantity.classList.add('ingredient-quantity');
            ingredientQuantity.textContent = ingredient.quantity;

            // Append checkbox, ingredient name, and ingredient quantity to the container
            ingredientContainer.appendChild(checkbox);
            ingredientContainer.appendChild(ingredientName);
            ingredientContainer.appendChild(ingredientQuantity);

            // Add event listener for unchecking checkboxes
            checkbox.addEventListener('change', (event) => {
              console.log('Checkbox changed:', event.target.checked);
              const ingredientElement = event.target.closest('.ingredient-container').parentElement;
              const containersToRemove = ingredientElement.querySelectorAll('.substitute-container, .no-substitutes-message, .multiple-substitutes-list');
              if (!event.target.checked) {
                containersToRemove.forEach(container => container.remove());
                console.log('Removed containers:', containersToRemove);
              }
            });
          } else {
            ingredientName.style.fontWeight = 'bold'; // Make headline bold
            ingredientContainer.appendChild(ingredientName);
          }

          // Append the container to the li
          li.appendChild(ingredientContainer);
          ingredientList.appendChild(li);
        });
      }

      // Display steps
      if (!data.steps.length) {
        const noStepsMessage = document.createElement('p');
        noStepsMessage.textContent = '手順が見つかりませんでした。';
        noStepsMessage.classList.add('error-text', 'no-steps-message');
        stepList.appendChild(noStepsMessage);
      } else {
        data.steps.forEach((step, stepIndex) => {
          const li = document.createElement('li');
          li.classList.add('step-item'); // Add step-item class

          // Remove leading numbers and optional whitespace from the step text
          const stepText = document.createElement('p');
          stepText.innerHTML = step.text.replace(/^\d+\s*/, ''); // Use innerHTML to handle <br> tags

          // Create a container for images
          const imageContainer = document.createElement('div');
          imageContainer.classList.add('image-container');

          // Append each image in the step
          step.images.forEach(imageSrc => {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = 'Step image';
            img.style.maxWidth = '100%';
            img.dataset.step = stepIndex; // Assign data-step attribute
            imageContainer.appendChild(img);
          });

          li.appendChild(imageContainer);
          li.appendChild(stepText);
          stepList.appendChild(li);
        });

      // Apply styles based on screen width
      applyStylesToStepImg();
    }

    // Display advice
    if (!data.advice) {
      const noAdviceMessage = document.createElement('p');
      noAdviceMessage.textContent = 'アドバイスが見つかりませんでした。';
      noAdviceMessage.classList.add('error-text');
      adviceInfo.appendChild(noAdviceMessage);
    } else {
      adviceInfo.innerHTML = data.advice; // Set the innerHTML to handle multiple <p> tags
    }

    // Turn off the Check All button
    document.getElementById('checkAll').checked = false;

    // Add event listeners to new images
    addImageEventListeners();
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      alert('レシピの取得に失敗しました。URLを確認してください。');
    }
  });

  return {
    fetchRecipe,
    checkIfFavorite,
    addToFavorites,
    removeFromFavorites,
  };
}

export function setupSearchSubstitutes() {
// Add event listener for Vegetarian Mode checkbox
document.getElementById('vegetarianMode').addEventListener('change', () => {
  const vegetarianMode = document.getElementById('vegetarianMode').checked;
  const description = document.getElementById('vegetarianDescription');
  if (vegetarianMode) {
    description.innerHTML = '肉、魚介類、卵、乳製品を含む<br>代用品が提示されません';
  } else {
    description.innerHTML = '肉、魚介類等も含め<br>全ての代用品が提示されます';
  }
});

  // Function to extract and normalize ingredient names
  function extractText(input) {
    const pattern = /[★●]?([^\(\)（）]+)(?:\（.*?\）|\(.*?\))?/;
    const match = input.match(pattern);
    return match ? match[1].trim() : input;
  }

  // Add event listener for search Substitutes button
  document.getElementById('searchSubstitutesButton').addEventListener('click', () => {
    const checkedIngredients = Array.from(document.querySelectorAll('.ingredient-checkbox:checked'))
      .map(checkbox => checkbox.nextElementSibling.textContent.trim());

    if (checkedIngredients.length === 0) {
      alert('１つ以上の材料を選択してください。');
      return;
    }

    const vegetarianMode = document.getElementById('vegetarianMode').checked;

    checkedIngredients.forEach(ingredient => {
      const cleanedIngredient = extractText(ingredient);
      const ingredientElement = Array.from(document.querySelectorAll('.ingredient-name')).
        find(el => el.textContent.trim() === ingredient);
      fetch(`/api/substitutes?ingredient=${encodeURIComponent(cleanedIngredient)}`)
        .then(response => {
          if (response.status === 404) {
            return null; // Handle 404 response
          }
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.json();
        })
        .then(substitutes => {
          displaySubstitutes(substitutes, ingredientElement, vegetarianMode, cleanedIngredient);
        })
        .catch(error => {
          console.error('Error fetching substitutes:', error);
          alert('Error fetching substitutes: ' + error.message);
        });
    });
  });

  // Add event listener for Check All button
  document.getElementById('checkAll').addEventListener('change', (event) => {
    const checkboxes = document.querySelectorAll('.ingredient-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = event.target.checked;
      const ingredientElement = checkbox.closest('.ingredient-container').parentElement;
      const containersToRemove = ingredientElement.querySelectorAll('.substitute-container, .no-substitutes-message, .multiple-substitutes-list');
      if (!event.target.checked) {
        containersToRemove.forEach(container => container.remove());
        console.log('Removed containers:', containersToRemove);
      }
    });
  });
}