import { Chart, registerables } from 'chart.js';
import { APIService } from './api';

Chart.register(...registerables);

interface SentimentData {
  fearGreedIndex: number;
  fearGreedLabel: string;
  putCallRatio: number;
  vix: number;
  spyPrice: number;
  spyChange: number;
  policyUncertainty: number;
  marketVolume: number;
  qqqPrice: number;
  qqqChange: number;
  qqqPutCallRatio: number;
  iwmPrice: number;
  iwmChange: number;
  iwmPutCallRatio: number;
}

class SentimentTracker {
  private data: SentimentData = {
    fearGreedIndex: 0,
    fearGreedLabel: 'Loading...',
    putCallRatio: 0,
    vix: 0,
    spyPrice: 0,
    spyChange: 0,
    policyUncertainty: 0,
    marketVolume: 0,
    qqqPrice: 0,
    qqqChange: 0,
    qqqPutCallRatio: 0,
    iwmPrice: 0,
    iwmChange: 0,
    iwmPutCallRatio: 0,
  };

  private charts: { [key: string]: Chart } = {};

  constructor() {
    this.initializeCharts();
    this.loadData().catch(console.error);
    this.setupRefreshInterval();
  }

  private initializeCharts() {
    this.createFearGreedGauge();
    this.createPutCallChart();
    this.createVixChart();
    this.createSpyChart();
    this.createPolicyChart();
    this.createVolumeChart();
    this.createQqqChart();
    this.createQqqPutCallChart();
    this.createIwmChart();
    this.createIwmPutCallChart();
  }

