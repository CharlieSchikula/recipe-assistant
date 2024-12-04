// Function to display a message when no substitutes are found or when multiple substitutes are found
export function displaySubstitutes(substitutes, ingredientElement, vegetarianMode, cleanedIngredient) {
  // Remove any existing substitution containers
  const liElement = ingredientElement.closest('li'); // Find the closest li element
  if (liElement) {
    liElement.querySelectorAll('.substitute-container, .no-substitutes-message').forEach(el => el.remove());
  }

  const substituteContainer = document.createElement('div');
  substituteContainer.classList.add('substitute-container');

  // Ensure substitutes is always an array
  substitutes = substitutes || [];

  const filteredSubstitutes = vegetarianMode
    ? substitutes.filter(substitute => substitute.vegetarian)
    : substitutes;

  if (!filteredSubstitutes || filteredSubstitutes.length === 0) {
    const noSubstitutesMessage = document.createElement('div');
    noSubstitutesMessage.textContent = `${cleanedIngredient}の代用品が見つかりませんでした。`;
    console.log('No substitutes found for:', cleanedIngredient);
    noSubstitutesMessage.classList.add('no-substitutes-message');
    liElement.appendChild(noSubstitutesMessage); // Append message after ingredient-container
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
  } else {
    const multipleSubstitutesText = document.createElement('span');
    multipleSubstitutesText.textContent = '複数の代用品が見つかりました';
    multipleSubstitutesText.classList.add('multiple-substitutes-list');
    multipleSubstitutesText.addEventListener('click', () => {
      openSubstituteModal(filteredSubstitutes, substituteContainer, cleanedIngredient);
    });
    substituteContainer.appendChild(multipleSubstitutesText);
  }

  if (liElement) {
    liElement.appendChild(substituteContainer); // Append substitute-container to the li element
  } else {
    ingredientElement.appendChild(substituteContainer); // Fallback in case liElement is not found
  }
}

// Function to open the modal to select a substitute when multiple substitutes are found
function openSubstituteModal(substitutes, substituteContainer, cleanedIngredient) {
  const modal = document.getElementById('substituteModal');
  const substituteList = document.getElementById('substituteList');
  const closeModal = document.getElementById('closeSubstituteModal');

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

  // Show the modal
  modal.style.display = 'block';

  // Close the modal when the close button is clicked
  closeModal.onclick = () => {
    modal.style.display = 'none';
  };

  // Close the modal when clicking outside of it
  window.onclick = (event) => {
    if (event.target === modal) {
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