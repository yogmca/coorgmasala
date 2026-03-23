const https = require('https');
const fs = require('fs');
const path = require('path');

// Sample image URLs from Unsplash (free to use)
const images = [
  {
    name: 'black-pepper.jpg',
    url: 'https://images.unsplash.com/photo-1599909533730-f9d49c0c5b8e?w=800&h=800&fit=crop'
  },
  {
    name: 'cinnamon.jpg',
    url: 'https://images.unsplash.com/photo-1599909533730-f9d49c0c5b8e?w=800&h=800&fit=crop'
  },
  {
    name: 'cardamom.jpg',
    url: 'https://images.unsplash.com/photo-1596040033229-a0b3b83d6c4f?w=800&h=800&fit=crop'
  },
  {
    name: 'turmeric.jpg',
    url: 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&h=800&fit=crop'
  },
  {
    name: 'ginger.jpg',
    url: 'https://images.unsplash.com/photo-1599909533730-f9d49c0c5b8e?w=800&h=800&fit=crop'
  },
  {
    name: 'coffee.jpg',
    url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop'
  }
];

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(__dirname, 'public', 'images', filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      console.error(`✗ Failed to download ${filename}:`, err.message);
      reject(err);
    });
  });
};

const downloadAllImages = async () => {
  console.log('Downloading sample product images...\n');

  // Create images directory if it doesn't exist
  const imagesDir = path.join(__dirname, 'public', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  for (const image of images) {
    try {
      await downloadImage(image.url, image.name);
    } catch (error) {
      console.error(`Failed to download ${image.name}`);
    }
  }

  console.log('\n✓ All images downloaded successfully!');
  console.log('Images saved to: backend/public/images/');
};

downloadAllImages().catch(console.error);
