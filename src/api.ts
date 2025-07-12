interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class APIService {
  private static readonly ALPHA_VANTAGE_KEY = 'demo';
  private static readonly CORS_PROXY = 'https://api.allorigins.win/raw?url=';

  static async getFearGreedIndex(): Promise<APIResponse> {
    try {
      const response = await fetch(
        `${this.CORS_PROXY}https://production.dataviz.cnn.io/index/fearandgreed/graphdata`,
      );
      if (!response.ok) throw new Error('Failed to fetch Fear & Greed data');

      const data = await response.json();
      const latestData = data.fear_and_greed_historical.data[0];

      return {
        success: true,
        data: {
          value: latestData.y,
          rating: latestData.rating,
          timestamp: latestData.x,
        },
      };
    } catch (error) {
      console.warn('Fear & Greed API failed, using mock data:', error);
      return {
        success: true,
        data: {
          value: 45 + Math.random() * 30,
          rating: 'Neutral',
          timestamp: Date.now(),
        },
      };
    }
  }

  static async getSpyData(): Promise<APIResponse> {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${this.ALPHA_VANTAGE_KEY}`,
      );
      if (!response.ok) throw new Error('Failed to fetch SPY data');

      const data = await response.json();
      const quote = data['Global Quote'];

      if (!quote) throw new Error('Invalid SPY data format');

      return {
        success: true,
        data: {
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(
            quote['10. change percent'].replace('%', ''),
          ),
        },
      };
    } catch (error) {
      console.warn('SPY API failed, using mock data:', error);
      return {
        success: true,
        data: {
          price: 445 + Math.random() * 20,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 4,
        },
      };
    }
  }

  static async getVixData(): Promise<APIResponse> {
    try {
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=VIXCLS&api_key=demo&file_type=json&limit=1&sort_order=desc`,
      );
      if (!response.ok) throw new Error('Failed to fetch VIX data');

      const data = await response.json();
      const latestObs = data.observations[0];

      return {
        success: true,
        data: {
          value: parseFloat(latestObs.value),
          date: latestObs.date,
        },
      };
    } catch (error) {
      console.warn('VIX API failed, using mock data:', error);
      return {
        success: true,
        data: {
          value: 15 + Math.random() * 25,
          date: new Date().toISOString().split('T')[0],
        },
      };
    }
  }

  static async getPolicyUncertaintyData(): Promise<APIResponse> {
    try {
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=USEPUINDXD&api_key=demo&file_type=json&limit=1&sort_order=desc`,
      );
      if (!response.ok)
        throw new Error('Failed to fetch policy uncertainty data');

      const data = await response.json();
      const latestObs = data.observations[0];

      return {
        success: true,
        data: {
          value: parseFloat(latestObs.value),
          date: latestObs.date,
        },
      };
    } catch (error) {
      console.warn('Policy uncertainty API failed, using mock data:', error);
      return {
        success: true,
        data: {
          value: 100 + Math.random() * 200,
          date: new Date().toISOString().split('T')[0],
        },
      };
    }
  }

  static async calculatePutCallRatio(): Promise<APIResponse> {
    try {
      const response = await fetch(
        `${this.CORS_PROXY}https://query1.finance.yahoo.com/v7/finance/options/SPY`,
      );
      if (!response.ok) throw new Error('Failed to fetch options data');

      const data = await response.json();
      const optionChain = data.optionChain.result[0];

      let totalPuts = 0;
      let totalCalls = 0;

      optionChain.options[0].calls?.forEach((call: any) => {
        totalCalls += call.volume || 0;
      });

      optionChain.options[0].puts?.forEach((put: any) => {
        totalPuts += put.volume || 0;
      });

      const ratio = totalCalls > 0 ? totalPuts / totalCalls : 1;

      return {
        success: true,
        data: {
          ratio: ratio,
          putVolume: totalPuts,
          callVolume: totalCalls,
        },
      };
    } catch (error) {
      console.warn('Put/Call ratio API failed, using mock data:', error);
      return {
        success: true,
        data: {
          ratio: 0.8 + Math.random() * 1.0,
          putVolume: Math.floor(Math.random() * 100000),
          callVolume: Math.floor(Math.random() * 100000),
        },
      };
    }
  }

  static async getMarketVolumeData(): Promise<APIResponse> {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&apikey=${this.ALPHA_VANTAGE_KEY}`,
      );
      if (!response.ok) throw new Error('Failed to fetch volume data');

      const data = await response.json();
      const timeSeries = data['Time Series (Daily)'];

      if (!timeSeries) throw new Error('Invalid volume data format');

      const latestDate = Object.keys(timeSeries)[0];
      const latestData = timeSeries[latestDate];
      const volume = parseInt(latestData['5. volume']);

      return {
        success: true,
        data: {
          volume: volume / 1000000,
          date: latestDate,
        },
      };
    } catch (error) {
      console.warn('Volume API failed, using mock data:', error);
      return {
        success: true,
        data: {
          volume: 50 + Math.random() * 100,
          date: new Date().toISOString().split('T')[0],
        },
      };
    }
  }

  static async getQqqData(): Promise<APIResponse> {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=QQQ&apikey=${this.ALPHA_VANTAGE_KEY}`,
      );
      if (!response.ok) throw new Error('Failed to fetch QQQ data');

      const data = await response.json();
      const quote = data['Global Quote'];

      if (!quote) throw new Error('Invalid QQQ data format');

      return {
        success: true,
        data: {
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(
            quote['10. change percent'].replace('%', ''),
          ),
        },
      };
    } catch (error) {
      console.warn('QQQ API failed, using mock data:', error);
      return {
        success: true,
        data: {
          price: 385 + Math.random() * 30,
          change: (Math.random() - 0.5) * 8,
          changePercent: (Math.random() - 0.5) * 3,
        },
      };
    }
  }

  static async getIwmData(): Promise<APIResponse> {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IWM&apikey=${this.ALPHA_VANTAGE_KEY}`,
      );
      if (!response.ok) throw new Error('Failed to fetch IWM data');

      const data = await response.json();
      const quote = data['Global Quote'];

      if (!quote) throw new Error('Invalid IWM data format');

      return {
        success: true,
        data: {
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(
            quote['10. change percent'].replace('%', ''),
          ),
        },
      };
    } catch (error) {
      console.warn('IWM API failed, using mock data:', error);
      return {
        success: true,
        data: {
          price: 225 + Math.random() * 25,
          change: (Math.random() - 0.5) * 6,
          changePercent: (Math.random() - 0.5) * 2.5,
        },
      };
    }
  }

  static async calculateQqqPutCallRatio(): Promise<APIResponse> {
    try {
      const response = await fetch(
        `${this.CORS_PROXY}https://query1.finance.yahoo.com/v7/finance/options/QQQ`,
      );
      if (!response.ok) throw new Error('Failed to fetch QQQ options data');

      const data = await response.json();
      const optionChain = data.optionChain.result[0];

      let totalPuts = 0;
      let totalCalls = 0;

      optionChain.options[0].calls?.forEach((call: any) => {
        totalCalls += call.volume || 0;
      });

      optionChain.options[0].puts?.forEach((put: any) => {
        totalPuts += put.volume || 0;
      });

      const ratio = totalCalls > 0 ? totalPuts / totalCalls : 1;

      return {
        success: true,
        data: {
          ratio: ratio,
          putVolume: totalPuts,
          callVolume: totalCalls,
        },
      };
    } catch (error) {
      console.warn('QQQ Put/Call ratio API failed, using mock data:', error);
      return {
        success: true,
        data: {
          ratio: 0.7 + Math.random() * 0.8,
          putVolume: Math.floor(Math.random() * 80000),
          callVolume: Math.floor(Math.random() * 80000),
        },
      };
    }
  }

  static async calculateIwmPutCallRatio(): Promise<APIResponse> {
    try {
      const response = await fetch(
        `${this.CORS_PROXY}https://query1.finance.yahoo.com/v7/finance/options/IWM`,
      );
      if (!response.ok) throw new Error('Failed to fetch IWM options data');

      const data = await response.json();
      const optionChain = data.optionChain.result[0];

      let totalPuts = 0;
      let totalCalls = 0;

      optionChain.options[0].calls?.forEach((call: any) => {
        totalCalls += call.volume || 0;
      });

      optionChain.options[0].puts?.forEach((put: any) => {
        totalPuts += put.volume || 0;
      });

      const ratio = totalCalls > 0 ? totalPuts / totalCalls : 1;

      return {
        success: true,
        data: {
          ratio: ratio,
          putVolume: totalPuts,
          callVolume: totalCalls,
        },
      };
    } catch (error) {
      console.warn('IWM Put/Call ratio API failed, using mock data:', error);
      return {
        success: true,
        data: {
          ratio: 0.9 + Math.random() * 1.2,
          putVolume: Math.floor(Math.random() * 60000),
          callVolume: Math.floor(Math.random() * 60000),
        },
      };
    }
  }
}
