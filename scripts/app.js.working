/**
 * Sinónimos de Caminar - Main Application
 * Uses local images (no API calls needed)
 */

// Load image credits and audio metadata
let imageCredits = {};
let audioMetadata = {};

// Load synonyms data
let synonymsData = [];
let filteredSynonyms = [];

// Audio playback state
let currentAudio = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
    renderCards(synonymsData);
    loadHeroImage();
});

// Load JSON data
async function loadData() {
    try {
        // Load synonyms
        const synonymsResponse = await fetch('data/synonyms.json');
        synonymsData = await synonymsResponse.json();
        filteredSynonyms = [...synonymsData];

        // Load image credits
        try {
            const creditsResponse = await fetch('data/image_credits.json');
            imageCredits = await creditsResponse.json();
        } catch (err) {
            console.log('Image credits not available');
        }

        // Load audio metadata
        try {
            const audioResponse = await fetch('data/audio_metadata.json');
            audioMetadata = await audioResponse.json();
        } catch (err) {
            console.log('Audio not available');
        }

    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to empty array
        synonymsData = [];
        filteredSynonyms = [];
    }
}

// Load hero image
function loadHeroImage() {
    const heroImage = document.getElementById('hero-image');
    if (heroImage) {
        heroImage.src = 'assets/images/hero/hero-walking.jpg';
        heroImage.alt = 'Caminar por el mundo - Sinónimos en español';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Filters
    const formalityFilter = document.getElementById('formality-filter');
    const contextFilter = document.getElementById('context-filter');

    if (formalityFilter) formalityFilter.addEventListener('change', applyFilters);
    if (contextFilter) contextFilter.addEventListener('change', applyFilters);

    // Reset button
    const resetButton = document.getElementById('reset-filters');
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }

    // Modal close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Handle search
function handleSearch(e) {
    applyFilters();
}

// Apply filters
function applyFilters() {
    const searchInput = document.getElementById('search-input');
    const formalityFilter = document.getElementById('formality-filter');
    const contextFilter = document.getElementById('context-filter');

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const formality = formalityFilter ? formalityFilter.value : 'all';
    const context = contextFilter ? contextFilter.value : 'all';

    filteredSynonyms = synonymsData.filter(synonym => {
        // Search filter
        if (query && !synonym.verb.toLowerCase().includes(query) &&
            !synonym.definition.toLowerCase().includes(query) &&
            !synonym.quickDefinition.toLowerCase().includes(query)) {
            return false;
        }

        // Formality filter
        if (formality !== 'all' && synonym.formality !== formality) {
            return false;
        }

        // Context filter
        if (context !== 'all' && synonym.context !== context) {
            return false;
        }

        return true;
    });

    renderCards(filteredSynonyms);
}

// Reset filters
function resetFilters() {
    const searchInput = document.getElementById('search-input');
    const formalityFilter = document.getElementById('formality-filter');
    const contextFilter = document.getElementById('context-filter');

    if (searchInput) searchInput.value = '';
    if (formalityFilter) formalityFilter.value = 'all';
    if (contextFilter) contextFilter.value = 'all';

    filteredSynonyms = [...synonymsData];
    renderCards(filteredSynonyms);
}

// Render synonym cards
function renderCards(synonyms) {
    const grid = document.getElementById('cards-grid');
    const noResults = document.getElementById('no-results');

    if (!grid) return;

    grid.innerHTML = '';

    if (synonyms.length === 0) {
        if (noResults) noResults.style.display = 'block';
        return;
    }

    if (noResults) noResults.style.display = 'none';

    synonyms.forEach((synonym, index) => {
        const card = createCard(synonym, index);
        grid.appendChild(card);
    });
}

// Create synonym card
function createCard(synonym, index) {
    const card = document.createElement('div');
    card.className = 'synonym-card';
    card.style.animationDelay = `${index * 0.05}s`;
    card.onclick = () => openModal(synonym);

    // Get image credit if available
    const verbKey = synonym.verb;
    const credit = imageCredits?.images?.[verbKey];

    card.innerHTML = `
        <div class="card-image-container">
            <img src="${synonym.image}" alt="${synonym.verb}" class="card-image" loading="lazy">
            ${credit ? `<div class="image-credit">Foto: ${credit.photographer}</div>` : ''}
            <div class="card-overlay">
                <div class="card-overlay-content">
                    <p class="overlay-definition">${synonym.quickDefinition}</p>
                </div>
            </div>
        </div>
        <div class="card-content">
            <h3 class="card-verb">${synonym.verb}</h3>
            <span class="card-pronunciation">
                ${createAudioButton(synonym.verb, 'verb')}
                ${synonym.pronunciation}
            </span>
            <div class="card-tags">
                ${createTag(synonym.formality, 'formality')}
                ${createTag(synonym.context, 'context')}
            </div>
        </div>
    `;

    return card;
}

// Create tag element
function createTag(text, type) {
    const icons = {
        formal: '👔',
        neutral: '💬',
        informal: '🗣️',
        profesional: '💼',
        literario: '📚',
        cotidiano: '🌟',
        coloquial: '💭',
        narrativo: '📖'
    };

    const icon = icons[text] || '';
    return `<span class="tag tag-${type}">${icon} ${text}</span>`;
}

// Create audio button
function createAudioButton(verb, type) {
    const audioFile = audioMetadata?.verbs?.[verb]?.file;
    if (!audioFile) return '';

    return `
        <button class="audio-button"
                onclick="playAudio('${audioFile}', this)"
                aria-label="Pronunciar ${verb}"
                title="Escuchar pronunciación">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
        </button>
    `;
}

// Play audio file
function playAudio(audioFile, buttonElement) {
    // Stop any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        // Remove playing class from all buttons
        document.querySelectorAll('.audio-button.playing, .example-audio-button.playing')
            .forEach(btn => btn.classList.remove('playing'));
    }

    // Create and play new audio
    currentAudio = new Audio(audioFile);

    // Add playing class
    if (buttonElement) {
        buttonElement.classList.add('playing');
    }

    // Remove playing class when done
    currentAudio.onended = () => {
        if (buttonElement) {
            buttonElement.classList.remove('playing');
        }
        currentAudio = null;
    };

    // Play
    currentAudio.play().catch(err => {
        console.error('Audio playback failed:', err);
        if (buttonElement) {
            buttonElement.classList.remove('playing');
        }
    });
}

