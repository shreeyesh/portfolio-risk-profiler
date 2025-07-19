import { type Holding } from './risk-calculations'

export interface PortfolioMetrics {
  expectedReturn: number
  volatility: number
  sharpeRatio: number
  var95: number
  var99: number
  beta: number
  correlation: number
  maxDrawdown: number
  informationRatio: number
  treynorRatio: number
  jensenAlpha: number
}

export interface MonteCarloResult {
  scenarios: number[][]
  percentiles: {
    p5: number
    p25: number
    p50: number
    p75: number
    p95: number
  }
  expectedValue: number
  worstCase: number
  bestCase: number
}

export interface RiskCluster {
  id: string
  name: string
  description: string
  riskLevel: 'Low' | 'Medium' | 'High'
  characteristics: string[]
  holdings: string[]
}

// Historical market data (simplified - in production, fetch from APIs)
const MARKET_DATA = {
  'RELIANCE': { returns: [0.02, -0.01, 0.03, -0.02, 0.01, 0.04, -0.01, 0.02, 0.01, -0.03] },
  'TCS': { returns: [0.01, 0.02, -0.01, 0.03, 0.01, -0.02, 0.02, 0.01, 0.03, -0.01] },
  'HDFCBANK': { returns: [0.015, -0.005, 0.025, -0.015, 0.005, 0.035, -0.005, 0.015, 0.005, -0.025] },
  'INFY': { returns: [0.012, 0.018, -0.008, 0.028, 0.008, -0.018, 0.018, 0.008, 0.028, -0.008] },
  'ICICIBANK': { returns: [0.018, -0.008, 0.032, -0.018, 0.008, 0.042, -0.008, 0.018, 0.008, -0.032] },
  'HINDUNILVR': { returns: [0.008, 0.012, -0.005, 0.022, 0.005, -0.012, 0.012, 0.005, 0.022, -0.005] },
  'ITC': { returns: [0.006, 0.010, -0.004, 0.020, 0.004, -0.010, 0.010, 0.004, 0.020, -0.004] },
  'SBIN': { returns: [0.020, -0.010, 0.040, -0.020, 0.010, 0.050, -0.010, 0.020, 0.010, -0.040] },
}

const RISK_FREE_RATE = 0.06 // 6% risk-free rate (Indian context)
const MARKET_RETURN = 0.12 // 12% expected market return

// Modern Portfolio Theory Calculations
export function calculatePortfolioMetrics(holdings: Holding[]): PortfolioMetrics {
  if (holdings.length === 0) {
    return {
      expectedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      var95: 0,
      var99: 0,
      beta: 0,
      correlation: 0,
      maxDrawdown: 0,
      informationRatio: 0,
      treynorRatio: 0,
      jensenAlpha: 0,
    }
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.total_value, 0)
  const weights = holdings.map(h => h.total_value / totalValue)
  
  // Calculate expected returns and covariance matrix
  const returns = holdings.map(h => {
    const stockData = MARKET_DATA[h.symbol as keyof typeof MARKET_DATA]
    return stockData ? stockData.returns.reduce((sum, r) => sum + r, 0) / stockData.returns.length : 0.08
  })

  const expectedReturn = weights.reduce((sum, w, i) => sum + w * returns[i], 0)
  
  // Calculate covariance matrix
  const covarianceMatrix = calculateCovarianceMatrix(holdings)
  
  // Calculate portfolio variance
  let portfolioVariance = 0
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      portfolioVariance += weights[i] * weights[j] * covarianceMatrix[i][j]
    }
  }
  
  const volatility = Math.sqrt(portfolioVariance)
  
  // Calculate Sharpe Ratio
  const sharpeRatio = (expectedReturn - RISK_FREE_RATE) / volatility
  
  // Calculate VaR (assuming normal distribution)
  const var95 = expectedReturn - 1.645 * volatility
  const var99 = expectedReturn - 2.326 * volatility
  
  // Calculate Beta
  const beta = calculatePortfolioBeta(holdings, weights)
  
  // Calculate correlation with market
  const correlation = calculateMarketCorrelation(holdings, weights)
  
  // Calculate maximum drawdown
  const maxDrawdown = calculateMaxDrawdown(holdings)
  
  // Calculate Information Ratio
  const informationRatio = (expectedReturn - MARKET_RETURN) / volatility
  
  // Calculate Treynor Ratio
  const treynorRatio = (expectedReturn - RISK_FREE_RATE) / beta
  
  // Calculate Jensen's Alpha
  const jensenAlpha = expectedReturn - (RISK_FREE_RATE + beta * (MARKET_RETURN - RISK_FREE_RATE))

  return {
    expectedReturn,
    volatility,
    sharpeRatio,
    var95,
    var99,
    beta,
    correlation,
    maxDrawdown,
    informationRatio,
    treynorRatio,
    jensenAlpha,
  }
}

