/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

export interface RobinhoodHolding {
  symbol: string
  name: string
  quantity: number
  average_buy_price: number
  last_price: number
  total_value: number
  sector?: string
}

export interface RobinhoodPortfolio {
  holdings: RobinhoodHolding[]
  total_value: number
  total_pnl: number
}

class RobinhoodAPI {
  private accessToken: string
  private baseURL = 'https://api.robinhood.com'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  async getPortfolio(): Promise<RobinhoodPortfolio> {
    try {
      // Get account information
      const accountResponse = await axios.get(`${this.baseURL}/accounts/`, {
        headers: this.getHeaders()
      })

      const accountId = accountResponse.data.results[0]?.id
      if (!accountId) {
        throw new Error('No account found')
      }

      // Get positions
      const positionsResponse = await axios.get(`${this.baseURL}/positions/`, {
        headers: this.getHeaders(),
        params: {
          account_id: accountId
        }
      })

      const positions = positionsResponse.data.results.filter((pos: any) => 
        parseFloat(pos.quantity) > 0
      )

      // Get quotes for all positions
      const symbols = positions.map((pos: any) => pos.instrument.split('/').pop())
      const quotesResponse = await axios.get(`${this.baseURL}/quotes/`, {
        headers: this.getHeaders(),
        params: {
          symbols: symbols.join(',')
        }
      })

      const quotes = quotesResponse.data.results.reduce((acc: any, quote: any) => {
        acc[quote.symbol] = quote
        return acc
      }, {})

      // Build holdings array
      const holdings: RobinhoodHolding[] = await Promise.all(
        positions.map(async (position: any) => {
          const symbol = position.instrument.split('/').pop()
          const quote = quotes[symbol]
          const quantity = parseFloat(position.quantity)
          const averagePrice = parseFloat(position.average_buy_price)
          const lastPrice = parseFloat(quote?.last_trade_price || '0')
          const totalValue = quantity * lastPrice

          // Get stock info for sector
          const stockInfo = await this.getStockInfo(symbol)

          return {
            symbol,
            name: quote?.simple_name || symbol,
            quantity,
            average_buy_price: averagePrice,
            last_price: lastPrice,
            total_value: totalValue,
            sector: stockInfo.sector
          }
        })
      )

      const totalValue = holdings.reduce((sum, holding) => sum + holding.total_value, 0)
      const totalPnl = holdings.reduce((sum, holding) => {
        const costBasis = holding.quantity * holding.average_buy_price
        return sum + (holding.total_value - costBasis)
      }, 0)

      return {
        holdings,
        total_value: totalValue,
        total_pnl: totalPnl
      }
    } catch (error) {
      console.error('Error fetching Robinhood portfolio:', error)
      throw new Error('Failed to fetch portfolio data from Robinhood')
    }
  }

  async getQuote(symbol: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/quotes/${symbol}/`, {
        headers: this.getHeaders()
      })

      return response.data
    } catch (error) {
      console.error('Error fetching quote:', error)
      throw new Error('Failed to fetch quote from Robinhood')
    }
  }

  async getHistoricalData(symbol: string, interval: string = 'day', span: string = 'year'): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/marketdata/historicals/${symbol}/`, {
        headers: this.getHeaders(),
        params: {
          interval,
          span
        }
      })

      return response.data
    } catch (error) {
      console.error('Error fetching historical data:', error)
      throw new Error('Failed to fetch historical data from Robinhood')
    }
  }

  async getStockInfo(symbol: string): Promise<any> {
    try {
      // This would typically call an external API to get sector information
      // For now, we'll return a mock response
      const sectorMap: { [key: string]: string } = {
        'AAPL': 'Technology',
        'MSFT': 'Technology',
        'GOOGL': 'Technology',
        'AMZN': 'Consumer Discretionary',
        'TSLA': 'Consumer Discretionary',
        'META': 'Technology',
        'NVDA': 'Technology',
        'NFLX': 'Communication Services',
        'JPM': 'Financial Services',
        'JNJ': 'Healthcare',
        'PG': 'Consumer Staples',
        'V': 'Financial Services',
        'UNH': 'Healthcare',
        'HD': 'Consumer Discretionary',
        'MA': 'Financial Services',
        'DIS': 'Communication Services',
        'PYPL': 'Financial Services',
        'BAC': 'Financial Services',
        'ADBE': 'Technology',
        'CRM': 'Technology',
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

  async getAccountInfo(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/accounts/`, {
        headers: this.getHeaders()
      })

      return response.data.results[0]
    } catch (error) {
      console.error('Error fetching account info:', error)
      throw new Error('Failed to fetch account information from Robinhood')
    }
  }
}

export default RobinhoodAPI 