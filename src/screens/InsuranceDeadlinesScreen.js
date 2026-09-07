import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { calculateDDay, formatDate } from '../utils/dateUtils';
import { INSURANCE_DEADLINES } from '../data/medications';

const InsuranceDeadlinesScreen = ({ navigation }) => {
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    loadDeadlines();
  }, []);

  const loadDeadlines = () => {
    const deadlineData = INSURANCE_DEADLINES.map((deadline) => {
      const dday = calculateDDay(deadline.deadline);
      return {
        ...deadline,
        ...dday,
      };
    }).sort((a, b) => a.daysRemaining - b.daysRemaining);

    setDeadlines(deadlineData);
  };

  const getStatusColor = (daysRemaining, isPassed) => {
    if (isPassed) return '#999';
    if (daysRemaining <= 0) return '#D32F2F';
    if (daysRemaining <= 30) return '#FF9800';
    return '#4CAF50';
  };

  const getStatusText = (daysRemaining, isPassed, isToday) => {
    if (isPassed) return '만료됨';
    if (isToday) return 'D-Day';
    if (daysRemaining <= 0) return '청구 가능';
    return `${daysRemaining}일 남음`;
  };

  const formatMonthDay = (date) => {
    return formatDate(date, 'MM월 dd일');
  };

  const calculateMonthsRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);

    let months = 0;
    let tempDate = new Date(today);

    while (tempDate < deadlineDate) {
      tempDate.setMonth(tempDate.getMonth() + 1);
      months++;
    }

    return Math.max(0, months);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>실손보험 청구 기한</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 안내문 */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            실손보험 청구 기한을 놓치지 않도록 주의하세요.{'\n'}
            일반적으로 진료 이후 3년 이내에 청구해야 합니다.
          </Text>
        </View>

        {/* 청구 기한 카드 */}
        {deadlines.map((deadline, index) => {
          const statusColor = getStatusColor(deadline.daysRemaining, deadline.isPassed);
          const statusText = getStatusText(
            deadline.daysRemaining,
            deadline.isPassed,
            deadline.isToday
          );

          return (
            <View key={deadline.id} style={styles.deadlineCard}>
              <View style={styles.cardContent}>
                {/* 왼쪽: 질병명 및 정보 */}
                <View style={styles.cardLeft}>
                  <Text style={styles.diseaseName}>{deadline.disease}</Text>
                  <Text style={styles.category}>{deadline.category}</Text>

                  {/* 청구 기한 */}
                  <View style={styles.deadlineInfo}>
                    <MaterialIcons name="calendar-today" size={16} color="#999" />
                    <Text style={styles.deadlineDate}>
                      {formatDate(deadline.deadline, 'yyyy년 MM월 dd일')}
                    </Text>
                  </View>

                  {/* 남은 일자 */}
                  {!deadline.isPassed && (
                    <View style={styles.remainingInfo}>
                      <Text style={styles.remainingLabel}>남은 기간</Text>
                      <Text style={styles.remainingDays}>
                        {calculateMonthsRemaining(deadline.deadline)}개월
                      </Text>
                    </View>
                  )}
                </View>

                {/* 오른쪽: 상태 배지 */}
                <View
                  style={[
                    styles.statusBadge,
                    { borderColor: statusColor, backgroundColor: statusColor + '15' },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {statusText}
                  </Text>
                  {!deadline.isPassed && (
                    <Text
                      style={[
                        styles.ddayDisplay,
                        { color: statusColor },
                      ]}
                    >
                      D-{Math.abs(deadline.daysRemaining)}
                    </Text>
                  )}
                </View>
              </View>

              {/* 청구 체크리스트 */}
              <View style={styles.checklist}>
                <Text style={styles.checklistTitle}>준비물</Text>
                <ChecklistItem icon="receipt" text="진료영수증" />
                <ChecklistItem icon="description" text="진단서" />
                <ChecklistItem icon="badge" text="신분증" />
                <ChecklistItem icon="credit-card" text="통장사본" />
              </View>

              {/* 알림 설정 */}
              {!deadline.isPassed && (
                <TouchableOpacity style={styles.notificationButton}>
                  <MaterialIcons name="notifications-none" size={18} color="#2196F3" />
                  <Text style={styles.notificationButtonText}>알림 설정</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* 청구 방법 가이드 */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>청구 방법</Text>

          <GuideStep
            number="1"
            title="서류 준비"
            description="진료영수증, 진단서, 신분증, 통장사본 등을 준비합니다."
          />
          <GuideStep
            number="2"
            title="보험사 연락"
            description="보험사 고객센터로 연락하여 청구 방법을 안내받습니다."
          />
          <GuideStep
            number="3"
            title="서류 제출"
            description="보험사에서 지정한 방법으로 서류를 제출합니다."
          />
          <GuideStep
            number="4"
            title="심사 및 지급"
            description="보험사에서 심사 후 지급 여부를 통보하고 입금됩니다."
          />
        </View>

        {/* 추가 정보 */}
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>주의사항</Text>
          <Text style={styles.noteItem}>
            • 청구 기한은 보험사 및 상품에 따라 다를 수 있으니 확인하세요
          </Text>
          <Text style={styles.noteItem}>
            • 서류는 원본이 필요할 수도 있으니 확인 후 제출하세요
          </Text>
          <Text style={styles.noteItem}>
            • 기한 만료 후 청구는 불가능하니 주의하세요
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const ChecklistItem = ({ icon, text }) => (
  <View style={styles.checklistItem}>
    <MaterialIcons name={icon} size={18} color="#2196F3" />
    <Text style={styles.checklistItemText}>{text}</Text>
  </View>
);

const GuideStep = ({ number, title, description }) => (
  <View style={styles.guideStep}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  infoCard: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 18,
  },
  deadlineCard: {
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
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardLeft: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 11,
    color: '#999',
    marginBottom: 10,
    fontWeight: '500',
  },
  deadlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deadlineDate: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  remainingInfo: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  remainingLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  remainingDays: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    minWidth: 90,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ddayDisplay: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  checklist: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginVertical: 12,
  },
  checklistTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checklistItemText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  notificationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 6,
  },
  guideCard: {
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
  guideTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 14,
  },
  guideStep: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
  notesCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noteItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  spacer: {
    height: 30,
  },
});

export default InsuranceDeadlinesScreen;
