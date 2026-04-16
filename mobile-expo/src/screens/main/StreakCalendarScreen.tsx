import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '../../theme';
import {apiService} from '../../services/api';

interface DayData {
  date: string;
  sessionCount: number;
  totalMinutes: number;
  waveTypes: string[];
}

export const StreakCalendarScreen = ({navigation}: any) => {
  const [history, setHistory] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadStreakHistory();
  }, [currentMonth]);

  const loadStreakHistory = async () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const result = await apiService.getStreakHistory(
      startOfMonth.toISOString(),
      endOfMonth.toISOString(),
    );

    if (result.data) {
      setHistory(result.data.history);
    }
    setLoading(false);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return {daysInMonth, startingDayOfWeek};
  };

  const getDayData = (day: number): DayData | undefined => {
    const dateString = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    ).toISOString().split('T')[0];

    return history.find(h => h.date.startsWith(dateString));
  };

  const getIntensityColor = (sessionCount: number) => {
    if (sessionCount === 0) return theme.colors.background.surface;
    if (sessionCount === 1) return 'rgba(159, 122, 234, 0.3)';
    if (sessionCount === 2) return 'rgba(159, 122, 234, 0.6)';
    return theme.colors.alpha.primary;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    if (next <= new Date()) {
      setCurrentMonth(next);
    }
  };

  const {daysInMonth, startingDayOfWeek} = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('en-US', {month: 'long', year: 'numeric'});
  const isCurrentMonth = currentMonth.getMonth() === new Date().getMonth() &&
    currentMonth.getFullYear() === new Date().getFullYear();

  // Calculate stats for current month
  const monthStats = {
    totalSessions: history.reduce((sum, day) => sum + day.sessionCount, 0),
    totalMinutes: history.reduce((sum, day) => sum + day.totalMinutes, 0),
    activeDays: history.filter(day => day.sessionCount > 0).length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Streak Calendar</Text>
        </View>

        {/* Month Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{monthStats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{monthStats.totalMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{monthStats.activeDays}</Text>
            <Text style={styles.statLabel}>Active Days</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthName}</Text>
            <TouchableOpacity
              onPress={nextMonth}
              style={[styles.navButton, isCurrentMonth && styles.navButtonDisabled]}
              disabled={isCurrentMonth}>
              <Text
                style={[
                  styles.navButtonText,
                  isCurrentMonth && styles.navButtonTextDisabled,
                ]}>
                →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendar}>
            {/* Day Headers */}
            <View style={styles.weekDays}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <View key={index} style={styles.weekDay}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Days */}
            <View style={styles.daysGrid}>
              {/* Empty cells for days before start of month */}
              {Array.from({length: startingDayOfWeek}, (_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}

              {/* Actual days */}
              {Array.from({length: daysInMonth}, (_, i) => {
                const day = i + 1;
                const dayData = getDayData(day);
                const today = new Date();
                const isToday =
                  currentMonth.getMonth() === today.getMonth() &&
                  currentMonth.getFullYear() === today.getFullYear() &&
                  day === today.getDate();

                return (
                  <View key={day} style={styles.dayCell}>
                    <View
                      style={[
                        styles.day,
                        {backgroundColor: getIntensityColor(dayData?.sessionCount || 0)},
                        isToday && styles.today,
                      ]}>
                      <Text
                        style={[
                          styles.dayNumber,
                          dayData && dayData.sessionCount > 0 && styles.dayNumberActive,
                        ]}>
                        {day}
                      </Text>
                      {dayData && dayData.sessionCount > 0 && (
                        <View style={styles.sessionDot}>
                          <Text style={styles.sessionCount}>{dayData.sessionCount}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendLabel}>Activity:</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendBox,
                    {backgroundColor: theme.colors.background.surface},
                  ]}
                />
                <Text style={styles.legendText}>None</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendBox, {backgroundColor: 'rgba(159, 122, 234, 0.3)'}]}
                />
                <Text style={styles.legendText}>Low</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendBox, {backgroundColor: 'rgba(159, 122, 234, 0.6)'}]}
                />
                <Text style={styles.legendText}>Medium</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendBox, {backgroundColor: theme.colors.alpha.primary}]}
                />
                <Text style={styles.legendText}>High</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {history
              .filter(day => day.sessionCount > 0)
              .slice(0, 7)
              .map((day, index) => {
                const date = new Date(day.date);
                const dateString = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityDate}>
                      <Text style={styles.activityDateText}>{dateString}</Text>
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activitySessions}>
                        {day.sessionCount} session{day.sessionCount > 1 ? 's' : ''}
                      </Text>
                      <Text style={styles.activityMinutes}>{day.totalMinutes} minutes</Text>
                    </View>
                    <View style={styles.activityWaves}>
                      {day.waveTypes.includes('alpha') && (
                        <Text style={styles.waveIcon}>🌊</Text>
                      )}
                      {day.waveTypes.includes('beta') && (
                        <Text style={styles.waveIcon}>⚡</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            {history.filter(day => day.sessionCount > 0).length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No activity this month yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start a session to build your streak!
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.dark,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  backButton: {
    color: theme.colors.coffee.cappuccino,
    fontSize: theme.typography.fontSize.body,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.display,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.coffee.cappuccino,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
  },
  calendarContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 20,
    color: theme.colors.text.primary,
  },
  navButtonTextDisabled: {
    color: theme.colors.text.secondary,
  },
  monthLabel: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  calendar: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  weekDayText: {
    fontSize: theme.typography.fontSize.bodySmall,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.secondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  day: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  today: {
    borderWidth: 2,
    borderColor: theme.colors.coffee.cappuccino,
  },
  dayNumber: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
  },
  dayNumberActive: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  sessionDot: {
    position: 'absolute',
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.coffee.cappuccino,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionCount: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  legendLabel: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
  },
  legendItems: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    color: theme.colors.text.secondary,
  },
  activitySection: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  activityList: {
    gap: theme.spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  activityDate: {
    width: 60,
  },
  activityDateText: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  activityInfo: {
    flex: 1,
  },
  activitySessions: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  activityMinutes: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.secondary,
  },
  activityWaves: {
    flexDirection: 'row',
    gap: 4,
  },
  waveIcon: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.fontSize.bodySmall,
    color: theme.colors.text.muted,
  },
});
