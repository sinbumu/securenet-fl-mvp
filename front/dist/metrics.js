const API_BASE_URL = "http://13.209.117.252:8000";

async function loadMetrics() {
    try {
        const response = await fetch(`${API_BASE_URL}/evaluation-metrics`);
        if (!response.ok) {
            throw new Error('Failed to fetch metrics');
        }
        
        const data = await response.json();
        
        // Update KPI cards
        document.getElementById('aucValue').textContent = (data.auc * 100).toFixed(2) + '%';
        document.getElementById('recallValue').textContent = (data.recall * 100).toFixed(2) + '%';
        document.getElementById('fprValue').textContent = (data.false_positive_rate * 100).toFixed(3) + '%';
        document.getElementById('modelVersion').textContent = `v${data.model_version}`;
        
    } catch (error) {
        console.error('Error loading metrics:', error);
        
        // Show fallback data
        document.getElementById('aucValue').textContent = '92.5%';
        document.getElementById('recallValue').textContent = '89.3%';
        document.getElementById('fprValue').textContent = '0.45%';
        document.getElementById('modelVersion').textContent = 'v125';
    }
}

// Load metrics on page load
document.addEventListener('DOMContentLoaded', loadMetrics);