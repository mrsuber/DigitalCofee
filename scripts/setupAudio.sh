#!/bin/bash

# Digital Coffee - Audio Setup Script
# Sets up audio files on VPS for alpha and beta waves

echo "🎵 Setting up Digital Coffee audio files..."

# Create directories
echo "Creating audio directories..."
mkdir -p /var/www/digitalcoffee/public/audio/alpha
mkdir -p /var/www/digitalcoffee/public/audio/beta

cd /var/www/digitalcoffee/public/audio

# Download sample binaural beats audio
echo "Downloading sample binaural beats audio..."
cd alpha
curl -L -o "morning-creative-flow.mp3" "https://archive.org/download/BinauralBeats-AlphaBetaThetaDelta/Loopool-StandingAlphaAt10Hz.mp3" 2>&1 | tail -5

# Copy for other alpha tracks
cp morning-creative-flow.mp3 deep-meditation.mp3
cp morning-creative-flow.mp3 creative-breakthrough.mp3
cp morning-creative-flow.mp3 relaxed-focus.mp3

echo "✅ Alpha wave tracks created"
ls -lh

# Beta tracks
cd ../beta
curl -L -o "productive-focus.mp3" "https://archive.org/download/BinauralBeats-AlphaBetaThetaDelta/Loopool-StandingBetaAt20Hz.mp3" 2>&1 | tail -5

cp productive-focus.mp3 active-concentration.mp3
cp productive-focus.mp3 study-power.mp3
cp productive-focus.mp3 mental-energy.mp3

echo "✅ Beta wave tracks created"
ls -lh

echo "✅ Audio setup complete!"
echo "Alpha tracks: 4 files"
echo "Beta tracks: 4 files"
echo "Total: 8 audio files ready"
