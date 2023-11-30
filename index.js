const form = document.getElementById('custom-chrome-ext-form'),
inputEl = document.getElementById('input-el'),
saveBtn = document.getElementById('save-btn'),
saveTabBtn = document.getElementById('saveTab-btn'),
deleteBtn = document.getElementById('delete-btn'),
ulEl = document.getElementById('ul-el'),
inModalCancelBtn = document.getElementById('inmodal-cancel-btn');

let trackedUrls = [];

const storedTrackedUrls = JSON.parse(window.localStorage.getItem('trackedUrls'));
const deleteTrackedUrlHash = '53qqyP1InJYXSNm/wRiqksP6hEB2Zy7nwmFJAlqiwv4=%';

// Class Types

  /**
   * Constructor function for creating an instance of the Modal class.
   *
   * @param {string} type - The type of the modal.
   * @param {string} message - The message to be displayed in the modal.
   * @throws {Error} Throws an error if type or message is not provided.
   */
class Modal {
  constructor(type, message) {
    if (!type || !message) {
        throw new Error(`modal properties type and message are required parameters`);
    }

    this.type = type,
    this.message = message;

    const modal = document.getElementById('custom-prompt'),
    overlay = document.getElementById('overlay'); 

    // switch case for different types
    switch(this.type) {
        case 'info':
            modal.classList.add('info');
            break;
        case 'delete':
            modal.classList.add('delete');
            break;
        case 'error':
            modal.classList.add('error');
            break;
    }

    this.show = function() {
      modal.getElementsByClassName('prompt-label')[0].innerHTML = this.message;
      modal.style.display = 'block';
      overlay.style.display = 'block';
    };
  }
}

// Event Listeners
form.addEventListener('submit', handleForm);

deleteBtn.addEventListener('click', function() {
  if (trackedUrls.length > 0) {
    try {
      const deleteModal = new Modal('delete','Are you sure you want to delete all records?');

      deleteModal.show();
      
      const actionYesBtn = document.getElementById('inmodal-yes-btn');
      
      actionYesBtn.addEventListener('click', function() {
        window.localStorage.removeItem('trackedUrls');
        trackedUrls = [];
        renderTrackedUrls(trackedUrls);
        hideCustomPrompt();
      });
    } catch (error) {
      console.error(error.message);
    }
  }
});

saveTabBtn.addEventListener('click', function() {
  getActiveTab().then(function(url) {
    if (url) {
      if (isUrlExisting(url) === false) {
        trackedUrls.push(url);
        window.localStorage.setItem('trackedUrls', JSON.stringify(trackedUrls));
        renderTrackedUrls(trackedUrls);
      } else {
        alert('Record already exists in the list!');
      }
    }
  })
});

inModalCancelBtn.addEventListener('click', hideCustomPrompt);

// API's

/**
 * Retrieves the URL of the active tab in the current window.
 *
 * @return {Promise<string>} A Promise that resolves with the URL of the active tab,
 * or rejects with an error message if no active tab is found.
 */
function getActiveTab() {
  return new Promise(function(resolve, reject) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length > 0) {
        resolve(tabs[0].url);
      } else {
        reject('No active tab found.');
      }
    });
  });
}

// Check if local storage exists if so, then render the tracked urls
if (storedTrackedUrls) {
  trackedUrls = storedTrackedUrls;
  renderTrackedUrls(trackedUrls);
}

/**
 * Handles the form submission event.
 *
 * @param {Event} event - The form submission event.
 * @return {undefined} This function does not return a value.
 */
function handleForm(event) {
  event.preventDefault();
  saveInput();
}

/**
 * Saves the input value to local storage and updates the list of tracked URLs.
 *
 * @param {HTMLElement} inputEl - The input element that contains the value to be saved.
 * @return {void} This function does not return a value.
 */
function saveInput() {
  // save input to local storage
  if (inputEl.value && isUrlExisting(inputEl.value) === false) {
    trackedUrls.push(inputEl.value);

    // set localstorage for tracked urls
    window.localStorage.setItem('trackedUrls', JSON.stringify(trackedUrls));
    inputEl.value = '';
    renderTrackedUrls(trackedUrls);
    inputEl.textContent = '';
  } else {
    alert('Record already exists in the list!');
  }
}

/**
 * Check if a given URL exists in the trackedUrls array.
 *
 * @param {string} url - The URL to check.
 * @return {boolean} Returns true if the URL exists in the trackedUrls array, otherwise returns false.
 */
function isUrlExisting(url) {
  return trackedUrls.indexOf(url) !== -1;
}

/**
 * Renders the tracked URLs by generating a list of HTML elements and updating the inner HTML of a given unordered list element.
 *
 * @param {Array} trackedUrls - An array of tracked URLs.
 * @return {undefined} This function does not return a value.
 */
function renderTrackedUrls(trackedUrls) {
  let listItems = '';
  for (let i = 0; i < trackedUrls.length; i++) {
    listItems += `
      <li>
        <a target='_blank' href='${trackedUrls[i]}'>
          ${trackedUrls[i]}
        </a>
        <button class="delete-url-btn" id="delete-url-btn" data-custom="${trackedUrls[i]}" integrity="${deleteTrackedUrlHash}">x</button>
      </li>
    `;
  }
  ulEl.innerHTML = listItems;

  const deleteUrlBtns = document.querySelectorAll('.delete-url-btn');
  deleteUrlBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const url = this.getAttribute('data-custom');
      deleteTrackedUrl(url);
    });
  })

}

function deleteTrackedUrl(trackedUrl) {
  const urlIndex = trackedUrls.indexOf(trackedUrl);
  trackedUrls.splice(urlIndex, 1);
  window.localStorage.setItem('trackedUrls', JSON.stringify(trackedUrls));
  renderTrackedUrls(trackedUrls);

  if (trackedUrls.length === 0) {
    window.localStorage.removeItem('trackedUrls');
  }
}

/**
 * Hides the custom prompt modal and overlay.
 *
 * @param {type} None - No parameters needed.
 * @return {type} None - No return value.
 */
function hideCustomPrompt() {
  const modal = document.getElementById('custom-prompt'),
  overlay = document.getElementById('overlay');
  modal.style.display = 'none';
  overlay.style.display = 'none';
  modal.removeAttribute('class');
}