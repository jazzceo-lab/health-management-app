# 빠른 시작 가이드

## 1단계: 환경 설정

### Windows에서 필요한 것
- Node.js (https://nodejs.org/ 에서 LTS 버전 설치)
- npm (Node.js와 함께 설치됨)
- Expo CLI

### 설치 확인
```bash
node --version    # v16.x 이상
npm --version     # 8.x 이상
```

## 2단계: 프로젝트 시작

### 터미널에서 프로젝트 폴더로 이동
```bash
cd N:\개인\진명건광관리앱
```

### 의존성 설치
```bash
npm install
```

이 과정은 몇 분이 걸릴 수 있습니다. 진행 상황을 확인하세요.

## 3단계: 개발 서버 시작

```bash
npm start
```

Expo 개발 서버가 시작되고 QR 코드가 표시됩니다.

## 4단계: 앱 실행 선택

### 스마트폰에서 실행 (추천)
1. iOS: Apple App Store에서 "Expo Go" 앱 설치
2. Android: Google Play에서 "Expo Go" 앱 설치
3. Expo Go 앱 열기
4. QR 코드 스캔 또는 프로젝트 이름 검색

### 에뮬레이터에서 실행
- Android: `a` 입력
- iOS: `i` 입력 (Mac에서만 가능)

### 웹 브라우저에서 실행
- `w` 입력

## 주요 기능 사용 방법

### 대시보드
- 오늘의 복약 현황을 한눈에 확인
- 실손보험 청구 기한 확인
- 빠른 링크로 다른 화면 이동

### 복약 추적
- 날짜 선택하여 복약 기록 확인
- 약물별로 시간대별 체크
- 복용 상태 업데이트

### 검사 수치
- "수치 추가" 버튼으로 검사 결과 기록
- 정상 범위 확인
- 이전 검사 결과와 비교
- "그래프 보기"로 추이 확인 (준비 중)

### 탈모 관리
- 주간 달력에서 탈모약 복용 기록
- 미녹시딜 도포 여부 체크
- 주간 통계 확인

### 설정
- 알림 활성화/비활성화
- 소리 및 진동 설정 변경
- 데이터 관리 (준비 중)

## 문제 해결

### "npm install" 실패
```bash
# npm 캐시 삭제
npm cache clean --force

# 다시 설치
npm install
```

### Expo Go에서 앱이 로드되지 않음
1. 터미널에서 `q` 입력 후 Enter
2. `npm start` 다시 실행
3. QR 코드 다시 스캔

### 데이터베이스 오류
```bash
# 노드 모듈 재설치
rm -r node_modules
npm install
```

### 알림이 작동하지 않음
1. 기기의 설정에서 "Expo Go" 알림 권한 확인
2. 앱의 설정 탭에서 알림 활성화 확인

## 개발 팁

### 핫 리로드 활용
- 코드를 저장하면 자동으로 새로고침됨
- 수동 새로고침: `r` 입력

### 디버그 메뉴
- 스마트폰을 흔들어 디버그 메뉴 열기
- 또는 터미널에서 `d` 입력

### 콘솔 로그 확인
```bash
# 터미널에서 직접 로그 확인
```

## 빌드 및 배포 (향후)

### Android APK 빌드
```bash
eas build --platform android
```

### iOS 빌드
```bash
eas build --platform ios
```

자세한 내용: https://docs.expo.dev/build/introduction/

## 다음 단계

1. ✅ 앱 실행 확인
2. ☐ 약물 정보 확인
3. ☐ 첫 번째 복약 기록
4. ☐ 검사 수치 입력
5. ☐ 알림 설정

## 도움이 필요하신가요?

- Expo 문서: https://docs.expo.dev
- React Native 문서: https://reactnative.dev
- 프로젝트 문제: README.md 참조
