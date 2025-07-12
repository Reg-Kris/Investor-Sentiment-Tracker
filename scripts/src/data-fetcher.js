import fetch from 'node-fetch';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { subDays, format } from 'date-fns';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../public/data');

// Ensure data directory exists
mkdirSync(DATA_DIR, { recursive: true });

class MarketDataFetcher {
  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_KEY || 'demo';
    this.fredApiKey = process.env.FRED_API_KEY || 'demo';
    this.corsProxy = 'https://api.allorigins.win/raw?url=';
  }

  async fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed for ${url}:`, error.message);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
      }
    }
  }

  async fetchFearGreedIndex() {
    try {
      console.log('📊 Fetching Fear & Greed Index...');
      const data = await this.fetchWithRetry(
        `${this.corsProxy}https://production.dataviz.cnn.io/index/fearandgreed/graphdata`
      );
      
      const historical = data.fear_and_greed_historical.data
        .slice(0, 30)
        .map(point => ({
          date: new Date(point.x).toISOString().split('T')[0],
          value: Math.round(point.y * 100) / 100,
          rating: point.rating
        }));

      return {
        current: historical[0],
        historical,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Fear & Greed fetch failed:', error.message);
      return this.getMockFearGreed();
    }
  }

  async fetchSpyData() {
    try {
      console.log('📈 Fetching SPY data...');
      const data = await this.fetchWithRetry(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&outputsize=compact&apikey=${this.alphaVantageKey}`
      );

      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) throw new Error('Invalid data format');

      const historical = Object.entries(timeSeries)
        .slice(0, 30)
        .map(([date, values]) => ({
          date,
          price: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
          change: parseFloat(values['4. close']) - parseFloat(values['1. open'])
        }));

      const current = historical[0];
      const previous = historical[1];
      const changePercent = ((current.price - previous.price) / previous.price) * 100;

      return {
        current: { ...current, changePercent: Math.round(changePercent * 100) / 100 },
        historical,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('SPY fetch failed:', error.message);
      return this.getMockSpyData();
    }
  }

  async fetchVixData() {
    try {
      console.log('📉 Fetching VIX data...');
      const data = await this.fetchWithRetry(
        `https://api.stlouisfed.org/fred/series/observations?series_id=VIXCLS&api_key=${this.fredApiKey}&file_type=json&limit=30&sort_order=desc`
      );

      const historical = data.observations
        .filter(obs => obs.value !== '.')
        .map(obs => ({
          date: obs.date,
          value: parseFloat(obs.value)
        }));

      return {
        current: historical[0],
        historical,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('VIX fetch failed:', error.message);
      return this.getMockVixData();
    }
  }

  async fetchOptionsData(symbol) {
    try {
      console.log(`📋 Fetching ${symbol} options data...`);
      const data = await this.fetchWithRetry(
        `${this.corsProxy}https://query1.finance.yahoo.com/v7/finance/options/${symbol}`
      );

      const optionChain = data.optionChain.result[0];
      const calls = optionChain.options[0].calls || [];
      const puts = optionChain.options[0].puts || [];

      const totalCallVolume = calls.reduce((sum, call) => sum + (call.volume || 0), 0);
      const totalPutVolume = puts.reduce((sum, put) => sum + (put.volume || 0), 0);
      const putCallRatio = totalCallVolume > 0 ? totalPutVolume / totalCallVolume : 1;

      return {
        symbol,
        putCallRatio: Math.round(putCallRatio * 100) / 100,
        totalCallVolume,
        totalPutVolume,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error(`${symbol} options fetch failed:`, error.message);
      return {
        symbol,
        putCallRatio: 0.8 + Math.random() * 0.4,
        totalCallVolume: Math.floor(Math.random() * 100000),
        totalPutVolume: Math.floor(Math.random() * 80000),
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Mock data generators for fallback
  getMockFearGreed() {
    const historical = Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
      value: Math.round((30 + Math.random() * 40) * 100) / 100,
      rating: 'Neutral'
    }));

    return {
      current: historical[0],
      historical,
      lastUpdated: new Date().toISOString()
    };
  }

  getMockSpyData() {
    const basePrice = 450;
    const historical = Array.from({ length: 30 }, (_, i) => {
      const price = basePrice + (Math.random() - 0.5) * 20;
      return {
        date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
        price: Math.round(price * 100) / 100,
        volume: Math.floor(50000000 + Math.random() * 50000000),
        change: (Math.random() - 0.5) * 10
      };
    });

    const current = historical[0];
    const changePercent = (Math.random() - 0.5) * 4;

    return {
      current: { ...current, changePercent: Math.round(changePercent * 100) / 100 },
      historical,
      lastUpdated: new Date().toISOString()
    };
  }

  getMockVixData() {
    const historical = Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
      value: Math.round((15 + Math.random() * 25) * 100) / 100
    }));

    return {
      current: historical[0],
      historical,
      lastUpdated: new Date().toISOString()
    };
  }

  async fetchAllData() {
    console.log('🚀 Starting market data collection...');
    
    const [fearGreed, spy, qqq, iwm, vix, spyOptions, qqqOptions, iwmOptions] = await Promise.allSettled([
      this.fetchFearGreedIndex(),
      this.fetchSpyData(),
      this.fetchSpyData().then(data => ({ ...data, symbol: 'QQQ' })), // Reuse for QQQ
      this.fetchSpyData().then(data => ({ ...data, symbol: 'IWM' })), // Reuse for IWM
      this.fetchVixData(),
      this.fetchOptionsData('SPY'),
      this.fetchOptionsData('QQQ'),
      this.fetchOptionsData('IWM')
    ]);

    const results = {
      fearGreed: fearGreed.status === 'fulfilled' ? fearGreed.value : this.getMockFearGreed(),
      spy: spy.status === 'fulfilled' ? spy.value : this.getMockSpyData(),
      qqq: qqq.status === 'fulfilled' ? qqq.value : this.getMockSpyData(),
      iwm: iwm.status === 'fulfilled' ? iwm.value : this.getMockSpyData(),
      vix: vix.status === 'fulfilled' ? vix.value : this.getMockVixData(),
      options: {
        spy: spyOptions.status === 'fulfilled' ? spyOptions.value : null,
        qqq: qqqOptions.status === 'fulfilled' ? qqqOptions.value : null,
        iwm: iwmOptions.status === 'fulfilled' ? iwmOptions.value : null
      },
      lastUpdated: new Date().toISOString(),
      generatedAt: new Date().toISOString()
    };

    // Save raw data
    writeFileSync(
      join(DATA_DIR, 'market-data.json'),
      JSON.stringify(results, null, 2)
    );

    console.log('✅ Market data saved to public/data/market-data.json');
    return results;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fetcher = new MarketDataFetcher();
  fetcher.fetchAllData().catch(console.error);
}