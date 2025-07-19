'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  TrendingUp, 
  BarChart3, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
  Settings,
  LogOut,
  User,
  DollarSign,
  PieChart as PieChartIcon,
  Activity,
  Link,
  ExternalLink,
  Calculator
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { calculateRiskScore, calculateSectorAllocation, getRiskColor, getRiskBgColor, getRiskBorderColor, getRecommendations, type Holding } from '@/lib/risk-calculations'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { syncPortfolioFromZerodha, syncPortfolioFromRobinhood, getLatestPortfolio } from '@/lib/portfolio-sync'

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

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-IN').format(value)
}

export default function Dashboard() {
  const [holdings, setHoldings] = useState<Holding[]>(mockHoldings)
  const [riskScore, setRiskScore] = useState(calculateRiskScore(mockHoldings))
  const [sectorAllocation, setSectorAllocation] = useState(calculateSectorAllocation(mockHoldings))
  const [recommendations, setRecommendations] = useState(getRecommendations(riskScore, holdings))
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedProviders, setConnectedProviders] = useState<{zerodha: boolean, robinhood: boolean}>({
    zerodha: false,
    robinhood: false
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)
  const [showErrorMessage, setShowErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user.email ? { id: user.id, email: user.email } : null)
        // Check if user has connected providers
        const { data: connections } = await supabase
          .from('api_connections')
          .select('*')
          .eq('user_id', user.id)
        if (connections) {
          setConnectedProviders({
            zerodha: connections.some(c => c.provider === 'zerodha' && c.is_active),
            robinhood: connections.some(c => c.provider === 'robinhood' && c.is_active)
          })
        }
      }
    }
    getUser()

    // Check for OAuth callback messages
    const urlParams = new URLSearchParams(window.location.search)
    const connected = urlParams.get('connected')
    const error = urlParams.get('error')

    if (connected) {
      setShowSuccessMessage(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`)
      setTimeout(() => setShowSuccessMessage(null), 5000)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (error) {
      setShowErrorMessage('Failed to connect. Please try again.')
      setTimeout(() => setShowErrorMessage(null), 5000)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const refreshPortfolio = async () => {
    setIsLoading(true)
    try {
      if (user) {
        // Try to sync from connected providers
        if (connectedProviders.zerodha) {
          try {
            const portfolioData = await syncPortfolioFromZerodha(user.id)
            setHoldings(portfolioData.holdings)
            setRiskScore(calculateRiskScore(portfolioData.holdings))
            setSectorAllocation(calculateSectorAllocation(portfolioData.holdings))
            setRecommendations(getRecommendations(calculateRiskScore(portfolioData.holdings), portfolioData.holdings))
            setShowSuccessMessage('Portfolio synced from Zerodha successfully!')
            setTimeout(() => setShowSuccessMessage(null), 5000)
          } catch (error) {
            console.error('Error syncing from Zerodha:', error)
          }
        } else if (connectedProviders.robinhood) {
          try {
            const portfolioData = await syncPortfolioFromRobinhood(user.id)
            setHoldings(portfolioData.holdings)
            setRiskScore(calculateRiskScore(portfolioData.holdings))
            setSectorAllocation(calculateSectorAllocation(portfolioData.holdings))
            setRecommendations(getRecommendations(calculateRiskScore(portfolioData.holdings), portfolioData.holdings))
            setShowSuccessMessage('Portfolio synced from Robinhood successfully!')
            setTimeout(() => setShowSuccessMessage(null), 5000)
          } catch (error) {
            console.error('Error syncing from Robinhood:', error)
          }
        } else {
          // Load latest portfolio from database
          const portfolioData = await getLatestPortfolio(user.id)
          if (portfolioData) {
            setHoldings(portfolioData.holdings)
            setRiskScore(calculateRiskScore(portfolioData.holdings))
            setSectorAllocation(calculateSectorAllocation(portfolioData.holdings))
            setRecommendations(getRecommendations(calculateRiskScore(portfolioData.holdings), portfolioData.holdings))
            setShowSuccessMessage('Portfolio loaded from database!')
            setTimeout(() => setShowSuccessMessage(null), 5000)
          } else {
            setShowErrorMessage('No portfolio data found. Please connect a brokerage account.')
            setTimeout(() => setShowErrorMessage(null), 5000)
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing portfolio:', error)
      setShowErrorMessage('Failed to refresh portfolio. Please try again.')
      setTimeout(() => setShowErrorMessage(null), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const connectZerodha = async () => {
    setIsConnecting(true)
    try {
      // Redirect to Zerodha OAuth
      const zerodhaAuthUrl = `https://kite.trade/connect/login?api_key=${process.env.NEXT_PUBLIC_ZERODHA_API_KEY}&v=3&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/auth/zerodha/callback`)}`
      window.location.href = zerodhaAuthUrl
    } catch (error) {
      console.error('Error connecting to Zerodha:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const connectRobinhood = async () => {
    setIsConnecting(true)
    try {
      // Redirect to Robinhood OAuth
      const robinhoodAuthUrl = `https://oauth.robinhood.com/authorize?client_id=${process.env.NEXT_PUBLIC_ROBINHOOD_CLIENT_ID}&response_type=code&scope=read&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/auth/robinhood/callback`)}`
      window.location.href = robinhoodAuthUrl
    } catch (error) {
      console.error('Error connecting to Robinhood:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectProvider = async (provider: 'zerodha' | 'robinhood') => {
    if (!user) return;
    try {
      await supabase
        .from('api_connections')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('provider', provider)
      
      setConnectedProviders(prev => ({
        ...prev,
        [provider]: false
      }))

      // Reset to mock data when disconnecting
      setHoldings(mockHoldings)
      setRiskScore(calculateRiskScore(mockHoldings))
      setSectorAllocation(calculateSectorAllocation(mockHoldings))
      setRecommendations(getRecommendations(calculateRiskScore(mockHoldings), mockHoldings))

      setShowSuccessMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} disconnected successfully!`)
      setTimeout(() => setShowSuccessMessage(null), 5000)
    } catch (error) {
      console.error(`Error disconnecting ${provider}:`, error)
      setShowErrorMessage(`Failed to disconnect ${provider}. Please try again.`)
      setTimeout(() => setShowErrorMessage(null), 5000)
    }
  }

  const totalValue = holdings.reduce((sum, holding) => sum + holding.total_value, 0)

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-black dark:text-white">Loading...</div>
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-black dark:text-white">RiskProfiler</h1>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Indian Portfolio Risk Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                onClick={refreshPortfolio}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Sync</span>
              </Button>
              
              <div className="hidden sm:flex items-center space-x-2">
                <User className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-black dark:text-white text-sm">{user?.email}</span>
              </div>
              
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Success/Error Messages */}
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 dark:text-green-200">{showSuccessMessage}</p>
            </div>
          </motion.div>
        )}

        {showErrorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 dark:text-red-200">{showErrorMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Connect Your Brokerage</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                Connect your Zerodha or Robinhood account to automatically sync your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Zerodha Connection */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">Z</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-black dark:text-white">Zerodha</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Indian Markets</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {connectedProviders.zerodha ? (
                      <>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                        <Button
                          onClick={() => disconnectProvider('zerodha')}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={connectZerodha}
                        disabled={isConnecting}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Link className="w-4 h-4 mr-2" />
                        {isConnecting ? 'Connecting...' : 'Connect'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Robinhood Connection */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">R</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-black dark:text-white">Robinhood</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">US Markets</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {connectedProviders.robinhood ? (
                      <>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                        <Button
                          onClick={() => disconnectProvider('robinhood')}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={connectRobinhood}
                        disabled={isConnecting}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Link className="w-4 h-4 mr-2" />
                        {isConnecting ? 'Connecting...' : 'Connect'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Score Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-black dark:text-white">Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black dark:text-white">{formatCurrency(totalValue)}</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{holdings.length} holdings</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-black dark:text-white">Risk Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getRiskColor(riskScore.overall_score)}`}>
                {riskScore.overall_score}/100
              </div>
              <Badge className={`mt-2 ${getRiskBgColor(riskScore.overall_score)} ${getRiskColor(riskScore.overall_score)} border-0`}>
                {riskScore.risk_profile}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-black dark:text-white">Concentration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getRiskColor(riskScore.concentration_score)}`}>
                {riskScore.concentration_score}/100
              </div>
              <Progress value={riskScore.concentration_score} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-black dark:text-white">Diversification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getRiskColor(100 - riskScore.diversification_score)}`}>
                {100 - riskScore.diversification_score}/100
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{new Set(holdings.map(h => h.sector)).size} sectors</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 w-full sm:w-auto overflow-x-auto">
              <TabsTrigger value="overview" className="text-black dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 text-xs sm:text-sm whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="sectors" className="text-black dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 text-xs sm:text-sm whitespace-nowrap">Sectors</TabsTrigger>
              <TabsTrigger value="holdings" className="text-black dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 text-xs sm:text-sm whitespace-nowrap">Holdings</TabsTrigger>
              <TabsTrigger value="recommendations" className="text-black dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 text-xs sm:text-sm whitespace-nowrap">Recs</TabsTrigger>
            </TabsList>
            
            <Button
              onClick={() => router.push('/quantitative')}
              variant="outline"
              size="sm"
              className="border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Advanced Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </Button>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Risk Score Chart */}
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Risk Score Breakdown</CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">Detailed analysis of your portfolio risk factors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'Overall', value: riskScore.overall_score },
                      { name: 'Concentration', value: riskScore.concentration_score },
                      { name: 'Sector', value: riskScore.sector_score },
                      { name: 'Diversification', value: riskScore.diversification_score },
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
                      />
                      <Bar dataKey="value" fill="#0a0a0a" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sector Allocation */}
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Sector Allocation</CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">Distribution across different sectors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sectorAllocation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ sector, percentage }) => `${sector} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sectorAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          color: '#111827'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sectors" className="space-y-4 sm:space-y-6">
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Sector Analysis</CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">Detailed breakdown of sector allocation and risks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sectorAllocation.map((sector, index) => (
                    <div key={sector.sector} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <h3 className="font-medium text-black dark:text-white">{sector.sector}</h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{formatCurrency(sector.value)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-black dark:text-white">{sector.percentage}%</div>
                        {sector.percentage > 25 && (
                          <Badge variant="destructive" className="mt-1">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            High Concentration
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holdings" className="space-y-4 sm:space-y-6">
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Portfolio Holdings</CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">Individual stock positions and their risk contribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {holdings
                    .sort((a, b) => b.total_value - a.total_value)
                    .map((holding) => {
                      const percentage = (holding.total_value / totalValue) * 100
                      const isHighRisk = percentage > 10
                      
                      return (
                        <div key={holding.symbol} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg gap-3">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-white dark:text-black font-bold text-sm sm:text-base">{holding.symbol[0]}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-black dark:text-white text-sm sm:text-base">{holding.symbol}</h3>
                              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 truncate">{holding.name}</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-500">{holding.sector}</p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:text-right gap-1">
                            <div className="font-medium text-black dark:text-white text-sm sm:text-base">{formatCurrency(holding.total_value)}</div>
                            <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">{percentage.toFixed(1)}%</div>
                            {isHighRisk && (
                              <Badge variant="destructive" className="mt-1 text-xs px-2 py-1 w-fit">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">High Concentration</span>
                                <span className="sm:hidden">High Risk</span>
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4 sm:space-y-6">
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Portfolio Recommendations</CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">Personalized suggestions to optimize your portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <p className="text-neutral-700 dark:text-neutral-300">{recommendation}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 