// Make playAudio globally available
window.playAudio = playAudio;

// Open detail modal
function openModal(synonym) {
    const modal = document.getElementById('detail-modal');
    if (!modal) return;

    // Populate modal content
    document.getElementById('modal-verb').textContent = synonym.verb;

    // Add pronunciation with audio button
    const modalAudioButton = document.getElementById('modal-audio-button');
    const modalPronText = document.getElementById('modal-pronunciation-text');
    if (modalAudioButton && modalPronText) {
        modalAudioButton.innerHTML = createAudioButton(synonym.verb, 'verb');
        modalPronText.textContent = synonym.pronunciation;
    }

    document.getElementById('modal-definition').textContent = synonym.definition;

    // Image
    const modalImage = document.getElementById('modal-image');
    if (modalImage) {
        modalImage.src = synonym.image;
        modalImage.alt = synonym.verb;
    }

    // Image credit
    const verbKey = synonym.verb;
    const credit = imageCredits?.images?.[verbKey];
    const creditElement = document.getElementById('modal-image-credit');
    if (creditElement && credit) {
        creditElement.innerHTML = `
            Foto por <a href="${credit.photographerUrl}" target="_blank" rel="noopener">${credit.photographer}</a>
            en <a href="${credit.unsplashUrl}" target="_blank" rel="noopener">Unsplash</a>
        `;
    }

    // Tags
    const tagsContainer = document.getElementById('modal-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = `
            ${createTag(synonym.formality, 'formality')}
            ${createTag(synonym.context, 'context')}
        `;
    }

    // Examples with audio
    const examplesList = document.getElementById('modal-examples');
    if (examplesList) {
        const examplesAudio = audioMetadata?.examples?.[synonym.verb] || [];
        examplesList.innerHTML = synonym.examples
            .map((example, i) => {
                const audioFile = examplesAudio[i]?.file;
                const audioButton = audioFile ? `
                    <button class="example-audio-button"
                            onclick="playAudio('${audioFile}', this)"
                            aria-label="Escuchar ejemplo"
                            title="Escuchar ejemplo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                    </button>
                ` : '';
                return `<li class="example-item"><span class="example-text">${highlightVerb(example, synonym.verb)}</span>${audioButton}</li>`;
            })
            .join('');
    }

    // Cultural notes
    if (synonym.culturalNotes) {
        const culturalSection = document.getElementById('modal-cultural-section');
        const culturalText = document.getElementById('modal-cultural');
        if (culturalSection && culturalText) {
            culturalSection.style.display = 'block';
            culturalText.textContent = synonym.culturalNotes;
        }
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('detail-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Highlight verb in example
function highlightVerb(text, verb) {
    const verbRoot = verb.substring(0, verb.length - 2); // Remove -ar, -er, -ir ending
    const regex = new RegExp(`\\b${verbRoot}\\w*\\b`, 'gi');
    return text.replace(regex, match => `<strong class="highlighted-verb">${match}</strong>`);
}

// Scroll to content
function scrollToContent() {
    const contentStart = document.getElementById('content-start');
    if (contentStart) {
        contentStart.scrollIntoView({ behavior: 'smooth' });
    }
}

// Make closeModal available globally
window.closeModal = closeModal;
window.scrollToContent = scrollToContent;
