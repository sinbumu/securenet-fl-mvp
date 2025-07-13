const API_BASE_URL = "http://13.209.117.252:8000";

let currentTab = 'server';
let isRunning = false;

const logFiles = {
    server: '/home/project/ai/server.log',
    bank_a: '/home/project/ai/bank_a.log',
    bank_b: '/home/project/ai/bank_b.log',
    bank_c: '/home/project/ai/bank_c.log',
    evaluation: '/home/project/ai/evaluate_model.log'
};

function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Clear current content
    const logContent = document.getElementById('logContent');
    logContent.innerHTML = '';
    
    if (isRunning) {
        displayLogs(tab);
    } else {
        logContent.innerHTML = '데모를 시작하려면 "데모 시작" 버튼을 클릭하세요.';
    }
}

async function startDemo() {
    if (isRunning) return;
    
    isRunning = true;
    const playBtn = document.getElementById('playBtn');
    const status = document.getElementById('status');
    
    playBtn.disabled = true;
    playBtn.textContent = '실행 중...';
    status.textContent = '연합학습 데모가 실행 중입니다...';
    status.className = 'status running';
    
    try {
        // Start with server logs
        await displayLogs('server');
        
        // Then show other logs in sequence
        await new Promise(resolve => setTimeout(resolve, 2000));
        await displayLogs('bank_a');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        await displayLogs('bank_b');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        await displayLogs('bank_c');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        await displayLogs('evaluation');
        
        status.textContent = '데모가 완료되었습니다!';
        status.className = 'status completed';
        
    } catch (error) {
        console.error('Demo error:', error);
        status.textContent = '데모 실행 중 오류가 발생했습니다.';
        status.className = 'status';
    } finally {
        playBtn.disabled = false;
        playBtn.textContent = '데모 다시 시작';
    }
}

async function displayLogs(logType) {
    if (currentTab !== logType) return;
    
    const logContent = document.getElementById('logContent');
    logContent.innerHTML = '';
    
    try {
        // Read log file content
        const response = await fetch(logFiles[logType]);
        if (!response.ok) {
            throw new Error(`Failed to load ${logType} logs`);
        }
        
        const logText = await response.text();
        const lines = logText.split('\n').filter(line => line.trim());
        
        // Display lines one by one with animation
        for (let i = 0; i < lines.length; i++) {
            if (currentTab !== logType) break; // Stop if user switched tabs
            
            const logLine = document.createElement('div');
            logLine.className = 'log-line';
            logLine.textContent = lines[i];
            logContent.appendChild(logLine);
            
            // Scroll to bottom
            logContent.scrollTop = logContent.scrollHeight;
            
            // Wait before showing next line
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
    } catch (error) {
        console.error(`Error loading ${logType} logs:`, error);
        logContent.innerHTML = `<div class="log-line" style="color: #ef4444;">로그 파일을 로드할 수 없습니다: ${error.message}</div>`;
    }
}