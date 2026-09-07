import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDate } from '../utils/dateUtils';
import { saveBloodTest, getBloodTestHistory } from '../utils/database';
import { BLOOD_TEST_ITEMS } from '../data/medications';

const BloodTestsScreen = ({ navigation }) => {
  const [testItems, setTestItems] = useState(BLOOD_TEST_ITEMS);
  const [histories, setHistories] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [testDate, setTestDate] = useState(formatDate(new Date()));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadHistories();
  }, []);

  const loadHistories = async () => {
    try {
      const allHistories = {};
      for (const item of BLOOD_TEST_ITEMS) {
        const history = await getBloodTestHistory(item.id);
        allHistories[item.id] = history;
      }
      setHistories(allHistories);
    } catch (error) {
      console.error('히스토리 로드 실패:', error);
    }
  };

  const handleAddTest = async () => {
    if (!newValue || isNaN(newValue)) {
      console.log('입력 오류: 수치 미입력');
      return;
    }

    try {
      await saveBloodTest(selectedItem.id, parseFloat(newValue), testDate, notes);
      console.log('✅ 검사 수치 저장 완료');

      // 히스토리 새로고침
      const updatedHistory = await getBloodTestHistory(selectedItem.id);
      setHistories({
        ...histories,
        [selectedItem.id]: updatedHistory,
      });

      // 모달 닫기 및 입력값 초기화
      setModalVisible(false);
      setNewValue('');
      setNotes('');
      setTestDate(formatDate(new Date()));
    } catch (error) {
      console.error('검사 수치 저장 오류:', error);
    }
  };

  const getValueStatus = (value, normalRange) => {
    // 간단한 상태 판정 (실제로는 더 복잡한 로직 필요)
    return 'normal'; // normal, warning, danger
  };

  const openAddModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>혈액검사 수치</Text>
          <Text style={styles.subtitle}>주기적으로 검사 결과를 기록하세요</Text>
        </View>

        {/* 검사 항목 */}
        {testItems.map((item) => {
          const latestTest = histories[item.id]?.[0];
          const previousTest = histories[item.id]?.[1];

          return (
            <View key={item.id} style={styles.testCard}>
              <View style={styles.testCardHeader}>
                <View style={styles.testCardTitleContainer}>
                  <Text style={styles.testCardTitle}>{item.name}</Text>
                  <Text style={styles.testCardUnit}>{item.unit}</Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => openAddModal(item)}
                >
                  <MaterialIcons name="add-circle-outline" size={24} color="#2196F3" />
                </TouchableOpacity>
              </View>

              {/* 정상 범위 */}
              <View style={styles.normalRangeContainer}>
                <Text style={styles.normalRangeLabel}>정상 범위:</Text>
                <Text style={styles.normalRangeValue}>{item.normal_range}</Text>
              </View>

              {/* 최신 검사 결과 */}
              {latestTest ? (
                <View style={styles.latestTestContainer}>
                  <Text style={styles.latestTestLabel}>최신 결과</Text>
                  <View style={styles.latestTestValue}>
                    <Text style={styles.latestTestNumber}>{latestTest.value}</Text>
                    <Text style={styles.latestTestDate}>
                      {formatDate(new Date(latestTest.date), 'yyyy.MM.dd')}
                    </Text>
                  </View>
                  {previousTest && (
                    <View style={styles.previousTestContainer}>
                      <Text style={styles.previousTestLabel}>이전 결과</Text>
                      <Text style={styles.previousTestValue}>
                        {previousTest.value}
                        <Text style={styles.previousTestDate}>
                          {' '}
                          ({formatDate(new Date(previousTest.date), 'MM.dd')})
                        </Text>
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>기록된 검사 수치가 없습니다.</Text>
                </View>
              )}

              {/* 히스토리 그래프 (간단 버전) */}
              {histories[item.id]?.length > 0 && (
                <TouchableOpacity
                  style={styles.viewGraphButton}
                  onPress={() =>
                    navigation.navigate('TestGraph', { testItem: item })
                  }
                >
                  <Text style={styles.viewGraphText}>그래프 보기</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#2196F3" />
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <View style={styles.spacer} />
      </ScrollView>

      {/* 추가 모달 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedItem?.name} 수치 추가
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>검사 수치</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="수치 입력"
                    keyboardType="decimal-pad"
                    value={newValue}
                    onChangeText={setNewValue}
                  />
                  <Text style={styles.inputUnit}>{selectedItem?.unit}</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>검사 날짜</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={testDate || formatDate(new Date())}
                    onChangeText={setTestDate}
                    placeholderTextColor="#CCC"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>비고</Text>
                <TextInput
                  style={[styles.input, styles.textAreaInput]}
                  placeholder="특별한 사항이 있으면 입력하세요"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddTest}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  testCard: {
    marginHorizontal: 15,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  testCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testCardTitleContainer: {
    flex: 1,
  },
  testCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  testCardUnit: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  addButton: {
    padding: 5,
  },
  normalRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    marginBottom: 12,
  },
  normalRangeLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  normalRangeValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  latestTestContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
  },
  latestTestLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  latestTestValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  latestTestNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  latestTestDate: {
    fontSize: 12,
    color: '#999',
  },
  previousTestContainer: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
  },
  previousTestLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  previousTestValue: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  previousTestDate: {
    fontSize: 11,
    color: '#999',
    fontWeight: 'normal',
  },
  noDataContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 13,
    color: '#999',
  },
  viewGraphButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  viewGraphText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  spacer: {
    height: 30,
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
    marginBottom: 20,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  inputUnit: {
    paddingHorizontal: 12,
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  textAreaInput: {
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BloodTestsScreen;
