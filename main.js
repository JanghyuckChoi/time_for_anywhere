const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const os = require('os');

// 환경 감지: WSL 또는 하드웨어 가속 비활성화 강제 플래그
const isWSL = process.platform === 'linux' && (
  os.release().toLowerCase().includes('microsoft') || 
  !!process.env.WSL_DISTRO_NAME ||
  !!process.env.WSL_INTEROP ||
  process.env.SHELL && process.env.SHELL.includes('wsl')
);
const forceDisableHWAccel = process.env.ELECTRON_DISABLE_HARDWARE_ACCELERATION === '1';

// 안정성을 위해 WSL/헤드리스에서 하드웨어 가속 비활성화
if (isWSL || forceDisableHWAccel) {
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-software-rasterizer');
}

// 샌드박스/공유메모리 이슈 회피 (WSL/컨테이너 호환)
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-setuid-sandbox');

// WSL 환경에서 추가 안정화 설정
if (isWSL) {
  app.commandLine.appendSwitch('disable-background-timer-throttling');
  app.commandLine.appendSwitch('disable-renderer-backgrounding');
  app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
  app.commandLine.appendSwitch('disable-ipc-flooding-protection');
}

let mainWindow;
let isDarkMode = true; // 기본값은 다크 모드

// 메모리 사용량 모니터링 (개발 편의)
function logMemoryUsage() {
  if (mainWindow && mainWindow.webContents && typeof process.getProcessMemoryInfo === 'function') {
    Promise.resolve(process.getProcessMemoryInfo())
      .then((memoryInfo) => console.log('Memory usage:', memoryInfo))
      .catch(() => {});
  }
}

function createWindow() {
  console.log('Creating main window...');
  
  // 메인 윈도우 생성 - 성능/안정화 설정
  mainWindow = new BrowserWindow({
    width: 380,
    height: 270,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    show: false, // ready-to-show까지 숨김
    backgroundColor: '#ffffff',
    icon: path.join(__dirname, 'assets', 'icon.svg'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      backgroundThrottling: false,
      offscreen: false,
      // 보안 관련 (필요 시 유지)
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });

  console.log('Loading index.html...');
  
  // HTML 파일 로드
  mainWindow.loadFile('index.html');

  // 준비되면 표시 (깜빡임 방지)
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    if (!mainWindow || mainWindow.isDestroyed()) return;
    
    try {
      mainWindow.show();
      console.log('Window shown successfully');

        // 화면 우상단 고정
      try {
        const { screen } = require('electron');
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width } = primaryDisplay.workAreaSize;
        mainWindow.setPosition(width - 400, 20);
        console.log('Window positioned');
      } catch (error) {
        console.error('Error positioning window:', error);
        // 기본 위치로 설정
        mainWindow.setPosition(100, 100);
      }
    } catch (error) {
      console.error('Error showing window:', error);
    }
  });

  // 개발자 도구 열기 (디버깅용)
  mainWindow.webContents.openDevTools({ mode: 'detach' });

  // 윈도우가 닫히면 참조 해제
  mainWindow.on('closed', () => {
    console.log('Main window closed');
    mainWindow = null;
  });

  // 개발 모드에서 리소스 모니터링 (메모리 누수 방지)
  let memoryMonitorInterval = null;
  if (process.argv.includes('--dev')) {
    memoryMonitorInterval = setInterval(logMemoryUsage, 30000);
    
    // 윈도우 종료 시 인터벌 정리
    mainWindow.on('closed', () => {
      if (memoryMonitorInterval) {
        clearInterval(memoryMonitorInterval);
        memoryMonitorInterval = null;
      }
    });
  }

  // 포커스 최적화
  mainWindow.on('focus', () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.setZoomFactor(1.0);
    }
  });

  // 에러 핸들링 추가
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('Renderer process crashed');
  });

  // 타임아웃 설정으로 무한 대기 방지
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      console.log('Window not visible after timeout, forcing show');
      try {
        mainWindow.show();
      } catch (error) {
        console.error('Error forcing window show:', error);
      }
    }
  }, 5000);
}

// 앱 준비되면 윈도우 생성
app.whenReady().then(() => {
  console.log('App is ready, creating window...');
  createWindow();

  // 전역 단축키 등록
  const registerShortcuts = () => {
    try {
      // Linux에서는 Ctrl 대신 Super 키 사용
      const modifier = process.platform === 'linux' ? 'Super' : 'Ctrl';
      
      globalShortcut.register(`${modifier}+Shift+D`, () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('toggle-theme');
        }
      });
      console.log('Shortcuts registered successfully');
    } catch (error) {
      console.log('단축키 등록 실패:', error);
    }
  };

  registerShortcuts();

  // macOS에서 앱이 활성화될 때 윈도우 재생성
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch((error) => {
  console.error('Error in app.whenReady():', error);
});

// 모든 윈도우가 닫히면 앱 종료
app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 이벤트 핸들러
ipcMain.handle('get-theme', () => {
  return isDarkMode;
});

ipcMain.handle('set-theme', (event, darkMode) => {
  isDarkMode = darkMode;
  return isDarkMode;
});

// 보안: 새 윈도우 생성 방지
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event) => {
    event.preventDefault();
  });
});

// 종료 시 리소스 정리
app.on('before-quit', () => {
  console.log('App quitting, cleaning up...');
  globalShortcut.unregisterAll();
});

// GPU 프로세스 크래시 로깅 (WSL에서는 무시 가능)
app.on('gpu-process-crashed', (event, killed) => {
  console.log('GPU process crashed, killed:', killed);
});

// 렌더러 종료 로깅
app.on('render-process-gone', (event, webContents, details) => {
  console.log('Renderer process gone:', details.reason);
});

// 앱 시작 로깅
app.on('ready', () => {
  console.log('App ready event fired');
});

// 앱 종료 로깅
app.on('quit', () => {
  console.log('App quit event fired');
});

// 에러 핸들링
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
