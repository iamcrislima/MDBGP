import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title,
  Filler,
} from 'chart.js';
import App from './App.tsx';

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title,
  Filler,
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
