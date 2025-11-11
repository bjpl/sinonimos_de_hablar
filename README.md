# Sinónimos de Hablar

An interactive educational web application for exploring Spanish synonyms of the verb "hablar" (to speak/talk), designed specifically for Latin American Spanish learners.

[![Live Site](https://img.shields.io/badge/Live-GitHub%20Pages-success)](https://bjpl.github.io/sinonimos_de_hablar)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Features

- **14 Curated Synonyms** - Comprehensive collection of speaking verbs with detailed definitions
- **Interactive Cards** - Beautiful, responsive card interface with hover effects
- **Search & Filter** - Find verbs by formality level (formal/neutral/informal) and context
- **Cultural Notes** - Latin American Spanish cultural context for each verb
- **Audio Pronunciation** - Multi-voice pronunciation support (coming soon)
- **Example Sentences** - Real-world usage examples for each synonym
- **High-Quality Images** - Curated images from Unsplash with proper attribution
- **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices

## 📚 Synonyms Included

1. **conversar** - To converse, have a conversation (neutral)
2. **platicar** - To chat casually (informal, Mexico/Central America)
3. **charlar** - To chat, have a light conversation (informal)
4. **dialogar** - To dialogue, have a formal exchange (formal)
5. **departir** - To converse pleasantly (formal, literary)
6. **discutir** - To discuss, debate (neutral)
7. **comunicar** - To communicate, convey (neutral)
8. **expresarse** - To express oneself (neutral)
9. **articular** - To articulate clearly (formal)
10. **pronunciar** - To pronounce, deliver a speech (neutral)
11. **decir** - To say, tell (universal, neutral)
12. **manifestar** - To manifest, declare publicly (formal)
13. **cotorrear** - To chatter, gossip (informal, Mexican)
14. **parlar** - To chatter incessantly (informal, colloquial)

## 🚀 Live Demo

Visit the live site: [https://bjpl.github.io/sinonimos_de_hablar](https://bjpl.github.io/sinonimos_de_hablar)

## 🛠️ Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables, flexbox, and grid
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Unsplash API** - High-quality images with attribution
- **GitHub Pages** - Free hosting and deployment

## 📁 Project Structure

```
sinonimos_de_hablar/
├── index.html                 # Main HTML file
├── src/
│   ├── scripts/
│   │   └── app.js            # Main application logic
│   ├── styles/
│   │   └── main.css          # Styles with earth tones theme
│   ├── data/
│   │   ├── synonyms.json     # Verb data
│   │   ├── image_credits.json # Unsplash attributions
│   │   └── audio_metadata.json # Audio file metadata
│   └── assets/
│       ├── images/           # Hero and synonym images
│       └── audio/            # Pronunciation audio files
├── scripts/
│   ├── download_images.js    # Unsplash image downloader
│   └── download_decir.js     # Additional image script
├── docs/                     # Documentation
└── research/                 # Linguistic research notes
```

## 🎨 Design

The application features a warm, earth-tones color palette inspired by natural communication:

- **Primary Colors**: Rich browns (#3d2e1f, #2a1f15)
- **Accent Colors**: Warm tans (#a89080, #c1a898)
- **Typography**: Cormorant Garamond (serif) + Inter (sans-serif)
- **Layout**: Responsive grid with smooth animations

## 🔧 Local Development

### Prerequisites

- Node.js 14+ (for image download script)
- Modern web browser
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/bjpl/sinonimos_de_hablar.git
cd sinonimos_de_hablar
```

2. Open `index.html` in your browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

3. Or use a local server:
```bash
# Python 3
python -m http.server 8000

# Node.js (npx http-server)
npx http-server -p 8000
```

Then visit: `http://localhost:8000`

## 📸 Image Attribution

All images are sourced from [Unsplash](https://unsplash.com) and used in accordance with the [Unsplash License](https://unsplash.com/license).

Full photographer credits available in [`src/data/image_credits.json`](src/data/image_credits.json).

### Download Images

To download fresh images from Unsplash:

```bash
# Set your Unsplash API key
export UNSPLASH_ACCESS_KEY=your_key_here

# Run the download script
node scripts/download_images.js
```

## 🎯 Usage

### Search
Type in the search box to find synonyms by name or definition.

### Filter
- **Formalidad**: Filter by formality level (formal, neutral, informal)
- **Contexto**: Filter by usage context (cotidiano, literario, narrativo, profesional)

### View Details
Click any card to see:
- Full definition
- Pronunciation guide
- Cultural notes
- Example sentences
- Regional usage information

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Areas for Contribution

- Additional synonyms
- Audio pronunciations
- Improved cultural notes
- UI/UX enhancements
- Bug fixes
- Documentation improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Images from [Unsplash](https://unsplash.com) photographers
- Inspired by Latin American Spanish linguistic research
- Built with ❤️ for Spanish language learners

## 📬 Contact

Questions or suggestions? Feel free to open an issue on GitHub.

---

**Part of the Spanish Verb Synonyms Series:**
- [Sinónimos de Ver](https://bjpl.github.io/sinonimos_de_ver) - Visual verbs
- [Sinónimos de Caminar](https://bjpl.github.io/sinonimos_de_caminar) - Movement verbs
- **Sinónimos de Hablar** - Speaking verbs (you are here)

Made with 🤖 by [Claude Code](https://claude.com/claude-code)
