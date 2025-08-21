const { ipcRenderer } = require('electron');

// DOM elements - cached once
const elements = {
    clockWidget: document.getElementById('clockWidget'),
    hoursModule: document.getElementById('hoursModule'),
    minutesModule: document.getElementById('minutesModule'),
    secondsModule: document.getElementById('secondsModule'),

    toggleThemeBtn: document.getElementById('toggleTheme'),
    closeAppBtn: document.getElementById('closeApp')
};

// 현재 시간 상태
let currentTime = {
    hours: 0,
    minutes: 0,
    seconds: 0
};

// 이전 시간 상태 (플립 애니메이션용)
let previousTime = {
    hours: 0,
    minutes: 0,
    seconds: 0
};



// Performance optimization variables
let lastUpdateTime = 0;
let isAnimating = false;
let isInitialized = false; // 초기화 상태 추적

// Initialize app
function initializeApp() {
    // Load theme settings first
    loadTheme();
    
    // 초기 시계 표시 (DOM이 준비된 후)
    setTimeout(() => {
        updateClock();
        isInitialized = true;
    }, 100);
    
    // Smooth clock updates using requestAnimationFrame
    function animateClock() {
        const now = Date.now();
        if (now - lastUpdateTime >= 1000) { // Update every second
            updateClock();
            lastUpdateTime = now;
        }
        requestAnimationFrame(animateClock);
    }
    
    requestAnimationFrame(animateClock);
    
    // Setup event listeners
    setupEventListeners();
    
    // IPC event listeners
    setupIpcListeners();
}



// 시계 업데이트 함수 - 변경된 경우에만 DOM 업데이트
function updateClock() {
    // 현재 모드에 따라 다른 시간 표시
    if (currentMode === 'now') {
        console.log('Updating clock in NOW mode');
        updateCurrentTime();
    } else if (currentMode === '5pm') {
        console.log('Updating clock in 5PM mode');
        // 5PM 모드일 때만 한 번 실행하고 인터벌 설정
        if (!remainingTimeInterval) {
            showRemainingTimeUntilTarget(17);
        }
    } else if (currentMode === '6pm') {
        console.log('Updating clock in 6PM mode');
        // 6PM 모드일 때만 한 번 실행하고 인터벌 설정
        if (!remainingTimeInterval) {
            showRemainingTimeUntilTarget(18);
        }
    }
}

// 현재 시간 표시 (12시간제)
function updateCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // 12시간제로 변환
    hours = hours % 12;
    hours = hours ? hours : 12; // 0시는 12시로 표시
    
    const newTime = {
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
    
    console.log('updateCurrentTime called with:', newTime);
    console.log('current currentTime:', currentTime);
    
    // 초기 로딩 시에는 애니메이션 없이 바로 설정
    if (!isInitialized || (currentTime.hours === 0 && currentTime.minutes === 0 && currentTime.seconds === 0)) {
        console.log('Initial time display:', newTime);
        
        // DOM 요소에 직접 설정
        const hoursFront = elements.hoursModule.querySelector('.flip-card-front');
        const hoursBack = elements.hoursModule.querySelector('.flip-card-back');
        const minutesFront = elements.minutesModule.querySelector('.flip-card-front');
        const minutesBack = elements.minutesModule.querySelector('.flip-card-back');
        const secondsFront = elements.secondsModule.querySelector('.flip-card-front');
        const secondsBack = elements.secondsModule.querySelector('.flip-card-back');
        
        if (hoursFront && hoursBack && minutesFront && minutesBack && secondsFront && secondsBack) {
            hoursFront.textContent = String(hours).padStart(2, '0');
            hoursBack.textContent = String(hours).padStart(2, '0');
            minutesFront.textContent = String(minutes).padStart(2, '0');
            minutesBack.textContent = String(minutes).padStart(2, '0');
            secondsFront.textContent = String(seconds).padStart(2, '0');
            secondsBack.textContent = String(seconds).padStart(2, '0');
            
            currentTime = { ...newTime };
            console.log('Time set successfully:', currentTime);
        } else {
            console.error('DOM elements not found');
        }
        return;
    }
    
    // NOW 모드에서는 항상 현재 시간을 표시 (애니메이션 없이)
    if (currentMode === 'now') {
        console.log('Force updating time display in NOW mode');
        
        // DOM 요소에 직접 설정 (애니메이션 없이)
        const hoursFront = elements.hoursModule.querySelector('.flip-card-front');
        const hoursBack = elements.hoursModule.querySelector('.flip-card-back');
        const minutesFront = elements.minutesModule.querySelector('.flip-card-front');
        const minutesBack = elements.minutesModule.querySelector('.flip-card-back');
        const secondsFront = elements.secondsModule.querySelector('.flip-card-front');
        const secondsBack = elements.secondsModule.querySelector('.flip-card-back');
        
        if (hoursFront && hoursBack && minutesFront && minutesBack && secondsFront && secondsBack) {
            hoursFront.textContent = String(hours).padStart(2, '0');
            hoursBack.textContent = String(hours).padStart(2, '0');
            minutesFront.textContent = String(minutes).padStart(2, '0');
            minutesBack.textContent = String(minutes).padStart(2, '0');
            secondsFront.textContent = String(seconds).padStart(2, '0');
            secondsBack.textContent = String(seconds).padStart(2, '0');
            
            currentTime = { ...newTime };
            console.log('Time updated successfully in NOW mode:', currentTime);
        }
        return;
    }
    
    // 다른 모드에서는 시간이 변경되었을 때만 플립 애니메이션 실행
    if (newTime.hours !== currentTime.hours) {
        console.log(`Hours changed: ${currentTime.hours} -> ${newTime.hours}`);
        flipTimeModule(elements.hoursModule, currentTime.hours, newTime.hours);
        currentTime.hours = newTime.hours;
    }
    
    if (newTime.minutes !== currentTime.minutes) {
        console.log(`Minutes changed: ${currentTime.minutes} -> ${newTime.minutes}`);
        flipTimeModule(elements.minutesModule, currentTime.minutes, newTime.minutes);
        currentTime.minutes = newTime.minutes;
    }
    
    if (newTime.seconds !== currentTime.seconds) {
        console.log(`Seconds changed: ${currentTime.seconds} -> ${newTime.seconds}`);
        flipTimeModule(elements.secondsModule, currentTime.seconds, newTime.seconds);
        currentTime.seconds = newTime.seconds;
    }
    
    // 디버깅: 현재 상태 로그
    console.log(`Current time state: ${currentTime.hours}:${currentTime.minutes}:${newTime.seconds}`);
}

