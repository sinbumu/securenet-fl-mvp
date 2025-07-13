let riskChart;
let chartData = [];

function initChart() {
    const ctx = document.getElementById('riskChart').getContext('2d');
    
    riskChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '평균 위험도 점수',
                data: [],
                borderColor: '#1f8eed',
                backgroundColor: 'rgba(31, 142, 237, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e2e8f0'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    }
                },
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    }
                }
            }
        }
    });
}

async function updateTable() {
    // API 호출 대신 항상 모의(mock) 데이터를 생성하여 사용합니다.
    try {
        generateMockData();
    } catch (error) {
        console.error('Error generating mock data:', error);
        const tbody = document.getElementById('suspiciousBody');
        tbody.innerHTML = `<tr><td colspan="5" class="loading">더미 데이터를 생성하는 중 오류가 발생했습니다.</td></tr>`;
    }
}

function generateMockData() {
    const tbody = document.getElementById('suspiciousBody');
    tbody.innerHTML = '';
    
    const mockData = [];
    for (let i = 0; i < 10; i++) {
        const riskScore = Math.random() * 40 + 60; // 60-100%
        const amount = Math.random() * 50000 + 1000;
        const types = ['TRANSFER', 'CASH_OUT', 'PAYMENT', 'DEBIT'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        mockData.push({
            transaction_id: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            amount: amount,
            type: type,
            risk_score: riskScore
        });
    }
    
    // Sort by risk score descending
    mockData.sort((a, b) => b.risk_score - a.risk_score);
    
    // Calculate average for chart
    const avgRiskScore = mockData.reduce((sum, item) => sum + item.risk_score, 0) / mockData.length;
    updateChart(avgRiskScore);
    
    // Populate table
    mockData.forEach(transaction => {
        const row = document.createElement('tr');
        const riskLevel = getRiskLevel(transaction.risk_score);
        const badgeClass = `risk-${riskLevel}`;
        
        row.innerHTML = `
            <td>${transaction.transaction_id}</td>
            <td>$${transaction.amount.toLocaleString()}</td>
            <td>${transaction.type}</td>
            <td>${transaction.risk_score.toFixed(2)}%</td>
            <td><span class="risk-badge ${badgeClass}">${riskLevel.toUpperCase()}</span></td>
        `;
        
        tbody.appendChild(row);
    });
}

function updateChart(avgRiskScore) {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Add new data point
    chartData.push({
        time: timeLabel,
        value: avgRiskScore
    });
    
    // Keep only last 20 points
    if (chartData.length > 20) {
        chartData.shift();
    }
    
    // Update chart
    riskChart.data.labels = chartData.map(d => d.time);
    riskChart.data.datasets[0].data = chartData.map(d => d.value);
    riskChart.update('none');
}

function getRiskLevel(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    updateTable();
    
    // Update every 5 seconds
    setInterval(updateTable, 5000);
});