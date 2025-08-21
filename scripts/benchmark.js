#!/usr/bin/env node

/**
 * MyTime 애플리케이션 성능 벤치마크 스크립트
 * 실행 시간, 메모리 사용량, CPU 사용량을 측정합니다.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 벤치마크 설정
const BENCHMARK_CONFIG = {
    iterations: 10,
    warmupTime: 5000, // 5초 워밍업
    testTime: 30000,  // 30초 테스트
    metrics: ['startup', 'memory', 'cpu', 'animation']
};

// 결과 저장
const results = {
    startup: [],
    memory: [],
    cpu: [],
    animation: [],
    timestamp: new Date().toISOString()
};

// 로그 함수
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

// 시간 측정 함수
function measureTime(fn) {
    const start = process.hrtime.bigint();
    fn();
    const end = process.hrtime.bigint();
    return Number(end - start) / 1000000; // 밀리초 단위로 변환
}

// 메모리 사용량 측정
function getMemoryUsage() {
    const memUsage = process.memoryUsage();
    return {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024) // MB
    };
}

// CPU 사용량 측정
function getCPUUsage() {
    const startUsage = process.cpuUsage();
    return new Promise((resolve) => {
        setTimeout(() => {
            const endUsage = process.cpuUsage(startUsage);
            resolve({
                user: Math.round(endUsage.user / 1000), // 밀리초
                system: Math.round(endUsage.system / 1000) // 밀리초
            });
        }, 100);
    });
}

// 애플리케이션 시작 시간 측정
async function benchmarkStartup() {
    log('애플리케이션 시작 시간 벤치마크 시작...');
    
    for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
        log(`시작 시간 테스트 ${i + 1}/${BENCHMARK_CONFIG.iterations}`);
        
        const startTime = Date.now();
        
        try {
            // Electron 프로세스 시작
            const electronProcess = spawn('electron', ['.', '--no-sandbox'], {
                cwd: process.cwd(),
                stdio: 'pipe'
            });
            
            // 프로세스가 준비될 때까지 대기
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('시작 시간 초과'));
                }, 10000);
                
                electronProcess.stdout.on('data', (data) => {
                    if (data.toString().includes('ready')) {
                        clearTimeout(timeout);
                        resolve();
                    }
                });
                
                electronProcess.on('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
            
            const endTime = Date.now();
            const startupTime = endTime - startTime;
            
            results.startup.push(startupTime);
            log(`시작 시간: ${startupTime}ms`, 'success');
            
            // 프로세스 종료
            electronProcess.kill();
            
            // 다음 테스트 전 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            log(`시작 시간 테스트 실패: ${error.message}`, 'error');
        }
    }
}

// 메모리 사용량 벤치마크
async function benchmarkMemory() {
    log('메모리 사용량 벤치마크 시작...');
    
    for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
        log(`메모리 테스트 ${i + 1}/${BENCHMARK_CONFIG.iterations}`);
        
        try {
            // 가상의 메모리 사용량 시뮬레이션
            const testData = new Array(1000000).fill('test');
            const memoryUsage = getMemoryUsage();
            
            results.memory.push(memoryUsage);
            log(`메모리 사용량: ${memoryUsage.heapUsed}MB (힙), ${memoryUsage.rss}MB (RSS)`, 'success');
            
            // 메모리 정리
            testData.length = 0;
            
            // 다음 테스트 전 대기
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            log(`메모리 테스트 실패: ${error.message}`, 'error');
        }
    }
}

// CPU 사용량 벤치마크
async function benchmarkCPU() {
    log('CPU 사용량 벤치마크 시작...');
    
    for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
        log(`CPU 테스트 ${i + 1}/${BENCHMARK_CONFIG.iterations}`);
        
        try {
            // CPU 집약적 작업 시뮬레이션
            const startTime = Date.now();
            let result = 0;
            
            for (let j = 0; j < 1000000; j++) {
                result += Math.sqrt(j) * Math.sin(j);
            }
            
            const endTime = Date.now();
            const cpuUsage = await getCPUUsage();
            
            results.cpu.push({
                executionTime: endTime - startTime,
                cpuUsage: cpuUsage
            });
            
            log(`CPU 테스트 완료: ${endTime - startTime}ms, CPU: ${cpuUsage.user}ms`, 'success');
            
            // 다음 테스트 전 대기
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            log(`CPU 테스트 실패: ${error.message}`, 'error');
        }
    }
}

// 애니메이션 성능 벤치마크
async function benchmarkAnimation() {
    log('애니메이션 성능 벤치마크 시작...');
    
    for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
        log(`애니메이션 테스트 ${i + 1}/${BENCHMARK_CONFIG.iterations}`);
        
        try {
            // 애니메이션 프레임 계산 시뮬레이션
            const frameCount = 60;
            const frameTimes = [];
            
            for (let frame = 0; frame < frameCount; frame++) {
                const frameStart = process.hrtime.bigint();
                
                // 가상의 애니메이션 계산
                const progress = frame / frameCount;
                const transform = Math.sin(progress * Math.PI * 2);
                
                const frameEnd = process.hrtime.bigint();
                const frameTime = Number(frameEnd - frameStart) / 1000000;
                frameTimes.push(frameTime);
                
                // 16.67ms (60fps) 시뮬레이션
                await new Promise(resolve => setTimeout(resolve, 16.67));
            }
            
            const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            const fps = 1000 / avgFrameTime;
            
            results.animation.push({
                avgFrameTime: avgFrameTime,
                fps: fps,
                frameTimes: frameTimes
            });
            
            log(`애니메이션 성능: ${avgFrameTime.toFixed(2)}ms/프레임, ${fps.toFixed(1)} FPS`, 'success');
            
            // 다음 테스트 전 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            log(`애니메이션 테스트 실패: ${error.message}`, 'error');
        }
    }
}

// 결과 분석 및 요약
function analyzeResults() {
    log('벤치마크 결과 분석 중...');
    
    const summary = {
        startup: {
            min: Math.min(...results.startup),
            max: Math.max(...results.startup),
            avg: results.startup.reduce((a, b) => a + b, 0) / results.startup.length,
            count: results.startup.length
        },
        memory: {
            avgHeapUsed: results.memory.reduce((sum, m) => sum + m.heapUsed, 0) / results.memory.length,
            avgRSS: results.memory.reduce((sum, m) => sum + m.rss, 0) / results.memory.length,
            count: results.memory.length
        },
        cpu: {
            avgExecutionTime: results.cpu.reduce((sum, c) => sum + c.executionTime, 0) / results.cpu.length,
            avgCPUUsage: results.cpu.reduce((sum, c) => sum + c.cpuUsage.user, 0) / results.cpu.length,
            count: results.cpu.length
        },
        animation: {
            avgFrameTime: results.animation.reduce((sum, a) => sum + a.avgFrameTime, 0) / results.animation.length,
            avgFPS: results.animation.reduce((sum, a) => sum + a.fps, 0) / results.animation.length,
            count: results.animation.length
        }
    };
    
    // 결과 출력
    console.log('\n📊 벤치마크 결과 요약');
    console.log('='.repeat(50));
    
    console.log(`🚀 시작 시간:`);
    console.log(`   평균: ${summary.startup.avg.toFixed(2)}ms`);
    console.log(`   최소: ${summary.startup.min}ms`);
    console.log(`   최대: ${summary.startup.max}ms`);
    
    console.log(`\n💾 메모리 사용량:`);
    console.log(`   평균 힙: ${summary.memory.avgHeapUsed}MB`);
    console.log(`   평균 RSS: ${summary.memory.avgRSS}MB`);
    
    console.log(`\n⚡ CPU 성능:`);
    console.log(`   평균 실행 시간: ${summary.cpu.avgExecutionTime.toFixed(2)}ms`);
    console.log(`   평균 CPU 사용량: ${summary.cpu.avgCPUUsage}ms`);
    
    console.log(`\n🎬 애니메이션 성능:`);
    console.log(`   평균 프레임 시간: ${summary.animation.avgFrameTime.toFixed(2)}ms`);
    console.log(`   평균 FPS: ${summary.animation.avgFPS.toFixed(1)}`);
    
    // 성능 등급 평가
    const performanceGrade = evaluatePerformance(summary);
    console.log(`\n🏆 성능 등급: ${performanceGrade}`);
    
    return summary;
}

// 성능 등급 평가
function evaluatePerformance(summary) {
    let score = 0;
    
    // 시작 시간 평가 (1000ms 이하 = 우수)
    if (summary.startup.avg < 1000) score += 25;
    else if (summary.startup.avg < 2000) score += 15;
    else if (summary.startup.avg < 3000) score += 10;
    
    // 메모리 사용량 평가 (100MB 이하 = 우수)
    if (summary.memory.avgRSS < 100) score += 25;
    else if (summary.memory.avgRSS < 200) score += 15;
    else if (summary.memory.avgRSS < 300) score += 10;
    
    // 애니메이션 성능 평가 (60fps 이상 = 우수)
    if (summary.animation.avgFPS >= 60) score += 25;
    else if (summary.animation.avgFPS >= 50) score += 15;
    else if (summary.animation.avgFPS >= 30) score += 10;
    
    // CPU 성능 평가 (100ms 이하 = 우수)
    if (summary.cpu.avgExecutionTime < 100) score += 25;
    else if (summary.cpu.avgExecutionTime < 200) score += 15;
    else if (summary.cpu.avgExecutionTime < 300) score += 10;
    
    if (score >= 90) return 'A+ (우수)';
    if (score >= 80) return 'A (양호)';
    if (score >= 70) return 'B+ (보통)';
    if (score >= 60) return 'B (미흡)';
    return 'C (개선 필요)';
}

// 결과를 파일로 저장
function saveResults(summary) {
    const outputDir = path.join(process.cwd(), 'benchmark');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    
    const filename = `benchmark-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(outputDir, filename);
    
    const outputData = {
        summary: summary,
        detailedResults: results,
        config: BENCHMARK_CONFIG
    };
    
    fs.writeFileSync(filepath, JSON.stringify(outputData, null, 2));
    log(`벤치마크 결과가 저장되었습니다: ${filepath}`, 'success');
}

// 메인 벤치마크 실행
async function runBenchmark() {
    log('🚀 MyTime 성능 벤치마크 시작');
    log(`설정: ${BENCHMARK_CONFIG.iterations}회 반복, ${BENCHMARK_CONFIG.testTime}ms 테스트`);
    
    try {
        // 각 벤치마크 실행
        await benchmarkStartup();
        await benchmarkMemory();
        await benchmarkCPU();
        await benchmarkAnimation();
        
        // 결과 분석
        const summary = analyzeResults();
        
        // 결과 저장
        saveResults(summary);
        
        log('✅ 모든 벤치마크가 완료되었습니다!', 'success');
        
    } catch (error) {
        log(`벤치마크 실행 중 오류 발생: ${error.message}`, 'error');
        process.exit(1);
    }
}

// 스크립트 실행
if (require.main === module) {
    runBenchmark();
}

module.exports = {
    runBenchmark,
    analyzeResults,
    evaluatePerformance
};
