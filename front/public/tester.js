const API_BASE_URL = "http://13.209.117.252:8000";

function loadLowRiskSample() {
    document.getElementById('amount').value = '50.00';
    document.getElementById('oldBalance').value = '1000.00';
    document.getElementById('newBalance').value = '950.00';
    document.getElementById('transactionType').value = 'PAYMENT';
}

function loadHighRiskSample() {
    document.getElementById('amount').value = '9999999.99';
    document.getElementById('oldBalance').value = '10000000.00';
    document.getElementById('newBalance').value = '0.01';
    document.getElementById('transactionType').value = 'TRANSFER';
}

function clearForm() {
    document.getElementById('riskForm').reset();
    document.getElementById('result').textContent = '위의 폼을 작성하고 "위험도 점수 확인" 버튼을 클릭하세요.';
    document.getElementById('result').className = 'result-badge result-error';
}

async function submitForm(event) {
    event.preventDefault();
    
    const resultElement = document.getElementById('result');
    const loadingElement = document.getElementById('loading');
    
    // Show loading
    resultElement.style.display = 'none';
    loadingElement.style.display = 'block';
    
    // Get form data
    const formData = {
        amount: parseFloat(document.getElementById('amount').value),
        oldbalanceOrg: parseFloat(document.getElementById('oldBalance').value),
        newbalanceOrig: parseFloat(document.getElementById('newBalance').value), // MISTAKE FIXED: newbalanceDest -> newbalanceOrig
        type: document.getElementById('transactionType').value
    };

    // Validate inputs
    if (Object.values(formData).some(v => v === null || (typeof v === 'number' && isNaN(v)))) {
        resultElement.textContent = '모든 필드를 올바른 숫자로 입력해주세요.';
        resultElement.className = 'result-badge result-error';
        loadingElement.style.display = 'none';
        resultElement.style.display = 'inline-block';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/risk-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display result - aassuming API returns { riskScore: 0.xx, riskLevel: "xxx" }
        const riskScorePercent = (data.riskScore * 100).toFixed(2);
        const riskLevel = data.riskLevel.toUpperCase();
        
        resultElement.textContent = `위험도 점수: ${riskScorePercent}% (${riskLevel})`;
        resultElement.className = `result-badge result-${data.riskLevel}`;
        
    } catch (error) {
        console.error('Error:', error);
        resultElement.textContent = `오류가 발생했습니다: ${error.message}`;
        resultElement.className = 'result-badge result-error';
    } finally {
        // Hide loading and show result
        loadingElement.style.display = 'none';
        resultElement.style.display = 'inline-block';
    }
}

function getRiskLevel(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

// Add event listener
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('riskForm').addEventListener('submit', submitForm);
});