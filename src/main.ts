import { DataService } from './services/data-service';
import { SentimentCluster } from './components/sentiment-cluster';
import { MarketCard, VixCard, OptionsCard } from './components/indicator-card';
import type { SentimentData, TimeFrame } from './types/sentiment';

class ModernSentimentTracker {
  private data: SentimentData | null = null;
  private currentTimeframe: TimeFrame = '1d';
  private components: {
    cluster?: SentimentCluster;
    cards: { [key: string]: any };
  } = { cards: {} };

  constructor() {
    this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    try {
      console.log('🚀 Initializing Modern Sentiment Tracker...');
      
      // Load data first
      await this.loadData();
      
      // Initialize components
      this.setupSentimentCluster();
      this.setupIndicatorCards();
      this.setupBackgroundGradient();
      this.setupRefreshInterval();
      
      console.log('✅ App initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      this.showErrorState();
    }
  }

  private async loadData(): Promise<void> {
    try {
      this.data = await DataService.getSentimentData();
      this.updateLastUpdateTime();
    } catch (error) {
      console.error('Failed to load sentiment data:', error);
      throw error;
    }
  }

  private setupSentimentCluster(): void {
    const container = document.getElementById('sentiment-cluster-container');
    if (!container || !this.data) return;

    const timeframeData = this.data.timeframes[this.currentTimeframe];
    
    this.components.cluster = new SentimentCluster(container, {
      score: timeframeData.score,
      sentiment: timeframeData.sentiment,
      message: timeframeData.message,
      timeframe: this.currentTimeframe,
      onTimeframeChange: (timeframe: TimeFrame) => {
        this.handleTimeframeChange(timeframe);
      }
    });
  }

  private setupIndicatorCards(): void {
    if (!this.data) return;

    const indicators = this.data.indicators;
    const timeframe = this.currentTimeframe.toUpperCase();

    // S&P 500 Card
    const spyContainer = document.getElementById('spy-card-container');
    if (spyContainer) {
      this.components.cards.spy = new MarketCard(
        spyContainer,
        'S&P 500',
        indicators.spy.price,
        indicators.spy.change,
        indicators.spy.message,
        indicators.spy.color,
        timeframe
      );
    }

    // Nasdaq 100 Card
    const qqqContainer = document.getElementById('qqq-card-container');
    if (qqqContainer) {
      this.components.cards.qqq = new MarketCard(
        qqqContainer,
        'Nasdaq 100',
        indicators.qqq.price,
        indicators.qqq.change,
        indicators.qqq.message,
        indicators.qqq.color,
        timeframe
      );
    }

    // Russell 2000 Card
    const iwmContainer = document.getElementById('iwm-card-container');
    if (iwmContainer) {
      this.components.cards.iwm = new MarketCard(
        iwmContainer,
        'Russell 2000',
        indicators.iwm.price,
        indicators.iwm.change,
        indicators.iwm.message,
        indicators.iwm.color,
        timeframe
      );
    }

    // VIX Card
    const vixContainer = document.getElementById('vix-card-container');
    if (vixContainer) {
      this.components.cards.vix = new VixCard(
        vixContainer,
        indicators.vix.value,
        indicators.vix.message,
        indicators.vix.color,
        timeframe
      );
    }

    // Options Cards
    const spyOptionsContainer = document.getElementById('spy-options-card-container');
    if (spyOptionsContainer) {
      this.components.cards.spyOptions = new OptionsCard(
        spyOptionsContainer,
        'SPY',
        indicators.options.spy,
        timeframe
      );
    }

    const qqqOptionsContainer = document.getElementById('qqq-options-card-container');
    if (qqqOptionsContainer) {
      this.components.cards.qqqOptions = new OptionsCard(
        qqqOptionsContainer,
        'QQQ',
        indicators.options.qqq,
        timeframe
      );
    }

    const iwmOptionsContainer = document.getElementById('iwm-options-card-container');
    if (iwmOptionsContainer) {
      this.components.cards.iwmOptions = new OptionsCard(
        iwmOptionsContainer,
        'IWM',
        indicators.options.iwm,
        timeframe
      );
    }
  }

  private handleTimeframeChange(timeframe: TimeFrame): void {
    this.currentTimeframe = timeframe;
    this.updateComponents();
  }

  private updateComponents(): void {
    if (!this.data) return;

    const timeframeData = this.data.timeframes[this.currentTimeframe];
    const timeframeLabel = this.currentTimeframe.toUpperCase();

    // Update sentiment cluster
    if (this.components.cluster) {
      this.components.cluster.updateProps({
        score: timeframeData.score,
        sentiment: timeframeData.sentiment,
        message: timeframeData.message,
        timeframe: this.currentTimeframe
      });
    }

    // Update all cards with new timeframe
    Object.values(this.components.cards).forEach(card => {
      if (card && typeof card.updateProps === 'function') {
        card.updateProps({ timeframe: timeframeLabel });
      }
    });

    // Update background gradient
    this.updateBackgroundGradient(timeframeData.score);
  }

  private setupBackgroundGradient(): void {
    if (!this.data) return;
    
    const score = this.data.timeframes[this.currentTimeframe].score;
    this.updateBackgroundGradient(score);
  }

  private updateBackgroundGradient(score: number): void {
    const backgroundElement = document.querySelector('.background-gradient');
    if (!backgroundElement) return;

    // Remove existing sentiment classes
    backgroundElement.className = 'background-gradient';

    // Add new sentiment class based on score
    if (score >= 80) {
      backgroundElement.classList.add('extreme-greed');
    } else if (score >= 65) {
      backgroundElement.classList.add('greed');
    } else if (score <= 20) {
      backgroundElement.classList.add('extreme-fear');
    } else if (score <= 35) {
      backgroundElement.classList.add('fear');
    }
  }

  private updateLastUpdateTime(): void {
    if (!this.data) return;
    
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) {
      const updateText = DataService.getLastUpdateText(this.data.lastAnalyzed);
      lastUpdateElement.textContent = updateText;
    }
  }

  private setupRefreshInterval(): void {
    // Refresh data every 5 minutes
    setInterval(async () => {
      try {
        await this.loadData();
        this.updateComponents();
        console.log('📊 Data refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh data:', error);
      }
    }, 5 * 60 * 1000);
  }

  private showErrorState(): void {
    const dashboard = document.querySelector('.dashboard');
    if (dashboard) {
      dashboard.innerHTML = `
        <div class="error-state">
          <h2>⚠️ Unable to Load Market Data</h2>
          <p>Please check your connection and try refreshing the page.</p>
          <button onclick="window.location.reload()" class="retry-button">
            Retry
          </button>
        </div>
      `;
    }
  }
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ModernSentimentTracker();
  });
} else {
  new ModernSentimentTracker();
}
