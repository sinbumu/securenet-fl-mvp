// --- State Management ---
let currentTab = 'server';
let isPrinting = false;
const demoSequence = ['server', 'bank_a', 'bank_b', 'bank_c', 'evaluation'];
const stepNames = {
    server: '서버',
    bank_a: 'Bank A',
    bank_b: 'Bank B',
    bank_c: 'Bank C',
    evaluation: '모델 평가'
};
let demoStep = -1; // -1: not started

const logFiles = {
    server: '/server.log',
    bank_a: '/bank_a.log',
    bank_b: '/bank_b.log',
    bank_c: '/bank_c.log',
    evaluation: '/evaluate_model.log'
};

// --- Main Demo Controller ---

function controlDemo() {
    if (isPrinting) return;

    demoStep++;
    const playBtn = document.getElementById('playBtn');

    if (demoStep >= demoSequence.length) {
        // Reset demo
        demoStep = -1;
        document.getElementById('status').textContent = '데모가 완료되었습니다. 다시 시작하려면 버튼을 클릭하세요.';
        document.getElementById('status').className = 'status completed';
        playBtn.textContent = '데모 다시 시작';
        playBtn.disabled = false;
        // Clear log content for restart
        document.getElementById('logContent').innerHTML = '데모를 다시 시작하려면 위의 버튼을 클릭하세요.';
        return;
    }

    isPrinting = true;
    playBtn.disabled = true;

    const currentLogType = demoSequence[demoStep];
    const nextLogType = (demoStep + 1 < demoSequence.length) ? demoSequence[demoStep + 1] : null;

    if (nextLogType) {
        playBtn.textContent = `다음: ${stepNames[nextLogType]} 로그 보기`;
    } else {
        playBtn.textContent = '데모 완료';
    }
    
    document.getElementById('status').textContent = `${stepNames[currentLogType]} 로그 출력 중...`;
    
    // Switch tab and display logs for the current step
    switchTabAndDisplay(currentLogType);
}

// --- UI and Log Display Functions ---

function setActiveTab(logType) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.logType === logType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

async function switchTabAndDisplay(logType) {
    setActiveTab(logType);
    currentTab = logType;
    
    await displayLogs(logType, false); // Play with animation

    // After logs are done
    isPrinting = false;
    document.getElementById('playBtn').disabled = false;
    document.getElementById('status').textContent = '내용을 확인 후 다음 버튼을 누르거나, 다른 탭을 선택하여 로그를 다시 볼 수 있습니다.';
}

function switchTab(element) {
    if (isPrinting) {
        return;
    }
    const logType = element.dataset.logType;
    if (!logType) return;

    currentTab = logType;
    setActiveTab(logType);
    
    displayLogs(logType, true);
}

async function displayLogs(logType, immediate = false) {
    const logContent = document.getElementById('logContent');
    logContent.innerHTML = '<div class="log-line loading-placeholder">로그를 불러오는 중...</div>';
    
    try {
        const response = await fetch(logFiles[logType]);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const logText = await response.text();
        logContent.innerHTML = ''; // Clear loading message
        const lines = logText.split('\n').filter(line => line.trim());

        if (immediate) {
            logContent.innerHTML = lines.map(line => `<div class="log-line">${line}</div>`).join('');
            logContent.scrollTop = logContent.scrollHeight;
            return;
        }

        for (const line of lines) {
            const logLine = document.createElement('div');
            logLine.className = 'log-line';
            logLine.textContent = line;
            logContent.appendChild(logLine);
            logContent.scrollTop = logContent.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    } catch (error) {
        console.error(`Error loading ${logType} logs:`, error);
        logContent.innerHTML = `<div class="log-line" style="color: #ef4444;">'${logFiles[logType]}' 파일을 로드할 수 없습니다.</div>`;
    }
}