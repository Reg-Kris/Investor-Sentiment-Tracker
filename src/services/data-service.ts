import type { SentimentData } from '../types/sentiment';

export class DataService {
  private static cache: SentimentData | null = null;
  private static lastFetch: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getSentimentData(): Promise<SentimentData> {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      const response = await fetch('/data/sentiment-analysis.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data: SentimentData = await response.json();
      
      // Update cache
      this.cache = data;
      this.lastFetch = now;
      
      return data;
    } catch (error) {
      console.warn('Failed to fetch sentiment data, using fallback:', error);
      
      // Return fallback data if fetch fails
      return this.getFallbackData();
    }
  }

  private static getFallbackData(): SentimentData {
    return {
      overall: {
        score: 50,
        sentiment: 'NEUTRAL',
        message: 'Markets are balanced',
        confidence: 50,
        components: {
          fearGreed: { score: 50, weight: 0.35 },
          market: { score: 50, weight: 0.25 },
          volatility: { score: 50, weight: 0.20 },
          options: { score: 50, weight: 0.20 }
        }
      },
      timeframes: {
        '1d': {
          score: 50,
          sentiment: 'NEUTRAL',
          message: 'Markets are balanced',
          trend: 'stable'
        },
        '5d': {
          score: 50,
          sentiment: 'NEUTRAL',
          message: 'Markets are balanced',
          trend: 'stable'
        },
        '1m': {
          score: 50,
          sentiment: 'NEUTRAL',
          message: 'Markets are balanced',
          trend: 'stable'
        }
      },
      indicators: {
        fearGreed: {
          value: 50,
          label: 'Neutral',
          message: 'Market sentiment balanced',
          color: '#6b7280'
        },
        spy: {
          price: 450,
          change: 0,
          message: 'S&P 500 trading flat',
          color: '#6b7280'
        },
        qqq: {
          price: 400,
          change: 0,
          message: 'Nasdaq 100 trading flat',
          color: '#6b7280'
        },
        iwm: {
          price: 230,
          change: 0,
          message: 'Russell 2000 trading flat',
          color: '#6b7280'
        },
        vix: {
          value: 20,
          message: 'Volatility is moderate',
          color: '#f59e0b'
        },
        options: {
          spy: 'SPY options data unavailable',
          qqq: 'QQQ options data unavailable',
          iwm: 'IWM options data unavailable'
        }
      },
      lastAnalyzed: new Date().toISOString()
    };
  }

  static formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  static formatChange(change: number): string {
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${change.toFixed(2)}%`;
  }

  static formatValue(value: number, decimals: number = 1): string {
    return value.toFixed(decimals);
  }

  static getLastUpdateText(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleDateString();
  }
}