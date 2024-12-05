// Function to check if the user is logged in
function isLoggedIn() {
  return !!localStorage.getItem('token');
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
export function renderWideScreenMenu() {
  const registerButton = document.getElementById('registerButton');
  const loginButton = document.getElementById('loginButton');
  const logoutButton = document.getElementById('logoutButton');
  const wideScreenMenu = document.querySelector('.wide-screen-menu ul');

  if (isLoggedIn()) {
    const email = getUserEmail();
    if (email) {
      registerButton.style.display = 'none';
      loginButton.style.display = 'none';
      logoutButton.style.display = 'block';

      // Clear existing menu items except the logout button
      wideScreenMenu.innerHTML = '';

      // Add menu items
      wideScreenMenu.innerHTML += `
        <hr class="logged-in">
        <li class="login-message logged-in">
          <span style="color: blue; text-decoration: underline;">${email}</span> でログイン中
        </li>
      `;

      // Append the logout button as the last item
      wideScreenMenu.appendChild(logoutButton);
    } else {
      console.error('Email is undefined');
    }
  }
}

// Function to render the hamburger menu for logged in users
export function renderHamburgerMenu(currentPage) {
  const hamburgerRegisterLink = document.getElementById('hamburgerRegisterLink');
  const hamburgerLoginLink = document.getElementById('hamburgerLoginLink');
  const hamburgerLogoutLink = document.getElementById('hamburgerLogoutLink');
  const menu = document.querySelector('.hamburger-menu ul');

  if (isLoggedIn()) {
    const email = getUserEmail();
    console.log('UserEmail:', email);
    if (email) {
      hamburgerRegisterLink.style.display = 'none';
      hamburgerLoginLink.style.display = 'none';
      hamburgerLogoutLink.style.display = 'block';

      // Clear existing menu items except the logout link
      menu.innerHTML = '';

      // Update menu items based on the current page
      if (currentPage === 'favorite-recipes') {
        menu.innerHTML = `
            <li><a href="/" style="font-weight: bold; color: darkcyan;">ホーム</a></li>
            <li class="logged-in"><a href="/manage-my-substitutes">my代用品を管理</a></li>
            <hr class="logged-in">
            <li class="login-message logged-in" style="padding: 10px; font-size: 1rem; line-height: 1.5rem;">
              <span style="color: blue; text-decoration: underline;">${email}</span> <br> でログイン中
            </li>
          `;
        // Append the logout link as the last item
        menu.appendChild(hamburgerLogoutLink);
      } else if (currentPage === 'manage-my-substitutes') {
        menu.innerHTML = `
            <li class="logged-in"><a href="/" style="font-weight: bold; color: darkcyan;">ホーム</a></li>
            <li class="logged-in"><a href="/favorite-recipes">お気に入りのレシピ</a></li>
            <hr class="logged-in">
            <li class="login-message logged-in" style="padding: 10px; font-size: 1rem; line-height: 1.5rem;">
              <span style="color: blue; text-decoration: underline;">${email}</span> <br> でログイン中
            </li>
          `;
        // Append the logout link as the last item
        menu.appendChild(hamburgerLogoutLink);
      } else {
        // Add menu items
        menu.innerHTML += `
          <li class="logged-in"><a href="/favorite-recipes">お気に入りのレシピ</a></li>
          <li class="logged-in"><a href="/manage-my-substitutes">my代用品を管理</a></li>
          <hr class="logged-in">
          <li class="login-message logged-in" style="padding: 10px; font-size: 1rem; line-height: 1.5rem;">
            <span style="color: blue; text-decoration: underline;">${email}</span> <br> でログイン中
          </li>
        `;

        // Append the logout link as the last item
        menu.appendChild(hamburgerLogoutLink);
      } 
    } else {
      console.error('Email is undefined');
    }
  }
}

// Function to handle logout
export function handleLogout() {
  localStorage.removeItem('token');
  window.location.reload(); // Reload the page to update the menu
}