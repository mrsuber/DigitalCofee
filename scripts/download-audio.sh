#!/bin/bash

# Download Audio Files Script
# Downloads binaural beats from Internet Archive and copies them for all tracks

set -e

echo "🎵 Downloading sample binaural beats audio files..."

# Download alpha wave source (10 Hz)
echo "Downloading alpha wave (10 Hz)..."
wget -q -O "/tmp/alpha-source.mp3" "https://archive.org/download/BinauralBeats-AlphaBetaThetaDelta/Loopool-StandingAlphaAt10Hz.mp3"

# Download beta wave source (14 Hz)
echo "Downloading beta wave (14 Hz)..."
wget -q -O "/tmp/beta-source.mp3" "https://archive.org/download/BinauralBeats-AlphaBetaThetaDelta/Loopool-StandingBetaAt14Hz.mp3"

# Upload to VPS
VPS_HOST="root@76.13.41.99"
VPS_PATH="/var/www/digitalcoffee/audio"

echo "📤 Uploading to VPS..."

# Copy alpha source to VPS
scp "/tmp/alpha-source.mp3" "$VPS_HOST:$VPS_PATH/alpha/"

# Copy beta source to VPS
scp "/tmp/beta-source.mp3" "$VPS_HOST:$VPS_PATH/beta/"

# Create all track files on VPS (using the same source audio)
echo "Creating track files on VPS..."
ssh $VPS_HOST "cd $VPS_PATH/alpha && \
  cp alpha-source.mp3 morning-creative-flow.mp3 && \
  cp alpha-source.mp3 deep-meditation.mp3 && \
  cp alpha-source.mp3 creative-breakthrough.mp3 && \
  cp alpha-source.mp3 relaxed-focus.mp3 && \
  ls -lh"

ssh $VPS_HOST "cd $VPS_PATH/beta && \
  cp beta-source.mp3 peak-performance.mp3 && \
  cp beta-source.mp3 study-power.mp3 && \
  cp beta-source.mp3 laser-focus.mp3 && \
  cp beta-source.mp3 energy-boost.mp3 && \
  ls -lh"

# Cleanup
rm /tmp/alpha-source.mp3 /tmp/beta-source.mp3

echo "✅ Audio files downloaded and uploaded successfully!"
echo "📊 Total: 8 tracks (4 alpha + 4 beta)"
