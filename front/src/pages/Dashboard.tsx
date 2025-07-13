import React, { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Activity, Shield, AlertTriangle, Cpu } from 'lucide-react';

Chart.register(...registerables);

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  id: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, id }) => (
  <div className="bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <p id={id} className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [suspiciousAccounts, setSuspiciousAccounts] = useState<Array<{id: string, score: number}>>([]);

  useEffect(() => {
    // Clean up existing chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    // Initialize chart
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Generate initial data points
        const initialData = Array.from({ length: 10 }, (_, i) => ({
          x: new Date(Date.now() - (9 - i) * 60000).toISOString(),
          y: 0.80 + Math.random() * 0.10
        }));

        const config: ChartConfiguration = {
          type: 'line',
          data: {
            datasets: [{
              label: '시간별 AUC',
              data: initialData,
              borderColor: '#1f8eed',
              backgroundColor: 'rgba(31, 142, 237, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#1f8eed',
              pointBorderColor: '#1f8eed',
              pointHoverBackgroundColor: '#60a5fa',
              pointHoverBorderColor: '#60a5fa',
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
                type: 'time',
                time: {
                  unit: 'minute',
                  displayFormats: {
                    minute: 'HH:mm'
                  }
                },
                ticks: {
                  color: '#94a3b8'
                },
                grid: {
                  color: '#334155'
                }
              },
              y: {
                min: 0.75,
                max: 0.95,
                ticks: {
                  color: '#94a3b8'
                },
                grid: {
                  color: '#334155'
                }
              }
            }
          }
        };

        chartInstance.current = new Chart(ctx, config);
      }
    }

    // Update function
    const updateMetrics = () => {
      // Update risk gauge
      const riskScore = (window as any).faker?.datatype?.number({ min: 80, max: 90, precision: 0.01 }) || 85.42;
      const riskGauge = document.getElementById('riskGauge');
      if (riskGauge) {
        riskGauge.textContent = `${riskScore}%`;
      }

      // Update chart
      if (chartInstance.current) {
        const newDataPoint = {
          x: new Date().toISOString(),
          y: riskScore / 100
        };
        chartInstance.current.data.datasets[0].data.push(newDataPoint);
        
        // Keep only last 10 points
        if (chartInstance.current.data.datasets[0].data.length > 10) {
          chartInstance.current.data.datasets[0].data.shift();
        }
        
        chartInstance.current.update('none');
      }

      // Update recall card
      const recallScore = (window as any).faker?.datatype?.number({ min: 91, max: 93, precision: 0.01 }) || 92.15;
      const recallCard = document.getElementById('recallCard');
      if (recallCard) {
        recallCard.textContent = `${recallScore}%`;
      }

      // Update false positive card
      const fpScore = (window as any).faker?.datatype?.number({ min: 0.2, max: 0.4, precision: 0.01 }) || 0.28;
      const fpCard = document.getElementById('fpCard');
      if (fpCard) {
        fpCard.textContent = `${fpScore}%`;
      }

      // Update model version
      const modelVersion = (window as any).faker?.datatype?.number({ min: 101, max: 150 }) || 125;
      const modelVer = document.getElementById('modelVer');
      if (modelVer) {
        modelVer.textContent = `v${modelVersion}`;
      }

      // Update suspicious accounts table
      const newAccounts = Array.from({ length: 10 }, (_, i) => ({
        id: (window as any).faker?.finance?.iban() || `ACCT${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        score: (window as any).faker?.datatype?.number({ min: 70, max: 99, precision: 0.01 }) || 70 + Math.random() * 29
      }));
      setSuspiciousAccounts(newAccounts);
    };

    // Initial update
    updateMetrics();

    // Set up interval for updates
    const interval = setInterval(updateMetrics, 5000);

    return () => {
      clearInterval(interval);
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-primary-300 bg-clip-text text-transparent">
          실시간 대시보드
        </h1>
        <p className="text-gray-400">실시간 사기 탐지 지표 및 분석</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="글로벌 위험도 점수"
          value="85.42%"
          icon={<Shield className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-primary-500 to-primary-600"
          id="riskGauge"
        />
        <MetricCard
          title="재현율"
          value="92.15%"
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
          id="recallCard"
        />
        <MetricCard
          title="오탐률"
          value="0.28%"
          icon={<AlertTriangle className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          id="fpCard"
        />
        <MetricCard
          title="모델 버전"
          value="v125"
          icon={<Cpu className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          id="modelVer"
        />
      </div>

      {/* Chart Section */}
      <div className="bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary-300">시간별 AUC 성능</h2>
        <div className="h-64">
          <canvas ref={chartRef} id="riskChart"></canvas>
        </div>
      </div>

      {/* Suspicious Accounts Table */}
      <div className="bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-primary-300">상위 10개 의심 계정</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Account</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">위험도 점수</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">조치</th>
              </tr>
            </thead>
            <tbody>
              {suspiciousAccounts.map((account, index) => (
                <tr key={index} className="border-b border-dark-700 hover:bg-dark-600/50 transition-colors">
                  <td className="py-3 px-4 text-gray-300 font-mono text-sm">{account.id}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      account.score >= 90 ? 'text-red-400' : 
                      account.score >= 80 ? 'text-orange-400' : 'text-yellow-400'
                    }`}>
                      {account.score.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                      차단
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;