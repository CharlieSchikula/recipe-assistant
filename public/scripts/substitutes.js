// Function to display substitutes
export function displaySubstitutes(substitutes, ingredientElement, vegetarianMode, cleanedIngredient) {
  const { mySubstitutes, basicSubstitutes } = substitutes;

  // Tag mySubstitutes to distinguish them from basicSubstitutes
  const taggedMySubstitutes = mySubstitutes.map(sub => ({ ...sub, isUserSubstitute: true }));
  const taggedBasicSubstitutes = basicSubstitutes.map(sub => ({ ...sub, isUserSubstitute: false }));

  // Combine and filter substitutes
  let combinedSubstitutes = [...taggedMySubstitutes, ...taggedBasicSubstitutes];
  let filteredSubstitutes = vegetarianMode
    ? combinedSubstitutes.filter(substitute => substitute.vegetarian)
    : combinedSubstitutes;

  // Remove any existing substitution containers
  const liElement = ingredientElement.closest('li'); // Find the closest li element
  if (liElement) {
    liElement.querySelectorAll('.substitute-container, .no-substitutes-message').forEach(el => el.remove());
  }

  const substituteContainer = document.createElement('div');
  substituteContainer.classList.add('substitute-container');

  if (!filteredSubstitutes || filteredSubstitutes.length === 0) {
    const noSubstitutesMessage = document.createElement('div');
    noSubstitutesMessage.textContent = `${cleanedIngredient}の用品が見つかりませんでした。`;
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
      openSubstitutesModal(filteredSubstitutes, cleanedIngredient, substituteContainer);
    });
    substituteContainer.appendChild(multipleSubstitutesText);
  }

  liElement.appendChild(substituteContainer); // Append the substitute container to the li element
}

// Function to open the modal to select a substitute when multiple substitutes are found
function openSubstitutesModal(filteredSubstitutes, cleanedIngredient, substituteContainer) {
  const substitutesModal = document.getElementById('substitutesModal');
  const substitutesList = document.getElementById('substitutesList');
  substitutesList.innerHTML = '';

  // Add substitutes to the list as radio buttons
  filteredSubstitutes.forEach(substitute => {
    const listItem = document.createElement('li');
    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = 'substitute';
    radioInput.value = substitute.substituteName;
    radioInput.id = `substitute-${substitute.substituteName}`;

    const label = document.createElement('label');
    label.htmlFor = radioInput.id;
    label.innerHTML = `
      ${substitute.isUserSubstitute ? '<span class="star">★</span>' : ''}
      <span class="ingredient-name-styled">${cleanedIngredient}</span> の分量 <span class="portion">${substitute.originalPortion}</span> に対して <span class="substitute-name">${substitute.substituteName}</span> の分量 <span class="portion">${substitute.substitutePortion}</span>
    `;

    if (substitute.vegetarian) {
      const vegBox = document.createElement('span');
      vegBox.textContent = 'べジ';
      vegBox.classList.add('veg-box');
      label.appendChild(vegBox);
    }
    listItem.appendChild(radioInput);
    listItem.appendChild(label);
    substitutesList.appendChild(listItem);
  });

  // Show the modal
  substitutesModal.style.display = 'block';

  // Close the modal when the close button is clicked
  const closeModal = document.getElementById('closeSubstitutesModal');
  if (closeModal) {
    closeModal.onclick = () => {
      substitutesModal.style.display = 'none';
    };
  }

  // Close the modal when clicking outside of it
  window.onclick = (event) => {
    if (event.target === substitutesModal) {
      substitutesModal.style.display = 'none';
    }
  };

  // Handle the selection of a substitute
  const selectSubstituteButton = document.getElementById('selectSubstituteButton');
  if (selectSubstituteButton) {
    selectSubstituteButton.onclick = (event) => {
      event.preventDefault(); // Prevent the default action
      const selectedSubstitute = document.querySelector('input[name="substitute"]:checked');
      if (selectedSubstitute) {
        console.log('Selected substitute:', selectedSubstitute.value);
        const selectedLabel = selectedSubstitute.nextElementSibling;
        substituteContainer.innerHTML = `${selectedLabel.innerHTML}`;
        substituteContainer.classList.add('substitute-container'); // Apply the class for styling
        substitutesModal.style.display = 'none'; // Close the modal after selection

        // Append the substituteContainer to the correct parent element
        const liElement = document.querySelector(`li[data-ingredient="${cleanedIngredient}"]`);
        if (liElement) {
          liElement.appendChild(substituteContainer);
        }
      }
    };
  }

  // Handle cancel action for the modal
  const cancelSelectButton = document.getElementById('cancelSelectButton');
  if (cancelSelectButton) {
    cancelSelectButton.onclick = (event) => {
      event.preventDefault(); // Prevent the default action
      substitutesModal.style.display = 'none';
    };
  }
}

// Add event listener to close button for the modal
document.addEventListener('DOMContentLoaded', () => {
  const closeModal = document.getElementById('closeSubstitutesModal');
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      const substitutesModal = document.getElementById('substitutesModal');
      if (substitutesModal) {
        substitutesModal.style.display = 'none';
      }
    });
  }
});