const API_BASE_URL = "http://13.209.117.252:8000";

async function loadMetrics() {
    const kpiElements = {
        auc: document.getElementById('aucValue'),
        recall: document.getElementById('recallValue'),
        fpr: document.getElementById('fprValue'),
        version: document.getElementById('modelVersion')
    };

    try {
        const response = await fetch(`${API_BASE_URL}/evaluation-metrics`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch metrics`);
        }
        
        const data = await response.json();
        
        // Update KPI cards with correct field names
        kpiElements.auc.textContent = (data.auc * 100).toFixed(2) + '%';
        kpiElements.recall.textContent = (data.recall * 100).toFixed(2) + '%';
        kpiElements.fpr.textContent = (data.falsePositiveRate * 100).toFixed(3) + '%';
        kpiElements.version.textContent = data.modelVer;
        
    } catch (error) {
        console.error('Error loading metrics:', error);
        // Show error message to the user
        Object.values(kpiElements).forEach(el => {
            if (el) el.textContent = 'Error';
        });
    }
}

// Load metrics on page load
document.addEventListener('DOMContentLoaded', loadMetrics);