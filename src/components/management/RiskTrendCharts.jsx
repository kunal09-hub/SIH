import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function ComplianceTrendChart({ mines }) {
  const data = {
    labels: ['Week 1 (Aug 01)', 'Week 2 (Aug 08)', 'Week 3 (Aug 15)', 'Week 4 (Current)'],
    datasets: [
      {
        label: 'Mine Alpha',
        data: [78, 82, 84, 88],
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.15)',
        tension: 0.3,
        borderWidth: 2.5,
      },
      {
        label: 'Mine Beta',
        data: [75, 78, 80, 82],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.15)',
        tension: 0.3,
        borderWidth: 2,
      },
      {
        label: 'Mine Gamma (High Risk)',
        data: [68, 65, 63, 61],
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.15)',
        tension: 0.3,
        borderWidth: 2.5,
        borderDash: [5, 5],
      },
      {
        label: 'Mine Delta',
        data: [88, 89, 90, 91],
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.15)',
        tension: 0.3,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#64748b', font: { size: 11, family: 'Inter', weight: '600' } },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
      }
    },
    scales: {
      y: {
        min: 50,
        max: 100,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
      x: {
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', font: { size: 10 } },
      }
    }
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
}

export function RiskDistributionChart({ violations }) {
  const critical = violations.filter(v => v.severity === 'CRITICAL').length;
  const high = violations.filter(v => v.severity === 'HIGH').length;
  const medium = violations.filter(v => v.severity === 'MEDIUM').length;
  const low = violations.filter(v => v.severity === 'LOW').length;

  const data = {
    labels: ['Critical Risk', 'High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [
      {
        data: [critical, high, medium, low],
        backgroundColor: ['#dc2626', '#ea580c', '#d97706', '#16a34a'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#64748b', font: { size: 11, family: 'Inter', weight: '600' } },
      },
    },
  };

  return (
    <div className="h-56 w-full flex items-center justify-center">
      <Doughnut data={data} options={options} />
    </div>
  );
}

export function HazardCategoryBarChart({ violations }) {
  const categories = [
    'Ventilation & Gas',
    'Blasting Safety',
    'Machinery & Haulage',
    'Electrical & Substation',
    'Worker Certification',
    'Ground Stability'
  ];

  const data = {
    labels: categories,
    datasets: [
      {
        label: 'Risk Severity Score (Weighted)',
        data: [88, 76, 62, 58, 70, 45],
        backgroundColor: [
          '#ef4444',
          '#f97316',
          '#f59e0b',
          '#3b82f6',
          '#8b5cf6',
          '#10b981'
        ],
        borderRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        callbacks: {
          label: (context) => ` Risk Index: ${context.parsed.y}/100`
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10, weight: '500' } },
      }
    }
  };

  return (
    <div className="h-64 w-full">
      <Bar data={data} options={options} />
    </div>
  );
}
