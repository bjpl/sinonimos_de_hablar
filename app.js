/**
 * Sinónimos de Hablar - Main Application (Root Level)
 * STANDALONE VERSION - All paths from root
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
    console.log('🚀 App starting from ROOT app.js...');
    await loadData();
    console.log(`📊 Loaded ${synonymsData.length} verbs`);
    setupEventListeners();
    renderCards(synonymsData);
    loadHeroImage();
    console.log('✅ Initialization complete');
});

// Load JSON data
async function loadData() {
    try {
        // Load synonyms
        console.log('📥 Fetching data/synonyms.json...');
        const synonymsResponse = await fetch('data/synonyms.json');
        console.log('Response:', synonymsResponse.status);
        synonymsData = await synonymsResponse.json();
        filteredSynonyms = [...synonymsData];
        console.log('✅ Loaded', synonymsData.length, 'synonyms');

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
        console.error('❌ Error loading data:', error);
        synonymsData = [];
        filteredSynonyms = [];
    }
}

// Load hero image
function loadHeroImage() {
    const heroImage = document.getElementById('hero-image');
    if (heroImage) {
        heroImage.src = 'assets/images/hero/hero-hablar.jpg';
        console.log('✅ Hero image set');
    }
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    const formalityFilter = document.getElementById('formality-filter');
    const contextFilter = document.getElementById('context-filter');

    if (formalityFilter) formalityFilter.addEventListener('change', applyFilters);
    if (contextFilter) contextFilter.addEventListener('change', applyFilters);

    const resetButton = document.getElementById('reset-filters');
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
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
        if (query && !synonym.verb.toLowerCase().includes(query) &&
            !synonym.definition.toLowerCase().includes(query) &&
            !synonym.quickDefinition.toLowerCase().includes(query)) {
            return false;
        }

        if (formality !== 'all' && synonym.formality !== formality) {
            return false;
        }

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

    console.log(`🎨 Rendering ${synonyms.length} cards...`);

    if (!grid) {
        console.error('❌ Grid element #cards-grid not found!');
        return;
    }

    grid.innerHTML = '';

    if (synonyms.length === 0) {
        console.log('⚠️ No synonyms to display');
        if (noResults) noResults.style.display = 'block';
        return;
    }

    if (noResults) noResults.style.display = 'none';

    synonyms.forEach((synonym, index) => {
        const card = createCard(synonym, index);
        grid.appendChild(card);
    });

    console.log(`✅ Successfully rendered ${synonyms.length} cards`);
}

// Create synonym card
function createCard(synonym, index) {
    const card = document.createElement('div');
    card.className = 'synonym-card';
    card.style.animationDelay = `${index * 0.05}s`;
    card.onclick = () => openModal(synonym);

    const verbKey = synonym.verb;
    const credit = imageCredits?.images?.[verbKey];

    card.innerHTML = `
        <div class="card-image-container">
            <img src="${synonym.image}" alt="${synonym.verb}" class="card-image" loading="lazy">
            ${credit ? `<div class="image-credit">Foto: ${credit.photographer.name}</div>` : ''}
            <div class="card-overlay">
                <div class="card-overlay-content">
                    <p class="overlay-definition">${synonym.quickDefinition}</p>
                </div>
            </div>
        </div>
        <div class="card-content">
            <h3 class="card-verb">${synonym.verb}</h3>
            <span class="card-pronunciation">${synonym.pronunciation}</span>
            <div class="card-tags">
                <span class="tag tag-formality">${synonym.formality}</span>
                <span class="tag tag-context">${synonym.context}</span>
            </div>
        </div>
    `;

    return card;
}

// Open modal
function openModal(synonym) {
    const modal = document.getElementById('detail-modal');
    if (!modal) return;

    document.getElementById('modal-verb').textContent = synonym.verb;
    document.getElementById('modal-pronunciation-text').textContent = synonym.pronunciation;
    document.getElementById('modal-definition').textContent = synonym.definition;

    const modalImage = document.getElementById('modal-image');
    if (modalImage) {
        modalImage.src = synonym.image;
        modalImage.alt = synonym.verb;
    }

    const verbKey = synonym.verb;
    const credit = imageCredits?.images?.[verbKey];
    const creditElement = document.getElementById('modal-image-credit');
    if (creditElement && credit) {
        creditElement.innerHTML = `Foto por ${credit.photographer.name} en Unsplash`;
    }

    const tagsContainer = document.getElementById('modal-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = `
            <span class="tag tag-formality">${synonym.formality}</span>
            <span class="tag tag-context">${synonym.context}</span>
        `;
    }

    const examplesList = document.getElementById('modal-examples');
    if (examplesList) {
        examplesList.innerHTML = synonym.examples
            .map(example => `<li>${example}</li>`)
            .join('');
    }

    const culturalSection = document.getElementById('modal-cultural-section');
    const culturalText = document.getElementById('modal-cultural');
    if (synonym.culturalNotes) {
        if (culturalText) culturalText.textContent = synonym.culturalNotes;
        if (culturalSection) culturalSection.style.display = 'block';
    } else {
        if (culturalSection) culturalSection.style.display = 'none';
    }

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('detail-modal');
    if (!modal) return;

    modal.classList.remove('is-open');
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    document.body.style.overflow = '';
}

// Scroll to content
function scrollToContent() {
    const contentStart = document.getElementById('content-start');
    if (contentStart) {
        contentStart.scrollIntoView({ behavior: 'smooth' });
    }
}

// Make functions globally available
window.closeModal = closeModal;
window.scrollToContent = scrollToContent;

console.log('📜 App.js loaded successfully');
