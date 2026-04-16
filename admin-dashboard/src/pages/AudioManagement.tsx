import React, { useState, useEffect } from 'react';
import { Upload, Music, Trash2, X } from 'lucide-react';
import { apiService } from '../services/api';

interface Track {
  id: string;
  name: string;
  duration: number;
  waveType: 'alpha' | 'beta';
  file: string;
  description?: string;
  frequency?: string;
  category?: string;
  isPremium?: boolean;
}

import { AudioPlayer } from '../components/audio/AudioPlayer';

export const AudioManagement: React.FC = () => {
  const [alphaTracks, setAlphaTracks] = useState<Track[]>([]);
  const [betaTracks, setBetaTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAudioTracks();
      if (response.data) {
        setAlphaTracks(response.data.alpha || []);
        setBetaTracks(response.data.beta || []);
      }
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const waveType = formData.get('waveType') as string;
    const audioFile = formData.get('audioFile') as File;

    if (!audioFile || !name || !waveType) {
      alert('Please fill in all fields');
      setUploading(false);
      return;
    }

    // Calculate duration from audio file
    const audio = new Audio();
    audio.src = URL.createObjectURL(audioFile);

    audio.addEventListener('loadedmetadata', async () => {
      const duration = Math.floor(audio.duration);

      const result = await apiService.uploadAudio(audioFile, name, waveType, duration);

      if (result.error) {
        alert(`Upload failed: ${result.error}`);
      } else {
        alert('Audio track uploaded successfully!');
        setShowUploadModal(false);
        fetchTracks(); // Refresh track list
      }

      setUploading(false);
      URL.revokeObjectURL(audio.src);
    });

    audio.addEventListener('error', () => {
      alert('Failed to read audio file duration');
      setUploading(false);
      URL.revokeObjectURL(audio.src);
    });
  };

  const handleDelete = async (trackId: string, trackName: string) => {
    if (!confirm(`Are you sure you want to delete "${trackName}"?`)) {
      return;
    }

    const result = await apiService.deleteAudioTrack(trackId);

    if (result.error) {
      alert(`Delete failed: ${result.error}`);
    } else {
      alert('Audio track deleted successfully!');
      fetchTracks(); // Refresh track list
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-coffee-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Audio Management</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload Audio
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Tracks</p>
          <p className="text-2xl font-bold text-gray-800">{alphaTracks.length + betaTracks.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Alpha Tracks</p>
          <p className="text-2xl font-bold text-purple-600">{alphaTracks.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Beta Tracks</p>
          <p className="text-2xl font-bold text-orange-600">{betaTracks.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alpha Waves */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            Alpha Waves (8-12 Hz)
          </h3>
          {alphaTracks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No alpha tracks yet</p>
          ) : (
            <div className="space-y-4">
              {alphaTracks.map((track) => (
                <div key={track.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition">
                    <div className="flex items-center flex-1 cursor-pointer" onClick={() => setPlayingTrack(playingTrack === track.id ? null : track.id)}>
                      <Music className="w-5 h-5 text-purple-500 mr-3" />
                      <div>
                        <p className="font-medium">{track.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatDuration(track.duration)}
                          {track.frequency && ` • ${track.frequency}`}
                          {track.isPremium && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Premium</span>}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(track.id, track.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {playingTrack === track.id && (
                    <div className="p-3 border-t border-gray-200">
                      <AudioPlayer audioUrl={track.file} trackName={track.name} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Beta Waves */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
            Beta Waves (12-30 Hz)
          </h3>
          {betaTracks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No beta tracks yet</p>
          ) : (
            <div className="space-y-4">
              {betaTracks.map((track) => (
                <div key={track.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition">
                    <div className="flex items-center flex-1 cursor-pointer" onClick={() => setPlayingTrack(playingTrack === track.id ? null : track.id)}>
                      <Music className="w-5 h-5 text-orange-500 mr-3" />
                      <div>
                        <p className="font-medium">{track.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatDuration(track.duration)}
                          {track.frequency && ` • ${track.frequency}`}
                          {track.isPremium && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Premium</span>}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(track.id, track.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {playingTrack === track.id && (
                    <div className="p-3 border-t border-gray-200">
                      <AudioPlayer audioUrl={track.file} trackName={track.name} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Upload Audio Track</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Track Name</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    placeholder="e.g., Morning Focus"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wave Type</label>
                  <select
                    name="waveType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select wave type</option>
                    <option value="alpha">Alpha (8-12 Hz)</option>
                    <option value="beta">Beta (12-30 Hz)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audio File</label>
                  <input
                    type="file"
                    name="audioFile"
                    accept="audio/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Supported: MP3, WAV, OGG</p>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
