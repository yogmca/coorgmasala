# Product Images

This directory contains product images for the Coorg Spices e-commerce store.

## Current Images

The following placeholder images are needed for the products:

1. **black-pepper.jpg** - Black Pepper product image
2. **cinnamon.jpg** - Cinnamon Sticks product image
3. **cardamom.jpg** - Green Cardamom product image
4. **turmeric.jpg** - Turmeric Powder product image
5. **ginger.jpg** - Dried Ginger product image
6. **coffee.jpg** - Coffee Powder product image

## Image Specifications

- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 800x800 pixels
- **Aspect Ratio**: 1:1 (square)
- **File Size**: < 500KB for optimal loading
- **Background**: White or transparent

## How to Add Images

### Option 1: Download Free Stock Images

Visit these websites for free spice images:

1. **Unsplash**: https://unsplash.com/s/photos/spices
2. **Pexels**: https://www.pexels.com/search/spices/
3. **Pixabay**: https://pixabay.com/images/search/spices/

Search for:
- "black pepper"
- "cinnamon sticks"
- "cardamom"
- "turmeric powder"
- "dried ginger"
- "coffee powder"

### Option 2: Use Placeholder Image Service

Temporarily use placeholder images by updating the product image URLs:

```javascript
// In seed.js, update image paths to use placeholder service
image: 'https://via.placeholder.com/800x800/8B4513/FFFFFF?text=Black+Pepper'
```

### Option 3: Take Your Own Photos

If you have the actual products:
1. Use a smartphone camera
2. Use white background
3. Good lighting
4. Square crop (1:1 ratio)
5. Save as JPG
6. Place in this directory

## Current Setup

The application is configured to serve images from `/images/` path.

Images should be placed directly in this directory:
```
backend/public/images/
├── black-pepper.jpg
├── cinnamon.jpg
├── cardamom.jpg
├── turmeric.jpg
├── ginger.jpg
└── coffee.jpg
```

## Temporary Solution

I've created a script to download sample images automatically. Run:

```bash
cd backend
node download-images.js
```

Or manually download and rename images to match the filenames above.
