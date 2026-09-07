# 진명 건강관리 앱

당뇨병, 고지혈증, 갑상선기능저하증 환자를 위한 개인 건강 관리 모바일 앱입니다.

## 주요 기능

### 1. 복약 알림 및 체크
- 7가지 약물의 복용 시간 알림
- 자디앙듀오 (아침/저녁 식후)
- 크레스토 (아침 식전)
- 디아미크롱서방정 (아침 식전)
- 리피딜슈프라 (저녁 식후)
- 씬지로이드 (아침 식전)
- 테트로닌 (아침 식전)
- 유힐릭스 (탈모약, 매일)

### 2. 혈액검사 수치 기록 및 분석
- HbA1c, ALT, HDL, LDL, 중성지방 등 항목별 수치 기록
- 검사 수치 추이 그래프
- 정상 범위 표시
- 검사 이력 관리

### 3. 실손보험 청구기한 관리
- 당뇨병: 2027-02-11
- 갑상선질환: 2027-02-12
- D-day 카운트다운
- 청구 방법 가이드

### 4. 탈모약 복용 트래커
- 유힐릭스 복용 기록
- 미녹시딜 주간 도포 체크
- 주간 통계 제공

## 설치 및 실행

### 필수 환경
- Node.js 16.x 이상
- npm 또는 yarn
- Expo CLI

### 설치 방법

```bash
# 프로젝트 폴더로 이동
cd 진명건광관리앱

# 의존성 설치
npm install

# 또는 yarn 사용
yarn install
```

### 실행 방법

```bash
# Expo 개발 서버 시작
npm start

# iOS 에뮬레이터에서 실행
npm run ios

# Android 에뮬레이터에서 실행
npm run android

# 웹에서 실행
npm run web
```

## 프로젝트 구조

```
진명건광관리앱/
├── App.js                          # 메인 앱 컴포넌트
├── app.json                        # Expo 설정
├── package.json                    # 의존성
├── src/
│   ├── screens/                    # 화면 컴포넌트
│   │   ├── DashboardScreen.js      # 대시보드
│   │   ├── MedicationTrackerScreen.js  # 복약 추적
│   │   ├── BloodTestsScreen.js     # 검사 수치
│   │   ├── HairlossTrackerScreen.js    # 탈모 관리
│   │   ├── InsuranceDeadlinesScreen.js # 보험 기한
│   │   └── SettingsScreen.js       # 설정
│   ├── utils/                      # 유틸리티
│   │   ├── database.js             # SQLite 데이터베이스
│   │   ├── notifications.js        # 알림 기능
│   │   └── dateUtils.js            # 날짜 유틸리티
│   └── data/
│       └── medications.js          # 약물 및 검사 항목 데이터
└── assets/                         # 이미지 및 아이콘
```

## 주요 라이브러리

- **React Native**: UI 프레임워크
- **Expo**: 개발 플랫폼
- **React Navigation**: 네비게이션
- **expo-sqlite**: 로컬 데이터베이스
- **expo-notifications**: 푸시 알림
- **date-fns**: 날짜 처리
- **react-native-svg**: SVG 렌더링

## 데이터 저장

모든 데이터는 로컬 SQLite 데이터베이스에 저장되므로, 인터넷 연결 없이도 앱을 사용할 수 있습니다.

## 주의사항

- 이 앱은 의료 조언을 제공하지 않습니다.
- 약물 정보는 정확하게 의료 전문가의 지시에 따라 사용하세요.
- 주기적인 병원 검진을 받으세요.

## 라이선스

MIT License

## 지원

문제가 있거나 개선 사항이 있으면 알려주세요.
