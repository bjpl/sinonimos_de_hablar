# Narrative Integration Architecture Design
## Sinónimos de Hablar - Immersive Literary Experience

**Version**: 1.0
**Date**: 2025-11-10
**Project**: sinonimos_de_hablar
**Architecture Status**: Design Phase
**Based on**: sinonimos_de_ver Reference Implementation

---

## Executive Summary

This document provides complete architectural specifications for integrating multi-part narrative experiences into sinonimos_de_hablar. The system will enhance ONE literary term ("departir") with an elegant, full-screen reading experience that demonstrates sophisticated usage through connected storytelling.

### Key Objectives

1. **Literary Enhancement**: Add immersive 3-part narratives for the literary term "departir"
2. **Elegant UX**: Full-screen reading experience with progress tracking
3. **Zero Dependencies**: Maintain offline-first, vanilla JavaScript architecture
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Mobile-First**: Responsive design for all screen sizes

### Quality Targets

- **Narrative Quality**: 8.5+/10 literary sophistication
- **Performance**: <200ms narrative viewer open time
- **Code Volume**: ~1,300 lines total (components + styles)
- **Cultural Authenticity**: Latin American Spanish literary tradition

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Specifications](#component-specifications)
3. [Data Schema](#data-schema)
4. [Service Layer](#service-layer)
5. [UI Integration](#ui-integration)
6. [Styling Architecture](#styling-architecture)
7. [User Experience Flow](#user-experience-flow)
8. [Technical Decisions](#technical-decisions)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Testing Strategy](#testing-strategy)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
├─────────────────────────────────────────────────────────────┤
│  index.html  │  Story Button  │  NarrativeViewer Component  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
├─────────────────────────────────────────────────────────────┤
│  app.js  │  openNarrative()  │  Event Coordination          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
├─────────────────────────────────────────────────────────────┤
│  narrativeProgress.js  │  LocalStorage Management           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│  synonyms.json  │  narrativeExperience objects              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Component Architecture (C4 Model - Level 2)

**Container Diagram:**

```
┌──────────────────────────────────────────────────────────────┐
│                    Browser Context                            │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Main Application (app.js)               │    │
│  │  • Card rendering                                    │    │
│  │  • Modal management                                  │    │
│  │  • Filter/search logic                               │    │
│  │  • Global coordination                               │    │
│  └──────────────────────────────────────────────────────┘    │
│                          │                                     │
│                          │ imports                             │
│                          ▼                                     │
│  ┌──────────────────────────────────────────────────────┐    │
│  │        NarrativeViewer Component (ES Module)         │    │
│  │  • Full-screen overlay rendering                     │    │
│  │  • Navigation state management                       │    │
│  │  • Verb highlighting (regex)                         │    │
│  │  • Tooltip management                                │    │
│  │  • Keyboard event handling                           │    │
│  │  • Progress coordination                             │    │
│  └──────────────────────────────────────────────────────┘    │
│                          │                                     │
│                          │ uses                                │
│                          ▼                                     │
│  ┌──────────────────────────────────────────────────────┐    │
│  │     Progress Tracking Service (ES Module)            │    │
│  │  • localStorage interface                            │    │
│  │  • Completion tracking                               │    │
│  │  • Progress calculations                             │    │
│  │  • Session persistence                               │    │
│  └──────────────────────────────────────────────────────┘    │
│                          │                                     │
│                          │ persists to                         │
│                          ▼                                     │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Browser LocalStorage                    │    │
│  │  Key: sinonimos_hablar_narrative_progress            │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### 1.3 File Structure

```
sinonimos_de_hablar/
├── index.html                          # Updated: narrative.css link
├── app.js                              # Updated: story button, openNarrative()
├── data/
│   └── synonyms.json                   # Updated: narrativeExperience for "departir"
├── components/                         # NEW DIRECTORY
│   └── NarrativeViewer.js              # NEW: ~450 lines
├── services/                           # NEW DIRECTORY
│   └── narrativeProgress.js            # NEW: ~250 lines
├── styles/
│   ├── main.css                        # Updated: story button styles
│   ├── narrative.css                   # NEW: ~600 lines
│   ├── images.css                      # Existing
│   ├── annotations.css                 # Existing
│   └── authentic.css                   # Existing
└── docs/
    ├── NARRATIVE_ARCHITECTURE_DESIGN.md # THIS DOCUMENT
    └── literary_narratives.json         # Backup of narrative content
```

---

## 2. Component Specifications

### 2.1 NarrativeViewer Component

**File**: `/components/NarrativeViewer.js`
**Type**: ES6 Module (export class)
**Size**: ~450 lines
**Dependencies**: None (vanilla JavaScript)

#### 2.1.1 Class Structure

```javascript
/**
 * NarrativeViewer - Full-screen immersive reader for multi-part narratives
 *
 * Responsibilities:
 * - Render full-screen overlay with narrative content
 * - Manage navigation between narrative parts
 * - Highlight verb conjugations within text
 * - Display click-to-define tooltips
 * - Coordinate with progress tracking service
 * - Handle keyboard navigation (arrows, escape)
 * - Manage body scroll lock during viewing
 */
export class NarrativeViewer {
    constructor(synonymData, options = {}) {
        // Configuration
        this.data = synonymData;
        this.narrative = synonymData.narrativeExperience;
        this.verb = synonymData.verb;
        this.options = {
            showProgress: options.showProgress ?? true,
            enableHighlighting: options.enableHighlighting ?? true,
            trackCompletion: options.trackCompletion ?? true,
            autoFocus: options.autoFocus ?? true
        };

        // State
        this.currentPart = 0;
        this.totalParts = this.narrative.parts.length;
        this.viewerElement = null;
        this.isOpen = false;

        // Bindings
        this._handleKeyboard = this._handleKeyboard.bind(this);
        this._handleNavigation = this._handleNavigation.bind(this);
    }

    // Public API methods (see detailed specifications below)
    render() { }
    open() { }
    close() { }
    goToPart(index) { }
    nextPart() { }
    prevPart() { }
    destroy() { }

    // Private rendering methods
    _renderContainer() { }
    _renderHeader() { }
    _renderSidebar() { }
    _renderTOC() { }
    _renderProgressBar() { }
    _renderMainContent() { }
    _renderParts() { }
    _renderLiteraryNote() { }
    _renderNavigation() { }

    // Private utility methods
    _highlightVerb(text) { }
    _showVerbTooltip(event, verbText) { }
    _hideVerbTooltip() { }
    _attachEventHandlers() { }
    _detachEventHandlers() { }
    _updateProgress() { }
    _scrollToActivePart() { }
}
```

#### 2.1.2 Key Methods - Detailed Specifications

**`render()`**
```javascript
/**
 * Render the complete narrative viewer structure
 * Creates DOM but doesn't display (call open() to show)
 *
 * @returns {HTMLElement} The viewer container
 */
render() {
    if (this.viewerElement) {
        this.viewerElement.remove();
    }

    this.viewerElement = document.createElement('div');
    this.viewerElement.className = 'narrative-viewer';
    this.viewerElement.setAttribute('role', 'dialog');
    this.viewerElement.setAttribute('aria-modal', 'true');
    this.viewerElement.setAttribute('aria-labelledby', 'narrative-title');

    this.viewerElement.innerHTML = `
        <div class="narrative-backdrop"></div>
        <div class="narrative-container">
            ${this._renderHeader()}
            <div class="narrative-body">
                ${this._renderSidebar()}
                ${this._renderMainContent()}
            </div>
        </div>
    `;

    document.body.appendChild(this.viewerElement);
    this._attachEventHandlers();

    return this.viewerElement;
}
```

**`_highlightVerb(text)`**
```javascript
/**
 * Highlight all conjugations of the target verb within text
 * Uses regex to find: departir, departiendo, departió, etc.
 *
 * @param {string} text - The narrative text to process
 * @returns {string} HTML string with highlighted verbs
 */
_highlightVerb(text) {
    if (!this.options.enableHighlighting) return text;

    // Build conjugation pattern for the verb
    // For "departir": depart(ir|o|es|e|imos|ís|en|ía|ías|íamos|íais|ían|í|iste|ió|imos|isteis|ieron|...)
    const verbRoot = this.verb.slice(0, -2); // Remove -ar/-er/-ir

    // Common Spanish verb endings (comprehensive)
    const endings = [
        'ir', 'o', 'as', 'a', 'amos', 'áis', 'an',           // Present
        'ía', 'ías', 'íamos', 'íais', 'ían',                 // Imperfect
        'í', 'iste', 'ió', 'imos', 'isteis', 'ieron',        // Preterite
        'é', 'ás', 'á', 'emos', 'éis', 'án',                 // Future
        'iendo',                                              // Gerund
        'ido', 'ida', 'idos', 'idas'                         // Participle
    ];

    const pattern = new RegExp(
        `\\b(${verbRoot}(${endings.join('|')}))\\b`,
        'gi'
    );

    return text.replace(pattern, (match) => {
        return `<span class="highlighted-verb"
                      data-verb="${this.verb}"
                      data-conjugation="${match}"
                      role="button"
                      tabindex="0"
                      aria-label="Ver definición de ${match}">${match}</span>`;
    });
}
```

**`_showVerbTooltip(event, verbText)`**
```javascript
/**
 * Display tooltip with verb definition on click/hover
 *
 * @param {Event} event - Click or hover event
 * @param {string} verbText - The conjugated verb form
 */
_showVerbTooltip(event, verbText) {
    this._hideVerbTooltip(); // Clear any existing tooltip

    const tooltip = document.createElement('div');
    tooltip.className = 'verb-tooltip';
    tooltip.innerHTML = `
        <div class="tooltip-header">
            <strong>${this.verb}</strong>
            <span class="tooltip-conjugation">(${verbText})</span>
        </div>
        <div class="tooltip-definition">
            ${this.data.definition}
        </div>
    `;

    // Position tooltip near clicked element
    const rect = event.target.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + 10}px`;
    tooltip.style.left = `${rect.left}px`;

    document.body.appendChild(tooltip);
    this._currentTooltip = tooltip;

    // Auto-hide after 5 seconds
    setTimeout(() => this._hideVerbTooltip(), 5000);
}
```

**Progress Tracking Integration**
```javascript
/**
 * Update progress when user views a part
 * Coordinates with narrativeProgress service
 */
_updateProgress() {
    if (!this.options.trackCompletion) return;

    import('../services/narrativeProgress.js').then(module => {
        const { narrativeProgress } = module;
        narrativeProgress.markPartComplete(this.verb, this.currentPart);

        // Update visual progress bar
        this._refreshProgressBar();
    });
}
```

#### 2.1.3 Keyboard Navigation

**Supported Keys:**
- **Arrow Right / Arrow Down**: Next part
- **Arrow Left / Arrow Up**: Previous part
- **Escape**: Close viewer
- **Home**: First part
- **End**: Last part
- **1-3**: Jump to specific part number

```javascript
_handleKeyboard(event) {
    switch(event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
            event.preventDefault();
            this.nextPart();
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            event.preventDefault();
            this.prevPart();
            break;
        case 'Escape':
            this.close();
            break;
        case 'Home':
            event.preventDefault();
            this.goToPart(0);
            break;
        case 'End':
            event.preventDefault();
            this.goToPart(this.totalParts - 1);
            break;
        case '1':
        case '2':
        case '3':
            const partIndex = parseInt(event.key) - 1;
            if (partIndex < this.totalParts) {
                this.goToPart(partIndex);
            }
            break;
    }
}
```

#### 2.1.4 Accessibility Features

**ARIA Attributes:**
- `role="dialog"` on main container
- `aria-modal="true"` for modal behavior
- `aria-labelledby` pointing to narrative title
- `aria-live="polite"` on progress bar
- `tabindex="0"` on interactive elements
- Focus trap within viewer when open

**Keyboard Focus Management:**
```javascript
open() {
    // ... rendering logic ...

    // Trap focus within viewer
    this._previousFocus = document.activeElement;

    if (this.options.autoFocus) {
        const firstFocusable = this.viewerElement.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
    }
}

close() {
    // Restore focus to element that opened viewer
    this._previousFocus?.focus();

    // ... cleanup logic ...
}
```

---

## 3. Data Schema

### 3.1 Narrative Experience Structure

**Location**: `/data/synonyms.json`
**Applies to**: Literary terms (context: "literario")

```json
{
  "verb": "departir",
  "pronunciation": "de-par-tir",
  "quickDefinition": "To converse pleasantly (literary)",
  "definition": "Conversar de manera agradable y culta, término literario o muy formal",
  "formality": "formal",
  "context": "literario",
  "regions": ["general"],
  "image": "assets/images/synonyms/departir.jpg",
  "examples": [
    "Los intelectuales departían sobre filosofía",
    "Departimos amenamente durante la cena",
    "Es un placer departir con personas tan cultas"
  ],
  "culturalNotes": "Departir es un término culto y literario que se usa raramente en el habla cotidiano",

  "narrativeExperience": {
    "title": "El Arte de la Conversación",
    "parts": [
      "En el salón de la biblioteca, bajo la luz dorada de las lámparas antiguas, don Esteban y la profesora Márquez departían sobre las obras de Borges. Sus palabras fluían con la cadencia propia de quienes saben que conversar es un arte, no una carrera.",

      "«Departir no es simplemente hablar», explicaba la profesora mientras servía más café. «Es cultivar el intercambio de ideas con elegancia, permitir que cada pensamiento madure antes de responder». Don Esteban asintió, recordando las tertulias literarias de su juventud en Buenos Aires.",

      "Al caer la noche, ambos comprendieron que habían departido no solo sobre literatura, sino sobre la vida misma. En un mundo de conversaciones apresuradas, ellos habían preservado algo precioso: el placer de departir con profundidad y gracia."
    ],
    "literaryNote": "Este relato ilustra cómo 'departir' va más allá de 'hablar' o 'conversar'. Departir implica una conversación culta, sosegada y refinada, típica de ambientes intelectuales o literarios. A diferencia de 'charlar' (casual) o 'platicar' (informal), departir evoca la tradición de las tertulias latinoamericanas donde el diálogo se convierte en arte."
  }
}
```

### 3.2 Narrative Content Guidelines

**Part 1: Scene Establishment (60-80 words)**
- Introduce setting and characters
- Establish atmosphere
- Use verb naturally in context
- Set up the scenario

**Part 2: Development (60-80 words)**
- Show verb's nuanced usage
- Build on Part 1's scenario
- Demonstrate sophistication
- Develop the interaction

**Part 3: Meta-Reflection (70-90 words)**
- Character or narrator reflects on meaning
- Philosophical or poetic closure
- Distinguish from simpler alternatives
- Provide insight into verb's essence

**Literary Style Requirements:**
- Latin American Spanish sophistication
- Elegant prose (Cormorant Garamond-friendly)
- No didactic tone - show, don't tell
- Poetic without being purple
- Authentic cultural grounding
- Dialogue-focused (appropriate for "hablar" synonyms)

---

## 4. Service Layer

### 4.1 Progress Tracking Service

**File**: `/services/narrativeProgress.js`
**Type**: ES6 Module (export singleton)
**Size**: ~250 lines

#### 4.1.1 Class Structure

```javascript
/**
 * NarrativeProgressTracker - Manages reading progress across sessions
 *
 * Responsibilities:
 * - Persist progress to localStorage
 * - Track completion per verb and part
 * - Calculate progress percentages
 * - Provide session continuity
 * - Clean up stale data
 */
class NarrativeProgressTracker {
    constructor() {
        this.storageKey = 'sinonimos_hablar_narrative_progress';
        this.data = this._load();
    }

    // Public API
    markPartComplete(verb, partIndex) { }
    getProgress(verb) { }
    getCompletionPercentage(verb, totalParts) { }
    isPartComplete(verb, partIndex) { }
    resetProgress(verb) { }
    getAllProgress() { }

    // Private methods
    _load() { }
    _save() { }
    _ensureVerbEntry(verb) { }
    _cleanupStale() { }
}

// Export singleton instance
export const narrativeProgress = new NarrativeProgressTracker();
```

#### 4.1.2 LocalStorage Schema

```javascript
{
  "sinonimos_hablar_narrative_progress": {
    "departir": {
      "startedAt": 1699564800000,              // Unix timestamp
      "completedParts": [0, 1, 2],              // Array of completed part indices
      "lastVisited": 1699565400000,             // Last interaction timestamp
      "completionPercentage": 100,              // Calculated percentage
      "totalParts": 3                           // Total parts in narrative
    }
  },
  "_meta": {
    "version": "1.0",
    "lastCleanup": 1699564800000
  }
}
```

#### 4.1.3 Key Methods

**`markPartComplete(verb, partIndex)`**
```javascript
/**
 * Mark a specific narrative part as completed
 *
 * @param {string} verb - The verb identifier (e.g., "departir")
 * @param {number} partIndex - Zero-based index of the completed part
 */
markPartComplete(verb, partIndex) {
    this._ensureVerbEntry(verb);

    const verbData = this.data[verb];

    // Add to completed parts if not already there
    if (!verbData.completedParts.includes(partIndex)) {
        verbData.completedParts.push(partIndex);
        verbData.completedParts.sort((a, b) => a - b);
    }

    // Update timestamps
    verbData.lastVisited = Date.now();

    // Calculate completion percentage
    verbData.completionPercentage =
        (verbData.completedParts.length / verbData.totalParts) * 100;

    this._save();
}
```

**`getProgress(verb)`**
```javascript
/**
 * Get progress data for a specific verb
 *
 * @param {string} verb - The verb identifier
 * @returns {Object|null} Progress data or null if not started
 */
getProgress(verb) {
    return this.data[verb] || null;
}
```

**`getCompletionPercentage(verb, totalParts)`**
```javascript
/**
 * Calculate completion percentage for a verb
 *
 * @param {string} verb - The verb identifier
 * @param {number} totalParts - Total number of narrative parts
 * @returns {number} Percentage (0-100)
 */
getCompletionPercentage(verb, totalParts) {
    const progress = this.getProgress(verb);
    if (!progress) return 0;

    return (progress.completedParts.length / totalParts) * 100;
}
```

#### 4.1.4 Data Cleanup

**Stale Data Removal:**
```javascript
/**
 * Remove progress entries older than 90 days
 * Called automatically on initialization
 */
_cleanupStale() {
    const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    let cleaned = false;

    for (const [verb, data] of Object.entries(this.data)) {
        if (verb === '_meta') continue;

        if (now - data.lastVisited > NINETY_DAYS) {
            delete this.data[verb];
            cleaned = true;
        }
    }

    if (cleaned) {
        this.data._meta.lastCleanup = now;
        this._save();
    }
}
```

---

## 5. UI Integration

### 5.1 Story Button on Cards

**Location**: Modify `createCard()` function in `/app.js`

#### 5.1.1 Detection Logic

```javascript
function createCard(synonym, index) {
    const card = document.createElement('div');
    card.className = 'synonym-card';
    card.style.animationDelay = `${index * 0.05}s`;

    // Detect if narrative exists
    const hasNarrative = synonym.narrativeExperience &&
                        synonym.narrativeExperience.title;

    // CRITICAL: Prevent modal opening when story button clicked
    card.onclick = (e) => {
        if (!e.target.closest('.story-button')) {
            openModal(synonym);
        }
    };

    // ... rest of card creation ...
}
```

#### 5.1.2 Story Button HTML

```javascript
const card.innerHTML = `
    <div class="card-image-container">
        <img src="${synonym.image}" alt="${synonym.verb}" class="card-image" loading="lazy">

        ${hasNarrative ? `
            <button class="story-button"
                    onclick="openNarrative('${synonym.verb}', event)"
                    aria-label="Leer narrativa literaria de ${synonym.verb}"
                    title="Experiencia narrativa inmersiva">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round"
                     stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span class="story-label">Historia</span>
            </button>
        ` : ''}

        <!-- Existing card content -->
        <div class="card-overlay">
            <div class="card-overlay-content">
                <p class="overlay-definition">${synonym.quickDefinition}</p>
            </div>
        </div>
    </div>
    <div class="card-content">
        <!-- Existing content -->
    </div>
`;
```

### 5.2 Global openNarrative Function

**Location**: End of `/app.js`

```javascript
/**
 * Open narrative viewer for a specific verb
 * Dynamically imports NarrativeViewer component
 *
 * @param {string} verb - The verb to display narrative for
 * @param {Event} event - Click event (for stopPropagation)
 */
async function openNarrative(verb, event) {
    // Prevent card click handler
    if (event) event.stopPropagation();

    // Find synonym data
    const synonym = synonymsData.find(s => s.verb === verb);

    if (!synonym || !synonym.narrativeExperience) {
        console.error(`Narrative not found for verb: ${verb}`);
        return;
    }

    try {
        // Dynamic import for code splitting
        const { NarrativeViewer } = await import('./components/NarrativeViewer.js');

        // Create and configure viewer
        const viewer = new NarrativeViewer(synonym, {
            showProgress: true,
            enableHighlighting: true,
            trackCompletion: true,
            autoFocus: true
        });

        // Render and open
        viewer.render();
        viewer.open();

        console.log(`✅ Narrative viewer opened for: ${verb}`);

    } catch (error) {
        console.error('Failed to load narrative viewer:', error);

        // Fallback: Show error message to user
        alert('No se pudo cargar la experiencia narrativa. Por favor, intenta de nuevo.');
    }
}

// Make globally available
window.openNarrative = openNarrative;
```

### 5.3 Event Coordination

**Preventing Modal Conflicts:**

The story button must NOT trigger the card's modal. This is achieved through:

1. **Event Bubbling Prevention**: `event.stopPropagation()` in `openNarrative()`
2. **Target Checking**: Card click handler checks `!e.target.closest('.story-button')`
3. **Z-index Layering**: Story button has `z-index: 10` on card

**Event Flow Diagram:**

```
User Click on Story Button
         │
         ▼
Story Button onClick → stopPropagation() → openNarrative()
         │                                        │
         ✗ (blocked)                             ▼
Card onClick (not fired)              Import NarrativeViewer
                                                 │
                                                 ▼
                                      Render & Open Viewer
```

---

## 6. Styling Architecture

### 6.1 Narrative Styles Overview

**File**: `/styles/narrative.css`
**Size**: ~600 lines
**Approach**: BEM methodology with CSS custom properties

#### 6.1.1 Color Palette (Elegant Reading)

```css
:root {
    /* Narrative-specific colors */
    --narrative-bg: #FAF8F5;              /* Soft cream background */
    --narrative-text: #2d3748;            /* Deep charcoal text */
    --narrative-accent: #D4A574;          /* Muted gold highlights */
    --narrative-progress: #10b981;        /* Emerald green progress */
    --narrative-progress-dark: #059669;   /* Dark emerald */
    --narrative-border: rgba(45, 49, 66, 0.1);
    --narrative-shadow: rgba(0, 0, 0, 0.1);

    /* Typography */
    --font-serif: 'Cormorant Garamond', Georgia, serif;
    --font-sans: 'Inter', -apple-system, sans-serif;
}
```

#### 6.1.2 Layout Structure

**Full-Screen Overlay:**

```css
.narrative-viewer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2000;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.narrative-viewer.active {
    opacity: 1;
    visibility: visible;
}

.narrative-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}
```

**Two-Column Layout (Desktop):**

```css
.narrative-body {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    max-height: calc(100vh - 140px);
    overflow: hidden;
}

/* Sidebar: Table of Contents + Progress */
.narrative-sidebar {
    border-right: 1px solid var(--narrative-border);
    padding-right: 2rem;
    overflow-y: auto;
}

/* Main content area */
.narrative-main {
    overflow-y: auto;
    padding-right: 2rem;
}
```

#### 6.1.3 Typography System

**Narrative Text (Serif):**

```css
.part-text {
    font-family: var(--font-serif);
    font-size: 1.35rem;
    line-height: 1.8;
    color: var(--narrative-text);
    margin-bottom: 2rem;
    text-align: justify;
    hyphens: auto;
}

/* First paragraph drop cap (optional elegant touch) */
.narrative-part.active .part-text::first-letter {
    font-size: 3.5rem;
    font-weight: 700;
    float: left;
    line-height: 1;
    margin: 0.1em 0.15em 0 0;
    color: var(--narrative-accent);
}
```

**UI Elements (Sans-serif):**

```css
.narrative-header,
.toc-item,
.nav-button {
    font-family: var(--font-sans);
}
```

#### 6.1.4 Verb Highlighting

```css
.highlighted-verb {
    background: linear-gradient(
        180deg,
        rgba(212, 165, 116, 0.3),
        rgba(212, 165, 116, 0.15)
    );
    border-bottom: 2px solid rgba(212, 165, 116, 0.5);
    padding: 0 0.15em;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 2px;
}

.highlighted-verb:hover {
    background: rgba(212, 165, 116, 0.4);
    border-bottom-color: rgba(212, 165, 116, 0.8);
}

.highlighted-verb:focus {
    outline: 2px solid var(--narrative-accent);
    outline-offset: 2px;
}
```

#### 6.1.5 Progress Bar

```css
.progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(16, 185, 129, 0.2);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 1rem;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    border-radius: 4px;
    transition: width 0.4s ease;
    position: relative;
}

/* Animated shimmer effect */
.progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
    );
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    to { left: 100%; }
}
```

#### 6.1.6 Responsive Design

**Tablet (768px - 1024px):**

```css
@media (max-width: 1024px) {
    .narrative-body {
        grid-template-columns: 220px 1fr;
        gap: 1.5rem;
    }

    .part-text {
        font-size: 1.25rem;
    }
}
```

**Mobile (<768px):**

```css
@media (max-width: 768px) {
    .narrative-body {
        grid-template-columns: 1fr;
    }

    .narrative-sidebar {
        display: none; /* Hide sidebar on mobile */
    }

    .narrative-main {
        padding: 1rem;
    }

    .part-text {
        font-size: 1.125rem;
        text-align: left; /* No justify on mobile */
    }

    /* Show mobile navigation instead */
    .narrative-mobile-nav {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        padding: 1rem;
        box-shadow: 0 -2px 10px var(--narrative-shadow);
    }
}
```

### 6.2 Story Button Styles

**File**: Add to `/styles/main.css`

```css
/* Story Button - Appears on cards with narratives */
.story-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 2px solid rgba(45, 49, 66, 0.2);
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text);
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.story-button:hover {
    background: white;
    border-color: var(--color-primary, #D4A574);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.story-button:active {
    transform: translateY(0);
}

.story-button svg {
    stroke: currentColor;
}

.story-label {
    font-family: var(--font-sans);
}

/* Ensure button is visible over card overlay */
.card-image-container {
    position: relative;
}
```

### 6.3 Animation System

**Fade-in Transitions:**

```css
.narrative-part {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.narrative-part.active {
    opacity: 1;
    transform: translateY(0);
}
```

**TOC Active State:**

```css
.toc-item {
    padding: 0.75rem 1rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    cursor: pointer;
}

.toc-item:hover {
    background: rgba(212, 165, 116, 0.1);
}

.toc-item.active {
    background: var(--narrative-accent);
    color: white;
    font-weight: 600;
}

.toc-item.completed::before {
    content: '✓';
    margin-right: 0.5rem;
    color: var(--narrative-progress);
}
```

---

## 7. User Experience Flow

### 7.1 Complete User Journey

```
1. User Browses Synonym Cards
         │
         ▼
2. Sees "Historia" Button on "departir" Card
         │
         ▼
3. Clicks Story Button
         │
         ▼
4. Narrative Viewer Opens (Full-Screen Overlay)
   • Backdrop blurs background
   • Sidebar shows TOC with 3 parts
   • Part 1 displayed in reading area
   • Progress bar shows 0%
         │
         ▼
5. User Reads Part 1
   • Highlighted verbs clickable
   • Click shows definition tooltip
   • Scroll to read full part
         │
         ▼
6. Progress Automatically Tracked
   • Part 1 marked complete
   • TOC shows checkmark
   • Progress bar updates to 33%
         │
         ▼
7. User Navigates to Part 2
   (Options: Next button, TOC click, Arrow key)
         │
         ▼
8. Reads Part 2 & Part 3
   • Each part marked complete
   • Progress reaches 100%
   • All TOC items checked
         │
         ▼
9. Views Literary Note
   • Explains nuance of "departir"
   • Distinguishes from simpler verbs
         │
         ▼
10. Closes Viewer
    (Options: Close button, Escape key, Backdrop click)
         │
         ▼
11. Returns to Card Grid
    • Progress saved to localStorage
    • Story button shows completion badge (optional)
```

### 7.2 Interaction Patterns

**Opening Narrative:**
- **Trigger**: Click "Historia" button on card
- **Animation**: 300ms fade-in with blur backdrop
- **Focus**: Auto-focus on close button (accessibility)
- **Body**: Scroll locked (`overflow: hidden`)

**Navigation Between Parts:**
- **Methods**:
  - Next/Previous buttons
  - TOC item clicks
  - Keyboard arrows
  - Part number keys (1-3)
- **Animation**: Fade out current part, fade in new part (400ms)
- **Scroll**: Auto-scroll to top of new part
- **Progress**: Immediate visual feedback (checkmark, progress bar)

**Verb Highlighting Interaction:**
- **Trigger**: Click or tap highlighted verb
- **Response**: Tooltip appears below verb
- **Content**: Infinitive form + full definition
- **Dismiss**: Auto-hide after 5s, or click elsewhere

**Closing Viewer:**
- **Triggers**:
  - Close button click
  - Escape key press
  - Backdrop click
- **Animation**: 300ms fade-out
- **Cleanup**: Remove from DOM, unlock body scroll
- **Focus**: Return to story button (accessibility)
- **Persistence**: Save progress to localStorage

### 7.3 Edge Cases

**No Narrative Available:**
```javascript
if (!synonym.narrativeExperience) {
    console.error('No narrative for this verb');
    // Story button not rendered
}
```

**Incomplete Narrative Data:**
```javascript
if (!narrative.parts || narrative.parts.length === 0) {
    console.error('Narrative has no parts');
    // Fallback: Show error message
}
```

**LocalStorage Disabled:**
```javascript
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
} catch (e) {
    console.warn('LocalStorage unavailable, progress will not persist');
    // Continue without progress tracking
}
```

**Mobile Keyboard Overlap:**
- Use `viewport-fit=cover` meta tag
- Calculate available height: `window.innerHeight`
- Adjust narrative container height dynamically

---

## 8. Technical Decisions

### 8.1 Architecture Decision Records (ADRs)

#### ADR-001: Use ES6 Modules for Components

**Context**: Need to organize code for narrative viewer without bundler.

**Decision**: Use native ES6 modules (`export class`, dynamic `import()`).

**Rationale**:
- Modern browsers support ES modules natively
- Allows code splitting (viewer only loads when needed)
- No build step required (aligns with project's zero-dependency philosophy)
- Cleaner separation of concerns

**Consequences**:
- Requires `type="module"` in HTML (not needed - dynamic import handles it)
- Not supported in IE11 (acceptable - target modern browsers)
- Slightly larger file sizes vs bundled (acceptable trade-off)

**Status**: Accepted

---

#### ADR-002: LocalStorage for Progress Tracking

**Context**: Need to persist reading progress across sessions.

**Decision**: Use browser LocalStorage with JSON serialization.

**Alternatives Considered**:
1. **SessionStorage**: Doesn't persist across browser sessions
2. **IndexedDB**: Overcomplicated for simple key-value needs
3. **Cookies**: Size limits and security concerns
4. **Server-side storage**: Requires backend (violates offline-first principle)

**Rationale**:
- LocalStorage persists across sessions
- Simple API (`getItem`, `setItem`)
- ~5-10MB storage limit (more than sufficient)
- Synchronous access (no async complexity)
- Works offline

**Consequences**:
- Data not synced across devices
- User can clear storage (acceptable - not critical data)
- Privacy-friendly (all data local)

**Status**: Accepted

---

#### ADR-003: Regex-Based Verb Conjugation Highlighting

**Context**: Need to highlight all forms of target verb in narrative text.

**Decision**: Use comprehensive regex pattern covering Spanish verb conjugations.

**Alternatives Considered**:
1. **Manual string replacement**: Too brittle, misses conjugations
2. **NLP library**: Violates zero-dependency constraint
3. **Pre-marked text**: Limits narrative writing flexibility
4. **Server-side processing**: Requires backend

**Rationale**:
- Spanish verb conjugations follow predictable patterns
- Regex can cover all tenses/moods comprehensively
- Client-side processing (no network latency)
- Flexible (works with any narrative text)

**Consequences**:
- Regex pattern must be maintained for accuracy
- May highlight unrelated words with same root (rare)
- Performance: O(n) text scan on each part render (acceptable)

**Status**: Accepted

---

#### ADR-004: Single Literary Term Initially

**Context**: Project has 1 literary term ("departir").

**Decision**: Build scalable architecture but implement for one term initially.

**Rationale**:
- Proves concept before expanding
- Allows iteration on UX with focused scope
- Architecture supports multiple terms (easy to scale)
- Reduces narrative writing workload
- Faster time to deployment

**Consequences**:
- Only "departir" will have story button initially
- Architecture ready for expansion to future literary terms
- Less content to test initially (easier QA)

**Status**: Accepted

---

#### ADR-005: Full-Screen Viewer vs In-Card Expansion

**Context**: How to display multi-part narratives.

**Decision**: Use full-screen overlay (not in-card expansion).

**Alternatives Considered**:
1. **In-card expansion**: Narrative expands within card grid
2. **Side panel**: Slides in from right
3. **Modal (small)**: Centered modal, not full-screen
4. **Separate page**: Navigate to /narrative/:verb route

**Rationale**:
- Full-screen provides immersive reading experience
- Minimizes distractions (consistent with literary focus)
- Easier to implement responsive layout
- Better for longer narrative content
- Aligns with reference implementation (sinonimos_de_ver)

**Consequences**:
- Blocks card grid visibility (acceptable - focused reading)
- Requires escape hatch (close button, ESC key)
- More complex state management vs in-card

**Status**: Accepted

---

#### ADR-006: Vanilla CSS vs CSS-in-JS

**Context**: How to style narrative viewer component.

**Decision**: Use separate CSS file (`narrative.css`) with BEM methodology.

**Alternatives Considered**:
1. **Inline styles**: Hard to maintain, no media queries
2. **CSS-in-JS library**: Violates zero-dependency constraint
3. **Styled components**: Requires React or similar
4. **CSS modules**: Requires bundler

**Rationale**:
- Aligns with existing project architecture
- Standard CSS with custom properties (maintainable)
- BEM prevents class name collisions
- Easy to override for theming
- Better caching (separate CSS file)

**Consequences**:
- Component styles split across JS and CSS files
- Must ensure CSS loads before component renders
- Class name management via BEM convention

**Status**: Accepted

---

### 8.2 Technology Stack

**Frontend:**
- HTML5 (semantic markup)
- Vanilla JavaScript (ES6+)
- CSS3 (Grid, Flexbox, Custom Properties)

**Storage:**
- LocalStorage API

**Fonts:**
- Cormorant Garamond (serif, literary)
- Inter (sans-serif, UI)

**No External Dependencies:**
- No npm packages
- No build tools
- No frameworks

---

### 8.3 Performance Considerations

**Code Splitting:**
- NarrativeViewer loaded via dynamic `import()` only when needed
- Reduces initial bundle size

**Lazy Loading:**
- Narrative images loaded as user navigates parts
- Use `loading="lazy"` attribute

**Efficient Rendering:**
- Only active part visible (CSS `display: none` on inactive)
- Minimize DOM manipulation (render once, toggle classes)

**LocalStorage Optimization:**
- Cleanup stale data (90+ days old) on initialization
- Compress data structure (minimal keys)

**Animation Performance:**
- Use `transform` and `opacity` (GPU-accelerated)
- Avoid layout thrashing (batch DOM reads/writes)

**Accessibility Performance:**
- Keyboard navigation (no mouse required)
- Focus trap prevents tab-out during reading
- Screen reader announcements for progress

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Estimated: 2 hours)

**Tasks:**
1. Create directory structure (`components/`, `services/`)
2. Set up `narrativeProgress.js` service
   - Implement LocalStorage schema
   - Write progress tracking methods
   - Add cleanup logic
3. Create `narrative.css` stylesheet
   - Define color palette
   - Set up layout grid
   - Add typography styles

**Deliverables:**
- `/services/narrativeProgress.js` (complete)
- `/styles/narrative.css` (base styles)

**Testing:**
- Manual: Save progress to LocalStorage, verify retrieval
- Console: Test progress methods directly

---

### Phase 2: Narrative Viewer Component (Estimated: 3 hours)

**Tasks:**
1. Create `NarrativeViewer.js` class structure
2. Implement rendering methods
   - `_renderHeader()`
   - `_renderSidebar()`
   - `_renderMainContent()`
3. Add navigation logic
   - Part switching
   - Keyboard handlers
   - Progress updates
4. Implement verb highlighting
   - Regex pattern for conjugations
   - Tooltip display/hide
5. Add accessibility features
   - ARIA attributes
   - Focus management
   - Keyboard navigation

**Deliverables:**
- `/components/NarrativeViewer.js` (complete, ~450 lines)

**Testing:**
- Unit: Test verb highlighting regex
- Integration: Load with sample data, verify rendering
- Accessibility: Screen reader test, keyboard-only navigation

---

### Phase 3: Data Integration (Estimated: 1 hour)

**Tasks:**
1. Write narrative for "departir"
   - Part 1: Scene establishment (dialogue setting)
   - Part 2: Nuanced usage demonstration
   - Part 3: Meta-reflection on verb meaning
   - Literary note explaining distinction
2. Add `narrativeExperience` object to `synonyms.json`
3. Validate JSON structure

**Deliverables:**
- Updated `/data/synonyms.json`
- Backup in `/docs/literary_narratives.json`

**Testing:**
- JSON validation (syntax check)
- Content review (literary quality, cultural authenticity)

---

### Phase 4: UI Integration (Estimated: 1.5 hours)

**Tasks:**
1. Add story button to card template in `app.js`
2. Implement `openNarrative()` function
3. Add event coordination (prevent modal conflicts)
4. Style story button in `main.css`
5. Link `narrative.css` in `index.html`

**Deliverables:**
- Updated `/app.js`
- Updated `/styles/main.css`
- Updated `/index.html`

**Testing:**
- Functional: Click story button, verify viewer opens
- Integration: Ensure card modal doesn't trigger
- Visual: Story button appearance on card

---

### Phase 5: Styling & Polish (Estimated: 2 hours)

**Tasks:**
1. Complete `narrative.css` styles
   - Progress bar animations
   - Hover states
   - Transitions
2. Implement responsive design
   - Tablet layout
   - Mobile layout (hide sidebar)
3. Add accessibility styles
   - Focus indicators
   - High contrast support
4. Cross-browser testing

**Deliverables:**
- Complete `/styles/narrative.css` (~600 lines)

**Testing:**
- Responsive: Test on mobile, tablet, desktop
- Browsers: Chrome, Firefox, Safari, Edge
- Accessibility: WCAG 2.1 AA audit

---

### Phase 6: Deployment (Estimated: 1 hour)

**Tasks:**
1. Commit all files to git
2. Push to main branch
3. Deploy to GitHub Pages via git subtree
4. Verify deployment
5. Hard-refresh test on live URL

**Deliverables:**
- Live deployment with narrative integration

**Testing:**
- Live site verification
- Story button visible on "departir" card
- Narrative viewer functional
- Progress persists across sessions

---

### Total Estimated Time: ~10.5 hours

**Breakdown:**
- Component development: 5.5 hours
- Data/content creation: 1 hour
- UI integration: 1.5 hours
- Styling: 2 hours
- Deployment: 0.5 hours

---

## 10. Testing Strategy

### 10.1 Unit Testing

**NarrativeViewer Component:**

```javascript
// Test verb highlighting regex
describe('_highlightVerb()', () => {
    test('highlights infinitive form', () => {
        const text = 'Me gusta departir con amigos';
        const result = viewer._highlightVerb(text);
        expect(result).toContain('<span class="highlighted-verb"');
        expect(result).toContain('departir');
    });

    test('highlights conjugated forms', () => {
        const text = 'Ellos departían sobre filosofía';
        const result = viewer._highlightVerb(text);
        expect(result).toContain('departían');
    });

    test('handles multiple occurrences', () => {
        const text = 'Departir es departir bien';
        const result = viewer._highlightVerb(text);
        const matches = (result.match(/highlighted-verb/g) || []).length;
        expect(matches).toBe(2);
    });
});
```

**Progress Tracking Service:**

```javascript
describe('NarrativeProgressTracker', () => {
    test('marks part as complete', () => {
        narrativeProgress.markPartComplete('departir', 0);
        const progress = narrativeProgress.getProgress('departir');
        expect(progress.completedParts).toContain(0);
    });

    test('calculates percentage correctly', () => {
        narrativeProgress.markPartComplete('departir', 0);
        narrativeProgress.markPartComplete('departir', 1);
        const percentage = narrativeProgress.getCompletionPercentage('departir', 3);
        expect(percentage).toBe(66.67);
    });

    test('persists to localStorage', () => {
        narrativeProgress.markPartComplete('departir', 0);
        const stored = JSON.parse(localStorage.getItem('sinonimos_hablar_narrative_progress'));
        expect(stored.departir.completedParts).toContain(0);
    });
});
```

### 10.2 Integration Testing

**End-to-End User Flow:**

```
Test: Complete narrative reading flow
1. Navigate to sinonimos_de_hablar
2. Locate "departir" card
3. Click "Historia" button
4. Verify narrative viewer opens
5. Read Part 1, verify it's marked complete
6. Navigate to Part 2 via TOC
7. Navigate to Part 3 via next button
8. Verify progress bar shows 100%
9. Close viewer via ESC key
10. Reopen narrative
11. Verify progress persisted (all parts checked)

Expected: All steps pass without errors
```

**Modal Conflict Prevention:**

```
Test: Story button doesn't trigger card modal
1. Click "Historia" button on "departir" card
2. Verify narrative viewer opens (NOT card modal)
3. Close narrative viewer
4. Click on card image (not story button)
5. Verify card modal opens (NOT narrative viewer)

Expected: Each button triggers correct overlay
```

### 10.3 Accessibility Testing

**Keyboard Navigation:**

```
Test: Keyboard-only navigation
1. Tab to "departir" card
2. Tab to "Historia" button
3. Press Enter to open narrative
4. Press Arrow Right to navigate to Part 2
5. Press Arrow Right to navigate to Part 3
6. Press ESC to close viewer
7. Verify focus returns to story button

Expected: All navigation functional without mouse
```

**Screen Reader:**

```
Test: Screen reader announcements (NVDA/JAWS)
1. Navigate to narrative viewer
2. Verify header announces: "Narrative dialog, El Arte de la Conversación"
3. Verify progress bar announces: "33% complete"
4. Verify highlighted verb announces: "departir, button, click to see definition"
5. Verify part text is read in full

Expected: All content accessible to screen readers
```

### 10.4 Performance Testing

**Load Time:**

```
Metric: Time from button click to viewer visible
Target: < 200ms
Test:
  1. Click story button
  2. Measure time to first paint
  3. Measure time to interactive

Expected:
  - First paint: < 100ms
  - Time to interactive: < 200ms
```

**Memory Usage:**

```
Metric: Memory footprint of viewer
Target: < 5MB
Test:
  1. Open Chrome DevTools > Performance
  2. Record session
  3. Open narrative viewer
  4. Navigate through all parts
  5. Close viewer
  6. Check memory snapshot

Expected: No memory leaks, heap stable after close
```

### 10.5 Cross-Browser Testing

**Browser Matrix:**

| Browser | Version | Desktop | Mobile | Status |
|---------|---------|---------|--------|--------|
| Chrome  | 90+     | ✓       | ✓      | -      |
| Firefox | 88+     | ✓       | ✓      | -      |
| Safari  | 14+     | ✓       | ✓      | -      |
| Edge    | 90+     | ✓       | -      | -      |

**Test Cases:**
1. Narrative viewer rendering
2. CSS Grid layout (sidebar + main)
3. Backdrop blur effect
4. LocalStorage access
5. ES6 dynamic import
6. Custom properties (CSS variables)

### 10.6 Responsive Testing

**Device Matrix:**

| Device Type | Width  | Test Focus              |
|-------------|--------|-------------------------|
| Desktop     | 1920px | Full layout, sidebar    |
| Laptop      | 1366px | Medium layout           |
| Tablet      | 768px  | Collapsed sidebar       |
| Mobile      | 375px  | Single column, mobile nav|

**Breakpoints:**
- **1024px**: Reduce sidebar width
- **768px**: Hide sidebar, show mobile navigation
- **480px**: Adjust font sizes, full-width content

---

## Appendices

### Appendix A: File Checklist

**New Files:**
- [ ] `/components/NarrativeViewer.js` (~450 lines)
- [ ] `/services/narrativeProgress.js` (~250 lines)
- [ ] `/styles/narrative.css` (~600 lines)
- [ ] `/docs/NARRATIVE_ARCHITECTURE_DESIGN.md` (this document)
- [ ] `/docs/literary_narratives.json` (backup)

**Modified Files:**
- [ ] `/index.html` (link narrative.css)
- [ ] `/app.js` (story button, openNarrative function)
- [ ] `/styles/main.css` (story button styles)
- [ ] `/data/synonyms.json` (add narrativeExperience to "departir")

**Total New Code:**
- Components: ~450 lines
- Services: ~250 lines
- Styles: ~600 lines
- Modifications: ~50 lines
- **Total: ~1,350 lines**

---

### Appendix B: Verb Conjugation Regex Pattern

**For "departir" (and other -ir verbs):**

```javascript
const verbRoot = 'depart'; // Remove -ir
const endings = [
    // Present indicative
    'o', 'es', 'e', 'imos', 'ís', 'en',

    // Imperfect indicative
    'ía', 'ías', 'íamos', 'íais', 'ían',

    // Preterite
    'í', 'iste', 'ió', 'imos', 'isteis', 'ieron',

    // Future
    'iré', 'irás', 'irá', 'iremos', 'iréis', 'irán',

    // Conditional
    'iría', 'irías', 'iríamos', 'iríais', 'irían',

    // Present subjunctive
    'a', 'as', 'amos', 'áis', 'an',

    // Imperfect subjunctive
    'iera', 'ieras', 'iéramos', 'ierais', 'ieran',
    'iese', 'ieses', 'iésemos', 'ieseis', 'iesen',

    // Gerund
    'iendo',

    // Participle
    'ido', 'ida', 'idos', 'idas',

    // Infinitive
    'ir'
];

const pattern = new RegExp(
    `\\b(${verbRoot}(${endings.join('|')}))\\b`,
    'gi'
);
```

---

### Appendix C: Sample Narrative Output

**Title**: El Arte de la Conversación

**Part 1** (Scene Establishment):
> En el salón de la biblioteca, bajo la luz dorada de las lámparas antiguas, don Esteban y la profesora Márquez departían sobre las obras de Borges. Sus palabras fluían con la cadencia propia de quienes saben que conversar es un arte, no una carrera.

**Part 2** (Development):
> «Departir no es simplemente hablar», explicaba la profesora mientras servía más café. «Es cultivar el intercambio de ideas con elegancia, permitir que cada pensamiento madure antes de responder». Don Esteban asintió, recordando las tertulias literarias de su juventud en Buenos Aires.

**Part 3** (Meta-Reflection):
> Al caer la noche, ambos comprendieron que habían departido no solo sobre literatura, sino sobre la vida misma. En un mundo de conversaciones apresuradas, ellos habían preservado algo precioso: el placer de departir con profundidad y gracia.

**Literary Note**:
> Este relato ilustra cómo 'departir' va más allá de 'hablar' o 'conversar'. Departir implica una conversación culta, sosegada y refinada, típica de ambientes intelectuales o literarios. A diferencia de 'charlar' (casual) o 'platicar' (informal), departir evoca la tradición de las tertulias latinoamericanas donde el diálogo se convierte en arte.

---

### Appendix D: LocalStorage Data Example

```json
{
  "sinonimos_hablar_narrative_progress": {
    "departir": {
      "startedAt": 1699564800000,
      "completedParts": [0, 1, 2],
      "lastVisited": 1699565400000,
      "completionPercentage": 100,
      "totalParts": 3
    }
  },
  "_meta": {
    "version": "1.0",
    "lastCleanup": 1699564800000
  }
}
```

---

### Appendix E: Accessibility Compliance

**WCAG 2.1 AA Requirements:**

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.1.1 | Text alternatives | Alt text on all images |
| 1.4.3 | Contrast ratio (4.5:1) | Text: #2d3748 on #FAF8F5 (9.2:1) |
| 2.1.1 | Keyboard navigation | All functions accessible via keyboard |
| 2.4.3 | Focus order | Logical tab order (header → sidebar → main) |
| 2.4.7 | Focus visible | Custom focus indicators (2px outline) |
| 3.2.1 | On focus | No context changes on focus |
| 4.1.2 | Name, role, value | ARIA labels on all interactive elements |

**Screen Reader Support:**
- NVDA (Windows): Full support
- JAWS (Windows): Full support
- VoiceOver (macOS/iOS): Full support
- TalkBack (Android): Full support

---

## Conclusion

This architecture provides a complete blueprint for integrating immersive narrative experiences into sinonimos_de_hablar. The design prioritizes:

1. **Elegance**: Literary reading experience worthy of sophisticated content
2. **Simplicity**: Zero dependencies, vanilla JavaScript
3. **Accessibility**: WCAG 2.1 AA compliant, keyboard/screen reader support
4. **Performance**: <200ms load time, efficient rendering
5. **Scalability**: Ready to expand to additional literary terms

The implementation follows proven patterns from sinonimos_de_ver while adapting to the unique characteristics of "hablar" synonyms (dialogue-focused narratives).

**Next Steps:**
1. Review and approve this architecture design
2. Proceed with Phase 1 implementation (Foundation)
3. Iterate through Phases 2-6 per roadmap
4. Deploy and verify integration

---

**Document Version**: 1.0
**Last Updated**: 2025-11-10
**Author**: System Architecture Designer (Claude Code)
**Review Status**: Pending
**Approval**: Pending
