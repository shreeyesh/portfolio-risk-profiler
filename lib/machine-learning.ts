/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Holding } from './risk-calculations'
import { type PortfolioMetrics } from './quantitative-models'

export interface InvestorPersonality {
  type: 'Conservative' | 'Moderate' | 'Aggressive'
  confidence: number
  characteristics: string[]
  riskTolerance: number
  investmentHorizon: 'Short' | 'Medium' | 'Long'
  preferredSectors: string[]
  behavioralTraits: string[]
}

export interface Recommendation {
  id: string
  type: 'rebalance' | 'diversify' | 'reduce_risk' | 'increase_return' | 'sector_shift'
  priority: 'High' | 'Medium' | 'Low'
  title: string
  description: string
  expectedImpact: {
    risk: number
    return: number
    diversification: number
  }
  actions: Array<{
    action: string
    rationale: string
    expectedOutcome: string
  }>
  confidence: number
}

export interface RiskProfile {
  overallRisk: number
  concentrationRisk: number
  sectorRisk: number
  volatilityRisk: number
  correlationRisk: number
  liquidityRisk: number
  marketRisk: number
}

// Feature extraction for ML models
export function extractPortfolioFeatures(holdings: Holding[], metrics: PortfolioMetrics): number[] {
  const totalValue = holdings.reduce((sum, h) => sum + h.total_value, 0)
  const weights = holdings.map(h => h.total_value / totalValue)
  
  // Calculate sector weights
  const sectorWeights: { [key: string]: number } = {}
  holdings.forEach((holding, index) => {
    if (!sectorWeights[holding.sector]) {
      sectorWeights[holding.sector] = 0
    }
    sectorWeights[holding.sector] += weights[index]
  })
  
  // Calculate concentration metrics
  const maxWeight = Math.max(...weights)
  const top3Weight = weights
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((sum, w) => sum + w, 0)
  
  // Calculate diversification metrics
  const uniqueSectors = Object.keys(sectorWeights).length
  const herfindahlIndex = weights.reduce((sum, w) => sum + w * w, 0)
  
  // Extract features
  const features = [
    metrics.expectedReturn,
    metrics.volatility,
    metrics.sharpeRatio,
    metrics.beta,
    metrics.correlation,
    maxWeight,
    top3Weight,
    uniqueSectors,
    herfindahlIndex,
    Object.values(sectorWeights).reduce((sum, w) => sum + w * w, 0), // Sector concentration
    weights.length, // Number of holdings
    metrics.var95,
    metrics.maxDrawdown,
    metrics.informationRatio,
    metrics.treynorRatio,
    metrics.jensenAlpha,
  ]
  
  return features
}

// Personality profiling using portfolio characteristics
export function analyzeInvestorPersonality(
  holdings: Holding[], 
  metrics: PortfolioMetrics,
  historicalBehavior?: any
): InvestorPersonality {
  const features = extractPortfolioFeatures(holdings, metrics)
  
  // Calculate risk tolerance based on portfolio characteristics
  const riskTolerance = calculateRiskTolerance(features)
  
  // Determine personality type
  let type: 'Conservative' | 'Moderate' | 'Aggressive'
  let confidence: number
  
  if (riskTolerance < 0.3) {
    type = 'Conservative'
    confidence = 0.85
  } else if (riskTolerance < 0.7) {
    type = 'Moderate'
    confidence = 0.80
  } else {
    type = 'Aggressive'
    confidence = 0.90
  }
  
  // Analyze characteristics
  const characteristics = analyzeCharacteristics(features, type)
  
  // Determine investment horizon
  const investmentHorizon = determineInvestmentHorizon(features, type)
  
  // Identify preferred sectors
  const preferredSectors = identifyPreferredSectors(holdings, type)
  
  // Analyze behavioral traits
  const behavioralTraits = analyzeBehavioralTraits(features, type)
  
  return {
    type,
    confidence,
    characteristics,
    riskTolerance,
    investmentHorizon,
    preferredSectors,
    behavioralTraits,
  }
}