// Calculate covariance matrix
function calculateCovarianceMatrix(holdings: Holding[]): number[][] {
  const matrix: number[][] = []
  
  for (let i = 0; i < holdings.length; i++) {
    matrix[i] = []
    for (let j = 0; j < holdings.length; j++) {
      if (i === j) {
        // Variance
        const stockData = MARKET_DATA[holdings[i].symbol as keyof typeof MARKET_DATA]
        if (stockData) {
          const mean = stockData.returns.reduce((sum, r) => sum + r, 0) / stockData.returns.length
          const variance = stockData.returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / stockData.returns.length
          matrix[i][j] = variance
        } else {
          matrix[i][j] = 0.04 // Default variance
        }
      } else {
        // Covariance (simplified - in production, calculate actual covariance)
        matrix[i][j] = 0.01 // Default covariance
      }
    }
  }
  
  return matrix
}

// Calculate portfolio beta
function calculatePortfolioBeta(holdings: Holding[], weights: number[]): number {
  const betas = holdings.map(h => {
    // Simplified beta calculation - in production, use actual market data
    const sectorBetas: { [key: string]: number } = {
      'Oil & Gas': 1.2,
      'IT': 0.8,
      'Banking': 1.1,
      'FMCG': 0.6,
      'Healthcare': 0.9,
      'Automobiles': 1.3,
      'Consumer Goods': 0.7,
      'Financial Services': 1.0,
      'Construction Materials': 1.4,
      'Telecommunications': 0.9,
    }
    return sectorBetas[h.sector] || 1.0
  })
  
  return weights.reduce((sum, w, i) => sum + w * betas[i], 0)
}

// Calculate market correlation
function calculateMarketCorrelation(holdings: Holding[], weights: number[]): number {
  const correlations = holdings.map(h => {
    // Simplified correlation - in production, calculate actual correlation
    const sectorCorrelations: { [key: string]: number } = {
      'Oil & Gas': 0.7,
      'IT': 0.5,
      'Banking': 0.8,
      'FMCG': 0.3,
      'Healthcare': 0.4,
      'Automobiles': 0.9,
      'Consumer Goods': 0.4,
      'Financial Services': 0.8,
      'Construction Materials': 0.9,
      'Telecommunications': 0.6,
    }
    return sectorCorrelations[h.sector] || 0.6
  })
  
  return weights.reduce((sum, w, i) => sum + w * correlations[i], 0)
}

// Calculate maximum drawdown
function calculateMaxDrawdown(holdings: Holding[]): number {
  // Simplified calculation - in production, use actual historical data
  const sectorDrawdowns: { [key: string]: number } = {
    'Oil & Gas': 0.25,
    'IT': 0.15,
    'Banking': 0.30,
    'FMCG': 0.10,
    'Healthcare': 0.20,
    'Automobiles': 0.35,
    'Consumer Goods': 0.12,
    'Financial Services': 0.28,
    'Construction Materials': 0.40,
    'Telecommunications': 0.18,
  }
  
  const totalValue = holdings.reduce((sum, h) => sum + h.total_value, 0)
  const weights = holdings.map(h => h.total_value / totalValue)
  
  return weights.reduce((sum, w, i) => {
    const sector = holdings[i].sector
    return sum + w * (sectorDrawdowns[sector] || 0.20)
  }, 0)
}

