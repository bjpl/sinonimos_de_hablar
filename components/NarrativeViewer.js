/**
 * NarrativeViewer Component
 * Full-screen immersive narrative experience for literary synonyms
 */

import { narrativeProgress } from '../services/narrativeProgress.js';

export class NarrativeViewer {
  constructor(synonymData, options = {}) {
    this.data = synonymData;
    this.narrative = synonymData.narrativeExperience;
    this.options = {
      showProgress: true,
      enableHighlighting: true,
      trackCompletion: true,
      enableAudio: true,
      ...options
    };

    this.currentPart = 0;
    this.element = null;
    this.currentAudio = null;
    this.currentAudioFile = null;
    this.progress = this.options.trackCompletion
      ? narrativeProgress.getProgress(this.data.verb)
      : null;

    // Get audio metadata from global scope (loaded by app.js)
    this.audioMetadata = null;
    if (this.options.enableAudio && typeof window.audioMetadata !== 'undefined') {
      this.audioMetadata = window.audioMetadata?.narratives?.[this.data.verb] || null;
    }
  }

  /**
   * Render the narrative viewer
   */
  render() {
    this.element = document.createElement('div');
    this.element.className = 'narrative-viewer';

    this.element.innerHTML = `
      <div class="narrative-backdrop"></div>
      <div class="narrative-container">
        <div class="narrative-header">
          <button class="narrative-close" aria-label="Cerrar narrativa">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <div class="narrative-title-section">
            <h1 class="narrative-title">${this.narrative.title}</h1>
            <p class="narrative-verb-label">Explorando: <strong>${this.data.verb}</strong></p>
          </div>
        </div>

        <div class="narrative-body">
          <aside class="narrative-sidebar">
            <div class="narrative-toc">
              <h3 class="toc-title">Capítulos</h3>
              <div class="toc-items">
                ${this._renderTOC()}
              </div>
            </div>
            ${this.options.showProgress ? this._renderProgressSection() : ''}
          </aside>

          <main class="narrative-content">
            <div class="narrative-parts">
              ${this._renderParts()}
            </div>

            <div class="narrative-note">
              <div class="note-icon">📚</div>
              <div class="note-content">
                <h4 class="note-title">Nota Literaria</h4>
                <p class="note-text">${this.narrative.literaryNote}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    `;

    this._attachEventHandlers();
    this._highlightCurrentPart();

    return this.element;
  }

