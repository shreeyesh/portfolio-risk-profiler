'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  Zap,
  Activity,
  PieChart,
  LineChart,
  ScatterChart,
  Gauge,
  Shield,
  Target as TargetIcon,
  Brain as BrainIcon,
  Zap as ZapIcon,
  ArrowLeft,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ScatterChart as RechartsScatterChart,
  Scatter,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { type Holding } from '@/lib/risk-calculations'
import { 
  calculatePortfolioMetrics, 
  runMonteCarloSimulation, 
  performRiskClustering,
  calculateCorrelationMatrix,
  calculateEfficientFrontier,
  type PortfolioMetrics,
  type MonteCarloResult,
  type RiskCluster
} from '@/lib/quantitative-models'
import { 
  analyzeInvestorPersonality, 
  generateRecommendations,
  performAdvancedRiskClustering,
  type InvestorPersonality,
  type Recommendation
} from '@/lib/machine-learning'

// Mock data for Indian markets
const mockHoldings: Holding[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', quantity: 100, current_price: 2500, total_value: 250000, sector: 'Oil & Gas' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', quantity: 50, current_price: 3500, total_value: 175000, sector: 'IT' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', quantity: 200, current_price: 1600, total_value: 320000, sector: 'Banking' },
  { symbol: 'INFY', name: 'Infosys Ltd.', quantity: 150, current_price: 1400, total_value: 210000, sector: 'IT' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', quantity: 100, current_price: 900, total_value: 90000, sector: 'Banking' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', quantity: 80, current_price: 2400, total_value: 192000, sector: 'FMCG' },
  { symbol: 'ITC', name: 'ITC Ltd.', quantity: 200, current_price: 400, total_value: 80000, sector: 'FMCG' },
  { symbol: 'SBIN', name: 'State Bank of India', quantity: 300, current_price: 600, total_value: 180000, sector: 'Banking' },
]

const COLORS = ['#0a0a0a', '#6c757d', '#adb5bd', '#dee2e6', '#f8f9fa', '#e9ecef', '#495057', '#343a40']

