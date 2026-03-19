// src/pages/InfluencerProgram.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Share2, TrendingUp, Award, Users, Ticket, Zap, ChevronRight, Check, Star, Crown, Gift, DollarSign, Target, BarChart3, Smartphone, MessageCircle, Instagram, TrendingUp as TrendingIcon, Percent, Clock, Shield, Wallet, ArrowUpRight, Sparkles } from 'lucide-react';

const LearnMore = () => {
  const [calculator, setCalculator] = useState({
    prizeValue: 5000000,
    numberOfTickets: 50,
    avgTicketValue: 1000
  });

  const handleCalculatorChange = (field, value) => {
    setCalculator(prev => ({
      ...prev,
      [field]: Math.max(0, Number(value) || 0)
    }));
  };

  // Calculate earnings
  const calculateEarnings = () => {
    const totalTicketValue = calculator.numberOfTickets * calculator.avgTicketValue;
    const winBooster = calculator.prizeValue * 0.15; // 15% of prize value
    const ticketBonus = totalTicketValue * 0.05; // 5% of ticket purchases
    const totalPotential = winBooster + ticketBonus;
    
    return {
      winBooster,
      ticketBonus,
      totalPotential,
      totalTicketValue
    };
  };

  const earnings = calculateEarnings();

  // Progress data
  const progressData = {
    referrals: { current: 38, target: 50, label: "Referrals", color: "from-purple-500 to-pink-500" },
    ticketShare: { current: 18, target: 25, label: "Ticket Share %", color: "from-blue-500 to-cyan-500" },
    monthlyEarnings: { current: 250000, target: 500000, label: "Monthly Goal", color: "from-green-500 to-emerald-500" }
  };

  // Badges data
  const badges = [
    { icon: "🥉", name: "Bronze", requirement: "10+ referrals", unlocked: true, bonus: "+2%" },
    { icon: "🥈", name: "Silver", requirement: "25+ referrals", unlocked: true, bonus: "+5%" },
    { icon: "🥇", name: "Gold", requirement: "50+ referrals", unlocked: false, bonus: "+8%" },
    { icon: "👑", name: "Kingmaker", requirement: "Referral wins", unlocked: false, bonus: "+15%" }
  ];

  // Success stories
  const successStories = [
    { name: "Chidinma L.", earnings: "₦850,000", role: "Student, Lagos" },
    { name: "Adebayo K.", earnings: "₦2.1M", role: "Content Creator, Abuja" },
    { name: "Chioma A.", earnings: "₦1.5M", role: "Freelancer, Port Harcourt" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white overflow-x-hidden">
      {/* Hero Section - Compact */}
      <section className="relative py-12 px-4 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-pink-900/30" />
        <div className="relative max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-sm font-bold px-4 py-1.5 rounded-full mb-4 animate-pulse">
            <Sparkles className="w-3 h-3" />
            LIMITED SLOTS: Join first 500 influencers get +5% bonus!
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Turn Your Network Into Cash!
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-6">
            Share. Earn. Repeat. Get <span className="font-bold text-yellow-400">₦750,000+</span> when friends win raffles + <span className="font-bold text-green-400">5%</span> of every ticket they buy!
          </p>
          
          <div className="grid grid-cols-2 sm:flex-row gap-3 mb-8">
            <Link 
              to="/influencers/auth" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl text-base transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/30 flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              GET MY LINK NOW
              <ArrowUpRight className="w-5 h-5" />
            </Link>
            
            <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 font-semibold py-3.5 px-6 rounded-xl text-base transition-all duration-300 flex items-center justify-center gap-2">
              <Smartphone className="w-5 h-5" />
              SEE HOW IT WORKS
            </button>
          </div>

          {/* Stats Row - Compact */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-xl p-3 border border-purple-500/20">
              <div className="text-lg font-bold text-yellow-400">₦1M+</div>
              <div className="text-xs text-gray-300">Per Raffle</div>
            </div>
            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm rounded-xl p-3 border border-blue-500/20">
              <div className="text-lg font-bold text-cyan-400">5%</div>
              <div className="text-xs text-gray-300">Guaranteed</div>
            </div>
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-xl p-3 border border-green-500/20">
              <div className="text-lg font-bold text-green-400">15%</div>
              <div className="text-xs text-gray-300">Win Bonus</div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-y border-purple-500/20 py-3 px-4 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
              </div>
              <span className="font-semibold">1,247+ Nigerians Earning</span>
            </div>
            <div className="hidden sm:block text-gray-300">•</div>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-green-400" />
              <span className="font-semibold">₦45M+ Paid Out</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - Compact */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">4 Steps to Start Earning</h2>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { number: 1, icon: Share2, title: "Get Your Link", desc: "Sign up & get unique referral link", color: "from-purple-600 to-pink-600" },
              { number: 2, icon: Users, title: "Share & Invite", desc: "Share on WhatsApp, IG, TikTok", color: "from-blue-600 to-cyan-600" },
              { number: 3, icon: TrendingUp, title: "They Participate", desc: "Friends join raffles with your link", color: "from-green-600 to-emerald-600" },
              { number: 4, icon: Award, title: "You Get Paid", desc: "Earn bonuses after each draw", color: "from-yellow-600 to-orange-600" }
            ].map((step) => (
              <div key={step.number} className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`bg-gradient-to-r ${step.color} w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`}>
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{step.title}</h3>
                    <p className="text-xs text-gray-400">{step.desc}</p>
                  </div>
                  <step.icon className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Breakdown - Compact */}
      <section className="py-10 px-4 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Dual Income Streams 💰</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Win Booster Card */}
            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-xl p-5 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Win Booster</h3>
                    <p className="text-yellow-400 text-sm font-bold">UP TO 15%</p>
                  </div>
                </div>
                <Percent className="w-5 h-5 text-yellow-400" />
              </div>
              
              <p className="text-sm text-gray-300 mb-4">
                When referral wins: <span className="font-bold text-white">You get 15% of prize!</span>
              </p>
              
              <div className="bg-black/50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-bold">Qualify If:</span>
                </div>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Referrals buy <span className="font-bold">≥25%</span> of tickets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>OR bring <span className="font-bold">≥50 participants</span></span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Ticket Bonus Card */}
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-800/20 rounded-xl p-5 border border-green-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
                    <Ticket className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Ticket Bonus</h3>
                    <p className="text-green-400 text-sm font-bold">5% GUARANTEED</p>
                  </div>
                </div>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              
              <p className="text-sm text-gray-300 mb-4">
                From every ticket purchase: <span className="font-bold text-white">You earn 5% instantly!</span>
              </p>
              
              <div className="bg-black/50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-bold">Always Earn:</span>
                </div>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2">
                    <Star className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Even if they don't win</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>No minimum required</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Total Bonus Banner */}
          <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-xl p-5 border border-purple-500/30">
            <div className="text-center">
              <div className="text-sm text-gray-300 mb-2">🎯 MAXIMUM POTENTIAL PER RAFFLE</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                ₦{earnings.totalPotential.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-2">Fresh earnings every raffle • Weekly payouts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Calculator - Compact */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">💰 Earnings Calculator</h2>
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          
          <p className="text-gray-300 text-sm mb-6">
            Slide to see how much you can earn. Real numbers from real Nigerians!
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calculator Inputs */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl p-5 border border-gray-800">
              <h3 className="font-bold text-lg mb-4">Adjust Your Numbers</h3>
              
              <div className="space-y-6">
                {[
                  {
                    label: "Prize Value",
                    value: calculator.prizeValue,
                    onChange: (val) => handleCalculatorChange('prizeValue', val),
                    min: 100000,
                    max: 10000000,
                    step: 100000,
                    prefix: "₦"
                  },
                  {
                    label: "Number of Tickets Sold",
                    value: calculator.numberOfTickets,
                    onChange: (val) => handleCalculatorChange('numberOfTickets', val),
                    min: 1,
                    max: 500,
                    step: 1,
                    prefix: ""
                  },
                  {
                    label: "Average Ticket Price",
                    value: calculator.avgTicketValue,
                    onChange: (val) => handleCalculatorChange('avgTicketValue', val),
                    min: 100,
                    max: 10000,
                    step: 100,
                    prefix: "₦"
                  }
                ].map((field, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-gray-300">{field.label}</label>
                      <span className="font-bold text-sm">{field.prefix}{field.value.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{field.prefix}{field.min.toLocaleString()}</span>
                      <span>{field.prefix}{field.max.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg">
                <div className="text-sm text-gray-300 mb-2">💡 PRO TIP:</div>
                <p className="text-xs">Share on WhatsApp groups for fastest results. Average Nigerian influencer sells 50+ tickets!</p>
              </div>
            </div>

            {/* Calculator Results */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-xl p-5 border border-purple-500/30">
              <h3 className="font-bold text-lg mb-4">Your Earnings Estimate</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg border border-yellow-500/30">
                  <div>
                    <div className="text-xs text-gray-400">Win Booster (15%)</div>
                    <div className="text-xl font-bold text-yellow-400">₦{earnings.winBooster.toLocaleString()}</div>
                  </div>
                  <div className="text-2xl">🎯</div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg border border-green-500/30">
                  <div>
                    <div className="text-xs text-gray-400">Ticket Bonus (5%)</div>
                    <div className="text-xl font-bold text-green-400">₦{earnings.ticketBonus.toLocaleString()}</div>
                  </div>
                  <div className="text-2xl">💸</div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-lg border border-purple-500/50">
                  <div>
                    <div className="text-xs text-gray-400">TOTAL POTENTIAL</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                      ₦{earnings.totalPotential.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-black/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingIcon className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold">Quick Math:</span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tickets Value:</span>
                    <span>₦{earnings.totalTicketValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prize × 15%:</span>
                    <span className="text-yellow-400">+₦{earnings.winBooster.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tickets × 5%:</span>
                    <span className="text-green-400">+₦{earnings.ticketBonus.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-1 mt-1">
                    <div className="flex justify-between font-bold">
                      <span>YOUR SHARE:</span>
                      <span>₦{earnings.totalPotential.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="mt-8">
            <h3 className="font-bold text-lg mb-4">📊 Real Nigerian Examples</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { prize: "₦3M", tickets: "30", avg: "₦1,500", total: "₦630,000", emoji: "😊" },
                { prize: "₦5M", tickets: "50", avg: "₦2,000", total: "₦1,250,000", emoji: "🔥" },
                { prize: "₦10M", tickets: "100", avg: "₦2,500", total: "₦3,000,000", emoji: "🚀" }
              ].map((example, index) => (
                <div key={index} className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">{example.emoji} Example</span>
                    <span className="text-xs text-gray-400">Weekly</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">Prize: {example.prize} • Tickets: {example.tickets}</div>
                  <div className="text-lg font-bold text-white">{example.total}</div>
                  <div className="text-xs text-gray-400">Potential Earnings</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories - Compact */}
      <section className="py-10 px-4 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">🇳🇬 Nigerians Like You Are Earning</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold">
                    {story.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">{story.name}</div>
                    <div className="text-xs text-gray-400">{story.role}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-400">{story.earnings}</div>
                <div className="text-xs text-gray-400">Earned Last Month</div>
              </div>
            ))}
          </div>

          {/* Progress & Badges */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">📈 Track Your Progress</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {Object.entries(progressData).map(([key, data]) => (
                <div key={key} className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg p-3 border border-gray-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-300">{data.label}</span>
                    <span className="text-xs font-bold">{data.current} / {data.target}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${data.color} rounded-full`}
                      style={{ width: `${(data.current / data.target) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div>
              <h3 className="text-lg font-bold mb-3">🏆 Unlock Bonus Levels</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {badges.map((badge, index) => (
                  <div key={index} className={`rounded-lg p-3 text-center border ${badge.unlocked ? 'bg-gradient-to-b from-yellow-900/20 to-yellow-800/10 border-yellow-500/30' : 'bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800'}`}>
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="font-bold text-sm mb-0.5">{badge.name}</div>
                    <div className="text-xs text-gray-400 mb-1">{badge.requirement}</div>
                    <div className="text-xs font-bold text-green-400">{badge.bonus} Bonus</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Share Platforms */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-5 border border-purple-500/30">
            <h3 className="font-bold text-lg mb-3">📱 Where Nigerians Share Most</h3>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                <Instagram className="w-4 h-4" />
                Instagram
              </button>
              <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.682 10.382v-.002c.108.102.211.21.305.33.455.571.74 1.312.74 2.122 0 .81-.285 1.551-.74 2.122a3.532 3.532 0 01-.305.33c-.455.571-1.075.946-1.774 1.056v2.078a.75.75 0 01-1.5 0v-2.078a3.755 3.755 0 01-1.774-1.056 3.532 3.532 0 01-.305-.33c-.455-.571-.74-1.312-.74-2.122 0-.81.285-1.551.74-2.122.094-.12.197-.228.305-.33.455-.571 1.075-.946 1.774-1.056V6.25a.75.75 0 011.5 0v2.076c.699.11 1.319.485 1.774 1.056zM12 14.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM3.5 12a8.5 8.5 0 1117 0 8.5 8.5 0 01-17 0z" clipRule="evenodd"/>
                </svg>
                TikTok
              </button>
              <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                <Users className="w-4 h-4" />
                Groups
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Compact */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">❓ Quick Questions Answered</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: "Does winner get less money?",
                a: "NO! Winner gets 100% prize. Your bonus is extra money we add."
              },
              {
                q: "Need to buy tickets?",
                a: "NO! Earn purely from referrals. Zero investment needed."
              },
              {
                q: "When do I get paid?",
                a: "After each raffle ends. Instant withdrawals to bank."
              },
              {
                q: "Is this gambling?",
                a: "NO! You earn from sharing, not chance. It's marketing commission."
              },
              {
                q: "Any limits?",
                a: "NO LIMITS! Earn from unlimited raffles simultaneously."
              },
              {
                q: "How to start?",
                a: "Sign up → Get link → Share → Earn. Takes 2 minutes!"
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg p-4 border border-gray-800">
                <div className="flex items-start gap-2 mb-2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    Q
                  </div>
                  <h3 className="font-bold text-sm">{faq.q}</h3>
                </div>
                <p className="text-sm text-gray-300 ml-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Compact */}
      <section className="py-12 px-4 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-blue-900/30 rounded-2xl p-8 border border-purple-500/20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-sm font-bold px-4 py-1.5 rounded-full mb-4">
              <Gift className="w-4 h-4" />
              FIRST 100 GET EXTRA ₦10,000 BONUS!
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Start Earning in 60 Seconds</h2>
            <p className="text-gray-300 mb-6">
              Every referral = money in your pocket. Join 1,247+ Nigerians earning weekly!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to="/influencers/auth" 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 px-8 rounded-xl text-base transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/30 flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                GET STARTED FREE
              </Link>
              
              <Link 
                to="/login" 
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 font-semibold py-3.5 px-8 rounded-xl text-base transition-all duration-300 flex items-center justify-center gap-2"
              >
                Already have account? <span className="text-purple-400 font-bold">Login</span>
              </Link>
            </div>
            
            <div className="mt-6 text-xs text-gray-400">
              ⚡ No monthly fees • 🛡️ 100% legal • 💰 Instant payouts
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="py-6 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center text-xs text-gray-400">
          <p>NextWinner Influencer Program • For Nigerians, By Nigerians • 🇳🇬</p>
          <p className="mt-1">Contact: support@nextwinner.ng • WhatsApp: +234 800 000 0000</p>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default LearnMore;