function calculateRiskTolerance(features: number[]): number {
  // Normalize features and calculate weighted risk tolerance
  const weights = [0.15, 0.20, 0.10, 0.10, 0.05, 0.15, 0.10, 0.05, 0.10]
  
  let riskScore = 0
  for (let i = 0; i < Math.min(weights.length, features.length); i++) {
    // Normalize each feature to 0-1 range
    let normalizedFeature = 0
    
    switch (i) {
      case 0: // expected return
        normalizedFeature = Math.min(features[i] / 0.20, 1)
        break
      case 1: // volatility
        normalizedFeature = Math.min(features[i] / 0.30, 1)
        break
      case 2: // sharpe ratio
        normalizedFeature = Math.max(0, Math.min(features[i] / 2, 1))
        break
      case 3: // beta
        normalizedFeature = Math.min(features[i] / 1.5, 1)
        break
      case 4: // correlation
        normalizedFeature = features[i]
        break
      case 5: // max weight
        normalizedFeature = features[i]
        break
      case 6: // top 3 weight
        normalizedFeature = features[i]
        break
      case 7: // unique sectors
        normalizedFeature = Math.min(features[i] / 10, 1)
        break
      case 8: // herfindahl index
        normalizedFeature = features[i]
        break
    }
    
    riskScore += weights[i] * normalizedFeature
  }
  
  return Math.max(0, Math.min(1, riskScore))
}

function analyzeCharacteristics(features: number[], type: string): string[] {
  const characteristics: string[] = []
  
  if (features[5] > 0.15) { // max weight
    characteristics.push('High concentration in individual stocks')
  }
  
  if (features[6] > 0.4) { // top 3 weight
    characteristics.push('Top-heavy portfolio allocation')
  }
  
  if (features[7] < 5) { // unique sectors
    characteristics.push('Limited sector diversification')
  }
  
  if (features[8] > 0.3) { // herfindahl index
    characteristics.push('High portfolio concentration')
  }
  
  if (features[2] > 1.5) { // sharpe ratio
    characteristics.push('Good risk-adjusted returns')
  }
  
  if (features[1] < 0.15) { // volatility
    characteristics.push('Low portfolio volatility')
  }
  
  if (type === 'Conservative') {
    characteristics.push('Preference for stable, dividend-paying stocks')
    characteristics.push('Focus on capital preservation')
  } else if (type === 'Aggressive') {
    characteristics.push('Willingness to take higher risks for higher returns')
    characteristics.push('Growth-oriented investment strategy')
  }
  
  return characteristics
}

function determineInvestmentHorizon(features: number[], type: string): 'Short' | 'Medium' | 'Long' {
  // Analyze portfolio characteristics to determine investment horizon
  const volatility = features[1]
  const beta = features[3]
  const concentration = features[8]
  
  if (type === 'Conservative' || (volatility < 0.15 && beta < 0.8)) {
    return 'Long'
  } else if (type === 'Aggressive' || (volatility > 0.25 && beta > 1.2)) {
    return 'Short'
  } else {
    return 'Medium'
  }
}

function identifyPreferredSectors(holdings: Holding[], type: string): string[] {
  const sectorWeights: { [key: string]: number } = {}
  const totalValue = holdings.reduce((sum, h) => sum + h.total_value, 0)
  
  holdings.forEach(holding => {
    if (!sectorWeights[holding.sector]) {
      sectorWeights[holding.sector] = 0
    }
    sectorWeights[holding.sector] += holding.total_value / totalValue
  })
  
  // Sort sectors by weight
  const sortedSectors = Object.entries(sectorWeights)
    .sort(([,a], [,b]) => b - a)
    .map(([sector]) => sector)
  
  // Return top 3 sectors
  return sortedSectors.slice(0, 3)
}

