# Sinónimos de Hablar

An interactive Spanish language learning application exploring synonyms of "hablar" (to speak/talk) designed for Latin American Spanish learners.

## Live Demo

**Deployed Application:** https://bjpl.github.io/sinonimos_de_hablar/

This project demonstrates interactive language learning through comprehensive synonym exploration, featuring detailed definitions, cultural context, example sentences, and high-quality imagery.

## Technical Overview

**Key Technologies:**
- Vanilla JavaScript (ES6+)
- HTML5 / CSS3 with CSS Grid and Flexbox
- Unsplash API for imagery
- Static site deployment via GitHub Pages
- No build tools or dependencies

**Implementation Highlights:**
- 14 curated synonyms with detailed definitions
- Interactive card interface with hover effects
- Real-time search and multi-filter functionality
- Cultural notes specific to Latin American Spanish
- Responsive design from mobile to desktop
- Semantic HTML5 markup

## Features

**Language Learning:**
- 14 comprehensive synonyms: conversar, platicar, charlar, dialogar, departir, discutir, comunicar, expresarse, articular, pronunciar, decir, manifestar, cotorrear, parlar
- Detailed definitions with formality indicators
- Authentic example sentences
- Regional usage notes (Mexico, Central America, etc.)
- Cultural context for each verb

**Interactive Interface:**
- Search functionality across names and definitions
- Filter by formality (formal/neutral/informal)
- Filter by context (cotidiano/literario/narrativo/profesional)
- Modal detail view with full information
- Beautiful card-based layout
- Smooth animations and transitions

**Visual Design:**
- High-quality Unsplash photography
- Earth-tones color palette
- Elegant typography pairing
- Responsive grid layout
- Professional photographer attribution

## Exploring the Code

```
sinonimos_de_hablar/
├── index.html             # Main application file
├── scripts/
│   ├── app.js            # Application logic
│   ├── download_images.js # Unsplash image fetcher
│   └── download_decir.js  # Additional image script
├── styles/
│   └── main.css          # Complete styling
├── data/
│   ├── synonyms.json     # Verb dataset
│   ├── image_credits.json # Photographer attributions
│   └── audio_metadata.json # Audio file metadata
├── assets/
│   ├── images/           # Hero and synonym images
│   └── audio/            # Pronunciation audio files
├── docs/                 # Additional documentation
└── research/             # Linguistic research notes
```

## Local Development

<details>
<summary>Click to expand setup instructions</summary>

```bash
# Clone repository
git clone https://github.com/bjpl/sinonimos_de_hablar.git
cd sinonimos_de_hablar

# Option 1: Open directly in browser
open index.html              # macOS
xdg-open index.html          # Linux
start index.html             # Windows

# Option 2: Run local server (recommended)
python -m http.server 8000
# Visit http://localhost:8000

# Node.js alternative
npx http-server -p 8000
```

**Regenerate Images:**
```bash
# Set Unsplash API key
export UNSPLASH_ACCESS_KEY=your_key_here

# Download fresh images
node scripts/download_images.js
```

**Requirements:**
- Node.js 14+ (for image download script only)
- Modern web browser
- Git
</details>

## Design System

**Color Palette:**
- Primary: Rich browns (#3d2e1f, #2a1f15)
- Accent: Warm tans (#a89080, #c1a898)
- Inspired by natural communication

**Typography:**
- Cormorant Garamond (serif) for Spanish content
- Inter (sans-serif) for UI
- Refined, professional pairing

**Layout:**
- Responsive grid with smooth animations
- Mobile-first approach
- Generous whitespace
- Hover effects and interactive states

## Usage Guide

**Search:**
Type in the search box to find synonyms by name or definition.

**Filter:**
- Formalidad: Filter by formality level
- Contexto: Filter by usage context

**View Details:**
Click any card to see:
- Full definition
- Pronunciation guide
- Cultural notes
- Example sentences
- Regional usage information

## Attribution

**Images:**
- Source: Unsplash
- License: Unsplash License
- Full credits: See data/image_credits.json

**Content:**
- Linguistic research on Latin American Spanish
- Original definitions and examples
- Educational use with attribution

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Related Projects

Part of the Spanish Verb Synonyms Series:
- [Sinónimos de Caminar](https://bjpl.github.io/sinonimos_de_caminar) - Movement verbs
- [Sinónimos de Ver](https://bjpl.github.io/sinonimos_de_ver) - Visual verbs
- [Sinónimos de Comer](https://bjpl.github.io/sinonimos_de_comer) - Eating verbs

---

Built for Spanish language learners with focus on Latin American usage
