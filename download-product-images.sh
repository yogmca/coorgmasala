#!/bin/bash

# Create images directory if it doesn't exist
mkdir -p backend/public/images

echo "Downloading product images..."

# Download black pepper image
curl -L "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Pfeffer_Schwarz.jpg/800px-Pfeffer_Schwarz.jpg" -o backend/public/images/black-pepper.jpg

# Download cinnamon image
curl -L "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Cinnamomum_verum_spices.jpg/800px-Cinnamomum_verum_spices.jpg" -o backend/public/images/cinnamon.jpg

# Download cardamom image  
curl -L "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Elettaria_cardamomum.jpg/800px-Elettaria_cardamomum.jpg" -o backend/public/images/cardamom.jpg

# Download turmeric image
curl -L "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Turmeric_powder.jpg/800px-Turmeric_powder.jpg" -o backend/public/images/turmeric.jpg

# Download ginger image
curl -L "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Ginger_rhizome.jpg/800px-Ginger_rhizome.jpg" -o backend/public/images/ginger.jpg

# Download coffee image
curl -L "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Roasted_coffee_beans.jpg/800px-Roasted_coffee_beans.jpg" -o backend/public/images/coffee.jpg

echo "✓ All images downloaded successfully!"
echo "Images saved to: backend/public/images/"