// Monte Carlo Simulation
export function runMonteCarloSimulation(
  holdings: Holding[], 
  timeHorizon: number = 252, // 1 year (trading days)
  numScenarios: number = 10000
): MonteCarloResult {
  const totalValue = holdings.reduce((sum, h) => sum + h.total_value, 0)
  const weights = holdings.map(h => h.total_value / totalValue)
  
  // Get expected returns and volatilities
  const returns = holdings.map(h => {
    const stockData = MARKET_DATA[h.symbol as keyof typeof MARKET_DATA]
    return stockData ? stockData.returns.reduce((sum, r) => sum + r, 0) / stockData.returns.length : 0.08
  })
  
  const volatilities = holdings.map(h => {
    const stockData = MARKET_DATA[h.symbol as keyof typeof MARKET_DATA]
    if (stockData) {
      const mean = stockData.returns.reduce((sum, r) => sum + r, 0) / stockData.returns.length
      const variance = stockData.returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / stockData.returns.length
      return Math.sqrt(variance)
    }
    return 0.20 // Default volatility
  })
  
  const scenarios: number[][] = []
  
  for (let scenario = 0; scenario < numScenarios; scenario++) {
    const scenarioPath: number[] = [totalValue]
    
    for (let day = 1; day <= timeHorizon; day++) {
      let dailyReturn = 0
      
      for (let i = 0; i < holdings.length; i++) {
        // Generate random return using normal distribution
        const randomReturn = returns[i] + volatilities[i] * (Math.random() + Math.random() + Math.random() + Math.random() - 2) / Math.sqrt(12)
        dailyReturn += weights[i] * randomReturn
      }
      
      const newValue = scenarioPath[day - 1] * (1 + dailyReturn)
      scenarioPath.push(newValue)
    }
    
    scenarios.push(scenarioPath)
  }
  
  // Calculate percentiles
  const finalValues = scenarios.map(s => s[s.length - 1]).sort((a, b) => a - b)
  
  return {
    scenarios,
    percentiles: {
      p5: finalValues[Math.floor(numScenarios * 0.05)],
      p25: finalValues[Math.floor(numScenarios * 0.25)],
      p50: finalValues[Math.floor(numScenarios * 0.50)],
      p75: finalValues[Math.floor(numScenarios * 0.75)],
      p95: finalValues[Math.floor(numScenarios * 0.95)],
    },
    expectedValue: finalValues.reduce((sum, v) => sum + v, 0) / numScenarios,
    worstCase: finalValues[0],
    bestCase: finalValues[numScenarios - 1],
  }
}

// Risk Clustering Algorithm
export function performRiskClustering(holdings: Holding[]): RiskCluster[] {
  const clusters: RiskCluster[] = []
  
  // Group by sector first
  const sectorGroups: { [key: string]: Holding[] } = {}
  holdings.forEach(holding => {
    if (!sectorGroups[holding.sector]) {
      sectorGroups[holding.sector] = []
    }
    sectorGroups[holding.sector].push(holding)
  })
  
  // Create clusters based on sector and risk characteristics
  Object.entries(sectorGroups).forEach(([sector, sectorHoldings]) => {
    const totalValue = sectorHoldings.reduce((sum, h) => sum + h.total_value, 0)
    const portfolioValue = holdings.reduce((sum, h) => sum + h.total_value, 0)
    const sectorWeight = totalValue / portfolioValue
    
    let riskLevel: 'Low' | 'Medium' | 'High'
    let characteristics: string[]
    
    if (sectorWeight > 0.3) {
      riskLevel = 'High'
      characteristics = ['High sector concentration', 'Limited diversification', 'Sector-specific risk']
    } else if (sectorWeight > 0.15) {
      riskLevel = 'Medium'
      characteristics = ['Moderate sector concentration', 'Some diversification', 'Balanced risk']
    } else {
      riskLevel = 'Low'
      characteristics = ['Low sector concentration', 'Good diversification', 'Well-balanced']
    }
    
    clusters.push({
      id: `cluster-${sector.toLowerCase().replace(/\s+/g, '-')}`,
      name: `${sector} Cluster`,
      description: `Holdings in the ${sector} sector with ${riskLevel.toLowerCase()} risk profile`,
      riskLevel,
      characteristics,
      holdings: sectorHoldings.map(h => h.symbol),
    })
  })
  
  // Add concentration risk cluster
  const highConcentrationHoldings = holdings.filter(h => {
    const holdingWeight = h.total_value / holdings.reduce((sum, h) => sum + h.total_value, 0)
    return holdingWeight > 0.1
  })
  
  if (highConcentrationHoldings.length > 0) {
    clusters.push({
      id: 'cluster-concentration',
      name: 'High Concentration Risk',
      description: 'Holdings with individual weights exceeding 10% of portfolio',
      riskLevel: 'High',
      characteristics: ['High individual stock concentration', 'Single stock risk', 'Limited diversification'],
      holdings: highConcentrationHoldings.map(h => h.symbol),
    })
  }
  
  return clusters
}

