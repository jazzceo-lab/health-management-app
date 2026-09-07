import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getWeekDays, formatDate } from '../utils/dateUtils';
import { getWeeklyHairlossTracking, saveHairlossTracking } from '../utils/database';

const HairlossTrackerScreen = ({ navigation }) => {
  const [weekDays, setWeekDays] = useState([]);
  const [weeklyData, setWeeklyData] = useState({});
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    loadWeekData();
  }, [currentWeek]);

  const loadWeekData = async () => {
    try {
      const days = getWeekDays(currentWeek);
      setWeekDays(days);

      const startDate = days[0].date;
      const endDate = days[6].date;

      const trackingData = await getWeeklyHairlossTracking(startDate, endDate);

      // 데이터를 날짜별로 그룹화
      const dataMap = {};
      trackingData.forEach((item) => {
        if (!dataMap[item.date]) {
          dataMap[item.date] = [];
        }
        dataMap[item.date].push(item);
      });

      setWeeklyData(dataMap);
    } catch (error) {
      console.error('주간 데이터 로드 실패:', error);
    }
  };

  const handleToggle = async (date, medication, completed, minoxidilApplied = false) => {
    try {
      // 새로운 상태로 저장
      const newCompleted = !completed;
      await saveHairlossTracking(date, medication, newCompleted, minoxidilApplied);

      // UI 업데이트
      const updatedData = { ...weeklyData };
      if (!updatedData[date]) {
        updatedData[date] = [];
      }

      const existingIndex = updatedData[date].findIndex(
        (item) => item.medication === medication
      );

      if (existingIndex >= 0) {
        updatedData[date][existingIndex].completed = newCompleted ? 1 : 0;
      } else {
        updatedData[date].push({
          date,
          medication,
          completed: newCompleted ? 1 : 0,
          minoxidil_applied: minoxidilApplied ? 1 : 0,
        });
      }

      setWeeklyData(updatedData);
    } catch (error) {
      Alert.alert('오류', '저장에 실패했습니다.');
    }
  };

  const handleMinoxidilToggle = async (date, completed, minoxidilApplied) => {
    try {
      const newMinoxidil = !minoxidilApplied;
      await saveHairlossTracking(date, 'minoxidil', completed, newMinoxidil);

      const updatedData = { ...weeklyData };
      if (!updatedData[date]) {
        updatedData[date] = [];
      }

      const existingIndex = updatedData[date].findIndex(
        (item) => item.medication === 'minoxidil'
      );

      if (existingIndex >= 0) {
        updatedData[date][existingIndex].minoxidil_applied = newMinoxidil ? 1 : 0;
      } else {
        updatedData[date].push({
          date,
          medication: 'minoxidil',
          completed,
          minoxidil_applied: newMinoxidil ? 1 : 0,
        });
      }

      setWeeklyData(updatedData);
    } catch (error) {
      Alert.alert('오류', '저장에 실패했습니다.');
    }
  };

  const getDayData = (date) => {
    return weeklyData[date] || [];
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const getWeeklyStats = () => {
    let totalDays = 0;
    let completedDays = 0;
    let minoxidilDays = 0;

    weekDays.forEach((day) => {
      const dayData = getDayData(day.date);
      if (dayData.length > 0) {
        totalDays++;
        if (dayData.some((item) => item.completed === 1 && item.medication !== 'minoxidil')) {
          completedDays++;
        }
        if (dayData.some((item) => item.minoxidil_applied === 1)) {
          minoxidilDays++;
        }
      }
    });

    return { totalDays, completedDays, minoxidilDays };
  };

  const stats = getWeeklyStats();

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>탈모 관리</Text>
        <Text style={styles.subtitle}>유힐릭스 복용 및 미녹시딜 추적</Text>
      </View>

      {/* 통계 카드 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>탈모약 복용</Text>
          <Text style={styles.statValue}>
            {stats.completedDays}/{stats.totalDays}일
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>미녹시딜 도포</Text>
          <Text style={styles.statValue}>{stats.minoxidilDays}일</Text>
        </View>
      </View>

      {/* 주간 선택 */}
      <View style={styles.weekNavigator}>
        <TouchableOpacity onPress={handlePreviousWeek}>
          <MaterialIcons name="chevron-left" size={28} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.weekRange}>
          {formatDate(new Date(weekDays[0].date), 'MM/dd')} ~{' '}
          {formatDate(new Date(weekDays[6].date), 'MM/dd')}
        </Text>
        <TouchableOpacity onPress={handleNextWeek}>
          <MaterialIcons name="chevron-right" size={28} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* 주간 추적 표 */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 탈모약 */}
        <View style={styles.trackingCard}>
          <View style={styles.trackingCardHeader}>
            <MaterialIcons name="local-pharmacy" size={24} color="#FF6B6B" />
            <Text style={styles.trackingCardTitle}>유힐릭스 (탈모약)</Text>
          </View>

          <View style={styles.dayGrid}>
            {weekDays.map((day, index) => {
              const dayData = getDayData(day.date);
              const halossDayData = dayData.find((item) => item.medication === 'uhlex');
              const completed = halossDayData?.completed === 1;

              return (
                <TouchableOpacity
                  key={day.date}
                  style={[styles.dayCell, completed && styles.dayCellCompleted]}
                  onPress={() => handleToggle(day.date, 'uhlex', completed || false)}
                >
                  <Text style={styles.dayLabel}>{day.dayName.substring(0, 1)}</Text>
                  <View
                    style={[
                      styles.dayCheckCircle,
                      completed && styles.dayCheckCircleCompleted,
                    ]}
                  >
                    {completed && (
                      <MaterialIcons name="check" size={16} color="#FFF" />
                    )}
                  </View>
                  <Text style={styles.dayNumber}>{day.day}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 미녹시딜 */}
        <View style={styles.trackingCard}>
          <View style={styles.trackingCardHeader}>
            <MaterialIcons name="water-drop" size={24} color="#4ECDC4" />
            <Text style={styles.trackingCardTitle}>미녹시딜 (주간 도포)</Text>
          </View>

          <View style={styles.dayGrid}>
            {weekDays.map((day, index) => {
              const dayData = getDayData(day.date);
              const minoxidilData = dayData.find((item) => item.medication === 'minoxidil');
              const applied = minoxidilData?.minoxidil_applied === 1;

              return (
                <TouchableOpacity
                  key={`minoxidil-${day.date}`}
                  style={[styles.dayCell, applied && styles.dayCellApplied]}
                  onPress={() => handleMinoxidilToggle(day.date, 1, applied || false)}
                >
                  <Text style={styles.dayLabel}>{day.dayName.substring(0, 1)}</Text>
                  <View
                    style={[styles.dayCheckCircle, applied && styles.dayCheckCircleApplied]}
                  >
                    {applied && <MaterialIcons name="check" size={16} color="#FFF" />}
                  </View>
                  <Text style={styles.dayNumber}>{day.day}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 관리 팁 */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <MaterialIcons name="lightbulb-outline" size={20} color="#FFA500" />
            <Text style={styles.tipsTitle}>탈모 관리 팁</Text>
          </View>
          <Text style={styles.tipItem}>
            • 유힐릭스는 매일 같은 시간에 복용하세요
          </Text>
          <Text style={styles.tipItem}>
            • 미녹시딜은 하루 2회(아침/저녁) 두피에 도포하세요
          </Text>
          <Text style={styles.tipItem}>
            • 도포 후 최소 4시간은 머리를 감지 마세요
          </Text>
          <Text style={styles.tipItem}>
            • 최소 6개월 이상 지속적으로 사용해야 효과를 볼 수 있습니다
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weekNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  weekRange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  trackingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  trackingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  trackingCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  dayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    flex: 1,
  },
  dayCellCompleted: {
    backgroundColor: '#F1F8E9',
    borderRadius: 8,
  },
  dayCellApplied: {
    backgroundColor: '#E0F7FA',
    borderRadius: 8,
  },
  dayLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
  },
  dayCheckCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  dayCheckCircleCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dayCheckCircleApplied: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  tipsCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  tipItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  spacer: {
    height: 30,
  },
});

export default HairlossTrackerScreen;