// Date update function removed for minimal design

// 플립 애니메이션 함수 - GPU 가속 최적화
function flipTimeModule(module, oldValue, newValue) {
    if (isAnimating) return; // 애니메이션 중복 방지
    
    const flipCard = module.querySelector('.flip-card');
    const front = module.querySelector('.flip-card-front');
    const back = module.querySelector('.flip-card-back');
    
    // 값이 같으면 애니메이션 실행하지 않음
    if (oldValue === newValue) return;
    
    // 뒷면에 새 값 설정
    back.textContent = String(newValue).padStart(2, '0');
    
    // GPU 가속을 위한 transform 사용
    flipCard.style.transform = 'rotateX(0deg)';
    flipCard.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
    
    // 플립 애니메이션 시작
    requestAnimationFrame(() => {
        flipCard.style.transform = 'rotateX(-90deg)';
        
        setTimeout(() => {
            front.textContent = String(newValue).padStart(2, '0');
            flipCard.style.transform = 'rotateX(0deg)';
            
            setTimeout(() => {
                flipCard.style.transition = '';
                isAnimating = false;
            }, 300);
        }, 150);
    });
    
    isAnimating = true;
}



// 시간 표시 모드 상태
let currentMode = 'now'; // 'now', '5pm', '6pm'
let remainingTimeInterval = null;
let targetHour = 17; // 기본값: 17시 (5시)

// Toggle between time display modes
function toggleTimeMode() {
    console.log(`=== TOGGLE TIME MODE ===`);
    console.log(`Current mode: ${currentMode}`);
    
    // 기존 인터벌 정리
    if (remainingTimeInterval) {
        clearInterval(remainingTimeInterval);
        remainingTimeInterval = null;
    }
    
    // 모드 순환: now -> 5pm -> 6pm -> now
    if (currentMode === 'now') {
        currentMode = '5pm';
        console.log('Switching to 5PM mode');
    } else if (currentMode === '5pm') {
        currentMode = '6pm';
        console.log('Switching to 6PM mode');
    } else {
        currentMode = 'now';
        console.log('Switching to NOW mode');
        
        // NOW 모드로 돌아올 때 현재 시간으로 currentTime 재설정
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // 12시간제로 변환
        hours = hours % 12;
        hours = hours ? hours : 12;
        
        currentTime = {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };
        
        console.log('Reset currentTime for NOW mode:', currentTime);
    }
    
    console.log(`New mode: ${currentMode}`);
    
    // 버튼 텍스트 업데이트
    updateToggleButtonText();
    
    // 시계 업데이트 (모드 변경 후)
    updateClock();
}

