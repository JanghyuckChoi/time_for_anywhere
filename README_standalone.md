# MyTime - 스탠드얼론 버전

MyTime 시계 위젯의 스탠드얼론 웹 버전입니다. 웹 브라우저에서 직접 실행할 수 있습니다.

## 🚀 실행 방법

### 방법 1: 직접 파일 열기
1. `standalone.html` 파일을 웹 브라우저로 직접 열기
2. 대부분의 브라우저에서 바로 실행됩니다

### 방법 2: 로컬 웹서버 사용 (권장)
```bash
# Python 3가 설치된 경우
python3 -m http.server 8080

# Python 2가 설치된 경우
python -m SimpleHTTPServer 8080

# Node.js가 설치된 경우
npx serve .
```

그 후 브라우저에서 `http://localhost:8080/standalone.html` 접속

### 방법 3: 온라인 서비스 이용
- GitHub Pages, Netlify, Vercel 등에 업로드하여 온라인으로 접근 가능

## ✨ 기능

### 시간 표시 모드
- **NOW**: 현재 시간 표시 (12시간제)
- **5PM**: 오후 5시까지 남은 시간 카운트다운
- **6PM**: 오후 6시까지 남은 시간 카운트다운

### 컨트롤
- **모드 변경 버튼**: 시간 표시 모드 순환 변경
- **전체화면 버튼**: 전체화면 모드 토글
- **도움말 버튼**: 키보드 단축키 정보 표시

### 키보드 단축키
- `F11`: 전체화면 토글
- `Space`: 시간 표시 모드 변경
- `H`: 도움말 토글
- `ESC`: 전체화면 종료 또는 도움말 닫기

## 🎨 특징

### 디자인
- 다크 테마 기본 적용
- 플립 카드 애니메이션으로 시간 변화 표시
- GPU 가속 최적화로 부드러운 애니메이션
- 반응형 디자인으로 다양한 화면 크기 지원

### 성능 최적화
- requestAnimationFrame을 사용한 효율적인 업데이트
- GPU 가속을 통한 부드러운 애니메이션
- 메모리 누수 방지를 위한 적절한 리소스 관리

### 브라우저 호환성
- 모던 브라우저 지원 (Chrome, Firefox, Safari, Edge)
- 웹 표준 기술만 사용 (Vanilla JavaScript, CSS3)

## 📝 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: 플렉스박스, 그리드, 애니메이션, GPU 가속
- **Vanilla JavaScript**: ES6+ 문법, 모듈 패턴
- **Web APIs**: Fullscreen API, Local Storage API

## 🔧 커스터마이징

### 색상 변경
CSS 변수를 수정하여 색상 테마를 변경할 수 있습니다:

```css
:root {
  --bg-color: #000000;
  --text-color: #e0e0e0;
  --card-bg: #141414;
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### 시간 형식 변경
JavaScript에서 시간 형식을 24시간제로 변경하려면:

```javascript
// 12시간제 변환 부분 주석 처리
// hours = hours % 12;
// hours = hours ? hours : 12;
```

### 추가 모드 구현
`toggleTimeMode()` 함수를 수정하여 더 많은 시간 모드를 추가할 수 있습니다.

## 📱 모바일 지원

- 터치 인터페이스 최적화
- 반응형 디자인으로 모바일 기기 지원
- PWA(Progressive Web App)로 확장 가능

## 🛠️ 개발자 정보

이 스탠드얼론 버전은 원본 Electron 앱에서 다음과 같이 변환되었습니다:

1. **Electron 의존성 제거**: `ipcRenderer` 등 Electron API 제거
2. **순수 웹 기술 사용**: Vanilla JavaScript, CSS3, HTML5만 사용
3. **추가 기능 구현**: 전체화면 모드, 키보드 단축키, 도움말
4. **성능 최적화**: GPU 가속, 메모리 관리 개선
5. **접근성 향상**: 키보드 네비게이션, 시각적 피드백

## 🚀 배포 가이드

### GitHub Pages 배포
1. GitHub 리포지토리에 `standalone.html` 업로드
2. Settings > Pages에서 소스 브랜치 설정
3. 제공된 URL로 접근

### Netlify 배포
1. `standalone.html`을 포함한 폴더를 드래그 앤 드롭
2. 자동으로 배포 URL 생성

### 로컬 네트워크 공유
```bash
# 네트워크의 다른 기기에서 접근 가능
python3 -m http.server 8080 --bind 0.0.0.0
```

이제 어떤 기기에서든 `http://[IP주소]:8080/standalone.html`로 접근 가능합니다.
