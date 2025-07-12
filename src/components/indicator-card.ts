interface IndicatorCardProps {
  title: string;
  value: string;
  change?: string;
  message: string;
  color: string;
  timeframe: string;
  trend?: 'up' | 'down' | 'neutral';
}

export class IndicatorCard {
  private container: HTMLElement;
  private props: IndicatorCardProps;

  constructor(container: HTMLElement, props: IndicatorCardProps) {
    this.container = container;
    this.props = props;
    this.render();
  }

  public updateProps(newProps: Partial<IndicatorCardProps>): void {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="indicator-card" data-trend="${this.props.trend || 'neutral'}">
        <div class="card-header">
          <h3 class="card-title">${this.props.title}</h3>
          <div class="timeframe-badge">${this.props.timeframe}</div>
        </div>
        
        <div class="card-content">
          <div class="value-section">
            <div class="primary-value" style="color: ${this.props.color}">
              ${this.props.value}
            </div>
            ${this.props.change ? `
              <div class="change-value" style="color: ${this.props.color}">
                ${this.props.change}
              </div>
            ` : ''}
          </div>
          
          <div class="message-section">
            <p class="indicator-message">${this.props.message}</p>
          </div>
          
          <div class="trend-indicator">
            <div class="trend-line" style="background: ${this.props.color}"></div>
          </div>
        </div>
      </div>
    `;

    this.addInteractionEffects();
  }

  private addInteractionEffects(): void {
    const card = this.container.querySelector('.indicator-card') as HTMLElement;
    if (!card) return;

    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = `0 8px 32px ${this.props.color}20`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '';
    });
  }
}

export class VixCard extends IndicatorCard {
  constructor(container: HTMLElement, value: number, message: string, color: string, timeframe: string) {
    super(container, {
      title: 'Market Volatility',
      value: value.toFixed(1),
      message,
      color,
      timeframe,
      trend: value > 25 ? 'up' : value < 15 ? 'down' : 'neutral'
    });
  }
}

export class MarketCard extends IndicatorCard {
  constructor(
    container: HTMLElement, 
    title: string, 
    price: number, 
    change: number, 
    message: string, 
    color: string, 
    timeframe: string
  ) {
    const changePrefix = change >= 0 ? '+' : '';
    super(container, {
      title,
      value: `$${price.toFixed(2)}`,
      change: `${changePrefix}${change.toFixed(2)}%`,
      message,
      color,
      timeframe,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    });
  }
}

export class OptionsCard extends IndicatorCard {
  constructor(
    container: HTMLElement, 
    symbol: string, 
    message: string, 
    timeframe: string
  ) {
    const sentiment = message.toLowerCase();
    let color = '#6b7280';
    let trend: 'up' | 'down' | 'neutral' = 'neutral';

    if (sentiment.includes('bullish') || sentiment.includes('very bullish')) {
      color = '#10b981';
      trend = 'up';
    } else if (sentiment.includes('bearish') || sentiment.includes('very bearish')) {
      color = '#ef4444';
      trend = 'down';
    }

    super(container, {
      title: `${symbol} Options Sentiment`,
      value: sentiment.includes('very') ? 'Strong' : 'Moderate',
      message,
      color,
      timeframe,
      trend
    });
  }
}