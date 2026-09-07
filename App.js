import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { initDatabase } from './src/utils/database';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import MedicationTrackerScreen from './src/screens/MedicationTrackerScreen';
import BloodTestsScreen from './src/screens/BloodTestsScreen';
import HairlossTrackerScreen from './src/screens/HairlossTrackerScreen';
import InsuranceDeadlinesScreen from './src/screens/InsuranceDeadlinesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 대시보드 네비게이션
function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="DashboardHome"
        component={DashboardScreen}
      />
      <Stack.Screen
        name="MedicationDetail"
        component={MedicationTrackerScreen}
        options={{
          title: '약물 상세',
          headerShown: true,
          headerBackTitle: '돌아가기',
        }}
      />
      <Stack.Screen
        name="InsuranceDeadlines"
        component={InsuranceDeadlinesScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

// 복약 추적 네비게이션
function MedicationStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MedicationTrackerHome"
        component={MedicationTrackerScreen}
      />
    </Stack.Navigator>
  );
}

// 검사 수치 네비게이션
function BloodTestsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="BloodTestsHome"
        component={BloodTestsScreen}
      />
    </Stack.Navigator>
  );
}

// 탈모 관리 네비게이션
function HairlossStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="HairlossTrackerHome"
        component={HairlossTrackerScreen}
      />
    </Stack.Navigator>
  );
}

// 설정 네비게이션
function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: '설정',
        headerBackTitle: '뒤로',
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

// 메인 탭 네비게이션
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'dashboard' : 'dashboard-outline';
          } else if (route.name === 'MedicationTracker') {
            iconName = focused ? 'pills' : 'circle-outline';
          } else if (route.name === 'BloodTests') {
            iconName = focused ? 'show-chart' : 'show-chart';
          } else if (route.name === 'HairlossTracker') {
            iconName = focused ? 'monitor-heart' : 'monitor-heart';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 2,
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#EEE',
          paddingBottom: 4,
          paddingTop: 4,
          height: 56,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: '대시보드',
        }}
      />
      <Tab.Screen
        name="MedicationTracker"
        component={MedicationStack}
        options={{
          tabBarLabel: '복약 추적',
        }}
      />
      <Tab.Screen
        name="BloodTests"
        component={BloodTestsStack}
        options={{
          tabBarLabel: '검사 수치',
        }}
      />
      <Tab.Screen
        name="HairlossTracker"
        component={HairlossStack}
        options={{
          tabBarLabel: '탈모 관리',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: '설정',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // 앱 시작 시 데이터베이스 초기화
    initDatabase()
      .then(() => console.log('데이터베이스 초기화 완료'))
      .catch((error) => console.error('데이터베이스 초기화 실패:', error));
  }, []);

  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}
