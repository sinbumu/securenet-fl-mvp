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
        newbalanceDest: parseFloat(document.getElementById('newBalance').value),
        type: document.getElementById('transactionType').value
    };
    
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
        
        // Display result
        const riskScore = data.risk_score || data.riskScore || 0;
        const riskLevel = data.risk_level || data.riskLevel || getRiskLevel(riskScore);
        
        resultElement.textContent = `위험도 점수: ${riskScore.toFixed(2)}% (${riskLevel.toUpperCase()})`;
        resultElement.className = `result-badge result-${riskLevel}`;
        
    } catch (error) {
        console.error('Error:', error);
        
        // Show mock result for demo purposes
        const mockRiskScore = Math.random() * 100;
        const mockRiskLevel = getRiskLevel(mockRiskScore);
        
        resultElement.textContent = `위험도 점수: ${mockRiskScore.toFixed(2)}% (${mockRiskLevel.toUpperCase()}) [모의 데이터]`;
        resultElement.className = `result-badge result-${mockRiskLevel}`;
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