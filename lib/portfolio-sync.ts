import { supabase } from './supabase'
import { type Holding } from './risk-calculations'

export interface PortfolioData {
  holdings: Holding[]
  totalValue: number
  lastUpdated: string
}

export async function syncPortfolioFromZerodha(userId: string): Promise<PortfolioData> {
  try {
    // Get Zerodha access token
    const { data: connection } = await supabase
      .from('api_connections')
      .select('access_token')
      .eq('user_id', userId)
      .eq('provider', 'zerodha')
      .eq('is_active', true)
      .single()

    if (!connection?.access_token) {
      throw new Error('No active Zerodha connection found')
    }

    // Fetch portfolio from Zerodha
    const response = await fetch('https://api.kite.trade/portfolio/holdings', {
      headers: {
        'Authorization': `token ${connection.access_token}`,
        'X-Kite-Version': '3'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Zerodha portfolio')
    }

    const data = await response.json()
    
    if (data.status === 'success') {
      const holdings: Holding[] = data.data.net.map((item: any) => ({
        symbol: item.tradingsymbol,
        name: item.product,
        quantity: item.quantity,
        current_price: item.average_price,
        total_value: item.quantity * item.average_price,
        sector: getSectorForSymbol(item.tradingsymbol), // You'll need to implement this
      }))

      const totalValue = holdings.reduce((sum, holding) => sum + holding.total_value, 0)

      // Store in database
      await supabase
        .from('portfolios')
        .upsert({
          user_id: userId,
          provider: 'zerodha',
          holdings: holdings,
          total_value: totalValue,
          last_synced: new Date().toISOString(),
        })

      return {
        holdings,
        totalValue,
        lastUpdated: new Date().toISOString()
      }
    }

    throw new Error('Invalid response from Zerodha API')
  } catch (error) {
    console.error('Error syncing Zerodha portfolio:', error)
    throw error
  }
}

export async function syncPortfolioFromRobinhood(userId: string): Promise<PortfolioData> {
  try {
    // Get Robinhood access token
    const { data: connection } = await supabase
      .from('api_connections')
      .select('access_token')
      .eq('user_id', userId)
      .eq('provider', 'robinhood')
      .eq('is_active', true)
      .single()

    if (!connection?.access_token) {
      throw new Error('No active Robinhood connection found')
    }

    // Fetch portfolio from Robinhood
    const response = await fetch('https://api.robinhood.com/accounts/', {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Robinhood account')
    }

    const accountData = await response.json()
    const accountId = accountData.results[0]?.id

    if (!accountId) {
      throw new Error('No Robinhood account found')
    }

    // Fetch positions
    const positionsResponse = await fetch(`https://api.robinhood.com/accounts/${accountId}/positions/`, {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Accept': 'application/json'
      }
    })

    if (!positionsResponse.ok) {
      throw new Error('Failed to fetch Robinhood positions')
    }

    const positionsData = await positionsResponse.json()
    
    const holdings: Holding[] = positionsData.results
      .filter((pos: any) => parseFloat(pos.quantity) > 0)
      .map((pos: any) => ({
        symbol: pos.instrument.split('/').pop(),
        name: pos.instrument.split('/').pop(), // You might want to fetch instrument details
        quantity: parseFloat(pos.quantity),
        current_price: parseFloat(pos.average_buy_price),
        total_value: parseFloat(pos.quantity) * parseFloat(pos.average_buy_price),
        sector: 'Unknown', // Robinhood doesn't provide sector info directly
      }))

    const totalValue = holdings.reduce((sum, holding) => sum + holding.total_value, 0)

    // Store in database
    await supabase
      .from('portfolios')
      .upsert({
        user_id: userId,
        provider: 'robinhood',
        holdings: holdings,
        total_value: totalValue,
        last_synced: new Date().toISOString(),
      })

    return {
      holdings,
      totalValue,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error syncing Robinhood portfolio:', error)
    throw error
  }
}

// Helper function to get sector for Indian stocks
function getSectorForSymbol(symbol: string): string {
  // This is a simplified mapping - in production, you'd want a comprehensive database
  const sectorMap: { [key: string]: string } = {
    'RELIANCE': 'Oil & Gas',
    'TCS': 'Information Technology',
    'HDFCBANK': 'Banking',
    'INFY': 'Information Technology',
    'ICICIBANK': 'Banking',
    'HINDUNILVR': 'FMCG',
    'ITC': 'FMCG',
    'SBIN': 'Banking',
    'BHARTIARTL': 'Telecommunications',
    'KOTAKBANK': 'Banking',
    'AXISBANK': 'Banking',
    'ASIANPAINT': 'Consumer Goods',
    'MARUTI': 'Automobiles',
    'SUNPHARMA': 'Healthcare',
    'TATAMOTORS': 'Automobiles',
    'WIPRO': 'Information Technology',
    'ULTRACEMCO': 'Construction Materials',
    'TITAN': 'Consumer Goods',
    'BAJFINANCE': 'Financial Services',
    'NESTLEIND': 'FMCG',
  }

  return sectorMap[symbol] || 'Other'
}

export async function getLatestPortfolio(userId: string): Promise<PortfolioData | null> {
  try {
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('last_synced', { ascending: false })
      .limit(1)
      .single()

    if (portfolio) {
      return {
        holdings: portfolio.holdings,
        totalValue: portfolio.total_value,
        lastUpdated: portfolio.last_synced
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching latest portfolio:', error)
    return null
  }
} 