  /**
   * Render table of contents
   * @private
   */
  _renderTOC() {
    return this.narrative.parts.map((part, index) => {
      const isCompleted = this.progress && this.progress.completedParts?.includes(index);
      const isCurrent = index === this.currentPart;

      return `
        <div class="toc-item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}"
             data-part="${index}">
          <div class="toc-number">${index + 1}</div>
          <div class="toc-label">
            Parte ${index + 1}
            ${isCompleted ? '<span class="toc-check">✓</span>' : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render progress section
   * @private
   */
  _renderProgressSection() {
    const completedCount = this.progress?.completedParts?.length || 0;
    const totalParts = this.narrative.parts.length;
    const percentage = totalParts > 0 ? Math.round((completedCount / totalParts) * 100) : 0;

    return `
      <div class="narrative-progress-section">
        <h3 class="progress-title">Tu Progreso</h3>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <p class="progress-text">${completedCount} de ${totalParts} partes leídas</p>
      </div>
    `;
  }

  /**
   * Render narrative parts
   * @private
   */
  _renderParts() {
    return this.narrative.parts.map((part, index) => {
      const isActive = index === this.currentPart;
      const highlightedText = this.options.enableHighlighting
        ? this._highlightVerb(part)
        : part;

      const audioButton = this._renderPartAudioButton(index);

      return `
        <div class="narrative-part ${isActive ? 'active' : ''}"
             data-part="${index}"
             role="button"
             tabindex="0"
             aria-label="Ir a parte ${index + 1}">
          <div class="part-header">
            <div class="part-number">Parte ${index + 1}</div>
            ${audioButton}
          </div>
          <p class="part-text">${highlightedText}</p>
        </div>
      `;
    }).join('');
  }

  /**
   * Render audio button for a narrative part
   * @private
   */
  _renderPartAudioButton(partIndex) {
    if (!this.options.enableAudio || !this.audioMetadata || !this.audioMetadata[partIndex]) {
      return '';
    }

    const audioData = this.audioMetadata[partIndex];
    return `
      <div class="narrative-audio-controls" data-part="${partIndex}" data-audio="${audioData.file}">
        <button class="audio-control-btn play-btn active"
                data-action="play"
                aria-label="Reproducir narración"
                title="Reproducir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
        <button class="audio-control-btn pause-btn"
                data-action="pause"
                aria-label="Pausar narración"
                title="Pausar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </button>
        <button class="audio-control-btn restart-btn"
                data-action="restart"
                aria-label="Reiniciar narración"
                title="Reiniciar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
        </button>
      </div>
    `;
  }

  /**
   * Highlight verb in text
   * @private
   */
  _highlightVerb(text) {
    const verb = this.data.verb;
    const verbRoot = verb.substring(0, verb.length - 2);
    const regex = new RegExp(`\\b(${verbRoot}\\w*)\\b`, 'gi');

    return text.replace(regex, (match) => {
      return `<span class="highlighted-verb" data-verb="${verb}" title="Click para ver definición">${match}</span>`;
    });
  }

  /**
   * Attach event handlers
   * @private
   */
  _attachEventHandlers() {
    const closeBtn = this.element.querySelector('.narrative-close');
    const backdrop = this.element.querySelector('.narrative-backdrop');

    closeBtn.onclick = () => this.close();
    backdrop.onclick = () => this.close();

    // Make parts clickable
    const parts = this.element.querySelectorAll('.narrative-part');
    parts.forEach(part => {
      part.onclick = (e) => {
        // Don't navigate if clicking audio controls or highlighted verbs
        if (e.target.closest('.narrative-audio-controls') ||
            e.target.closest('.highlighted-verb') ||
            e.target.closest('.audio-control-btn')) {
          return;
        }
        const partIndex = parseInt(part.dataset.part);
        this.goToPart(partIndex);
      };
    });

    const tocItems = this.element.querySelectorAll('.toc-item');
    tocItems.forEach(item => {
      item.onclick = () => {
        const partIndex = parseInt(item.dataset.part);
        this.goToPart(partIndex);
      };
    });

    const highlightedVerbs = this.element.querySelectorAll('.highlighted-verb');
    highlightedVerbs.forEach(span => {
      span.onclick = (e) => {
        e.stopPropagation();
        this._showVerbTooltip(span);
      };
    });

    const audioControls = this.element.querySelectorAll('.narrative-audio-controls');
    audioControls.forEach(controlGroup => {
      const buttons = controlGroup.querySelectorAll('.audio-control-btn');
      buttons.forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          const audioFile = controlGroup.dataset.audio;
          this._handleAudioControl(action, audioFile, controlGroup);
        };
      });
    });

    this._keyboardHandler = this._handleKeyboard.bind(this);
    document.addEventListener('keydown', this._keyboardHandler);
  }

  /**
   * Handle audio control actions
   * @private
   */
  _handleAudioControl(action, audioFile, controlGroup) {
    switch (action) {
      case 'play':
        this._playAudio(audioFile, controlGroup);
        break;
      case 'pause':
        this._pauseAudio(controlGroup);
        break;
      case 'restart':
        this._restartAudio(audioFile, controlGroup);
        break;
    }
  }

  /**
   * Play audio
   * @private
   */
  _playAudio(audioFile, controlGroup) {
    // If there's a different audio playing, stop it
    if (this.currentAudio && this.currentAudioFile !== audioFile) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this._resetAllControls();
    }

    // If same audio is paused, resume
    if (this.currentAudio && this.currentAudioFile === audioFile) {
      this.currentAudio.play();
      this._setControlState(controlGroup, 'playing');
      return;
    }

    // Create new audio
    this.currentAudio = new Audio(audioFile);
    this.currentAudioFile = audioFile;

    // Set playing state
    this._setControlState(controlGroup, 'playing');

    // Handle ended
    this.currentAudio.onended = () => {
      this._setControlState(controlGroup, 'ended');
      this.currentAudio = null;
      this.currentAudioFile = null;
    };

    // Handle errors
    this.currentAudio.onerror = () => {
      console.error('Failed to load audio:', audioFile);
      this._resetAllControls();
      this.currentAudio = null;
      this.currentAudioFile = null;
    };

    // Play
    this.currentAudio.play().catch(err => {
      console.error('Audio playback failed:', err);
      this._resetAllControls();
    });
  }

  /**
   * Pause audio
   * @private
   */
  _pauseAudio(controlGroup) {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this._setControlState(controlGroup, 'paused');
    }
  }

  /**
   * Restart audio
   * @private
   */
  _restartAudio(audioFile, controlGroup) {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    this._playAudio(audioFile, controlGroup);
  }

  /**
   * Set control group state
   * @private
   */
  _setControlState(controlGroup, state) {
    const playBtn = controlGroup.querySelector('.play-btn');
    const pauseBtn = controlGroup.querySelector('.pause-btn');
    const restartBtn = controlGroup.querySelector('.restart-btn');

    // Reset all
    playBtn.classList.remove('active');
    pauseBtn.classList.remove('active');
    restartBtn.classList.remove('active');
    controlGroup.classList.remove('playing', 'paused');

    // Set state
    switch (state) {
      case 'playing':
        pauseBtn.classList.add('active');
        restartBtn.classList.add('active');
        controlGroup.classList.add('playing');
        break;
      case 'paused':
        playBtn.classList.add('active');
        restartBtn.classList.add('active');
        controlGroup.classList.add('paused');
        break;
      case 'ended':
        playBtn.classList.add('active');
        break;
    }
  }

  /**
   * Reset all control groups
   * @private
   */
  _resetAllControls() {
    const allControls = this.element.querySelectorAll('.narrative-audio-controls');
    allControls.forEach(controlGroup => {
      this._setControlState(controlGroup, 'ended');
    });
  }

  /**
   * Handle keyboard navigation
   * @private
   */
  _handleKeyboard(e) {
    if (!this.element || !document.body.contains(this.element)) return;

    if (e.key === 'Escape') {
      this.close();
    } else if (e.key === 'ArrowLeft') {
      this.prevPart();
    } else if (e.key === 'ArrowRight') {
      this.nextPart();
    }
  }

  /**
   * Show verb tooltip
   * @private
   */
  _showVerbTooltip(element) {
    const existingTooltip = this.element.querySelector('.verb-tooltip');
    if (existingTooltip) existingTooltip.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'verb-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-header">
        <strong>${this.data.verb}</strong>
        <button class="tooltip-close">&times;</button>
      </div>
      <p class="tooltip-definition">${this.data.definition}</p>
    `;

    const rect = element.getBoundingClientRect();
    tooltip.style.position = 'absolute';
    tooltip.style.top = `${rect.bottom + 10}px`;
    tooltip.style.left = `${rect.left}px`;

    this.element.appendChild(tooltip);

    const closeBtn = tooltip.querySelector('.tooltip-close');
    closeBtn.onclick = () => tooltip.remove();

    setTimeout(() => {
      if (tooltip.parentElement) tooltip.remove();
    }, 5000);
  }

  /**
   * Navigate to specific part
   */
  goToPart(index) {
    if (index < 0 || index >= this.narrative.parts.length) return;

    if (this.options.trackCompletion && this.currentPart !== index) {
      narrativeProgress.markPartComplete(this.data.verb, this.currentPart);
    }

    this.currentPart = index;
    this._highlightCurrentPart();
    this._updateNavigation();
    this._updateTOC();
    this._updateProgress();

    const activePart = this.element.querySelector('.narrative-part.active');
    if (activePart) {
      activePart.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  nextPart() {
    if (this.currentPart < this.narrative.parts.length - 1) {
      this.goToPart(this.currentPart + 1);
    }
  }

  prevPart() {
    if (this.currentPart > 0) {
      this.goToPart(this.currentPart - 1);
    }
  }

  _highlightCurrentPart() {
    const parts = this.element.querySelectorAll('.narrative-part');
    parts.forEach((part, index) => {
      if (index === this.currentPart) {
        part.classList.add('active');
      } else {
        part.classList.remove('active');
      }
    });
  }

  _updateNavigation() {
    const prevBtn = this.element.querySelector('.nav-prev');
    const nextBtn = this.element.querySelector('.nav-next');
    const indicator = this.element.querySelector('.nav-indicator');

    prevBtn.disabled = this.currentPart === 0;
    nextBtn.disabled = this.currentPart === this.narrative.parts.length - 1;
    indicator.textContent = `Parte ${this.currentPart + 1} de ${this.narrative.parts.length}`;
  }

  _updateTOC() {
    const tocItems = this.element.querySelectorAll('.toc-item');
    tocItems.forEach((item, index) => {
      if (index === this.currentPart) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  _updateProgress() {
    if (!this.options.showProgress) return;

    const progressSection = this.element.querySelector('.narrative-progress-section');
    if (!progressSection) return;

    this.progress = narrativeProgress.getProgress(this.data.verb);
    const completedCount = this.progress?.completedParts?.length || 0;
    const totalParts = this.narrative.parts.length;
    const percentage = totalParts > 0 ? Math.round((completedCount / totalParts) * 100) : 0;

    const progressFill = progressSection.querySelector('.progress-fill');
    const progressText = progressSection.querySelector('.progress-text');

    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${completedCount} de ${totalParts} partes leídas`;
  }

  close() {
    // Stop any playing audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.currentAudioFile = null;
    }

    if (this.options.trackCompletion) {
      narrativeProgress.markPartComplete(this.data.verb, this.currentPart);
    }

    this.element.classList.add('closing');

    setTimeout(() => {
      if (this.element && this.element.parentElement) {
        this.element.parentElement.removeChild(this.element);
      }

      document.removeEventListener('keydown', this._keyboardHandler);
      document.body.style.overflow = '';

      if (typeof this.options.onClose === 'function') {
        this.options.onClose();
      }
    }, 300);
  }

  open() {
    document.body.appendChild(this.element);
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      this.element.classList.add('active');
    }, 10);

    return this;
  }
}

export default NarrativeViewer;
