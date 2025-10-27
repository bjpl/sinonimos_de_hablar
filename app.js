/**
 * Sinónimos de Hablar - Main Application (Root Level)
 * STANDALONE VERSION - All paths from root
 */

// Load image credits and audio metadata
let imageCredits = {};
let audioMetadata = {};
let authenticExamples = {};

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

        // Load authentic examples (optional, non-breaking)
        try {
            const authResponse = await fetch('data/authentic_examples.json');
            authenticExamples = await authResponse.json();
            console.log('✅ Loaded authentic examples');
        } catch (err) {
            console.log('ℹ️  Authentic examples not loaded (optional)');
            authenticExamples = {};
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
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${synonym.verb} - ${synonym.quickDefinition}. Click for details`);

    card.onclick = () => openModal(synonym);
    card.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(synonym);
        }
    };

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

    // Use existing verbKey from card creation scope or get from synonym
    const credit = imageCredits?.images?.[synonym.verb];
    const creditElement = document.getElementById('modal-image-credit');
    if (creditElement && credit) {
        const photogName = credit.photographer?.name || credit.photographer;
        const photogUrl = credit.photographer?.profile_url || credit.photo?.unsplash_url || '#';
        creditElement.innerHTML = `Foto por <a href="${photogUrl}" target="_blank" rel="noopener">${photogName}</a> en Unsplash`;
    }

    // Add pronunciation with audio button
    const modalAudioButton = document.getElementById('modal-audio-button');
    if (modalAudioButton) {
        modalAudioButton.innerHTML = createAudioButton(synonym.verb, 'verb');
    }

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
                        </svg>
                    </button>
                ` : '';
                return `<li>${audioButton} ${example}</li>`;
            })
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

    // Display authentic examples if available (simple, non-breaking)
    const authSection = document.getElementById('modal-authentic-section');
    const authList = document.getElementById('modal-authentic-list');
    const verbExamples = authenticExamples[synonym.verb];

    if (verbExamples && verbExamples.length > 0 && authList) {
        const qualityIcons = { 'nobel': '🏆', 'classic': '📖', 'corpus': '📊' };

        authList.innerHTML = verbExamples.map(ex => `
            <div style="margin-bottom: 1rem; padding: 1rem; background: #f5f1ed; border-radius: 8px;">
                <div style="font-style: italic; color: #3d2e1f; margin-bottom: 0.5rem;">
                    ${qualityIcons[ex.quality] || '📚'} "${ex.text}"
                </div>
                <div style="font-size: 0.875rem; color: #6b5d4f;">
                    — ${ex.source}
                </div>
            </div>
        `).join('');

        if (authSection) authSection.style.display = 'block';
    } else {
        if (authSection) authSection.style.display = 'none';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus on close button for accessibility
    const closeButton = modal.querySelector('.modal-close');
    if (closeButton) {
        setTimeout(() => closeButton.focus(), 100);
    }

    console.log('✅ Modal opened for:', synonym.verb);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('detail-modal');
    if (!modal) return;

    modal.classList.remove('active');
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    document.body.style.overflow = '';
    console.log('✅ Modal closed');
}

// Scroll to content
function scrollToContent() {
    const contentStart = document.getElementById('content-start');
    if (contentStart) {
        contentStart.scrollIntoView({ behavior: 'smooth' });
    }
}

// Make functions globally available
window.openModal = openModal;
window.closeModal = closeModal;
window.scrollToContent = scrollToContent;

console.log('📜 App.js loaded successfully');