  private createFearGreedGauge() {
    const ctx = document.getElementById(
      'fear-greed-gauge',
    ) as HTMLCanvasElement;
    if (!ctx) return;

    this.charts.fearGreed = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: [0, 100],
            backgroundColor: [
              'rgba(239, 68, 68, 0.8)',
              'rgba(255, 255, 255, 0.1)',
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        rotation: -90,
        circumference: 180,
        cutout: '75%',
      },
    });
  }

  private createPutCallChart() {
    const ctx = document.getElementById('put-call-chart') as HTMLCanvasElement;
    if (!ctx) return;

    this.charts.putCall = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: 'Put/Call Ratio',
            data: this.generateMockData(30, 0.5, 2.0),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { display: false },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          },
        },
      },
    });
  }

  private createVixChart() {
    const ctx = document.getElementById('vix-chart') as HTMLCanvasElement;
    if (!ctx) return;

    this.charts.vix = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: 'VIX',
            data: this.generateMockData(30, 15, 40),
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { display: false },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          },
        },
      },
    });
  }

  private createSpyChart() {
    const ctx = document.getElementById('spy-chart') as HTMLCanvasElement;
    if (!ctx) return;

    this.charts.spy = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: 'SPY Price',
            data: this.generateMockData(30, 400, 500),
            borderColor: 'rgb(6, 214, 160)',
            backgroundColor: 'rgba(6, 214, 160, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { display: false },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          },
        },
      },
    });
  }

  private createPolicyChart() {
    const ctx = document.getElementById('policy-chart') as HTMLCanvasElement;
    if (!ctx) return;

    this.charts.policy = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          {
            label: 'Policy Uncertainty',
            data: [120, 150, 180, 160],
            backgroundColor: 'rgba(245, 158, 11, 0.8)',
            borderColor: 'rgb(245, 158, 11)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          },
        },
      },
    });
  }

  private createVolumeChart() {
    const ctx = document.getElementById('volume-chart') as HTMLCanvasElement;
    if (!ctx) return;

    this.charts.volume = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: 'Volume',
            data: this.generateMockData(7, 50, 150),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          },
        },
      },
    });
  }

  private createQqqChart() {
    const ctx = document.getElementById('qqq-chart') as HTMLCanvasElement;
    if (!ctx) return;

    this.charts.qqq = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: 'QQQ Price',
            data: this.generateMockData(30, 380, 420),
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { display: false },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          },
        },
      },
    });
  }

  private createQqqPutCallChart() {
    const ctx = document.getElementById(
      'qqq-put-call-chart',
    ) as HTMLCanvasElement;
    if (!ctx) return;

    this.charts.qqqPutCall = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: 'QQQ Put/Call Ratio',
            data: this.generateMockData(30, 0.4, 1.8),
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { display: false },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          },
        },
      },
    });
  }

  private createIwmChart() {
    const ctx = document.getElementById('iwm-chart') as HTMLCanvasElement;
    if (!ctx) return;

    this.charts.iwm = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: 'IWM Price',
            data: this.generateMockData(30, 220, 250),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { display: false },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          },
        },
      },
    });
  }

  private createIwmPutCallChart() {
    const ctx = document.getElementById(
      'iwm-put-call-chart',
    ) as HTMLCanvasElement;
    if (!ctx) return;

    this.charts.iwmPutCall = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: 'IWM Put/Call Ratio',
            data: this.generateMockData(30, 0.6, 2.2),
            borderColor: 'rgb(236, 72, 153)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { display: false },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          },
        },
      },
    });
  }

  private generateMockData(length: number, min: number, max: number): number[] {
    return Array.from({ length }, () => Math.random() * (max - min) + min);
  }

  private async loadData() {
    try {
      const [
        fearGreedResult,
        spyResult,
        vixResult,
        policyResult,
        putCallResult,
        volumeResult,
        qqqResult,
        qqqPutCallResult,
        iwmResult,
        iwmPutCallResult,
      ] = await Promise.allSettled([
        APIService.getFearGreedIndex(),
        APIService.getSpyData(),
        APIService.getVixData(),
        APIService.getPolicyUncertaintyData(),
        APIService.calculatePutCallRatio(),
        APIService.getMarketVolumeData(),
        APIService.getQqqData(),
        APIService.calculateQqqPutCallRatio(),
        APIService.getIwmData(),
        APIService.calculateIwmPutCallRatio(),
      ]);

      if (
        fearGreedResult.status === 'fulfilled' &&
        fearGreedResult.value.success
      ) {
        this.data.fearGreedIndex = fearGreedResult.value.data.value;
        this.data.fearGreedLabel = this.getFearGreedLabel(
          fearGreedResult.value.data.value,
        );
      }

      if (spyResult.status === 'fulfilled' && spyResult.value.success) {
        this.data.spyPrice = spyResult.value.data.price;
        this.data.spyChange = spyResult.value.data.changePercent;
      }

      if (vixResult.status === 'fulfilled' && vixResult.value.success) {
        this.data.vix = vixResult.value.data.value;
      }

      if (policyResult.status === 'fulfilled' && policyResult.value.success) {
        this.data.policyUncertainty = policyResult.value.data.value;
      }

      if (putCallResult.status === 'fulfilled' && putCallResult.value.success) {
        this.data.putCallRatio = putCallResult.value.data.ratio;
      }

      if (volumeResult.status === 'fulfilled' && volumeResult.value.success) {
        this.data.marketVolume = volumeResult.value.data.volume;
      }

      if (qqqResult.status === 'fulfilled' && qqqResult.value.success) {
        this.data.qqqPrice = qqqResult.value.data.price;
        this.data.qqqChange = qqqResult.value.data.changePercent;
      }

      if (
        qqqPutCallResult.status === 'fulfilled' &&
        qqqPutCallResult.value.success
      ) {
        this.data.qqqPutCallRatio = qqqPutCallResult.value.data.ratio;
      }

      if (iwmResult.status === 'fulfilled' && iwmResult.value.success) {
        this.data.iwmPrice = iwmResult.value.data.price;
        this.data.iwmChange = iwmResult.value.data.changePercent;
      }

      if (
        iwmPutCallResult.status === 'fulfilled' &&
        iwmPutCallResult.value.success
      ) {
        this.data.iwmPutCallRatio = iwmPutCallResult.value.data.ratio;
      }

      this.updateUI();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private getFearGreedLabel(value: number): string {
    if (value <= 25) return 'Extreme Fear';
    if (value <= 45) return 'Fear';
    if (value <= 55) return 'Neutral';
    if (value <= 75) return 'Greed';
    return 'Extreme Greed';
  }

  private updateUI() {
    this.updateElement('fear-greed-value', this.data.fearGreedIndex.toString());
    this.updateElement('fear-greed-label', this.data.fearGreedLabel);

    this.updateElement('put-call-value', this.data.putCallRatio.toFixed(2));
    this.updateElement('spy-value', `$${this.data.spyPrice.toFixed(2)}`);
    this.updateElement('vix-value', this.data.vix.toFixed(1));
    this.updateElement('policy-value', this.data.policyUncertainty.toString());
    this.updateElement('volume-value', `${this.data.marketVolume.toFixed(1)}M`);

    this.updateElement('qqq-value', `$${this.data.qqqPrice.toFixed(2)}`);
    this.updateElement(
      'qqq-put-call-value',
      this.data.qqqPutCallRatio.toFixed(2),
    );
    this.updateElement('iwm-value', `$${this.data.iwmPrice.toFixed(2)}`);
    this.updateElement(
      'iwm-put-call-value',
      this.data.iwmPutCallRatio.toFixed(2),
    );

    const spyChangePrefix = this.data.spyChange >= 0 ? '+' : '';
    this.updateElement(
      'spy-change',
      `${spyChangePrefix}${this.data.spyChange.toFixed(2)}%`,
    );
    const spyChangeElement = document.getElementById('spy-change');
    if (spyChangeElement) {
      spyChangeElement.className = `metric-change ${this.data.spyChange >= 0 ? 'positive' : 'negative'}`;
    }

    const qqqChangePrefix = this.data.qqqChange >= 0 ? '+' : '';
    this.updateElement(
      'qqq-change',
      `${qqqChangePrefix}${this.data.qqqChange.toFixed(2)}%`,
    );
    const qqqChangeElement = document.getElementById('qqq-change');
    if (qqqChangeElement) {
      qqqChangeElement.className = `metric-change ${this.data.qqqChange >= 0 ? 'positive' : 'negative'}`;
    }

    const iwmChangePrefix = this.data.iwmChange >= 0 ? '+' : '';
    this.updateElement(
      'iwm-change',
      `${iwmChangePrefix}${this.data.iwmChange.toFixed(2)}%`,
    );
    const iwmChangeElement = document.getElementById('iwm-change');
    if (iwmChangeElement) {
      iwmChangeElement.className = `metric-change ${this.data.iwmChange >= 0 ? 'positive' : 'negative'}`;
    }

    this.updateFearGreedGauge();
    this.updateLastUpdateTime();
  }

  private updateFearGreedGauge() {
    if (this.charts.fearGreed) {
      const value = this.data.fearGreedIndex;
      this.charts.fearGreed.data.datasets[0].data = [value, 100 - value];

      let color = 'rgba(239, 68, 68, 0.8)';
      if (value > 25 && value < 75) color = 'rgba(245, 158, 11, 0.8)';
      if (value >= 75) color = 'rgba(16, 185, 129, 0.8)';

      const backgrounds = this.charts.fearGreed.data.datasets[0]
        .backgroundColor as string[];
      backgrounds[0] = color;
      this.charts.fearGreed.update();
    }
  }

  private updateElement(id: string, value: string) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  private updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    this.updateElement('last-update', timeString);
  }

  private setupRefreshInterval() {
    setInterval(
      () => {
        this.loadData().catch(console.error);
      },
      5 * 60 * 1000,
    );
  }
}

new SentimentTracker();
