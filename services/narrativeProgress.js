/**
 * NarrativeProgress Service
 * Tracks user progress through narrative experiences using LocalStorage
 */

class NarrativeProgressTracker {
  constructor() {
    this.storageKey = 'sinonimos_hablar_narrative_progress';
    this.data = this._load();
  }

  markPartComplete(verb, partIndex) {
    if (!this.data[verb]) {
      this.data[verb] = {
        startedAt: Date.now(),
        completedParts: [],
        lastVisited: Date.now(),
        totalTime: 0
      };
    }

    if (!this.data[verb].completedParts.includes(partIndex)) {
      this.data[verb].completedParts.push(partIndex);
      this.data[verb].completedParts.sort((a, b) => a - b);
    }

    this.data[verb].lastVisited = Date.now();
    this._save();

    return this.data[verb];
  }

  getProgress(verb) {
    return this.data[verb] || null;
  }

  isPartCompleted(verb, partIndex) {
    const progress = this.data[verb];
    return progress && progress.completedParts.includes(partIndex);
  }

  getCompletionPercentage(verb, totalParts) {
    const progress = this.data[verb];
    if (!progress || !totalParts) return 0;
    return Math.round((progress.completedParts.length / totalParts) * 100);
  }

  _load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load narrative progress:', error);
      return {};
    }
  }

  _save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save narrative progress:', error);
    }
  }
}

export const narrativeProgress = new NarrativeProgressTracker();
export default narrativeProgress;
