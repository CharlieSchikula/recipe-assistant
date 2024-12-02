document.addEventListener('DOMContentLoaded', () => {
  // Function to check if the user is logged in
  function isLoggedIn() {
    const token = localStorage.getItem('token');
    return token !== null;
  }

  // Function to handle logout
  function handleLogout() {
    localStorage.removeItem('token');
    window.location.reload(); // Reload the page to update the menu
  }

  // Function to get the user's email from the token
  function getUserEmail() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email;
    } catch (e) {
      console.error('Error parsing token:', e);
      return null;
    }
  }

  // Function to render the wide screen menu for logged in users
  function renderWideScreenMenu() {
    const registerButton = document.getElementById('registerButton');
    const loginButton = document.getElementById('loginButton');
    const wideScreenMenu = document.querySelector('.wide-screen-menu ul');

    if (isLoggedIn()) {
      const email = getUserEmail();
      console.log('Email:', email); // Debugging log
      if (email) {
        registerButton.style.display = 'none';
        loginButton.style.display = 'none';
        wideScreenMenu.innerHTML += `
          <li class="login-message">
            <span style="color: blue; text-decoration: underline;">${email}</span> でログイン中
          </li>
          <li id="logoutButton">ログアウト</li>
        `;
      } else {
        console.error('Email is undefined');
      }
    }
  }

  // Function to render the hamburger menu for logged in users
  function renderHamburgerMenu() {
    const hamburgerRegisterLink = document.getElementById('hamburgerRegisterLink');
    const hamburgerLoginLink = document.getElementById('hamburgerLoginLink');
    const menu = document.querySelector('.hamburger-menu ul');

    if (isLoggedIn()) {
      const email = getUserEmail();
      console.log('Email:', email); // Debugging log
      if (email) {
        hamburgerRegisterLink.style.display = 'none';
        hamburgerLoginLink.style.display = 'none';
        menu.innerHTML += `
          <li><a href="/favorite-recipes">お気に入りのレシピ</a></li>
          <li><a href="/manage-my-substitutes">my代用品を管理</a></li>
          <hr>
          <li class="login-message" style="padding: 10px; font-size: 1rem; line-height: 1.5rem;">
            <span style="color: blue; text-decoration: underline;">${email}</span> <br> でログイン中
          </li>
          <li><a href="#" id="logoutLink">ログアウト</a></li>
        `;
      } else {
        console.error('Email is undefined');
      }
    }
  }

  // Function to validate email
  function validateEmail(email, emailErrorElement) {
    if (!email) {
      emailErrorElement.textContent = 'メールアドレスを入力してください';
      emailErrorElement.style.display = 'block';
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailErrorElement.textContent = 'メールアドレス形式が誤っています';
      emailErrorElement.style.display = 'block';
      return false;
    } else {
      emailErrorElement.style.display = 'none';
      return true;
    }
  }

  // Function to validate password
  function validatePassword(password, passwordErrorElement) {
    if (!password) {
      passwordErrorElement.textContent = 'パスワードを入力してください';
      passwordErrorElement.style.display = 'block';
      return false;
    } else if (password.length < 8) {
      passwordErrorElement.textContent = '8文字以上で入力してください';
      passwordErrorElement.style.display = 'block';
      return false;
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      passwordErrorElement.textContent = '大文字、小文字、数字を含めて入力してください';
      passwordErrorElement.style.display = 'block';
      return false;
    } else {
      passwordErrorElement.style.display = 'none';
      return true;
    }
  }

  // Function to open the modal to select a substitute when multiple substitutes are found
  function openSubstituteModal(substitutes, substituteContainer, cleanedIngredient) {
    const modal = document.getElementById('substituteModal');
    const substituteList = document.getElementById('substituteList');
    const closeModal = document.getElementsByClassName('close')[0];

    // Clear previous substitutes
    substituteList.innerHTML = '';

    // Add substitutes to the list as radio buttons
    substitutes.forEach((substitute, index) => {
      const listItem = document.createElement('li');
      const radioInput = document.createElement('input');
      radioInput.type = 'radio';
      radioInput.name = 'substitute';
      radioInput.value = substitute.substituteName;
      radioInput.id = `substitute-${index}`;
      const label = document.createElement('label');
      label.htmlFor = `substitute-${index}`;
      const ingredientNameStyled = `<span class="ingredient-name-styled">${cleanedIngredient}</span>`;
      label.innerHTML = `${ingredientNameStyled} の分量 <span class="portion">${substitute.originalPortion}</span> に対して <span class="substitute-name">${substitute.substituteName}</span> の分量 <span class="portion">${substitute.substitutePortion}</span>`;
      if (substitute.vegetarian) {
        const vegBox = document.createElement('span');
        vegBox.textContent = 'べジ';
        vegBox.classList.add('veg-box');
        label.appendChild(vegBox);
      }
      listItem.appendChild(radioInput);
      listItem.appendChild(label);
      substituteList.appendChild(listItem);
    });

    modal.style.display = 'block';

    closeModal.onclick = () => {
      modal.style.display = 'none';
    };

    window.onclick = (event) => {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    };

    document.getElementById('selectSubstitute').onclick = () => {
      const selectedSubstitute = document.querySelector('input[name="substitute"]:checked');
      if (selectedSubstitute) {
        const selectedLabel = selectedSubstitute.nextElementSibling;
        substituteContainer.innerHTML = `${selectedLabel.innerHTML}`;
        substituteContainer.classList.add('substitute-container'); // Apply the class for styling
        modal.style.display = 'none';
      } else {
        alert('代用品を選択してください。');
      }
    };
  }

  // Function to display a message when no substitutes are found or when multiple substitutes are found
  function displaySubstitutes(substitutes, ingredientElement, vegetarianMode, cleanedIngredient) {
    // Remove any existing substitution containers
    const existingContainers = ingredientElement.parentElement.querySelectorAll('.substitute-container, .no-substitutes-message, .clickable-text');
    existingContainers.forEach(container => container.remove());

    const substituteContainer = document.createElement('div');
    substituteContainer.classList.add('substitute-container');

    const filteredSubstitutes = vegetarianMode
      ? substitutes.filter(substitute => substitute.vegetarian)
      : substitutes;

    if (!filteredSubstitutes || filteredSubstitutes.length === 0) {
      const noSubstitutesMessage = document.createElement('div');
      noSubstitutesMessage.textContent = '代用品が見つかりませんでした。';
      noSubstitutesMessage.classList.add('no-substitutes-message');
      if (ingredientElement) {
        ingredientElement.parentElement.appendChild(noSubstitutesMessage); // Append message after ingredient-container
      }
    } else if (filteredSubstitutes.length === 1) {
      const originalPortion = document.createElement('span');
      originalPortion.classList.add('portion');
      originalPortion.textContent = filteredSubstitutes[0].originalPortion;
    
      const substitutePortion = document.createElement('span');
      substitutePortion.classList.add('portion');
      substitutePortion.textContent = filteredSubstitutes[0].substitutePortion;
    
      const substituteName = document.createElement('span');
      substituteName.classList.add('substitute-name');
      substituteName.textContent = filteredSubstitutes[0].substituteName || 'No Info';
    
      const ingredientNameStyled = `<span class="ingredient-name-styled">${cleanedIngredient}</span>`;
      substituteContainer.innerHTML = `${ingredientNameStyled} の分量 ${originalPortion.outerHTML} あたり ${substituteName.outerHTML} の分量 ${substitutePortion.outerHTML}`;
    
      if (filteredSubstitutes[0].vegetarian) {
        const vegBox = document.createElement('span');
        vegBox.textContent = 'べジ';
        vegBox.classList.add('veg-box');
        substituteContainer.appendChild(vegBox);
      }
      ingredientElement.parentElement.appendChild(substituteContainer); // Append container after ingredient-container    
    } else {
      const multipleSubstitutesText = document.createElement('span');
      multipleSubstitutesText.textContent = '複数の代用品が見つかりました';
      multipleSubstitutesText.classList.add('clickable-text');
      multipleSubstitutesText.addEventListener('click', () => {
        openSubstituteModal(filteredSubstitutes, substituteContainer, cleanedIngredient);
      });
      substituteContainer.appendChild(multipleSubstitutesText);
      ingredientElement.parentElement.appendChild(substituteContainer); // Append container after ingredient-container
    }
  }

  // Function to apply styles based on screen width
  function applyStyles() {
    const stepList = document.getElementById('stepList');
    const steps = stepList.querySelectorAll('.step-item');

    steps.forEach(step => {
      const imageContainer = step.querySelector('.image-container');
      const images = imageContainer.querySelectorAll('img');

      if (window.innerWidth >= 769) {
        // Apply styles for wide screens
        let currentIndex = 0;
        const showImage = (index) => {
          images.forEach((img, i) => {
            img.style.display = i === index ? 'block' : 'none';
          });
        };
        showImage(currentIndex);

        imageContainer.addEventListener('click', () => {
          currentIndex = (currentIndex + 1) % images.length;
          showImage(currentIndex);
        });
      } else {
        // Apply styles for narrow screens
        images.forEach(img => {
          img.style.display = 'block';
        });
      }
    });
  }

  // Call the functions to render the menus
  renderWideScreenMenu();
  renderHamburgerMenu();

  // Add event listener for the hamburger button and menu for base or logout status
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

  // Add event listeners for the registration, login and logout modals for base status
  // Get the modal elements
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
  if (redirectToRegister) {
    redirectToRegister.addEventListener('click', (event) => {
      event.preventDefault();
      loginModal.style.display = 'none';
      registerModal.style.display = 'block';
      document.getElementById('loginForm').reset(); // Clear input fields
      emailError.style.display = 'none'; // Hide email error
      passwordError.style.display = 'none'; // Hide password error
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
  const logoutButton = document.getElementById('logoutButton');
  const logoutLink = document.getElementById('logoutLink');

  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      logoutModal.style.display = 'block';
    });
  }

  if (logoutLink) {
    logoutLink.addEventListener('click', (event) => {
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

  if (cancelLogoutButton) {
    cancelLogoutButton.addEventListener('click', () => {
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
      handleLogout();
    });
  }

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

  // Add event listener for Vegetarian Mode checkbox
  document.getElementById('vegetarianMode').addEventListener('change', () => {
    const vegetarianMode = document.getElementById('vegetarianMode').checked;
    const description = document.getElementById('vegetarianDescription');
    if (vegetarianMode) {
      description.textContent = '肉、魚介類、卵、乳製品を含む代用品が提示されません';
    } else {
      description.textContent = '肉、魚介類等も含めた全ての代用品が提示されます';
    }
  });

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

  // Add event listener for Fetch Recipe button
  document.getElementById('fetchRecipe').addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    const recipeNameElement = document.getElementById('recipeName');
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

    console.log(`Fetching recipe from URL: ${url}`);
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
      recipeNameElement.innerHTML = '';

      // Display recipe name
      if (data.title) {
        const recipeNameText = document.createElement('h1');
        recipeNameText.textContent = data.title;
        recipeNameElement.appendChild(recipeNameText);
        recipeNameElement.innerHTML = `<a href="${url}" target="_blank" style="color: inherit; text-decoration: none;">${data.title}</a>`;
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
              const containersToRemove = ingredientElement.querySelectorAll('.substitute-container, .no-substitutes-message, .clickable-text');
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
        data.steps.forEach(step => {
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
            imageContainer.appendChild(img);
          });

          li.appendChild(imageContainer);
          li.appendChild(stepText);
          stepList.appendChild(li);

        });

        // Apply styles based on screen width
        applyStyles();
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
    } catch(error)  {
      console.error('There was a problem with the fetch operation:', error);
      alert('レシピの取得に失敗しました。URLを確認してください。');
    }
  });

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
      const cleanedIngredient = ingredient.replace(/[^\p{L}\p{N}\p{Zs}]/gu, ''); // Remove non-word characters except Japanese characters
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
          const ingredientElement = Array.from(document.querySelectorAll('.ingredient-name'))
            .find(el => el.textContent.replace(/[^\p{L}\p{N}\p{Zs}]/gu, '') === cleanedIngredient);
        
          if (!ingredientElement) {
            console.error('Ingredient element not found for:', cleanedIngredient);
            displaySubstitutes([], null, vegetarianMode); // Ensure message is displayed
            return;
          }
        
          if (!substitutes) {
            console.error('No substitutes found for:', cleanedIngredient);
            displaySubstitutes([], ingredientElement.parentElement, vegetarianMode); // Ensure message is displayed
            return;
          }
        
          displaySubstitutes(substitutes, ingredientElement.parentElement, vegetarianMode, cleanedIngredient);
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
      const containersToRemove = ingredientElement.querySelectorAll('.substitute-container, .no-substitutes-message, .clickable-text');
      if (!event.target.checked) {
        containersToRemove.forEach(container => container.remove());
        console.log('Removed containers:', containersToRemove);
      }
    });
  });

  // Apply styles based on screen width
  function applyStyles() {
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
          const leftArrow = document.createElement('div');
          leftArrow.classList.add('left-arrow');
          leftArrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left-circle" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"/></svg>';
          imageContainer.appendChild(leftArrow);

          const rightArrow = document.createElement('div');
          rightArrow.classList.add('right-arrow');
          rightArrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-circle" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"/></svg>';
          imageContainer.appendChild(rightArrow);

          const indicators = document.createElement('div');
          indicators.classList.add('image-indicators');
          images.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('image-indicator');
            if (index === currentIndex) {
              indicator.classList.add('active');
            }
            indicators.appendChild(indicator);
          });
          imageContainer.appendChild(indicators);

          const showImage = (index) => {
            images.forEach((img, i) => {
              img.style.display = i === index ? 'block' : 'none';
            });
            imageContainer.classList.toggle('has-prev', index > 0);
            imageContainer.classList.toggle('has-next', index < images.length - 1);
            indicators.querySelectorAll('.image-indicator').forEach((indicator, i) => {
              indicator.classList.toggle('active', i === index);
            });
          };
          showImage(currentIndex);

          leftArrow.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
          });

          rightArrow.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
          });
        } else {
          // Remove arrows and indicators for narrow screens
          const leftArrow = imageContainer.querySelector('.left-arrow');
          const rightArrow = imageContainer.querySelector('.right-arrow');
          const indicators = imageContainer.querySelector('.image-indicators');
          if (leftArrow) leftArrow.remove();
          if (rightArrow) rightArrow.remove();
          if (indicators) indicators.remove();

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

  // Apply styles on initial load
  applyStyles();
});

