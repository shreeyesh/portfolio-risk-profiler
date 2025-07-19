export interface Holding {
  symbol: string
  name: string
  quantity: number
  current_price: number
  total_value: number
  sector: string
}

export interface RiskScore {
  overall_score: number
  concentration_score: number
  sector_score: number
  diversification_score: number
  risk_profile: string
}

export interface SectorAllocation {
  sector: string
  value: number
  percentage: number
}

export const calculateRiskScore = (holdings: Holding[]): RiskScore => {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.total_value, 0)
  
  // Calculate concentration risk (individual holdings)
  const concentrationRisk = holdings.reduce((maxRisk, holding) => {
    const percentage = (holding.total_value / totalValue) * 100
    if (percentage > 20) return Math.max(maxRisk, 100)
    if (percentage > 10) return Math.max(maxRisk, 80)
    if (percentage > 5) return Math.max(maxRisk, 60)
    return maxRisk
  }, 0)

  // Calculate sector concentration using Herfindahl Index
  const sectorAllocations = calculateSectorAllocation(holdings)
  const herfindahlIndex = sectorAllocations.reduce((sum, sector) => {
    return sum + Math.pow(sector.percentage / 100, 2)
  }, 0)
  
  const sectorRisk = herfindahlIndex > 0.5 ? 100 : herfindahlIndex * 200

  // Calculate diversification score
  const uniqueSectors = new Set(holdings.map(h => h.sector)).size
  const diversificationRisk = Math.max(0, 100 - (uniqueSectors * 10))

  // Calculate overall risk score
  const overallScore = Math.round((concentrationRisk * 0.4 + sectorRisk * 0.4 + diversificationRisk * 0.2))

  // Determine risk profile
  let riskProfile = 'Conservative'
  if (overallScore > 70) riskProfile = 'Aggressive'
  else if (overallScore > 30) riskProfile = 'Moderate'

  return {
    overall_score: overallScore,
    concentration_score: concentrationRisk,
    sector_score: Math.round(sectorRisk),
    diversification_score: diversificationRisk,
    risk_profile: riskProfile
  }
}

export const calculateSectorAllocation = (holdings: Holding[]): SectorAllocation[] => {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.total_value, 0)
  
  const sectorMap = new Map<string, number>()
  
  holdings.forEach(holding => {
    const currentValue = sectorMap.get(holding.sector) || 0
    sectorMap.set(holding.sector, currentValue + holding.total_value)
  })

  return Array.from(sectorMap.entries())
    .map(([sector, value]) => ({
      sector,
      value,
      percentage: Math.round((value / totalValue) * 100 * 100) / 100
    }))
    .sort((a, b) => b.value - a.value)
}

export const getRiskColor = (score: number): string => {
  if (score <= 30) return 'text-green-600'
  if (score <= 70) return 'text-yellow-600'
  return 'text-red-600'
}

export const getRiskBgColor = (score: number): string => {
  if (score <= 30) return 'bg-green-100'
  if (score <= 70) return 'bg-yellow-100'
  return 'bg-red-100'
}

export const getRiskBorderColor = (score: number): string => {
  if (score <= 30) return 'border-green-200'
  if (score <= 70) return 'border-yellow-200'
  return 'border-red-200'
}

export const getRecommendations = (riskScore: RiskScore, holdings: Holding[]): string[] => {
  const recommendations: string[] = []
  
  if (riskScore.concentration_score > 60) {
    recommendations.push('Consider reducing concentration in top holdings to diversify risk')
  }
  
  if (riskScore.sector_score > 60) {
    recommendations.push('Diversify across more sectors to reduce sector concentration risk')
  }
  
  if (riskScore.diversification_score > 60) {
    recommendations.push('Add holdings from different sectors to improve diversification')
  }
  
  if (holdings.length < 10) {
    recommendations.push('Consider adding more holdings to improve portfolio diversification')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Your portfolio shows good diversification. Maintain current allocation.')
  }
  
  return recommendations
} 