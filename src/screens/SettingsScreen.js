import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { registerForPushNotifications } from '../utils/notifications';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    // 초기화 시 권한 요청
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    try {
      await registerForPushNotifications();
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
    }
  };

  const handleNotificationToggle = (value) => {
    setNotificationsEnabled(value);
    if (value) {
      Alert.alert('알림 활성화', '복약 알림이 활성화되었습니다.');
    } else {
      Alert.alert('알림 비활성화', '복약 알림이 비활성화되었습니다.');
    }
  };

  const handleDataExport = () => {
    Alert.alert('데이터 내보내기', '기능 준비 중입니다.');
  };

  const handleDataImport = () => {
    Alert.alert('데이터 가져오기', '기능 준비 중입니다.');
  };

  const handleResetData = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 기록이 삭제됩니다. 계속하시겠습니까?',
      [
        { text: '취소', onPress: () => {} },
        {
          text: '삭제',
          onPress: () => {
            Alert.alert('완료', '데이터가 초기화되었습니다.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert('문의', '이메일: support@healthapp.com');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 알림 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림 설정</Text>

          <SettingItem
            icon="notifications"
            title="복약 알림"
            description="복약 시간에 알림을 받습니다"
            value={notificationsEnabled}
            onToggle={handleNotificationToggle}
          />

          <SettingItem
            icon="volume-up"
            title="알림음"
            description="알림음 사용"
            value={soundEnabled}
            onToggle={setSoundEnabled}
            disabled={!notificationsEnabled}
          />

          <SettingItem
            icon="vibration"
            title="진동"
            description="알림 진동 사용"
            value={vibrationEnabled}
            onToggle={setVibrationEnabled}
            disabled={!notificationsEnabled}
          />
        </View>

        {/* 데이터 관리 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>데이터 관리</Text>

          <SettingButton
            icon="download"
            title="데이터 내보내기"
            description="현재 데이터를 파일로 저장"
            onPress={handleDataExport}
          />

          <SettingButton
            icon="upload"
            title="데이터 가져오기"
            description="저장된 파일에서 데이터 복원"
            onPress={handleDataImport}
          />

          <SettingButton
            icon="delete-outline"
            title="데이터 초기화"
            description="모든 기록 삭제 (복구 불가)"
            onPress={handleResetData}
            isDangerous={true}
          />
        </View>

        {/* 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>

          <SettingInfo
            label="앱 버전"
            value="1.0.0"
          />

          <SettingInfo
            label="마지막 업데이트"
            value="2026-09-04"
          />

          <SettingButton
            icon="help-outline"
            title="고객 지원"
            description="문제가 있거나 피드백이 있으신가요?"
            onPress={handleContactSupport}
          />

          <SettingButton
            icon="description"
            title="개인정보 처리방침"
            description="우리의 개인정보 처리방침을 확인하세요"
            onPress={() => Alert.alert('개인정보 처리방침', '준비 중입니다.')}
          />

          <SettingButton
            icon="gavel"
            title="이용약관"
            description="서비스 이용약관을 확인하세요"
            onPress={() => Alert.alert('이용약관', '준비 중입니다.')}
          />
        </View>

        {/* 앱 소개 */}
        <View style={styles.aboutCard}>
          <MaterialIcons name="favorite" size={24} color="#E91E63" />
          <Text style={styles.aboutText}>
            건강 관리 앱{'\n'}
            당신의 건강을 위해 만들어졌습니다.
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const SettingItem = ({
  icon,
  title,
  description,
  value,
  onToggle,
  disabled = false,
}) => (
  <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
    <View style={styles.settingItemLeft}>
      <MaterialIcons
        name={icon}
        size={24}
        color={disabled ? '#CCC' : '#2196F3'}
      />
      <View style={styles.settingItemTextContainer}>
        <Text style={[styles.settingItemTitle, disabled && styles.disabledText]}>
          {title}
        </Text>
        <Text style={[styles.settingItemDescription, disabled && styles.disabledText]}>
          {description}
        </Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ false: '#CCC', true: '#81C784' }}
      thumbColor={value ? '#4CAF50' : '#FFF'}
    />
  </View>
);

const SettingButton = ({
  icon,
  title,
  description,
  onPress,
  isDangerous = false,
}) => (
  <TouchableOpacity
    style={styles.settingButton}
    onPress={onPress}
  >
    <View style={styles.settingButtonLeft}>
      <MaterialIcons
        name={icon}
        size={24}
        color={isDangerous ? '#D32F2F' : '#2196F3'}
      />
      <View style={styles.settingItemTextContainer}>
        <Text
          style={[
            styles.settingItemTitle,
            isDangerous && styles.dangerousText,
          ]}
        >
          {title}
        </Text>
        <Text style={styles.settingItemDescription}>
          {description}
        </Text>
      </View>
    </View>
    <MaterialIcons name="chevron-right" size={20} color="#CCC" />
  </TouchableOpacity>
);

const SettingInfo = ({ label, value }) => (
  <View style={styles.settingInfo}>
    <Text style={styles.settingInfoLabel}>{label}</Text>
    <Text style={styles.settingInfoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    marginBottom: 8,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingItemDisabled: {
    opacity: 0.6,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingItemDescription: {
    fontSize: 11,
    color: '#999',
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dangerousText: {
    color: '#D32F2F',
  },
  disabledText: {
    color: '#CCC',
  },
  settingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
  },
  settingInfoLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  settingInfoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  aboutCard: {
    alignItems: 'center',
    paddingVertical: 30,
    marginVertical: 20,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  spacer: {
    height: 30,
  },
});

export default SettingsScreen;
