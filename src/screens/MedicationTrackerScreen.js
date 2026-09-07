import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  CheckBox,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getTodayDate, getWeekDays, formatTime } from '../utils/dateUtils';
import { getMedicationChecks, saveMedicationCheck, updateMedicationCheck } from '../utils/database';
import { MEDICATIONS } from '../data/medications';

const MedicationTrackerScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [medicationChecks, setMedicationChecks] = useState({});
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    const days = getWeekDays();
    setWeekDays(days);
    loadMedicationData(selectedDate);
  }, []);

  useEffect(() => {
    loadMedicationData(selectedDate);
  }, [selectedDate]);

  const loadMedicationData = async () => {
    try {
      const checks = await getMedicationChecks(selectedDate);
      const checksMap = {};

      MEDICATIONS.forEach((med) => {
        checksMap[med.id] = med.timing.map((timing, index) => {
          const existingCheck = checks.find(
            (c) => c.medication_id === med.id && c.time_slot === med.times[index]
          );
          return {
            id: existingCheck?.id || null,
            timing: timing,
            time: med.times[index],
            completed: existingCheck?.completed === 1,
            notes: existingCheck?.notes || '',
          };
        });
      });

      setMedicationChecks(checksMap);
    } catch (error) {
      console.error('복약 데이터 로드 실패:', error);
    }
  };

  const handleCheckToggle = async (medicationId, timeSlot, isCompleted) => {
    try {
      const currentChecks = medicationChecks[medicationId];
      const checkItem = currentChecks.find((c) => c.time_slot === timeSlot);

      if (checkItem.id) {
        await updateMedicationCheck(checkItem.id, !isCompleted);
      } else {
        await saveMedicationCheck(medicationId, selectedDate, timeSlot, !isCompleted);
      }

      // UI 업데이트
      const updatedChecks = { ...medicationChecks };
      updatedChecks[medicationId] = updatedChecks[medicationId].map((item) =>
        item.time_slot === timeSlot ? { ...item, completed: !isCompleted } : item
      );
      setMedicationChecks(updatedChecks);
    } catch (error) {
      console.error('복약 기록 저장 오류:', error);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const getCategoryColor = (category) => {
    const colors = {
      당뇨: '#FF6B6B',
      고지혈증: '#4ECDC4',
      갑상선: '#95E1D3',
      탈모: '#FFA07A',
    };
    return colors[category] || '#999';
  };

  const getCompletionForDate = (date) => {
    // 다른 날짜의 완료율을 계산 (실제로는 모든 데이터를 로드해야 함)
    return Math.random() * 100;
  };

  return (
    <View style={styles.container}>
      {/* 주간 선택 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.weekScroll}
        contentContainerStyle={styles.weekContainer}
      >
        {weekDays.map((day) => (
          <TouchableOpacity
            key={day.date}
            style={[
              styles.dayButton,
              selectedDate === day.date && styles.dayButtonSelected,
            ]}
            onPress={() => handleDateSelect(day.date)}
          >
            <Text
              style={[
                styles.dayName,
                selectedDate === day.date && styles.dayNameSelected,
              ]}
            >
              {day.dayName.substring(0, 1)}
            </Text>
            <Text
              style={[
                styles.dayNumber,
                selectedDate === day.date && styles.dayNumberSelected,
              ]}
            >
              {day.day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 약물 목록 */}
      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
      >
        {MEDICATIONS.map((medication) => {
          const checks = medicationChecks[medication.id] || [];
          const allCompleted = checks.length > 0 && checks.every((c) => c.completed);

          return (
            <View key={medication.id} style={styles.medicationCard}>
              {/* 약물 헤더 */}
              <View style={styles.medicationHeader}>
                <View style={styles.medicationTitleContainer}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(medication.category) },
                    ]}
                  >
                    <Text style={styles.categoryText}>{medication.category}</Text>
                  </View>
                  <View style={styles.medicationTitleInfo}>
                    <Text style={styles.medicationTitle}>{medication.name}</Text>
                    <Text style={styles.medicationSubtitle}>
                      {medication.timing.join(' / ')}
                    </Text>
                  </View>
                </View>
                <MaterialIcons
                  name={allCompleted ? 'check-circle' : 'radio-button-unchecked'}
                  size={32}
                  color={allCompleted ? '#4CAF50' : '#CCC'}
                />
              </View>

              {/* 복용 시간별 체크 */}
              <View style={styles.checkItems}>
                {checks.map((checkItem, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.checkItem}
                    onPress={() =>
                      handleCheckToggle(medication.id, checkItem.time_slot, checkItem.completed)
                    }
                  >
                    <View style={styles.checkItemLeft}>
                      <MaterialIcons
                        name={checkItem.completed ? 'check-box' : 'check-box-outline-blank'}
                        size={24}
                        color={checkItem.completed ? '#4CAF50' : '#CCC'}
                      />
                      <View style={styles.checkItemInfo}>
                        <Text style={styles.checkItemTime}>
                          {formatTime(checkItem.time_slot)}
                        </Text>
                        <Text style={styles.checkItemTiming}>{checkItem.timing}</Text>
                      </View>
                    </View>
                    {checkItem.completed && (
                      <Text style={styles.checkItemStatus}>완료</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

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
  weekScroll: {
    flexGrow: 0,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  weekContainer: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  dayButton: {
    width: 60,
    paddingVertical: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  dayButtonSelected: {
    backgroundColor: '#2196F3',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  dayNameSelected: {
    color: '#FFF',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dayNumberSelected: {
    color: '#FFF',
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  medicationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  medicationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  medicationTitleInfo: {
    flex: 1,
  },
  medicationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicationSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  checkItems: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  checkItemTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  checkItemTiming: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  checkItemStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  spacer: {
    height: 30,
  },
});

export default MedicationTrackerScreen;