// Helper function to format numbers consistently for INR
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`
}

export default function QuantitativeAnalysis() {
  const [holdings, setHoldings] = useState<Holding[]>(mockHoldings)
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloResult | null>(null)
  const [riskClusters, setRiskClusters] = useState<RiskCluster[]>([])
  const [personality, setPersonality] = useState<InvestorPersonality | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [correlationMatrix, setCorrelationMatrix] = useState<{ matrix: number[][], symbols: string[] } | null>(null)
  const [efficientFrontier, setEfficientFrontier] = useState<Array<{ risk: number, return: number }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    mpt: false,
    var: false,
    monteCarlo: false,
    ml: false,
    correlation: false
  })

  useEffect(() => {
    calculateAllMetrics()
  }, [holdings])

  const calculateAllMetrics = async () => {
    setIsLoading(true)
    
    try {
      // Calculate Modern Portfolio Theory metrics
      const portfolioMetrics = calculatePortfolioMetrics(holdings)
      setMetrics(portfolioMetrics)
      
      // Run Monte Carlo simulation
      const mcResult = runMonteCarloSimulation(holdings, 252, 5000) // 1 year, 5000 scenarios
      setMonteCarloResult(mcResult)
      
      // Perform risk clustering
      const clusters = performRiskClustering(holdings)
      setRiskClusters(clusters)
      
      // Analyze investor personality
      const personalityAnalysis = analyzeInvestorPersonality(holdings, portfolioMetrics)
      setPersonality(personalityAnalysis)
      
      // Generate recommendations
      const recs = generateRecommendations(holdings, portfolioMetrics, personalityAnalysis)
      setRecommendations(recs)
      
      // Calculate correlation matrix
      const corrMatrix = calculateCorrelationMatrix(holdings)
      setCorrelationMatrix(corrMatrix)
      
      // Calculate efficient frontier
      const frontier = calculateEfficientFrontier(holdings)
      setEfficientFrontier(frontier)
      
    } catch (error) {
      console.error('Error calculating metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMetricColor = (value: number, threshold: number, reverse: boolean = false): string => {
    if (reverse) {
      return value > threshold ? 'text-green-600' : 'text-red-600'
    }
    return value > threshold ? 'text-red-600' : 'text-green-600'
  }

  const getMetricBgColor = (value: number, threshold: number, reverse: boolean = false): string => {
    if (reverse) {
      return value > threshold ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
    }
    return value > threshold ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-black dark:text-white">Calculating advanced metrics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                onClick={() => window.history.back()}
                variant="ghost"
                size="sm"
                className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-black dark:text-white">Quantitative Analysis</h1>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Advanced Financial Models & ML Insights</p>
              </div>
            </div>
            
            <Button
              onClick={calculateAllMetrics}
              disabled={isLoading}
              size="sm"
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
            >
              <Zap className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Recalculate</span>
              <span className="sm:hidden">Calc</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs defaultValue="mpt" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 w-full sm:w-auto overflow-x-auto">
              <TabsTrigger value="mpt" className="text-black dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                <TargetIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">MPT</span>
                <span className="sm:hidden">MPT</span>
              </TabsTrigger>
              <TabsTrigger value="var" className="text-black dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">VaR</span>
                <span className="sm:hidden">VaR</span>
              </TabsTrigger>
              <TabsTrigger value="monte-carlo" className="text-black dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Monte Carlo</span>
                <span className="sm:hidden">MC</span>
              </TabsTrigger>
              <TabsTrigger value="ml" className="text-black dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                <BrainIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">ML</span>
                <span className="sm:hidden">ML</span>
              </TabsTrigger>
              <TabsTrigger value="correlation" className="text-black dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                <PieChart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Correlation</span>
                <span className="sm:hidden">Corr</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Modern Portfolio Theory */}
          <TabsContent value="mpt" className="space-y-6">
            {/* Description Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-black dark:text-white">Modern Portfolio Theory (MPT)</h3>
                  </div>
                  <Button
                    onClick={() => toggleSection('mpt')}
                    variant="ghost"
                    size="sm"
                    className="text-black dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    {expandedSections.mpt ? (
                      <>
                        <span className="hidden sm:inline mr-2">Show Less</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline mr-2">Know More</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
                
                {expandedSections.mpt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <p className="text-black dark:text-white text-sm leading-relaxed">
                      Modern Portfolio Theory, developed by Harry Markowitz in 1952, is the foundation of modern investment management. 
                      It demonstrates how investors can construct optimal portfolios that maximize expected return for a given level of risk, 
                      or minimize risk for a given level of expected return. The key insight is that portfolio risk depends not just on 
                      individual asset risks, but also on how assets move together (correlation).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium text-black dark:text-white mb-1">Key Benefits:</p>
                        <ul className="text-black dark:text-white space-y-1">
                          <li>• Optimize risk-return trade-offs</li>
                          <li>• Reduce portfolio volatility through diversification</li>
                          <li>• Identify efficient investment combinations</li>
                          <li>• Make informed asset allocation decisions</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-black dark:text-white mb-1">How to Use:</p>
                        <ul className="text-black dark:text-white space-y-1">
                          <li>• Compare your portfolio to the efficient frontier</li>
                          <li>• Identify opportunities to improve risk-adjusted returns</li>
                          <li>• Understand your portfolio&apos;s risk characteristics</li>
                          <li>• Plan rebalancing strategies</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Portfolio Metrics */}
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Portfolio Metrics</CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metrics && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Expected Return</p>
                          <p className={`text-lg font-bold ${getMetricColor(metrics.expectedReturn, 0.12, true)}`}>
                            {formatPercentage(metrics.expectedReturn)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Volatility</p>
                          <p className={`text-lg font-bold ${getMetricColor(metrics.volatility, 0.20)}`}>
                            {formatPercentage(metrics.volatility)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Sharpe Ratio</p>
                          <p className={`text-lg font-bold ${getMetricColor(metrics.sharpeRatio, 1.0, true)}`}>
                            {metrics.sharpeRatio.toFixed(3)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Beta</p>
                          <p className={`text-lg font-bold ${getMetricColor(metrics.beta, 1.2)}`}>
                            {metrics.beta.toFixed(3)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Information Ratio</p>
                          <p className={`text-lg font-bold ${getMetricColor(metrics.informationRatio, 0.5, true)}`}>
                            {metrics.informationRatio.toFixed(3)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Treynor Ratio</p>
                          <p className={`text-lg font-bold ${getMetricColor(metrics.treynorRatio, 0.1, true)}`}>
                            {metrics.treynorRatio.toFixed(3)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Efficient Frontier */}
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Efficient Frontier</CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">Risk-return optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsScatterChart data={efficientFrontier}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="risk" 
                        stroke="#6b7280"
                        tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          color: '#111827'
                        }}
                        formatter={(value: number, name: string) => [
                          `${(value * 100).toFixed(2)}%`, 
                          name === 'return' ? 'Expected Return' : 'Risk'
                        ]}
                        labelFormatter={(label) => `Risk: ${(label * 100).toFixed(2)}%`}
                      />
                      <Scatter dataKey="return" fill="#0a0a0a" />
                    </RechartsScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* VaR & Risk Metrics */}
          <TabsContent value="var" className="space-y-6">
            {/* Description Card */}
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-black dark:text-white">Value at Risk (VaR) & Risk Metrics</h3>
                  </div>
                  <Button
                    onClick={() => toggleSection('var')}
                    variant="ghost"
                    size="sm"
                    className="text-black dark:text-white hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    {expandedSections.var ? (
                      <>
                        <span className="hidden sm:inline mr-2">Show Less</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline mr-2">Know More</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
                
                {expandedSections.var && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <p className="text-black dark:text-white text-sm leading-relaxed">
                      Value at Risk (VaR) is a statistical measure that quantifies the maximum potential loss of a portfolio over a 
                      specific time period with a given confidence level. It helps investors understand their downside risk and set 
                      appropriate risk limits. Our analysis includes multiple risk metrics to provide a comprehensive view of portfolio risk.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium text-black dark:text-white mb-1">Risk Metrics Explained:</p>
                        <ul className="text-black dark:text-white space-y-1">
                          <li>• <strong>VaR (95%)</strong>: Maximum daily loss with 95% confidence</li>
                          <li>• <strong>VaR (99%)</strong>: Extreme loss scenarios with 99% confidence</li>
                          <li>• <strong>Max Drawdown</strong>: Historical worst-case decline</li>
                          <li>• <strong>Risk Decomposition</strong>: Breakdown of risk sources</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-black dark:text-white mb-1">Practical Applications:</p>
                        <ul className="text-black dark:text-white space-y-1">
                          <li>• Set stop-loss levels and risk limits</li>
                          <li>• Assess portfolio resilience to market stress</li>
                          <li>• Compare risk across different portfolios</li>
                          <li>• Plan for worst-case scenarios</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* VaR Analysis */}
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Value at Risk (VaR)</CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">Portfolio downside risk analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metrics && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg ${getMetricBgColor(metrics.var95, -0.05)}`}>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">VaR (95%)</p>
                          <p className={`text-lg font-bold ${getMetricColor(metrics.var95, -0.05)}`}>
                            {formatPercentage(Math.abs(metrics.var95))}
                          </p>
                          <p className="text-xs text-neutral-500">Daily loss limit</p>
                        </div>
                        <div className={`p-4 rounded-lg ${getMetricBgColor(metrics.var99, -0.08)}`}>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">VaR (99%)</p>
                          <p className={`text-lg font-bold ${getMetricColor(metrics.var99, -0.08)}`}>
                            {formatPercentage(Math.abs(metrics.var99))}
                          </p>
                          <p className="text-xs text-neutral-500">Extreme loss limit</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Maximum Drawdown</p>
                        <Progress value={metrics.maxDrawdown * 100} className="mb-2" />
                        <p className="text-sm font-medium">{formatPercentage(metrics.maxDrawdown)}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Risk Decomposition */}
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Risk Decomposition</CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">Breakdown of portfolio risk factors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'Market Risk', value: metrics?.correlation || 0 },
                      { name: 'Concentration', value: Math.max(...holdings.map(h => h.total_value / holdings.reduce((sum, h) => sum + h.total_value, 0))) },
                      { name: 'Sector Risk', value: 1 - (new Set(holdings.map(h => h.sector)).size / holdings.length) },
                      { name: 'Volatility', value: metrics?.volatility || 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          color: '#111827'
                        }}
                        formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Risk Contribution']}
                      />
                      <Bar dataKey="value" fill="#0a0a0a" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monte Carlo Simulation */}
          <TabsContent value="monte-carlo" className="space-y-6">
            {/* Description Card */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-black dark:text-white">Monte Carlo Simulation</h3>
                  </div>
                  <Button
                    onClick={() => toggleSection('var')}
                    variant="ghost"
                    size="sm"
                    className="text-black dark:text-white hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    {expandedSections.var ? (
                      <>
                        <span className="hidden sm:inline mr-2">Show Less</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline mr-2">Know More</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
                
                {expandedSections.var && (
                <div className="flex items-start space-x-3">
                  {/* <Activity className="w-5 h-5 text-purple-600 mt-0.5" /> */}
                  <div>
                    {/* <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Monte Carlo Simulation</h3> */}
                    <p className="text-purple-800 dark:text-purple-200 text-sm leading-relaxed">
                      Monte Carlo simulation is a powerful computational technique that uses random sampling to model the probability 
                      of different outcomes. By running thousands of scenarios with varying market conditions, it provides a comprehensive 
                      view of potential portfolio performance and helps quantify uncertainty in investment decisions.
                    </p>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium text-purple-900 dark:text-purple-100 mb-1">Simulation Details:</p>
                        <ul className="text-purple-800 dark:text-purple-200 space-y-1">
                          <li>• <strong>10,000 Scenarios</strong>: Comprehensive probability analysis</li>
                          <li>• <strong>1-Year Horizon</strong>: Medium-term investment planning</li>
                          <li>• <strong>Realistic Assumptions</strong>: Based on historical market data</li>
                          <li>• <strong>Percentile Analysis</strong>: P5, P25, P50, P75, P95 outcomes</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-purple-900 dark:text-purple-100 mb-1">Investment Insights:</p>
                        <ul className="text-purple-800 dark:text-purple-200 space-y-1">
                          <li>• Understand probability of different outcomes</li>
                          <li>• Plan for various market scenarios</li>
                          <li>• Set realistic return expectations</li>
                          <li>• Assess portfolio resilience</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monte Carlo Results */}
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Monte Carlo Simulation</CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">10,000 scenarios over 1 year</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {monteCarloResult && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Expected Value</p>
                          <p className="text-lg font-bold text-black dark:text-white">
                            {formatCurrency(monteCarloResult.expectedValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Worst Case (5%)</p>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(monteCarloResult.percentiles.p5)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Best Case (95%)</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(monteCarloResult.percentiles.p95)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Median (50%)</p>
                          <p className="text-lg font-bold text-black dark:text-white">
                            {formatCurrency(monteCarloResult.percentiles.p50)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Monte Carlo Distribution */}
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Portfolio Value Distribution</CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">Probability distribution of outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monteCarloResult ? [
                      { percentile: '5%', value: monteCarloResult.percentiles.p5 },
                      { percentile: '25%', value: monteCarloResult.percentiles.p25 },
                      { percentile: '50%', value: monteCarloResult.percentiles.p50 },
                      { percentile: '75%', value: monteCarloResult.percentiles.p75 },
                      { percentile: '95%', value: monteCarloResult.percentiles.p95 },
                    ] : []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="percentile" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          color: '#111827'
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#0a0a0a" fill="#0a0a0a" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Machine Learning */}
          <TabsContent value="ml" className="space-y-6">
            {/* Description Card */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-black dark:text-white">Machine Learning</h3>
                  </div>
                  <Button
                    onClick={() => toggleSection('var')}
                    variant="ghost"
                    size="sm"
                    className="text-black dark:text-white hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    {expandedSections.var ? (
                      <>
                        <span className="hidden sm:inline mr-2">Show Less</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline mr-2">Know More</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
                
                {expandedSections.var && (
                <div className="flex items-start space-x-3">
                  {/* <Brain className="w-5 h-5 text-green-600 mt-0.5" /> */}
                  <div>
                    {/* <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Machine Learning Insights</h3> */}
                    <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
                      Our advanced machine learning algorithms analyze your portfolio characteristics to provide personalized insights 
                      about your investment personality, risk preferences, and behavioral patterns. These AI-powered recommendations 
                      help you make more informed investment decisions based on your unique profile.
                    </p>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100 mb-1">ML Features:</p>
                        <ul className="text-green-800 dark:text-green-200 space-y-1">
                          <li>• <strong>Personality Profiling</strong>: Investment style analysis</li>
                          <li>• <strong>Risk Clustering</strong>: Portfolio segmentation</li>
                          <li>• <strong>Behavioral Analysis</strong>: Investment pattern recognition</li>
                          <li>• <strong>Smart Recommendations</strong>: AI-powered suggestions</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100 mb-1">Benefits:</p>
                        <ul className="text-green-800 dark:text-green-200 space-y-1">
                          <li>• Understand your investment psychology</li>
                          <li>• Identify behavioral biases</li>
                          <li>• Get personalized portfolio advice</li>
                          <li>• Improve decision-making process</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Investor Personality */}
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Investor Personality Analysis</CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">ML-powered behavioral insights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {personality && (
                    <>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${
                          personality.type === 'Conservative' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          personality.type === 'Moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        } border-0`}>
                          {personality.type}
                        </Badge>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          Confidence: {(personality.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Risk Tolerance</p>
                        <Progress value={personality.riskTolerance * 100} className="mb-2" />
                        <p className="text-sm font-medium">{(personality.riskTolerance * 100).toFixed(1)}%</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Investment Horizon</p>
                        <Badge variant="outline" className="border-neutral-300 dark:border-neutral-700">
                          {personality.investmentHorizon} Term
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Preferred Sectors</p>
                        <div className="flex flex-wrap gap-1">
                          {personality.preferredSectors.map((sector, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Characteristics</p>
                        <ul className="text-sm space-y-1">
                          {personality.characteristics.slice(0, 3).map((char, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>{char}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Risk Clusters */}
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Risk Clusters</CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">ML-based portfolio segmentation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {riskClusters.map((cluster, index) => (
                    <div key={cluster.id} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-black dark:text-white">{cluster.name}</h4>
                        <Badge className={`${
                          cluster.riskLevel === 'Low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          cluster.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        } border-0`}>
                          {cluster.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        {cluster.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {cluster.holdings.slice(0, 3).map((holding, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {holding}
                          </Badge>
                        ))}
                        {cluster.holdings.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{cluster.holdings.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Advanced Recommendations */}
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">ML-Powered Recommendations</CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">AI-generated portfolio optimization suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                                      {recommendations.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-black dark:text-white">{rec.title}</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{rec.description}</p>
                        </div>
                        <Badge className={`${
                          rec.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        } border-0`}>
                          {rec.priority}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">Risk Impact</p>
                          <p className={`text-sm font-medium ${rec.expectedImpact.risk > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {rec.expectedImpact.risk > 0 ? '+' : ''}{(rec.expectedImpact.risk * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">Return Impact</p>
                          <p className={`text-sm font-medium ${rec.expectedImpact.return > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {rec.expectedImpact.return > 0 ? '+' : ''}{(rec.expectedImpact.return * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">Diversification</p>
                          <p className="text-sm font-medium text-green-600">
                            +{(rec.expectedImpact.diversification * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {rec.actions.map((action, idx) => (
                          <div key={idx} className="text-sm">
                            <p className="font-medium text-black dark:text-white">{action.action}</p>
                            <p className="text-neutral-600 dark:text-neutral-400">{action.rationale}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Correlation Analysis */}
          <TabsContent value="correlation" className="space-y-6">
            {/* Description Card */}
            <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <PieChart className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-black dark:text-white">Correlation Analysis</h3>
                  </div>
                  <Button
                    onClick={() => toggleSection('var')}
                    variant="ghost"
                    size="sm"
                    className="text-black dark:text-white hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    {expandedSections.var ? (
                      <>
                        <span className="hidden sm:inline mr-2">Show Less</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline mr-2">Know More</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
                
                {expandedSections.var && (
                <div className="flex items-start space-x-3">
                  {/* <PieChart className="w-5 h-5 text-amber-600 mt-0.5" /> */}
                  <div>
                    {/* <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Correlation Analysis</h3> */}
                    <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                      Correlation analysis measures how different stocks in your portfolio move together. Understanding these relationships 
                      is crucial for effective diversification. Stocks with high correlation provide less diversification benefits, 
                      while low correlation can help reduce portfolio volatility.
                    </p>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">Correlation Interpretation:</p>
                        <ul className="text-amber-800 dark:text-amber-200 space-y-1">
                          <li>• <strong>1.0</strong>: Perfect positive correlation (same stock)</li>
                          <li>• <strong>0.7-1.0</strong>: High correlation (similar movement)</li>
                          <li>• <strong>0.3-0.7</strong>: Moderate correlation</li>
                          <li>• <strong>0.0-0.3</strong>: Low correlation (good diversification)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">Diversification Benefits:</p>
                        <ul className="text-amber-800 dark:text-amber-200 space-y-1">
                          <li>• Reduce portfolio volatility</li>
                          <li>• Improve risk-adjusted returns</li>
                          <li>• Identify over-concentrated positions</li>
                          <li>• Optimize sector allocation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Correlation Matrix</CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">Stock correlation heatmap</CardDescription>
              </CardHeader>
              <CardContent>
                {correlationMatrix && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left p-2"></th>
                          {correlationMatrix.symbols.map(symbol => (
                            <th key={symbol} className="p-2 text-center font-medium text-black dark:text-white">
                              {symbol}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {correlationMatrix.matrix.map((row, i) => (
                          <tr key={i}>
                            <td className="p-2 font-medium text-black dark:text-white">
                              {correlationMatrix.symbols[i]}
                            </td>
                            {row.map((value, j) => (
                              <td key={j} className="p-2 text-center">
                                <div 
                                  className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                                    value === 1 ? 'bg-black text-white dark:bg-white dark:text-black' :
                                    value > 0.7 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    value > 0.4 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  }`}
                                >
                                  {value.toFixed(2)}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 