function analyzeBehavioralTraits(features: number[], type: string): string[] {
  const traits: string[] = []
  
  if (features[5] > 0.2) { // high max weight
    traits.push('Concentration bias')
  }
  
  if (features[7] < 4) { // few sectors
    traits.push('Sector bias')
  }
  
  if (features[2] < 0.5) { // low sharpe ratio
    traits.push('Risk-inefficient allocation')
  }
  
  if (type === 'Conservative') {
    traits.push('Loss aversion')
    traits.push('Preference for familiar investments')
  } else if (type === 'Aggressive') {
    traits.push('Overconfidence')
    traits.push('Momentum chasing')
  }
  
  return traits
}

// Advanced recommendation engine
export function generateRecommendations(
  holdings: Holding[],
  metrics: PortfolioMetrics,
  personality: InvestorPersonality
): Recommendation[] {
  const recommendations: Recommendation[] = []
  const totalValue = holdings.reduce((sum, h) => sum + h.total_value, 0)
  const weights = holdings.map(h => h.total_value / totalValue)
  
  // Check for high concentration risk
  const maxWeight = Math.max(...weights)
  if (maxWeight > 0.15) {
    recommendations.push({
      id: 'reduce-concentration',
      type: 'reduce_risk',
      priority: 'High',
      title: 'Reduce Concentration Risk',
      description: `Your largest holding represents ${(maxWeight * 100).toFixed(1)}% of your portfolio, which exceeds recommended limits.`,
      expectedImpact: {
        risk: -0.15,
        return: -0.05,
        diversification: 0.20,
      },
      actions: [{
        action: 'Consider reducing position size to below 10%',
        rationale: 'Reduces single-stock risk and improves diversification',
        expectedOutcome: 'Lower portfolio volatility and reduced downside risk',
      }],
      confidence: 0.90,
    })
  }
  
  // Check for sector concentration
  const sectorWeights: { [key: string]: number } = {}
  holdings.forEach((holding, index) => {
    if (!sectorWeights[holding.sector]) {
      sectorWeights[holding.sector] = 0
    }
    sectorWeights[holding.sector] += weights[index]
  })
  
  const maxSectorWeight = Math.max(...Object.values(sectorWeights))
  if (maxSectorWeight > 0.3) {
    recommendations.push({
      id: 'diversify-sectors',
      type: 'diversify',
      priority: 'Medium',
      title: 'Diversify Sector Allocation',
      description: `Your ${Object.keys(sectorWeights).find(k => sectorWeights[k] === maxSectorWeight)} sector represents ${(maxSectorWeight * 100).toFixed(1)}% of your portfolio.`,
      expectedImpact: {
        risk: -0.10,
        return: 0.02,
        diversification: 0.25,
      },
      actions: [{
        action: 'Consider adding positions in underrepresented sectors',
        rationale: 'Reduces sector-specific risk and improves portfolio resilience',
        expectedOutcome: 'Better performance during sector rotations',
      }],
      confidence: 0.85,
    })
  }
  
  // Check for low Sharpe ratio
  if (metrics.sharpeRatio < 0.5) {
    recommendations.push({
      id: 'improve-risk-return',
      type: 'increase_return',
      priority: 'Medium',
      title: 'Improve Risk-Adjusted Returns',
      description: 'Your portfolio has a low Sharpe ratio, indicating poor risk-adjusted performance.',
      expectedImpact: {
        risk: 0.05,
        return: 0.10,
        diversification: 0.05,
      },
      actions: [{
        action: 'Review and potentially rebalance to higher-quality stocks',
        rationale: 'Focus on companies with better fundamentals and growth prospects',
        expectedOutcome: 'Improved risk-adjusted returns over time',
      }],
      confidence: 0.75,
    })
  }
  
  // Check for low diversification
  const uniqueSectors = Object.keys(sectorWeights).length
  if (uniqueSectors < 5) {
    recommendations.push({
      id: 'increase-diversification',
      type: 'diversify',
      priority: 'Medium',
      title: 'Increase Portfolio Diversification',
      description: `Your portfolio is concentrated in only ${uniqueSectors} sectors.`,
      expectedImpact: {
        risk: -0.08,
        return: 0.03,
        diversification: 0.30,
      },
      actions: [{
        action: 'Consider adding positions in new sectors',
        rationale: 'Diversification reduces portfolio volatility and improves stability',
        expectedOutcome: 'More consistent performance across market cycles',
      }],
      confidence: 0.80,
    })
  }
  
  // Personality-based recommendations
  if (personality.type === 'Conservative' && metrics.volatility > 0.2) {
    recommendations.push({
      id: 'reduce-volatility',
      type: 'reduce_risk',
      priority: 'High',
      title: 'Reduce Portfolio Volatility',
      description: 'Your portfolio volatility is high for a conservative investor.',
      expectedImpact: {
        risk: -0.20,
        return: -0.08,
        diversification: 0.10,
      },
      actions: [{
        action: 'Consider adding defensive stocks or bonds',
        rationale: 'Aligns portfolio risk with your conservative investment style',
        expectedOutcome: 'Lower portfolio volatility and more stable returns',
      }],
      confidence: 0.85,
    })
  }
  
  if (personality.type === 'Aggressive' && metrics.expectedReturn < 0.12) {
    recommendations.push({
      id: 'increase-growth',
      type: 'increase_return',
      priority: 'Medium',
      title: 'Increase Growth Exposure',
      description: 'Your portfolio may benefit from higher-growth opportunities.',
      expectedImpact: {
        risk: 0.15,
        return: 0.15,
        diversification: 0.05,
      },
      actions: [{
        action: 'Consider adding growth stocks or emerging market exposure',
        rationale: 'Aligns with your aggressive investment style and return objectives',
        expectedOutcome: 'Higher potential returns, though with increased volatility',
      }],
      confidence: 0.70,
    })
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

// Risk clustering using K-means algorithm
export function performAdvancedRiskClustering(holdings: Holding[], k: number = 3): any[] {
  const features = holdings.map(h => [
    h.total_value,
    h.current_price,
    h.quantity,
    // Add more features as needed
  ])
  
  // Simplified K-means implementation
  const clusters = kMeansClustering(features, k)
  
  return clusters.map((cluster, index) => ({
    id: `cluster-${index}`,
    name: `Risk Cluster ${index + 1}`,
    holdings: cluster.map((_, i) => holdings[i].symbol),
    characteristics: generateClusterCharacteristics(cluster, holdings),
  }))
}

function kMeansClustering(data: number[][], k: number): number[][] {
  // Simplified K-means implementation
  // In production, use a proper ML library like TensorFlow.js or ml-matrix
  
  // Initialize centroids randomly
  const centroids: number[][] = []
  for (let i = 0; i < k; i++) {
    const centroid = data[0].map(() => Math.random())
    centroids.push(centroid)
  }
  
  // Assign points to clusters
  const clusters: number[][] = Array(k).fill(null).map(() => [])
  
  data.forEach((point, pointIndex) => {
    let minDistance = Infinity
    let bestCluster = 0
    
    centroids.forEach((centroid: number[], clusterIndex: number) => {
      const distance = euclideanDistance(point, centroid)
      if (distance < minDistance) {
        minDistance = distance
        bestCluster = clusterIndex
      }
    })
    
    clusters[bestCluster].push(pointIndex)
  })
  
  return clusters
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0))
}

function generateClusterCharacteristics(cluster: number[], holdings: Holding[]): string[] {
  const clusterHoldings = cluster.map(i => holdings[i])
  const sectors = clusterHoldings.map(h => h.sector)
  const avgValue = clusterHoldings.reduce((sum, h) => sum + h.total_value, 0) / clusterHoldings.length
  
  const characteristics = []
  
  if (avgValue > 200000) {
    characteristics.push('High-value holdings')
  } else if (avgValue < 50000) {
    characteristics.push('Small-cap focus')
  }
  
  const uniqueSectors = new Set(sectors).size
  if (uniqueSectors === 1) {
    characteristics.push('Sector-specific cluster')
  } else if (uniqueSectors > 3) {
    characteristics.push('Diversified cluster')
  }
  
  return characteristics
} 