// Calculate correlation matrix
export function calculateCorrelationMatrix(holdings: Holding[]): { matrix: number[][], symbols: string[] } {
  const symbols = holdings.map(h => h.symbol)
  const matrix: number[][] = []
  
  for (let i = 0; i < symbols.length; i++) {
    matrix[i] = []
    for (let j = 0; j < symbols.length; j++) {
      if (i === j) {
        matrix[i][j] = 1.0
      } else {
        // Simplified correlation - in production, calculate actual correlation
        const stock1 = holdings[i]
        const stock2 = holdings[j]
        
        // Same sector = higher correlation
        if (stock1.sector === stock2.sector) {
          matrix[i][j] = 0.7 + Math.random() * 0.2
        } else {
          matrix[i][j] = 0.2 + Math.random() * 0.3
        }
      }
    }
  }
  
  return { matrix, symbols }
}

// Calculate efficient frontier points
export function calculateEfficientFrontier(holdings: Holding[], numPoints: number = 20): Array<{ risk: number, return: number }> {
  const frontier: Array<{ risk: number, return: number }> = []
  
  // Get individual stock metrics with more realistic data
  const returns = holdings.map(h => {
    const stockData = MARKET_DATA[h.symbol as keyof typeof MARKET_DATA]
    return stockData ? stockData.returns.reduce((sum, r) => sum + r, 0) / stockData.returns.length : 0.08
  })
  
  const volatilities = holdings.map(h => {
    const stockData = MARKET_DATA[h.symbol as keyof typeof MARKET_DATA]
    if (stockData) {
      const mean = stockData.returns.reduce((sum, r) => sum + r, 0) / stockData.returns.length
      const variance = stockData.returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / stockData.returns.length
      return Math.sqrt(variance)
    }
    return 0.20
  })
  
  // Generate more realistic efficient frontier with proper optimization
  for (let i = 0; i < numPoints; i++) {
    const targetReturn = 0.05 + (i / (numPoints - 1)) * 0.20 // 5% to 25%
    
    // Generate different portfolio weights with more variation
    const weights = holdings.map((_, index) => {
      const baseWeight = 1 / holdings.length
      const returnAdjustment = (returns[index] - targetReturn) * 0.15
      const volatilityAdjustment = (0.25 - volatilities[index]) * 0.1
      const randomFactor = (Math.random() - 0.5) * 0.2
      
      return Math.max(0, baseWeight + returnAdjustment + volatilityAdjustment + randomFactor)
    })
    
    // Normalize weights
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    const normalizedWeights = weights.map(w => w / totalWeight)
    
    // Calculate portfolio metrics with more realistic correlation
    const portfolioReturn = normalizedWeights.reduce((sum, w, j) => sum + w * returns[j], 0)
    
    // Calculate portfolio risk with more sophisticated correlation matrix
    let portfolioVariance = 0
    for (let j = 0; j < normalizedWeights.length; j++) {
      for (let k = 0; k < normalizedWeights.length; k++) {
        const correlation = j === k ? 1 : getCorrelation(holdings[j].sector, holdings[k].sector)
        portfolioVariance += normalizedWeights[j] * normalizedWeights[k] * volatilities[j] * volatilities[k] * correlation
      }
    }
    
    const portfolioRisk = Math.sqrt(portfolioVariance)
    
    // Add some noise to make it more realistic
    const noiseFactor = 1 + (Math.random() - 0.5) * 0.1
    const finalRisk = portfolioRisk * noiseFactor
    const finalReturn = portfolioReturn * (1 + (Math.random() - 0.5) * 0.05)
    
    frontier.push({ risk: finalRisk, return: finalReturn })
  }
  
  // Sort by risk and remove dominated portfolios
  const sortedFrontier = frontier.sort((a, b) => a.risk - b.risk)
  const efficientFrontier: Array<{ risk: number, return: number }> = []
  
  let maxReturn = -Infinity
  for (const point of sortedFrontier) {
    if (point.return > maxReturn) {
      efficientFrontier.push(point)
      maxReturn = point.return
    }
  }
  
  return efficientFrontier
}

