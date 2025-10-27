/**
 * Sinónimos de Hablar - Interactive Spanish Verb Learning Application
 * Main application logic for filtering, rendering, and audio playback
 */

// ============================================================================
// Application State
// ============================================================================

const state = {
  synonyms: [],
  imageCredits: {},
  audioMetadata: {},
  currentAudio: null,
  filters: {
    search: '',
    formality: 'all',
    context: 'all'
  }
};

// ============================================================================
// Data Loading
// ============================================================================

/**
 * Load all required data files on application initialization
 */
async function loadApplicationData() {
  try {
    // Load all data in parallel
    const [synonymsData, creditsData, audioData] = await Promise.all([
      fetch('./src/data/synonyms.json').then(response => {
        if (!response.ok) throw new Error('Failed to load synonyms.json');
        return response.json();
      }),
      fetch('./src/data/image_credits.json').then(response => {
        if (!response.ok) throw new Error('Failed to load image_credits.json');
        return response.json();
      }),
      fetch('./src/data/audio_metadata.json').then(response => {
        if (!response.ok) throw new Error('Failed to load audio_metadata.json');
        return response.json();
      })
    ]);

    // Store in application state
    state.synonyms = synonymsData || [];
    state.imageCredits = creditsData.images || {};
    state.audioMetadata = audioData.audio || {};

    // Initialize the application
    initializeApp();
  } catch (error) {
    console.error('Error loading application data:', error);
    showErrorState('Failed to load application data. Please refresh the page.');
  }
}

/**
 * Display error state to user
 */
function showErrorState(message) {
  const container = document.getElementById('cards-grid');
  if (container) {
    container.innerHTML = `
      <div class="error-state" role="alert">
        <h2>Error Loading Application</h2>
        <p>${message}</p>
        <button onclick="location.reload()">Reload Page</button>
      </div>
    `;
  }
}

// ============================================================================
// Application Initialization
// ============================================================================

/**
 * Initialize application after data is loaded
 */
