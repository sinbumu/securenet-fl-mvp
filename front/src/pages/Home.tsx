import React from 'react';
import { ShieldCheck, Globe, TrendingUp } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent leading-tight">
              연합학습 기반
              <br />
              사기 탐지 네트워크
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              데이터는 로컬에, 인텔리전스만 공유하세요.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/dashboard.html"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg shadow-lg hover:shadow-xl hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105"
              >
                실시간 대시보드 보기
                <TrendingUp className="ml-2 w-5 h-5" />
              </a>
              <a
                href="/fl-demo.html"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-primary-400 bg-transparent border-2 border-primary-500 hover:bg-primary-500 hover:text-white rounded-lg shadow-lg hover:shadow-xl hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105"
              >
                연합학습 데모 보기
                <Globe className="ml-2 w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 animate-slide-up">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary-300">데이터 로컬 보관</h3>
              <p className="text-gray-300 leading-relaxed">
                민감한 데이터는 절대 외부로 나가지 않습니다. 집계된 인텔리전스만 네트워크에서 공유됩니다.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary-300">글로벌 위험도 API</h3>
              <p className="text-gray-300 leading-relaxed">
                전체 네트워크의 집단 지능으로 구동되는 실시간 사기 위험도 점수에 접근하세요.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary-300">10%+ 재현율 향상</h3>
              <p className="text-gray-300 leading-relaxed">
                프라이버시를 유지하면서 협업 학습을 통해 뛰어난 사기 탐지 성능을 달성하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-primary-300 bg-clip-text text-transparent">
              아키텍처 개요
            </h2>
          </div>
          
          <div className="relative">
            <div id="arch-img" className="w-full h-[300px] bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl border border-dark-600 p-4 fade-in">
              <svg viewBox="0 0 1200 300" fill="none" stroke="#e6e6e6" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" className="w-full h-full">
                {/* Data Nodes */}
                <rect x="80" y="60" width="140" height="60" rx="8" fill="rgba(31,142,237,0.12)"/>
                <rect x="80" y="140" width="140" height="60" rx="8" fill="rgba(31,142,237,0.12)"/>
                <rect x="80" y="220" width="140" height="60" rx="8" fill="rgba(31,142,237,0.12)"/>
                <text x="150" y="95" textAnchor="middle" fill="#e6e6e6" fontSize="14">Bank A</text>
                <text x="150" y="175" textAnchor="middle" fill="#e6e6e6" fontSize="14">Bank B</text>
                <text x="150" y="255" textAnchor="middle" fill="#e6e6e6" fontSize="14">Bank C</text>

                {/* Secure Aggregation */}
                <rect x="420" y="90" width="220" height="140" rx="12" fill="rgba(31,142,237,0.20)"/>
                <text x="530" y="145" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="600">Secure Aggregation</text>
                <text x="530" y="170" textAnchor="middle" fill="#e0e0e0" fontSize="13">Encrypted Gradients</text>

                {/* Global Model */}
                <rect x="780" y="40" width="170" height="80" rx="10" fill="rgba(31,142,237,0.12)"/>
                <text x="865" y="83" textAnchor="middle" fill="#e6e6e6" fontSize="14">Global Model</text>

                {/* Risk Score API */}
                <rect x="780" y="180" width="170" height="80" rx="10" fill="rgba(31,142,237,0.12)"/>
                <text x="865" y="223" textAnchor="middle" fill="#e6e6e6" fontSize="14">Risk Score API</text>

                {/* Member Systems */}
                <rect x="1030" y="110" width="140" height="100" rx="12" fill="rgba(31,142,237,0.12)"/>
                <text x="1100" y="155" textAnchor="middle" fill="#e6e6e6" fontSize="14">Member Apps</text>

                {/* Arrows */}
                <defs>
                  <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                    <polygon points="0 0, 6 3, 0 6" fill="#1f8eed" />
                  </marker>
                </defs>
                {/* Banks → SecureAgg */}
                <line x1="220" y1="90" x2="420" y2="120" markerEnd="url(#arrow)"/>
                <line x1="220" y1="170" x2="420" y2="160" markerEnd="url(#arrow)"/>
                <line x1="220" y1="250" x2="420" y2="200" markerEnd="url(#arrow)"/>

                {/* SecureAgg → Global Model & API */}
                <line x1="640" y1="120" x2="780" y2="80" markerEnd="url(#arrow)"/>
                <line x1="640" y1="180" x2="780" y2="220" markerEnd="url(#arrow)"/>

                {/* Global Model → API (feedback loop dashed) */}
                <g strokeDasharray="6 4">
                  <line x1="780" y1="80" x2="780" y2="220"/>
                </g>

                {/* API → Member Apps */}
                <line x1="950" y1="220" x2="1030" y2="160" markerEnd="url(#arrow)"/>
              </svg>
            </div>
            <div className="text-center mt-6">
              <p className="text-gray-400 text-lg font-medium">보안 집계 플로우</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;