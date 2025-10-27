#!/usr/bin/env node

/**
 * Unsplash Image Downloader for Sinónimos de Hablar
 *
 * Downloads curated images for the speaking/talking synonyms application
 * Generates attribution credits as required by Unsplash API guidelines
 *
 * Usage: node scripts/download_images.js
 *
 * Environment Variables:
 * - UNSPLASH_ACCESS_KEY: Your Unsplash API access key
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  UNSPLASH_ACCESS_KEY: 'DPM5yTFbvoZW0imPQWe5pAXAxbEMhhBZE1GllByUPzY',
  BASE_URL: 'https://api.unsplash.com',
  OUTPUT_DIR_SYNONYMS: path.join(__dirname, '../src/assets/images/synonyms'),
  OUTPUT_DIR_HERO: path.join(__dirname, '../src/assets/images/hero'),
  CREDITS_FILE: path.join(__dirname, '../src/assets/images/image_credits.json'),
  PER_PAGE: 1,
  ORIENTATION: 'landscape',
  IMAGE_WIDTH: 1200,
  IMAGE_QUALITY: 85
};

// Image search queries for each synonym
const IMAGE_QUERIES = {
  hero: {
    query: 'people talking communication conversation diverse speaking',
    category: 'hero',
    filename: 'hero-hablar.jpg'
  },
  conversar: {
    query: 'people conversing discussion dialogue talking',
    category: 'synonym',
    filename: 'conversar.jpg'
  },
  platicar: {
    query: 'casual conversation friends chatting latin america',
    category: 'synonym',
    filename: 'platicar.jpg'
  },
  charlar: {
    query: 'informal chat coffee conversation relaxed',
    category: 'synonym',
    filename: 'charlar.jpg'
  },
  dialogar: {
    query: 'dialogue conversation communication exchange',
    category: 'synonym',
    filename: 'dialogar.jpg'
  },
  departir: {
    query: 'formal conversation elegant discussion refined',
    category: 'synonym',
    filename: 'departir.jpg'
  },
  discutir: {
    query: 'discussion debate conversation argument exchange',
    category: 'synonym',
    filename: 'discutir.jpg'
  },
  comunicar: {
    query: 'communication expressing ideas telling sharing',
    category: 'synonym',
    filename: 'comunicar.jpg'
  },
  expresarse: {
    query: 'self expression speaking articulating emotions',
    category: 'synonym',
    filename: 'expresarse.jpg'
  },
  articular: {
    query: 'articulate speech speaking pronunciation clear',
    category: 'synonym',
    filename: 'articular.jpg'
  },
  pronunciar: {
    query: 'pronunciation speaking delivering speech words',
    category: 'synonym',
    filename: 'pronunciar.jpg'
  },
  decir: {
    query: 'person speaking talking verbal communication speech',
    category: 'synonym',
    filename: 'decir.jpg'
  },
  manifestar: {
    query: 'manifesting expressing declaration speaking',
    category: 'synonym',
    filename: 'manifestar.jpg'
  },
  cotorrear: {
    query: 'chatting gossiping casual conversation lively',
    category: 'synonym',
    filename: 'cotorrear.jpg'
  },
  parlar: {
    query: 'talking speaking conversation casual informal',
    category: 'synonym',
    filename: 'parlar.jpg'
  }
};

// Utilities
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = (url, headers = {}) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
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

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
};

const ensureDirectories = () => {
  [CONFIG.OUTPUT_DIR_SYNONYMS, CONFIG.OUTPUT_DIR_HERO].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  });
};

const validateApiKey = () => {
  if (!CONFIG.UNSPLASH_ACCESS_KEY || CONFIG.UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY_HERE') {
    console.error('\n❌ Error: Unsplash API access key not configured');
    console.error('\nPlease set your API key using one of these methods:');
    console.error('1. Environment variable: export UNSPLASH_ACCESS_KEY=your_key_here');
    console.error('2. Edit this script and replace YOUR_UNSPLASH_ACCESS_KEY_HERE\n');
    console.error('Get your API key at: https://unsplash.com/developers\n');
    process.exit(1);
  }
};

const searchUnsplashImage = async (query) => {
  const params = new URLSearchParams({
    query: query,
    per_page: CONFIG.PER_PAGE,
    orientation: CONFIG.ORIENTATION
  });

  const url = `${CONFIG.BASE_URL}/search/photos?${params}`;
  const headers = {
    'Authorization': `Client-ID ${CONFIG.UNSPLASH_ACCESS_KEY}`
  };

  const data = await makeRequest(url, headers);

  if (!data.results || data.results.length === 0) {
    throw new Error('No images found for query');
  }

  return data.results[0];
};

const triggerDownload = async (downloadLocation) => {
  // Unsplash API requires triggering download endpoint for analytics
  const headers = {
    'Authorization': `Client-ID ${CONFIG.UNSPLASH_ACCESS_KEY}`
  };

  try {
    await makeRequest(downloadLocation, headers);
  } catch (err) {
    console.warn(`Warning: Failed to trigger download analytics: ${err.message}`);
  }
};

const processImage = async (key, config, credits) => {
  console.log(`\n[${key}] Searching for: "${config.query}"`);

  try {
    // Search for image
    const photo = await searchUnsplashImage(config.query);

    console.log(`  ✓ Found image by ${photo.user.name}`);
    console.log(`  → ${photo.description || 'No description'}`);

    // Determine output path
    const outputDir = config.category === 'hero' ? CONFIG.OUTPUT_DIR_HERO : CONFIG.OUTPUT_DIR_SYNONYMS;
    const outputPath = path.join(outputDir, config.filename);

    // Get optimized image URL
    const imageUrl = `${photo.urls.raw}&w=${CONFIG.IMAGE_WIDTH}&q=${CONFIG.IMAGE_QUALITY}&fm=jpg&fit=max`;

    // Download image
    console.log(`  ⬇ Downloading...`);
    await downloadFile(imageUrl, outputPath);
    console.log(`  ✓ Saved to: ${path.relative(process.cwd(), outputPath)}`);

    // Trigger download analytics (required by Unsplash API)
    await triggerDownload(photo.links.download_location);

    // Store credits
    credits[key] = {
      filename: config.filename,
      category: config.category,
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

    return true;
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    return false;
  }
};

const saveCredits = (credits) => {
  const creditsData = {
    generated_at: new Date().toISOString(),
    total_images: Object.keys(credits).length,
    attribution_required: true,
    attribution_text: 'Photos provided by Unsplash',
    images: credits
  };

  fs.writeFileSync(CONFIG.CREDITS_FILE, JSON.stringify(creditsData, null, 2));
  console.log(`\n✓ Credits saved to: ${path.relative(process.cwd(), CONFIG.CREDITS_FILE)}`);
};

const generateReport = (credits, failed) => {
  const total = Object.keys(IMAGE_QUERIES).length;
  const successful = Object.keys(credits).length;

  console.log('\n' + '='.repeat(60));
  console.log('DOWNLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total images:      ${total}`);
  console.log(`Successfully downloaded: ${successful}`);
  console.log(`Failed:            ${failed.length}`);
  console.log(`Success rate:      ${((successful / total) * 100).toFixed(1)}%`);

  if (failed.length > 0) {
    console.log('\nFailed downloads:');
    failed.forEach(key => {
      console.log(`  - ${key}: "${IMAGE_QUERIES[key].query}"`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('ATTRIBUTION REQUIREMENTS');
  console.log('='.repeat(60));
  console.log('Per Unsplash API Guidelines:');
  console.log('1. Credit photographers when displaying images');
  console.log('2. Link to photographer profiles on Unsplash');
  console.log('3. Include "Photo by [Name] on Unsplash" text');
  console.log('\nAll credits available in: image_credits.json');
  console.log('='.repeat(60) + '\n');
};

// Main execution
const main = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('UNSPLASH IMAGE DOWNLOADER - Sinónimos de Hablar');
  console.log('='.repeat(60) + '\n');

  // Validate API key
  validateApiKey();

  // Ensure output directories exist
  ensureDirectories();

  // Track progress
  const credits = {};
  const failed = [];

  // Process each image with rate limiting
  const entries = Object.entries(IMAGE_QUERIES);
  for (let i = 0; i < entries.length; i++) {
    const [key, config] = entries[i];

    console.log(`\nProgress: ${i + 1}/${entries.length}`);

    const success = await processImage(key, config, credits);

    if (!success) {
      failed.push(key);
    }

    // Rate limiting: Unsplash allows 50 requests per hour for demo apps
    // Sleep for 1.5 seconds between requests to be safe
    if (i < entries.length - 1) {
      console.log('  ⏱ Rate limiting (1.5s)...');
      await sleep(1500);
    }
  }

  // Save credits file
  if (Object.keys(credits).length > 0) {
    saveCredits(credits);
  }

  // Generate final report
  generateReport(credits, failed);

  // Exit with appropriate code
  process.exit(failed.length > 0 ? 1 : 0);
};

// Run the script
if (require.main === module) {
  main().catch(err => {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  });
}

module.exports = { processImage, searchUnsplashImage, CONFIG };
