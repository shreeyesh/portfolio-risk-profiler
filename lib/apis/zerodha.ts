import axios from 'axios'

export interface ZerodhaHolding {
  tradingsymbol: string
  exchange: string
  isin: string
  quantity: number
  average_price: number
  last_price: number
  pnl: number
  day_change: number
  day_change_percentage: number
}

export interface ZerodhaPortfolio {
  holdings: ZerodhaHolding[]
  total_value: number
  total_pnl: number
}

class ZerodhaAPI {
  private accessToken: string
  private baseURL = 'https://api.kite.trade'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private getHeaders() {
    return {
      'X-Kite-Version': '3',
      'Authorization': `token ${this.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  async getPortfolio(): Promise<ZerodhaPortfolio> {
    try {
      const response = await axios.get(`${this.baseURL}/portfolio/holdings`, {
        headers: this.getHeaders()
      })

      const holdings = response.data.data.net || []
      const totalValue = holdings.reduce((sum: number, holding: ZerodhaHolding) => {
        return sum + (holding.quantity * holding.last_price)
      }, 0)

      const totalPnl = holdings.reduce((sum: number, holding: ZerodhaHolding) => {
        return sum + holding.pnl
      }, 0)

      return {
        holdings,
        total_value: totalValue,
        total_pnl: totalPnl
      }
    } catch (error) {
      console.error('Error fetching Zerodha portfolio:', error)
      throw new Error('Failed to fetch portfolio data from Zerodha')
    }
  }

  async getQuote(symbols: string[]): Promise<any> {
    try {
      const symbolsParam = symbols.join(',')
      const response = await axios.get(`${this.baseURL}/quote/ltp?i=${symbolsParam}`, {
        headers: this.getHeaders()
      })

      return response.data.data
    } catch (error) {
      console.error('Error fetching quotes:', error)
      throw new Error('Failed to fetch quotes from Zerodha')
    }
  }

  async getHistoricalData(symbol: string, from: string, to: string, interval: string = 'day'): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/chart/${symbol}/${interval}`, {
        headers: this.getHeaders(),
        params: {
          from,
          to
        }
      })

      return response.data.data
    } catch (error) {
      console.error('Error fetching historical data:', error)
      throw new Error('Failed to fetch historical data from Zerodha')
    }
  }

  // Helper method to get sector information for a stock
  async getStockInfo(symbol: string): Promise<any> {
    try {
      // This would typically call an external API to get sector information
      // For now, we'll return a mock response
      const sectorMap: { [key: string]: string } = {
        'RELIANCE': 'Energy',
        'TCS': 'Technology',
        'HDFCBANK': 'Financial Services',
        'INFY': 'Technology',
        'ICICIBANK': 'Financial Services',
        'HINDUNILVR': 'Consumer Goods',
        'ITC': 'Consumer Goods',
        'SBIN': 'Financial Services',
        'BHARTIARTL': 'Telecommunications',
        'KOTAKBANK': 'Financial Services',
      }

      return {
        sector: sectorMap[symbol] || 'Unknown',
        name: symbol,
        market_cap: 0
      }
    } catch (error) {
      console.error('Error fetching stock info:', error)
      return {
        sector: 'Unknown',
        name: symbol,
        market_cap: 0
      }
    }
  }
}

export default ZerodhaAPI 