function initializeApp() {
  // Set hero image
  const heroImage = document.getElementById('hero-image');
  if (heroImage) {
    heroImage.src = './src/assets/images/hero/hero-hablar.jpg';
  }

  // Render all cards initially
  renderCards();

  // Set up event listeners
  setupEventListeners();

  // Announce to screen readers
  announceToScreenReader('Application loaded successfully. 14 verbs available.');
}

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
  // Search input with debouncing
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      state.filters.search = e.target.value.trim();
      applyFilters();
    }, 300));
  }

  // Formality filter
  const formalityFilter = document.getElementById('formality-filter');
  if (formalityFilter) {
    formalityFilter.addEventListener('change', (e) => {
      state.filters.formality = e.target.value;
      applyFilters();
    });
  }

  // Context filter
  const contextFilter = document.getElementById('context-filter');
  if (contextFilter) {
    contextFilter.addEventListener('change', (e) => {
      state.filters.context = e.target.value;
      applyFilters();
    });
  }

  // Reset button
  const resetButton = document.getElementById('reset-filters');
  if (resetButton) {
    resetButton.addEventListener('click', resetFilters);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Handle keyboard shortcuts for accessibility
 */
function handleKeyboardShortcuts(e) {
  // Escape key - close modal
  if (e.key === 'Escape') {
    closeModal();
  }

  // Enter key on search - focus first result
  if (e.key === 'Enter' && e.target.id === 'search-input') {
    const firstCard = document.querySelector('.verb-card:not([style*="display: none"])');
    if (firstCard) {
      firstCard.focus();
    }
  }
}

// ============================================================================
// Filtering Logic
// ============================================================================

/**
 * Apply all active filters and re-render cards
 */
function applyFilters() {
  const { search, formality, context } = state.filters;
  let visibleCount = 0;

  state.synonyms.forEach((verb, index) => {
    const card = document.querySelector(`[data-verb-index="${index}"]`);
    if (!card) return;

    let isVisible = true;

    // Search filter (case-insensitive, matches verb or definition)
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesVerb = verb.verb.toLowerCase().includes(searchLower);
      const matchesQuickDef = verb.quickDefinition.toLowerCase().includes(searchLower);
      const matchesDefinition = verb.definition.toLowerCase().includes(searchLower);

      isVisible = matchesVerb || matchesQuickDef || matchesDefinition;
    }

    // Formality filter
    if (isVisible && formality !== 'all') {
      isVisible = verb.formality === formality;
    }

    // Context filter
    if (isVisible && context !== 'all') {
      isVisible = verb.context === context;
    }

    // Show/hide card
    if (isVisible) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Show empty state if no results
  const noResults = document.getElementById('no-results');
  if (visibleCount === 0) {
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
  }

  // Announce to screen readers
  announceToScreenReader(`Showing ${visibleCount} of ${state.synonyms.length} verbs`);
}

/**
 * Reset all filters to default state
 */
function resetFilters() {
  // Reset state
  state.filters = {
    search: '',
    formality: 'all',
    context: 'all'
  };

  // Reset UI elements
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  const formalityFilter = document.getElementById('formality-filter');
  if (formalityFilter) formalityFilter.value = 'all';

  const contextFilter = document.getElementById('context-filter');
  if (contextFilter) contextFilter.value = 'all';

  // Re-apply filters (will show all)
  applyFilters();

  // Announce to screen readers
  announceToScreenReader('Filters reset. Showing all verbs.');
}

// ============================================================================
// Rendering Functions
// ============================================================================

/**
 * Render all verb cards to the DOM
 */
function renderCards() {
  const container = document.getElementById('cards-grid');
  if (!container) {
    console.error('Cards container not found');
    return;
  }

  // Clear existing content
  container.innerHTML = '';

  // Create and append all cards
  state.synonyms.forEach((verb, index) => {
    const card = createCard(verb, index);
    container.appendChild(card);
  });
}

/**
 * Create a single verb card element
 */
function createCard(verb, index) {
  const card = document.createElement('article');
  card.className = 'verb-card';
  card.dataset.verbIndex = index;
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${verb.verb} - ${verb.quickDefinition}. Click for details.`);

  // Get image credit
  const credit = getImageCredit(verb.image);

  card.innerHTML = `
    <div class="card-image" style="background-image: url('./${verb.image}');">
      <div class="image-credit" aria-hidden="true">${credit}</div>
    </div>
    <div class="card-content">
      <h2 class="verb-title">${verb.verb}</h2>
      <p class="verb-translation">${verb.quickDefinition}</p>
      <div class="verb-meta">
        <span class="formality-badge ${verb.formality}" aria-label="Formality: ${verb.formality}">
          ${verb.formality}
        </span>
      </div>
      <button
        class="audio-button"
        aria-label="Play pronunciation for ${verb.verb}"
        onclick="event.stopPropagation(); playAudio('${verb.audioPath}', this);">
        <span class="audio-icon">🔊</span>
        <span class="audio-text">Pronunciation</span>
      </button>
    </div>
  `;

  // Click handler for opening modal
  card.addEventListener('click', (e) => {
    // Don't trigger if clicking audio button
    if (!e.target.closest('.audio-button')) {
      openModal(index);
    }
  });

  // Keyboard support for card activation
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(index);
    }
  });

  return card;
}

// ============================================================================
// Modal Functions
// ============================================================================

/**
 * Open modal with verb details
 */
function openModal(index) {
  const verb = state.synonyms[index];
  if (!verb) return;

  const modal = document.getElementById('detail-modal');
  if (!modal) return;

  // Populate modal content
  document.getElementById('modal-verb').textContent = verb.verb;
  document.getElementById('modal-pronunciation-text').textContent = verb.pronunciation;
  document.getElementById('modal-definition').textContent = verb.definition;

  const modalImage = document.getElementById('modal-image');
  modalImage.src = `./${verb.image}`;
  modalImage.alt = verb.verb;

  document.getElementById('modal-image-credit').textContent = getImageCredit(verb.image);

  // Populate examples
  const examplesList = document.getElementById('modal-examples');
  examplesList.innerHTML = verb.examples.map(ex => `<li>${ex}</li>`).join('');

  // Show/hide cultural notes
  const culturalSection = document.getElementById('modal-cultural-section');
  const culturalText = document.getElementById('modal-cultural');
  if (verb.culturalNotes) {
    culturalText.textContent = verb.culturalNotes;
    culturalSection.style.display = 'block';
  } else {
    culturalSection.style.display = 'none';
  }

  // Show modal
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  // Announce to screen readers
  announceToScreenReader(`Opened details for ${verb.verb}`);
}

/**
 * Close the modal
 */
function closeModal() {
  const modal = document.getElementById('detail-modal');
  if (!modal) return;

  // Hide modal
  modal.classList.remove('is-open');

  // Stop any playing audio
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.currentAudio = null;
  }

  // Restore body scroll
  document.body.style.overflow = '';
}

/**
 * Scroll to content section
 */
function scrollToContent() {
  const contentStart = document.getElementById('content-start');
  if (contentStart) {
    contentStart.scrollIntoView({ behavior: 'smooth' });
  }
}

// ============================================================================
// Audio Player
// ============================================================================

/**
 * Play audio file with error handling
 */
function playAudio(audioPath, buttonElement) {
  // Stop current audio if playing
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.currentAudio.currentTime = 0;
  }

  // Remove all playing indicators
  document.querySelectorAll('.audio-button.playing').forEach(btn => {
    btn.classList.remove('playing');
  });

  try {
    // Create new audio instance
    const audio = new Audio(`./src/assets/audio/${audioPath}`);
    state.currentAudio = audio;

    // Add playing indicator
    if (buttonElement) {
      buttonElement.classList.add('playing');
    }

    // Handle audio end
    audio.addEventListener('ended', () => {
      if (buttonElement) {
        buttonElement.classList.remove('playing');
      }
      state.currentAudio = null;
    });

    // Handle audio error
    audio.addEventListener('error', () => {
      console.error(`Failed to load audio: ${audioPath}`);
      if (buttonElement) {
        buttonElement.classList.remove('playing');
      }
      announceToScreenReader('Audio failed to load');
    });

    // Play audio
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      if (buttonElement) {
        buttonElement.classList.remove('playing');
      }
      announceToScreenReader('Error playing audio');
    });

  } catch (error) {
    console.error('Error creating audio:', error);
    if (buttonElement) {
      buttonElement.classList.remove('playing');
    }
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get image credit for a given image filename
 */
function getImageCredit(imageName) {
  const credit = state.imageCredits[imageName];
  if (!credit) {
    return 'Photo by Unknown';
  }

  return `Photo by ${credit.photographer}${credit.source ? ` on ${credit.source}` : ''}`;
}

/**
 * Debounce function for search input
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Announce message to screen readers
 */
function announceToScreenReader(message) {
  let liveRegion = document.getElementById('aria-live-region');

  // Create live region if it doesn't exist
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  }

  // Update message
  liveRegion.textContent = message;
}

// ============================================================================
// Application Entry Point
// ============================================================================

/**
 * Initialize application when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadApplicationData);
} else {
  loadApplicationData();
}

// Export functions to global scope for inline event handlers
window.playAudio = playAudio;
window.resetFilters = resetFilters;
window.openModal = openModal;
window.closeModal = closeModal;
window.scrollToContent = scrollToContent;
