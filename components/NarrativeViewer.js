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
      ...options
    };

    this.currentPart = 0;
    this.element = null;
    this.progress = this.options.trackCompletion
      ? narrativeProgress.getProgress(this.data.verb)
      : null;
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

            <div class="narrative-navigation">
              <button class="nav-button nav-prev" data-action="prev" ${this.currentPart === 0 ? 'disabled' : ''}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                Anterior
              </button>
              <span class="nav-indicator">
                Parte ${this.currentPart + 1} de ${this.narrative.parts.length}
              </span>
              <button class="nav-button nav-next" data-action="next" ${this.currentPart === this.narrative.parts.length - 1 ? 'disabled' : ''}>
                Siguiente
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
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

      return `
        <div class="narrative-part ${isActive ? 'active' : ''}" data-part="${index}">
          <div class="part-number">Parte ${index + 1}</div>
          <p class="part-text">${highlightedText}</p>
        </div>
      `;
    }).join('');
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

    const navButtons = this.element.querySelectorAll('.nav-button');
    navButtons.forEach(btn => {
      btn.onclick = () => {
        const action = btn.dataset.action;
        if (action === 'next') this.nextPart();
        if (action === 'prev') this.prevPart();
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

    this._keyboardHandler = this._handleKeyboard.bind(this);
    document.addEventListener('keydown', this._keyboardHandler);
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