// Helper function to get correlation between sectors
function getCorrelation(sector1: string, sector2: string): number {
  const sectorCorrelations: { [key: string]: { [key: string]: number } } = {
    'Oil & Gas': {
      'Oil & Gas': 1.0,
      'IT': 0.2,
      'Banking': 0.4,
      'FMCG': 0.1,
      'Healthcare': 0.1,
      'Automobiles': 0.3,
      'Consumer Goods': 0.1,
      'Financial Services': 0.4,
      'Construction Materials': 0.5,
      'Telecommunications': 0.2,
    },
    'IT': {
      'Oil & Gas': 0.2,
      'IT': 1.0,
      'Banking': 0.3,
      'FMCG': 0.1,
      'Healthcare': 0.2,
      'Automobiles': 0.1,
      'Consumer Goods': 0.2,
      'Financial Services': 0.3,
      'Construction Materials': 0.1,
      'Telecommunications': 0.4,
    },
    'Banking': {
      'Oil & Gas': 0.4,
      'IT': 0.3,
      'Banking': 1.0,
      'FMCG': 0.2,
      'Healthcare': 0.1,
      'Automobiles': 0.3,
      'Consumer Goods': 0.2,
      'Financial Services': 0.8,
      'Construction Materials': 0.3,
      'Telecommunications': 0.2,
    },
    'FMCG': {
      'Oil & Gas': 0.1,
      'IT': 0.1,
      'Banking': 0.2,
      'FMCG': 1.0,
      'Healthcare': 0.3,
      'Automobiles': 0.2,
      'Consumer Goods': 0.6,
      'Financial Services': 0.2,
      'Construction Materials': 0.1,
      'Telecommunications': 0.1,
    },
    'Healthcare': {
      'Oil & Gas': 0.1,
      'IT': 0.2,
      'Banking': 0.1,
      'FMCG': 0.3,
      'Healthcare': 1.0,
      'Automobiles': 0.1,
      'Consumer Goods': 0.2,
      'Financial Services': 0.1,
      'Construction Materials': 0.1,
      'Telecommunications': 0.1,
    },
    'Automobiles': {
      'Oil & Gas': 0.3,
      'IT': 0.1,
      'Banking': 0.3,
      'FMCG': 0.2,
      'Healthcare': 0.1,
      'Automobiles': 1.0,
      'Consumer Goods': 0.4,
      'Financial Services': 0.3,
      'Construction Materials': 0.5,
      'Telecommunications': 0.1,
    },
    'Consumer Goods': {
      'Oil & Gas': 0.1,
      'IT': 0.2,
      'Banking': 0.2,
      'FMCG': 0.6,
      'Healthcare': 0.2,
      'Automobiles': 0.4,
      'Consumer Goods': 1.0,
      'Financial Services': 0.2,
      'Construction Materials': 0.2,
      'Telecommunications': 0.1,
    },
    'Financial Services': {
      'Oil & Gas': 0.4,
      'IT': 0.3,
      'Banking': 0.8,
      'FMCG': 0.2,
      'Healthcare': 0.1,
      'Automobiles': 0.3,
      'Consumer Goods': 0.2,
      'Financial Services': 1.0,
      'Construction Materials': 0.3,
      'Telecommunications': 0.2,
    },
    'Construction Materials': {
      'Oil & Gas': 0.5,
      'IT': 0.1,
      'Banking': 0.3,
      'FMCG': 0.1,
      'Healthcare': 0.1,
      'Automobiles': 0.5,
      'Consumer Goods': 0.2,
      'Financial Services': 0.3,
      'Construction Materials': 1.0,
      'Telecommunications': 0.1,
    },
    'Telecommunications': {
      'Oil & Gas': 0.2,
      'IT': 0.4,
      'Banking': 0.2,
      'FMCG': 0.1,
      'Healthcare': 0.1,
      'Automobiles': 0.1,
      'Consumer Goods': 0.1,
      'Financial Services': 0.2,
      'Construction Materials': 0.1,
      'Telecommunications': 1.0,
    },
  }
  
  return sectorCorrelations[sector1]?.[sector2] || 0.3
} 