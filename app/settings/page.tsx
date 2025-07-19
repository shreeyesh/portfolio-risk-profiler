'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Settings, 
  Link, 
  Unlink, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Key,
  User,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [zerodhaConnected, setZerodhaConnected] = useState(false)
  const [robinhoodConnected, setRobinhoodConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        // Check existing connections
        await checkConnections()
      }
    }
    getUser()
  }, [router])

  const checkConnections = async () => {
    try {
      const { data: connections } = await supabase
        .from('api_connections')
        .select('*')
        .eq('user_id', user?.id)

      if (connections) {
        setZerodhaConnected(connections.some(c => c.platform === 'zerodha'))
        setRobinhoodConnected(connections.some(c => c.platform === 'robinhood'))
      }
    } catch (error) {
      console.error('Error checking connections:', error)
    }
  }

  const connectZerodha = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would redirect to Zerodha's OAuth
      // For now, we'll simulate the connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Save connection to database
      const { error } = await supabase
        .from('api_connections')
        .insert({
          user_id: user.id,
          platform: 'zerodha',
          access_token: 'mock_token',
          refresh_token: 'mock_refresh',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })

      if (!error) {
        setZerodhaConnected(true)
      }
    } catch (error) {
      console.error('Error connecting Zerodha:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectRobinhood = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would redirect to Robinhood's OAuth
      // For now, we'll simulate the connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Save connection to database
      const { error } = await supabase
        .from('api_connections')
        .insert({
          user_id: user.id,
          platform: 'robinhood',
          access_token: 'mock_token',
          refresh_token: 'mock_refresh',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })

      if (!error) {
        setRobinhoodConnected(true)
      }
    } catch (error) {
      console.error('Error connecting Robinhood:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectAccount = async (platform: string) => {
    try {
      const { error } = await supabase
        .from('api_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', platform)

      if (!error) {
        if (platform === 'zerodha') {
          setZerodhaConnected(false)
        } else if (platform === 'robinhood') {
          setRobinhoodConnected(false)
        }
      }
    } catch (error) {
      console.error('Error disconnecting account:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Settings</h1>
                <p className="text-sm text-gray-400">Manage your account and connections</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList className="bg-white/5 backdrop-blur-sm border-white/10">
            <TabsTrigger value="connections" className="text-white data-[state=active]:bg-purple-500">
              Brokerage Connections
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-purple-500">
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="text-white data-[state=active]:bg-purple-500">
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-white">
                <CardHeader>
                  <CardTitle>Connect Your Brokerage Accounts</CardTitle>
                  <CardDescription className="text-gray-300">
                    Link your Zerodha or Robinhood accounts to automatically sync your portfolio data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Zerodha Connection */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Key className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Zerodha Kite</h3>
                        <p className="text-sm text-gray-400">Connect your Zerodha trading account</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {zerodhaConnected ? (
                        <>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disconnectAccount('zerodha')}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Unlink className="w-4 h-4 mr-2" />
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={connectZerodha}
                          disabled={isLoading}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          <Link className="w-4 h-4 mr-2" />
                          {isLoading ? 'Connecting...' : 'Connect'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Robinhood Connection */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                        <Key className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Robinhood</h3>
                        <p className="text-sm text-gray-400">Connect your Robinhood trading account</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {robinhoodConnected ? (
                        <>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disconnectAccount('robinhood')}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Unlink className="w-4 h-4 mr-2" />
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={connectRobinhood}
                          disabled={isLoading}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Link className="w-4 h-4 mr-2" />
                          {isLoading ? 'Connecting...' : 'Connect'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Connection Status */}
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-400">Connection Status</h4>
                        <p className="text-sm text-gray-300 mt-1">
                          {zerodhaConnected || robinhoodConnected 
                            ? 'Your portfolio data will be automatically synced every hour. You can manually refresh from the dashboard.'
                            : 'Connect at least one brokerage account to start analyzing your portfolio risk.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-white">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage your account details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        defaultValue={user?.user_metadata?.first_name || ''}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        defaultValue={user?.user_metadata?.last_name || ''}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      defaultValue={user?.email || ''}
                      disabled
                      className="bg-white/5 border-white/20 text-gray-400"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                    Update Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-white">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage your account security and privacy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium">Change Password</h4>
                        <p className="text-sm text-gray-400">Update your account password</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      Change
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-400">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      Enable
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 