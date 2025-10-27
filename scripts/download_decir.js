#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  UNSPLASH_ACCESS_KEY: 'DPM5yTFbvoZW0imPQWe5pAXAxbEMhhBZE1GllByUPzY',
  BASE_URL: 'https://api.unsplash.com',
  OUTPUT_DIR: path.join(__dirname, '../src/assets/images/synonyms'),
  CREDITS_FILE: path.join(__dirname, '../src/assets/images/image_credits.json'),
  IMAGE_WIDTH: 1200,
  IMAGE_QUALITY: 85
};

const makeRequest = (url, headers = {}) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
};

const downloadFile = (url, outputPath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
};

const searchAndDownload = async () => {
  const query = 'person speaking talking verbal communication speech';
  console.log('\n[decir] Searching with new query:', query);

  const params = new URLSearchParams({
    query: query,
    per_page: 1,
    orientation: 'landscape'
  });

  const url = `${CONFIG.BASE_URL}/search/photos?${params}`;
  const headers = { 'Authorization': `Client-ID ${CONFIG.UNSPLASH_ACCESS_KEY}` };

  const data = await makeRequest(url, headers);

  if (!data.results || data.results.length === 0) {
    console.error('  ❌ No images found');
    process.exit(1);
  }

  const photo = data.results[0];
  console.log(`  ✓ Found image by ${photo.user.name}`);
  console.log(`  → ${photo.description || photo.alt_description || 'No description'}`);

  const outputPath = path.join(CONFIG.OUTPUT_DIR, 'decir.jpg');
  const imageUrl = `${photo.urls.raw}&w=${CONFIG.IMAGE_WIDTH}&q=${CONFIG.IMAGE_QUALITY}&fm=jpg&fit=max`;

  console.log('  ⬇ Downloading...');
  await downloadFile(imageUrl, outputPath);
  console.log(`  ✓ Saved to: ${path.relative(process.cwd(), outputPath)}`);

  // Update credits
  const creditsData = JSON.parse(fs.readFileSync(CONFIG.CREDITS_FILE, 'utf8'));
  creditsData.images.decir = {
    filename: 'decir.jpg',
    category: 'synonym',
    photographer: {
      name: photo.user.name,
      username: photo.user.username,
      profile_url: photo.user.links.html
    },
    photo: {
      id: photo.id,
      url: photo.urls.regular,
      unsplash_url: photo.links.html,
      description: photo.description || photo.alt_description || null,
      color: photo.color
    },
    downloaded_at: new Date().toISOString()
  };
  creditsData.total_images = Object.keys(creditsData.images).length;

  fs.writeFileSync(CONFIG.CREDITS_FILE, JSON.stringify(creditsData, null, 2));
  console.log('  ✓ Credits updated');

  // Trigger download endpoint
  await makeRequest(photo.links.download_location, headers);
  console.log('  ✓ Download analytics triggered\n');

  console.log('✅ Successfully downloaded decir image!');
};

searchAndDownload().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
