// Function to validate email
export function validateEmail(email, emailErrorElement) {
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
export function validatePassword(password, passwordErrorElement) {
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
