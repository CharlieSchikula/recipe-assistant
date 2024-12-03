// Function to render the wide screen menu for logged in users
export function renderWideScreenMenu() {
  const registerButton = document.getElementById('registerButton');
  const loginButton = document.getElementById('loginButton');
  const logoutButton = document.getElementById('logoutButton');
  const wideScreenMenu = document.querySelector('.wide-screen-menu ul');

  if (isLoggedIn()) {
    const email = getUserEmail();
    console.log('Email:', email); // Debugging log
    if (email) {
      registerButton.style.display = 'none';
      loginButton.style.display = 'none';
      logoutButton.style.display = 'block';

      // Clear existing menu items except the logout button
      wideScreenMenu.innerHTML = '';

      // Add menu items
      wideScreenMenu.innerHTML += `
        <hr>
        <li class="login-message">
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
export function renderHamburgerMenu() {
  const hamburgerRegisterLink = document.getElementById('hamburgerRegisterLink');
  const hamburgerLoginLink = document.getElementById('hamburgerLoginLink');
  const hamburgerLogoutLink = document.getElementById('hamburgerLogoutLink');
  const menu = document.querySelector('.hamburger-menu ul');

  if (isLoggedIn()) {
    const email = getUserEmail();
    console.log('Email:', email); // Debugging log
    if (email) {
      hamburgerRegisterLink.style.display = 'none';
      hamburgerLoginLink.style.display = 'none';
      hamburgerLogoutLink.style.display = 'block';

      // Clear existing menu items except the logout link
      menu.innerHTML = '';

      // Add menu items
      menu.innerHTML += `
        <li><a href="/favorite-recipes">お気に入りのレシピ</a></li>
        <li><a href="/manage-my-substitutes">my代用品を管理</a></li>
        <hr>
        <li class="login-message" style="padding: 10px; font-size: 1rem; line-height: 1.5rem;">
          <span style="color: blue; text-decoration: underline;">${email}</span> <br> でログイン中
        </li>
      `;

      // Append the logout link as the last item
      menu.appendChild(hamburgerLogoutLink);
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

// Function to check if the user is logged in
function isLoggedIn() {
  const token = localStorage.getItem('token');
  return token !== null;
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