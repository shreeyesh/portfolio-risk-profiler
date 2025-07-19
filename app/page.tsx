'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Target, 
  Zap, 
  Globe, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Activity,
  Award,
  Lock,
  Eye,
  PieChart,
  LineChart,
  Brain,
  Calculator,
  BarChart,
  ScatterChart,
  Gauge,
  TrendingDown
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Shield,
    title: 'Institutional-Grade Risk Analysis',
    description: 'Advanced multi-factor risk scoring algorithm used by professional wealth managers'
  },
  {
    icon: BarChart3,
    title: 'Comprehensive Sector Analysis',
    description: 'Deep dive into sector allocation with concentration risk warnings amd figure out the perfect products'
  },
  {
    icon: Target,
    title: 'Personalized Risk Profiling',
    description: 'AI-powered assessment of your investment personality and risk tolerance'
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Portfolio Monitoring',
    description: 'Seamless integration with Zerodha and Robinhood for live portfolio tracking'
  }
]

const stats = [
  { label: 'Portfolio Value Analyzed', value: '$2.5B+', icon: Activity },
  { label: 'Risk Assessments Completed', value: '50K+', icon: BarChart3 },
  { label: 'Accuracy Rate', value: '98.5%', icon: Star },
  { label: 'Institutional Clients', value: '500+', icon: Users }
]

const testimonials = [
  {
    name: "Michael Chen",
    role: "Portfolio Manager",
    company: "BlackRock",
    content: "RiskProfiler provides the most sophisticated risk analysis I've seen. It's become an essential tool for our high-net-worth clients."
  },
  {
    name: "Sarah Johnson",
    role: "Chief Investment Officer",
    company: "Goldman Sachs",
    content: "The platform's ability to identify concentration risks and provide actionable recommendations is exceptional."
  }
]