// Calculate and display remaining time until target hour
function showRemainingTimeUntilTarget(targetHour) {
    console.log(`=== CALCULATING REMAINING TIME ===`);
    console.log(`Target hour: ${targetHour}`);
    
    const now = new Date();
    const todayTarget = new Date();
    todayTarget.setHours(targetHour, 0, 0, 0);
    
    console.log(`Current time: ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
    console.log(`Today's target: ${todayTarget.getHours()}:${todayTarget.getMinutes()}:${todayTarget.getSeconds()}`);
    console.log(`Now >= todayTarget: ${now >= todayTarget}`);
    
    let targetTime = todayTarget;
    
    // If current time has passed target time, set to next day
    if (now >= todayTarget) {
        targetTime = new Date(todayTarget);
        targetTime.setDate(targetTime.getDate() + 1);
        console.log('Target time passed, setting to next day');
        console.log(`Next day target: ${targetTime.getHours()}:${targetTime.getMinutes()}:${targetTime.getSeconds()}`);
    }
    
    // Display remaining time in clock format
    function updateRemainingTime() {
        const now = new Date();
        const timeDiff = targetTime - now;
        
        if (timeDiff <= 0) {
            // When target time is reached
            elements.hoursModule.querySelector('.flip-card-front').textContent = '00';
            elements.minutesModule.querySelector('.flip-card-front').textContent = '00';
            elements.secondsModule.querySelector('.flip-card-front').textContent = '00';
            elements.hoursModule.querySelector('.flip-card-back').textContent = '00';
            elements.minutesModule.querySelector('.flip-card-back').textContent = '00';
            elements.secondsModule.querySelector('.flip-card-back').textContent = '00';
            console.log('Target time reached!');
            return;
        }
        
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        // Update clock display
        elements.hoursModule.querySelector('.flip-card-front').textContent = String(hours).padStart(2, '0');
        elements.minutesModule.querySelector('.flip-card-front').textContent = String(minutes).padStart(2, '0');
        elements.secondsModule.querySelector('.flip-card-front').textContent = String(seconds).padStart(2, '0');
        
        // Update back side as well
        elements.hoursModule.querySelector('.flip-card-back').textContent = String(hours).padStart(2, '0');
        elements.minutesModule.querySelector('.flip-card-back').textContent = String(minutes).padStart(2, '0');
        elements.secondsModule.querySelector('.flip-card-back').textContent = String(seconds).padStart(2, '0');
    }
    
    // Update immediately
    updateRemainingTime();
    
    // Update every second (기존 인터벌이 없을 때만 새로 생성)
    if (!remainingTimeInterval) {
        remainingTimeInterval = setInterval(updateRemainingTime, 1000);
        console.log(`Interval set for ${targetHour}:00 countdown`);
    }
}

// Update button text based on current mode
function updateToggleButtonText() {
    if (currentMode === 'now') {
        elements.toggleThemeBtn.textContent = 'NOW';
        elements.toggleThemeBtn.title = 'Showing current time (Click to show 5PM countdown)';
    } else if (currentMode === '5pm') {
        elements.toggleThemeBtn.textContent = '5PM';
        elements.toggleThemeBtn.title = 'Showing time until 5PM (Click to show 6PM countdown)';
    } else if (currentMode === '6pm') {
        elements.toggleThemeBtn.textContent = '6PM';
        elements.toggleThemeBtn.title = 'Showing time until 6PM (Click to show current time)';
    }
}

// Load settings
function loadSettings() {
    // Load saved current mode
    const savedMode = localStorage.getItem('currentMode');
    if (savedMode && ['now', '5pm', '6pm'].includes(savedMode)) {
        currentMode = savedMode;
        console.log(`Loaded current mode: ${currentMode}`);
    }
    
    // Always apply dark theme
    elements.clockWidget.classList.add('dark-theme');
    
    // Button setup
    updateToggleButtonText();
}

// Keep loadTheme for compatibility
function loadTheme() {
    loadSettings();
}

// Close app
function closeApp() {
    window.close();
}

// Setup event listeners
function setupEventListeners() {
    // Time mode toggle button (left click)
    elements.toggleThemeBtn.addEventListener('click', () => {
        toggleTimeMode();
        // Save current mode to localStorage
        localStorage.setItem('currentMode', currentMode);
    });
    
    // Close app button
    elements.closeAppBtn.addEventListener('click', closeApp);
}

// Setup IPC event listeners
function setupIpcListeners() {
    // Toggle time mode (global shortcut)
    ipcRenderer.on('toggle-theme', (event) => {
        toggleTimeMode();
        localStorage.setItem('currentMode', currentMode);
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', initializeApp);

// Update clock when window gains focus
window.addEventListener('focus', () => {
    updateClock();
});

// Update clock when page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateClock();
    }
});


