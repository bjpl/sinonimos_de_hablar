# GitHub Pages Setup Instructions

## 🚨 CRITICAL: Configure GitHub Pages to use gh-pages branch

Your Sinónimos de Hablar app is deployed on the `gh-pages` branch (like sinonimos_de_ver), but GitHub Pages may still be pointing to the `main` branch.

---

## ⚙️ Configure GitHub Pages Settings

### Step 1: Go to Repository Settings
Visit: https://github.com/bjpl/sinonimos_de_hablar/settings/pages

### Step 2: Change Branch Setting
Under **"Build and deployment"** section:

**Source**: Deploy from a branch

**Branch**:
- Change from: `main` `/( root)`
- Change to: **`gh-pages`** `/( root)`

Click **Save**

### Step 3: Wait for Deployment
- GitHub Pages will rebuild (takes 1-2 minutes)
- You'll see a success message with your site URL
- The site will be available at: https://bjpl.github.io/sinonimos_de_hablar

---

## 📊 Branch Structure

### main branch
- Contains ALL development files
- Includes `.claude/` configuration
- Research materials
- Documentation
- Test files
- ~240 files total

### gh-pages branch (DEPLOYMENT)
- Contains ONLY production files
- Clean structure matching working apps
- Essential files only:
  - index.html
  - scripts/app.js
  - styles/main.css
  - data/ (JSON files)
  - assets/ (images)
  - .nojekyll
- ~27 files total

---

## ✅ Verification

After changing to `gh-pages` branch, your site should display:

1. **Hero Image** - People talking/communicating
2. **14 Synonym Cards** - Interactive cards with:
   - conversar
   - platicar
   - charlar
   - dialogar
   - departir
   - discutir
   - comunicar
   - expresarse
   - articular
   - pronunciar
   - decir
   - manifestar
   - cotorrear
   - parlar

3. **Search & Filter** - Working search and dual filtering
4. **Modal Details** - Click any card to see full information
5. **Responsive Design** - Works on all devices

---

## 🐛 Troubleshooting

### If you see "No results found"

**Most Likely Cause**: GitHub Pages is still using `main` branch instead of `gh-pages`

**Solution**: Follow steps above to change to `gh-pages` branch

### If site still doesn't work after changing branches

1. **Hard Refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear Cache**: Clear browser cache completely
3. **Wait**: Give GitHub Pages 5 minutes to fully deploy
4. **Check Status**: Visit https://github.com/bjpl/sinonimos_de_hablar/deployments

### Browser Console Check

Open browser console (F12) and look for:
- `✓ Data loaded successfully`
- `- Synonyms: 14 verbs`
- `✓ Rendered 14 verb cards`

If you see errors, check the exact error message.

---

## 📁 File Locations on gh-pages

All files use root-relative paths:

```
/index.html
/styles/main.css
/scripts/app.js
/data/synonyms.json
/data/image_credits.json
/data/audio_metadata.json
/assets/images/hero/hero-hablar.jpg
/assets/images/synonyms/[14 images].jpg
```

---

## 🔍 Quick Tests

Once configured, test these URLs:

1. **Main Site**: https://bjpl.github.io/sinonimos_de_hablar
2. **Data File**: https://bjpl.github.io/sinonimos_de_hablar/data/synonyms.json
3. **App Script**: https://bjpl.github.io/sinonimos_de_hablar/scripts/app.js
4. **Hero Image**: https://bjpl.github.io/sinonimos_de_hablar/assets/images/hero/hero-hablar.jpg

All should load without 404 errors.

---

## ✅ Expected Result

After configuration, your site will match the quality and functionality of:
- https://bjpl.github.io/sinonimos_de_ver
- https://bjpl.github.io/sinonimos_de_caminar

With full parity in:
- Design and styling
- Interactive features
- Content quality
- Responsive behavior
- Accessibility

---

**Next Step**: Visit https://github.com/bjpl/sinonimos_de_hablar/settings/pages and change to `gh-pages` branch!