const quantitativeModels = [
  {
    icon: TrendingUp,
    title: 'Modern Portfolio Theory',
    description: 'Advanced optimization using Markowitz theory to find the efficient frontier and optimal risk-return combinations.',
    color: 'from-blue-500 to-purple-600',
    features: ['Efficient Frontier Analysis', 'Risk-Return Optimization', 'Portfolio Rebalancing']
  },
  {
    icon: TrendingDown,
    title: 'Value at Risk (VaR)',
    description: 'Statistical risk measurement to quantify maximum potential losses with confidence intervals and historical simulation.',
    color: 'from-red-500 to-orange-600',
    features: ['95% & 99% Confidence Levels', 'Historical Simulation', 'Risk Decomposition']
  },
  {
    icon: Activity,
    title: 'Monte Carlo Simulation',
    description: 'Computational technique using random sampling to model portfolio performance under various scenarios.',
    color: 'from-purple-500 to-pink-600',
    features: ['Scenario Analysis', 'Probability Modeling', 'Stress Testing']
  },
  {
    icon: Brain,
    title: 'Machine Learning Insights',
    description: 'AI-powered analysis for personality profiling, clustering, and personalized recommendations.',
    color: 'from-green-500 to-emerald-600',
    features: ['Investor Profiling', 'Risk Clustering', 'Smart Recommendations']
  },
  {
    icon: PieChart,
    title: 'Correlation Analysis',
    description: 'Comprehensive analysis of how different assets move together to optimize diversification.',
    color: 'from-amber-500 to-yellow-600',
    features: ['Asset Correlation', 'Diversification Metrics', 'Sector Analysis']
  },
  {
    icon: BarChart,
    title: 'Advanced Risk Metrics',
    description: 'Professional-grade metrics including Sharpe ratio, Beta, and information ratio calculations.',
    color: 'from-indigo-500 to-blue-600',
    features: ['Sharpe Ratio', 'Beta Analysis', 'Information Ratio']
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-2 sm:space-x-3"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white dark:text-black" />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-black dark:text-white">RiskProfiler</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center space-x-2 sm:space-x-4"
        >
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900">
              <span className="hidden sm:inline">Sign In</span>
              <span className="sm:hidden">Login</span>
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-smooth">
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
            </Button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-900 rounded-full px-4 py-2 mb-8"
          >
            <Award className="w-4 h-4 text-black dark:text-white" />
            <span className="text-sm font-medium text-black dark:text-white">Trusted by 500+ Institutional Clients</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-3xl sm:text-5xl md:text-7xl font-bold text-black dark:text-white mb-6 leading-tight"
          >
            Institutional-Grade
            <span className="block text-neutral-600 dark:text-neutral-400">Portfolio Risk Analysis</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Advanced risk assessment platform designed for high-net-worth individuals and institutional investors. 
            Get professional-grade portfolio analysis with real-time monitoring and AI-powered recommendations.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/signup">
              <Button size="lg" className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-lg px-8 py-6 transition-smooth">
                Start Free Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 text-lg px-8 py-6 transition-smooth">
              <Eye className="w-5 h-5 mr-2" />
              View Demo
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-black dark:text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-black dark:text-white mb-2">{stat.value}</div>
              <div className="text-neutral-600 dark:text-neutral-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20"
      >
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-black dark:text-white mb-4">
            Professional Features for Serious Investors
          </h2>
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Everything you need for comprehensive portfolio risk management and optimization
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.8 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-smooth professional-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-black dark:text-white" />
                  </div>
                  <CardTitle className="text-xl text-black dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quantitative Analysis Models Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.2 }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20"
      >
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 2.4 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full px-4 py-2 mb-6"
          >
            <Calculator className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Advanced Analytics</span>
          </motion.div>
          <h2 className="text-2xl sm:text-4xl font-bold text-black dark:text-white mb-4">
            Professional Quantitative Models
          </h2>
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Access institutional-grade financial models and advanced analytics used by top investment firms worldwide
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {quantitativeModels.map((model, index) => (
            <motion.div
              key={model.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 2.6 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:shadow-xl transition-all duration-300 professional-shadow overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${model.color}`} />
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${model.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <model.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-black dark:text-white">{model.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                    {model.description}
                  </CardDescription>
                  <div className="space-y-2">
                    {model.features.map((feature, featureIndex) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 2.8 + index * 0.1 + featureIndex * 0.05 }}
                        className="flex items-center space-x-2"
                      >
                        <div className={`w-2 h-2 bg-gradient-to-r ${model.color} rounded-full`} />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 3.2 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-20"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black dark:text-white mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            See what top investment professionals say about RiskProfiler
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 2.4 + index * 0.1 }}
            >
              <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mr-4">
                      <span className="text-lg font-semibold text-black dark:text-white">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-black dark:text-white">{testimonial.name}</div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 italic">&ldquo;{testimonial.content}&rdquo;</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 3.6 }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center"
      >
        <Card className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 professional-shadow">
          <CardContent className="p-12">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 3.8 }}
              className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Lock className="w-8 h-8 text-white dark:text-black" />
            </motion.div>
            
            <h3 className="text-3xl font-bold text-black dark:text-white mb-4">
              Bank-Level Security
            </h3>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
              Your financial data is protected with enterprise-grade encryption and security protocols. 
              We never store your brokerage credentials.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                SOC 2 Type II Compliant
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                End-to-End Encryption
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                GDPR Compliant
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 4 }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center"
      >
        <Card className="bg-black dark:bg-white text-white dark:text-black professional-shadow">
          <CardContent className="p-12">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 4.2 }}
              className="w-16 h-16 bg-white dark:bg-black rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Target className="w-8 h-8 text-black dark:text-white" />
            </motion.div>
            
            <h3 className="text-3xl font-bold mb-4">
              Ready to Elevate Your Portfolio Analysis?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of sophisticated investors who trust RiskProfiler for their portfolio risk management.
            </p>
            
            <Link href="/signup">
              <Button size="lg" className="bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 text-lg px-8 py-6 transition-smooth">
                Start Your Free Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 4.4 }}
        className="relative z-10 border-t border-neutral-200 dark:border-neutral-800 mt-20"
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white dark:text-black" />
              </div>
              <span className="text-xl font-bold text-black dark:text-white">RiskProfiler</span>
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 text-sm">
              © 2024 RiskProfiler. All rights reserved.
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
