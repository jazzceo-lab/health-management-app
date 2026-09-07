import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getTodayDate, calculateDDay, formatDate } from '../utils/dateUtils';
import { getMedicationChecks } from '../utils/database';
import { MEDICATIONS, INSURANCE_DEADLINES, EXEMPT_PERIODS } from '../data/medications';

const DashboardScreen = ({ navigation }) => {
  const [todayMedications, setTodayMedications] = useState([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [insuranceData, setInsuranceData] = useState([]);
  const [exemptPeriods, setExemptPeriods] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedExempt, setSelectedExempt] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editDays, setEditDays] = useState('');

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const today = getTodayDate();
      const checks = await getMedicationChecks(today);

      // 오늘의 복약 일정 계산
      const todayMeds = MEDICATIONS.map((med) => {
        const medChecks = checks.filter((c) => c.medication_id === med.id);
        const allChecked = med.timing.length === medChecks.length && medChecks.every((c) => c.completed);
        return {
          ...med,
          checked: allChecked,
          details: med.timing.map((t, i) => ({
            timing: t,
            time: med.times[i],
            checked: medChecks[i]?.completed || false,
          })),
        };
      });

      setTodayMedications(todayMeds);

      // 복약률 계산
      const totalSlots = todayMeds.reduce((sum, med) => sum + med.timing.length, 0);
      const completedSlots = todayMeds.reduce(
        (sum, med) => sum + med.details.filter((d) => d.checked).length,
        0
      );
      setCompletionRate(totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0);

      // 보험 D-day 계산
      const insuranceInfo = INSURANCE_DEADLINES.map((deadline) => {
        const dday = calculateDDay(deadline.deadline);
        return {
          ...deadline,
          ...dday,
        };
      });
      setInsuranceData(insuranceInfo);

      // 면책기간 계산
      const exemptInfo = EXEMPT_PERIODS.map((exempt) => {
        const exemptEndDate = new Date(exempt.insuranceStartDate);
        exemptEndDate.setDate(exemptEndDate.getDate() + exempt.exemptDays);
        const dday = calculateDDay(exemptEndDate);
        return {
          ...exempt,
          exemptEndDate,
          ...dday,
        };
      });
      setExemptPeriods(exemptInfo);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const handleMedicationPress = (medication) => {
    navigation.navigate('MedicationDetail', { medication });
  };

  const handleInsurancePress = (deadline) => {
    navigation.navigate('InsuranceDeadlines');
  };

  const handleEditExemptPeriod = (exempt) => {
    setSelectedExempt(exempt);
    setEditDate(formatDate(exempt.insuranceStartDate, 'yyyy-MM-dd'));
    setEditDays(exempt.exemptDays.toString());
    setEditModalVisible(true);
  };

  const handleSaveExemptPeriod = () => {
    if (!editDate || !editDays) {
      console.log('입력값 미입력');
      return;
    }

    try {
      const newDate = new Date(editDate);
      const newExempt = {
        ...selectedExempt,
        insuranceStartDate: newDate,
        exemptDays: parseInt(editDays),
      };

      const exemptEndDate = new Date(newDate);
      exemptEndDate.setDate(exemptEndDate.getDate() + parseInt(editDays));
      const dday = calculateDDay(exemptEndDate);

      const updatedExempt = {
        ...newExempt,
        exemptEndDate,
        ...dday,
      };

      const updatedPeriods = exemptPeriods.map((e) =>
        e.id === selectedExempt.id ? updatedExempt : e
      );
      setExemptPeriods(updatedPeriods);
      setEditModalVisible(false);
      console.log('✅ 면책기간 저장 완료');
    } catch (error) {
      console.error('저장 오류:', error);
    }
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>오늘의 건강</Text>
        <Text style={styles.headerDate}>{formatDate(new Date(), 'MM월 dd일 EEEE')}</Text>
      </View>

      {/* 복약률 카드 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="medications" size={24} color="#2E7D32" />
          <Text style={styles.cardTitle}>복약 현황</Text>
        </View>
        <View style={styles.completionContainer}>
          <View style={styles.circleProgress}>
            <Text style={styles.completionRate}>{completionRate}%</Text>
          </View>
          <Text style={styles.completionText}>오늘 복약 완료율</Text>
        </View>
      </View>

      {/* 오늘의 약물 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘의 약물</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MedicationTracker')}>
            <Text style={styles.seeAll}>모두 보기</Text>
          </TouchableOpacity>
        </View>

        {todayMedications.slice(0, 3).map((med) => (
          <TouchableOpacity
            key={med.id}
            style={[styles.medicationItem, med.checked && styles.medicationItemCompleted]}
            onPress={() => handleMedicationPress(med)}
          >
            <View style={styles.medicationLeft}>
              <MaterialIcons
                name={med.checked ? 'check-circle' : 'radio-button-unchecked'}
                size={28}
                color={med.checked ? '#4CAF50' : '#999'}
              />
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{med.name}</Text>
                <Text style={styles.medicationTiming}>{med.timing.join(', ')}</Text>
              </View>
            </View>
            <Text style={[styles.medicationStatus, med.checked && styles.statusCompleted]}>
              {med.checked ? '완료' : '대기'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 실손보험 면책기간 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🛡️ 면책기간</Text>
        </View>

        {exemptPeriods.map((exempt) => {
          const isOngoing = !exempt.isPassed;
          const isEnding = exempt.daysRemaining <= 30 && exempt.daysRemaining > 0;

          return (
            <TouchableOpacity
              key={exempt.id}
              style={[
                styles.exemptCard,
                isEnding && styles.exemptCardEnding,
                exempt.isPassed && styles.exemptCardEnded,
              ]}
              onPress={() => handleEditExemptPeriod(exempt)}
            >
              <View style={styles.exemptInfo}>
                <Text style={styles.exemptDisease}>{exempt.disease}</Text>
                <Text style={styles.exemptDate}>
                  {formatDate(exempt.insuranceStartDate, 'yyyy.MM.dd')} ~ {formatDate(exempt.exemptEndDate, 'yyyy.MM.dd')}
                </Text>
                <Text style={styles.exemptDays}>({exempt.exemptDays}일)</Text>
              </View>
              <View
                style={[
                  styles.exemptBadge,
                  isEnding && styles.exemptBadgeEnding,
                  exempt.isPassed && styles.exemptBadgeEnded,
                ]}
              >
                <Text
                  style={[
                    styles.exemptText,
                    isEnding && styles.exemptTextEnding,
                    exempt.isPassed && styles.exemptTextEnded,
                  ]}
                >
                  {exempt.isPassed
                    ? '종료됨'
                    : exempt.isToday
                    ? '오늘 종료'
                    : `D-${exempt.daysRemaining}`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 보험 청구 기한 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 청구 기한</Text>
        </View>

        {insuranceData.map((deadline) => {
          const isUrgent = deadline.daysRemaining <= 30 && deadline.daysRemaining > 0;
          const isPassed = deadline.isPassed;

          return (
            <TouchableOpacity
              key={deadline.id}
              style={[
                styles.insuranceCard,
                isUrgent && styles.insuranceCardUrgent,
                isPassed && styles.insuranceCardPassed,
              ]}
              onPress={handleInsurancePress}
            >
              <View style={styles.insuranceInfo}>
                <Text style={styles.insuranceDisease}>{deadline.disease}</Text>
                <Text style={styles.insuranceDeadline}>
                  {formatDate(deadline.deadline, 'yyyy년 MM월 dd일')}
                </Text>
              </View>
              <View
                style={[
                  styles.ddayBadge,
                  isUrgent && styles.ddayBadgeUrgent,
                  isPassed && styles.ddayBadgePassed,
                ]}
              >
                <Text
                  style={[
                    styles.ddayText,
                    isUrgent && styles.ddayTextUrgent,
                    isPassed && styles.ddayTextPassed,
                  ]}
                >
                  {isPassed
                    ? '만료'
                    : deadline.isToday
                    ? 'D-Day'
                    : `D-${deadline.daysRemaining}`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 빠른 링크 */}
      <View style={styles.section}>
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.quickLinkButton}
            onPress={() => navigation.navigate('BloodTests')}
          >
            <MaterialIcons name="show-chart" size={32} color="#1976D2" />
            <Text style={styles.quickLinkText}>검사 수치</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkButton}
            onPress={() => navigation.navigate('HairlossTracker')}
          >
            <MaterialIcons name="monitor-heart" size={32} color="#D32F2F" />
            <Text style={styles.quickLinkText}>탈모 관리</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <MaterialIcons name="settings" size={32} color="#7B1FA2" />
            <Text style={styles.quickLinkText}>설정</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>

      {/* 면책기간 편집 모달 */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>면책기간 수정</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>질환명</Text>
                <Text style={styles.inputValue}>{selectedExempt?.disease}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>보험 시작일</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={editDate}
                  onChangeText={setEditDate}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>면책기간 (일수)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="90"
                  keyboardType="numeric"
                  value={editDays}
                  onChangeText={setEditDays}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveExemptPeriod}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerDate: {
    fontSize: 14,
    color: '#888',
  },
  card: {
    marginHorizontal: 15,
    marginVertical: 15,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  completionContainer: {
    alignItems: 'center',
  },
  circleProgress: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  completionRate: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  completionText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  seeAll: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  medicationItemCompleted: {
    backgroundColor: '#F1F8E9',
  },
  medicationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  medicationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  medicationTiming: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  medicationStatus: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF9800',
  },
  statusCompleted: {
    color: '#4CAF50',
  },
  insuranceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  insuranceCardUrgent: {
    borderLeftColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
  insuranceCardPassed: {
    borderLeftColor: '#999',
    backgroundColor: '#F5F5F5',
  },
  insuranceInfo: {
    flex: 1,
  },
  insuranceDisease: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  insuranceDeadline: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  ddayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
  },
  ddayBadgeUrgent: {
    backgroundColor: '#FFCDD2',
  },
  ddayBadgePassed: {
    backgroundColor: '#EEEEEE',
  },
  ddayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  ddayTextUrgent: {
    color: '#D32F2F',
  },
  ddayTextPassed: {
    color: '#999',
  },
  exemptCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  exemptCardEnding: {
    borderLeftColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  exemptCardEnded: {
    borderLeftColor: '#999',
    backgroundColor: '#F5F5F5',
  },
  exemptInfo: {
    flex: 1,
  },
  exemptDisease: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  exemptDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  exemptDays: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  exemptBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
  },
  exemptBadgeEnding: {
    backgroundColor: '#FFE0B2',
  },
  exemptBadgeEnded: {
    backgroundColor: '#EEEEEE',
  },
  exemptText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  exemptTextEnding: {
    color: '#F57C00',
  },
  exemptTextEnded: {
    color: '#999',
  },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 30,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickLinkButton: {
    alignItems: 'center',
  },
  quickLinkText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputValue: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#F9F9F9',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;
