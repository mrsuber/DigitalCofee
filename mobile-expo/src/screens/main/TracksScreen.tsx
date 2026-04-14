import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {theme} from '../../theme';
import {apiService} from '../../services/api';
import {Track} from '../../types';

type WaveType = 'all' | 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';

interface TracksScreenProps {
  navigation: any;
}

export const TracksScreen: React.FC<TracksScreenProps> = ({navigation}) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [selectedWaveType, setSelectedWaveType] = useState<WaveType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTracks();
  }, []);

  useEffect(() => {
    filterTracks();
  }, [selectedWaveType, searchQuery, tracks]);

  const loadTracks = async () => {
    setLoading(true);
    const result = await apiService.getTracks();

    if (result.data) {
      // Combine all tracks from different wave types
      const allTracks = [
        ...(result.data.alpha || []),
        ...(result.data.beta || []),
      ];
      setTracks(allTracks);
    }

    setLoading(false);
  };

  const filterTracks = () => {
    let filtered = tracks;

    // Filter by wave type
    if (selectedWaveType !== 'all') {
      filtered = filtered.filter(track => track.waveType === selectedWaveType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(track =>
        track.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTracks(filtered);
  };

  const handleTrackPress = (track: Track) => {
    navigation.navigate('Player', {track});
  };

  const getWaveTypeColor = (waveType: string) => {
    switch (waveType) {
      case 'delta':
        return '#1E3A8A'; // Deep blue
      case 'theta':
        return '#7C3AED'; // Purple
      case 'alpha':
        return '#9F7AEA'; // Light purple
      case 'beta':
        return '#2563EB'; // Blue
      case 'gamma':
        return '#F59E0B'; // Orange
      default:
        return theme.colors.coffee.cappuccino;
    }
  };

  const getWaveTypeGradient = (waveType: string): [string, string] => {
    switch (waveType) {
      case 'delta':
        return ['#1E3A8A', '#3B82F6'];
      case 'theta':
        return ['#7C3AED', '#A78BFA'];
      case 'alpha':
        return ['#9F7AEA', '#C4B5FD'];
      case 'beta':
        return ['#2563EB', '#60A5FA'];
      case 'gamma':
        return ['#F59E0B', '#FCD34D'];
      default:
        return [theme.colors.coffee.cappuccino, theme.colors.coffee.latte];
    }
  };

  const getWaveTypeEmoji = (waveType: string) => {
    switch (waveType) {
      case 'delta':
        return '💤';
      case 'theta':
        return '🧘';
      case 'alpha':
        return '🌊';
      case 'beta':
        return '⚡';
      case 'gamma':
        return '🚀';
      default:
        return '🎵';
    }
  };

  const getWaveTypeLabel = (waveType: string) => {
    switch (waveType) {
      case 'delta':
        return 'Delta (0.5-4 Hz)';
      case 'theta':
        return 'Theta (4-8 Hz)';
      case 'alpha':
        return 'Alpha (8-12 Hz)';
      case 'beta':
        return 'Beta (12-30 Hz)';
      case 'gamma':
        return 'Gamma (30-100 Hz)';
      default:
        return waveType;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const waveTypeFilters: WaveType[] = ['all', 'delta', 'theta', 'alpha', 'beta', 'gamma'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Library</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tracks..."
            placeholderTextColor={theme.colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Wave Type Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}>
        {waveTypeFilters.map(waveType => {
          const isSelected = selectedWaveType === waveType;
          return (
            <TouchableOpacity
              key={waveType}
              onPress={() => setSelectedWaveType(waveType)}
              activeOpacity={0.8}>
              <LinearGradient
                colors={
                  isSelected
                    ? getWaveTypeGradient(waveType)
                    : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                }
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                ]}>
                <Text style={styles.filterEmoji}>
                  {waveType === 'all' ? '🎵' : getWaveTypeEmoji(waveType)}
                </Text>
                <Text
                  style={[
                    styles.filterText,
                    isSelected && styles.filterTextSelected,
                  ]}>
                  {waveType === 'all' ? 'All' : waveType.charAt(0).toUpperCase() + waveType.slice(1)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Track List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.coffee.cappuccino} />
          <Text style={styles.loadingText}>Loading tracks...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.tracksList}
          contentContainerStyle={styles.tracksListContent}
          showsVerticalScrollIndicator={false}>
          {filteredTracks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎵</Text>
              <Text style={styles.emptyTitle}>No tracks found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'No tracks available for this wave type'}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.resultsCount}>
                {filteredTracks.length} {filteredTracks.length === 1 ? 'track' : 'tracks'}
              </Text>
              {filteredTracks.map(track => (
                <TouchableOpacity
                  key={track.id}
                  onPress={() => handleTrackPress(track)}
                  activeOpacity={0.8}
                  style={styles.trackCardContainer}>
                  <LinearGradient
                    colors={getWaveTypeGradient(track.waveType)}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.trackCard}>
                    <View style={styles.trackCardLeft}>
                      <View
                        style={[
                          styles.trackIconContainer,
                          {backgroundColor: 'rgba(255, 255, 255, 0.3)'},
                        ]}>
                        <Text style={styles.trackIcon}>
                          {getWaveTypeEmoji(track.waveType)}
                        </Text>
                      </View>
                      <View style={styles.trackInfo}>
                        <Text style={styles.trackName} numberOfLines={1}>
                          {track.name}
                        </Text>
                        <Text style={styles.trackWaveType}>
                          {getWaveTypeLabel(track.waveType)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.trackCardRight}>
                      <Text style={styles.trackDuration}>
                        {formatDuration(track.duration)}
                      </Text>
                      <View style={styles.playIconContainer}>
                        <Text style={styles.playIcon}>▶</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Bottom Spacing */}
          <View style={{height: theme.spacing.xl * 2}} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    paddingHorizontal: theme.spacing.md,
    height: 50,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.primary,
    padding: 0,
  },
  clearIcon: {
    fontSize: 18,
    color: theme.colors.text.secondary,
    padding: theme.spacing.xs,
  },
  filtersScroll: {
    maxHeight: 60,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChipSelected: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  filterText: {
    fontSize: theme.typography.fontSize.bodySmall,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  filterTextSelected: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
  },
  tracksList: {
    flex: 1,
  },
  tracksListContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  resultsCount: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 3,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  trackCardContainer: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    minHeight: 80,
  },
  trackCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  trackIcon: {
    fontSize: 24,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  trackWaveType: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: theme.typography.fontWeight.medium,
  },
  trackCardRight: {
    alignItems: 'flex-end',
    marginLeft: theme.spacing.md,
  },
  trackDuration: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.xs,
  },
  playIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 14,
    color: theme.colors.text.primary,
    marginLeft: 2,
  },
});
