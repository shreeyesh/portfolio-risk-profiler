# RiskProfiler - Indian Portfolio Risk Analysis Platform

A comprehensive portfolio risk analysis platform built with Next.js, TypeScript, and Supabase, specifically designed for Indian markets. This application helps Indian investors understand their portfolio risk through advanced analytics, sector analysis, and personalized recommendations. Connect your Zerodha or Robinhood accounts to automatically sync your portfolio data.

## 🚀 Features

### Risk Analysis
- **Multi-factor Risk Scoring**: Advanced algorithm calculating risk score (0-100) based on concentration, sector allocation, and diversification
- **Risk Profiling**: Determines risk appetite (Conservative/Moderate/Aggressive) and investment personality
- **Concentration Analysis**: Identifies high-risk individual holdings and sector concentrations
- **Herfindahl Index**: Calculates portfolio concentration using industry-standard metrics

### Portfolio Management
- **Real-time Sync**: Connect Zerodha Kite or Robinhood accounts for automatic portfolio updates
- **Sector Analysis**: Visual breakdown of sector allocation with concentration warnings
- **Holdings Overview**: Detailed view of individual positions with risk indicators
- **Performance Tracking**: Monitor portfolio performance and risk trends over time

### Investment Personality Types
- **Balanced Diversifier (Conservative)**: Well-diversified, low-risk portfolio
- **Growth-Oriented Investor (Moderate)**: Moderate concentration, growth-focused
- **High-Risk Concentrator (Aggressive)**: High concentration, aggressive positioning

### Visual Analytics
- **Interactive Charts**: Beautiful charts using Recharts for data visualization
- **Risk Dashboard**: Color-coded risk meters and alerts
- **Sector Breakdown**: Pie charts and detailed sector analysis
- **Portfolio Metrics**: Comprehensive overview of key metrics

### Personalized Recommendations
- **Dynamic Suggestions**: AI-powered recommendations based on risk analysis
- **Actionable Advice**: Specific steps for portfolio optimization
- **Risk Mitigation**: Strategies to reduce portfolio risk
- **Diversification Tips**: Suggestions for better sector allocation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with custom theming
- **Animations**: Framer Motion for smooth, engaging animations
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **APIs**: Zerodha Kite Connect API, Robinhood API
- **State Management**: React hooks and context

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd risk-profiler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration (Required)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # Zerodha API Configuration (Required for Zerodha integration)
   NEXT_PUBLIC_ZERODHA_API_KEY=your_zerodha_api_key
   ZERODHA_API_SECRET=your_zerodha_api_secret
   
   # Robinhood API Configuration (Required for Robinhood integration)
   NEXT_PUBLIC_ROBINHOOD_CLIENT_ID=your_robinhood_client_id
   ROBINHOOD_CLIENT_SECRET=your_robinhood_client_secret
   ROBINHOOD_REDIRECT_URI=http://localhost:3000/api/auth/robinhood/callback
   ```

4. **Set up Supabase Database**
   
   Create a new Supabase project and run the following SQL to create the required tables:

   ```sql
   -- Create portfolios table
   CREATE TABLE portfolios (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     total_value DECIMAL(15,2) DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create holdings table
   CREATE TABLE holdings (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
     symbol TEXT NOT NULL,
     name TEXT NOT NULL,
     quantity INTEGER NOT NULL,
     current_price DECIMAL(10,2) NOT NULL,
     total_value DECIMAL(15,2) NOT NULL,
     sector TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create risk_scores table
   CREATE TABLE risk_scores (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
     overall_score INTEGER NOT NULL,
     concentration_score INTEGER NOT NULL,
     sector_score INTEGER NOT NULL,
     diversification_score INTEGER NOT NULL,
     risk_profile TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create api_connections table
   CREATE TABLE api_connections (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     platform TEXT NOT NULL,
     access_token TEXT NOT NULL,
     refresh_token TEXT NOT NULL,
     expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
   ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
   ALTER TABLE api_connections ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   CREATE POLICY "Users can view own portfolios" ON portfolios
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own portfolios" ON portfolios
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own portfolios" ON portfolios
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own portfolios" ON portfolios
     FOR DELETE USING (auth.uid() = user_id);

   -- Similar policies for other tables...
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Update your `.env.local` file with these values

### Zerodha API Setup (Optional)
1. Create a Zerodha developer account
2. Generate API credentials from the Zerodha developer console
3. Add your API key and secret to `.env.local`

### Robinhood API Setup (Optional)
1. Create a Robinhood developer account
2. Generate OAuth credentials
3. Add your client ID and secret to `.env.local`

## 📱 Usage

### Getting Started
1. **Sign Up**: Create a new account with your email
2. **Connect Brokerage**: Link your Zerodha or Robinhood account in Settings
3. **View Analysis**: Your portfolio risk analysis will appear on the dashboard
4. **Explore Features**: Use the tabs to explore different aspects of your portfolio

### Dashboard Features
- **Overview**: Risk score breakdown and sector allocation charts
- **Sector Analysis**: Detailed sector breakdown with concentration warnings
- **Holdings**: Individual stock positions with risk indicators
- **Recommendations**: Personalized suggestions for portfolio optimization

### Risk Scoring
The platform calculates risk based on:
- **Concentration Risk**: Individual holdings >10% of portfolio
- **Sector Risk**: Herfindahl Index for sector concentration
- **Diversification Risk**: Number of unique sectors and holdings

## 🎨 Customization

### Styling
The app uses Tailwind CSS with a custom dark theme. You can customize colors and styling in:
- `app/globals.css` - Global styles and CSS variables
- `components.json` - shadcn/ui configuration

### Components
All UI components are built with shadcn/ui and can be customized in the `components/ui/` directory.

### Risk Algorithm
The risk calculation algorithm can be modified in `lib/risk-calculations.ts` to adjust:
- Risk thresholds
- Scoring weights
- Risk factors

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Roadmap

- [ ] Real-time market data integration
- [ ] Advanced portfolio backtesting
- [ ] Mobile app development
- [ ] Social features and portfolio sharing
- [ ] AI-powered investment recommendations
- [ ] Integration with more brokerage platforms
- [ ] Advanced risk modeling and stress testing

---

Built with ❤️ using Next.js, TypeScript, and shadcn/ui
