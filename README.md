# time_for_anywhere

어디서나 사용할 수 있는 시계 위젯 - Electron 데스크톱 앱과 스탠드얼론 웹 버전을 모두 제공합니다.

## 🕐 프로젝트 소개

MyTime은 플립 카드 애니메이션과 다양한 시간 표시 모드를 제공하는 세련된 시계 위젯입니다. 
데스크톱에서는 Electron 앱으로, 웹에서는 브라우저에서 직접 실행할 수 있는 스탠드얼론 버전으로 제공됩니다.

## ✨ 주요 기능

- **현재 시간 표시**: 12시간제 형식으로 현재 시간 표시
- **카운트다운 모드**: 
  - 오후 5시까지 남은 시간
  - 오후 6시까지 남은 시간
- **플립 카드 애니메이션**: 시간 변경 시 부드러운 전환 효과
- **다크 테마**: 모던한 다크 인터페이스
- **반응형 디자인**: 다양한 화면 크기 지원
- **키보드 단축키**: 편리한 조작을 위한 단축키 지원

## 🚀 사용 방법

### 📱 스탠드얼론 웹 버전 (권장)

**가장 간단한 방법:**
```bash
# 리포지토리 클론
git clone https://github.com/JanghyuckChoi/time_for_anywhere.git
cd time_for_anywhere

# 웹서버 실행
python3 -m http.server 8080

# 브라우저에서 접속
# http://localhost:8080/standalone.html
```

**또는 파일 직접 열기:**
- `standalone.html` 파일을 웹 브라우저로 드래그 앤 드롭

### 🖥️ Electron 데스크톱 버전

```bash
# 의존성 설치
npm install

# 애플리케이션 실행
npm start

# WSL 사용자의 경우
npm run start:wsl
```

## 🎯 조작 방법

### 스탠드얼론 웹 버전
- **모드 변경 버튼**: NOW → 5PM → 6PM 순환
- **전체화면 버튼**: 전체화면 모드 토글
- **도움말 버튼**: 키보드 단축키 정보

**키보드 단축키:**
- `F11`: 전체화면 토글
- `Space`: 시간 표시 모드 변경
- `H`: 도움말 토글
- `ESC`: 전체화면 종료

### Electron 데스크톱 버전
- **⏱️ 버튼**: 시간 표시 모드 토글
- **✕ 버튼**: 애플리케이션 종료
- **전역 단축키**: `Ctrl+Shift+D` (Linux: `Super+Shift+D`)

## 📋 시간 표시 모드

1. **NOW**: 현재 시간 (12시간제)
2. **5PM**: 오후 5시까지 남은 시간 카운트다운
3. **6PM**: 오후 6시까지 남은 시간 카운트다운

## 🛠️ 개발

개발 모드 실행:
```bash
npm run dev
```

빌드:
```bash
npm run build
```

## 🌐 배포

### GitHub Pages
1. `standalone.html`을 GitHub 리포지토리에 업로드
2. Settings > Pages에서 배포 설정

### Netlify/Vercel
- `standalone.html` 파일을 드래그 앤 드롭으로 간단 배포

## 🔧 기술 스택

### 스탠드얼론 웹 버전
- **HTML5**: 시맨틱 마크업
- **CSS3**: 플렉스박스, 애니메이션, GPU 가속
- **Vanilla JavaScript**: ES6+, 웹 표준 API

### Electron 데스크톱 버전
- **Electron 28.0.0**: 크로스 플랫폼 데스크톱 앱
- **Node.js**: 백엔드 로직
- **GPU 가속 최적화**: 부드러운 애니메이션

## 📱 호환성

- **웹 버전**: Chrome, Firefox, Safari, Edge (모던 브라우저)
- **데스크톱 버전**: Windows, macOS, Linux
- **WSL 지원**: Windows Subsystem for Linux 환경 최적화

## 📄 라이선스

MIT License

---

**time_for_anywhere** - 어디서나 사용할 수 있는 아름다운 시계 위젯# time_for_anywhere
# time_for_anywhere

