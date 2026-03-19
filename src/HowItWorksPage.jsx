import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, Star, ShoppingBag, Trophy, Shield,
  CheckCircle, Users, Zap, Clock, Award,
  ChevronRight, Play, MessageSquare, Target,
  TrendingUp, DollarSign, Percent, Gift, Heart,
  Lock, RefreshCw, Truck, Smartphone, BarChart,
  Calendar, Calculator, Globe, Sparkles, ThumbsUp,
  AlertCircle, BookOpen, Headphones, Award as AwardIcon,
  Shield as ShieldIcon, Users as UsersIcon, Zap as ZapIcon
} from 'lucide-react';

const HowItWorksPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [showFAQ, setShowFAQ] = useState(false);

  // Psychological benefits for each step
  const psychologicalBenefits = [
    {
      emotion: "HOPE",
      description: "Feeling optimistic about your future",
      color: "from-blue-400 to-cyan-400"
    },
    {
      emotion: "EXCITEMENT",
      description: "Anticipation of positive outcomes",
      color: "from-purple-400 to-pink-400"
    },
    {
      emotion: "CONFIDENCE",
      description: "Trust in a fair and transparent process",
      color: "from-green-400 to-emerald-400"
    },
    {
      emotion: "JOY",
      description: "Celebration of life-changing results",
      color: "from-yellow-400 to-orange-400"
    }
  ];

  // Comprehensive steps with psychological insights
  const steps = [
    {
      id: 1,
      title: "Create Your Free Account",
      subtitle: "Join the winning community in 60 seconds",
      icon: UserPlus,
      description: "Sign up with your email . No hidden fees, no commitments. Start your journey to financial freedom.",
      detailedDescription: "Psychologically, taking this first step creates commitment and investment in the process. Your brain starts seeing you as someone who takes action toward their dreams.",
      psychologicalInsight: "The act of signing up triggers the 'endowment effect' - you now feel ownership and commitment to the process.",
      action: "Sign Up Free",
      actionLink: "/register",
      stats: "98% user satisfaction",
      color: "from-blue-500 to-cyan-500",
      tips: [
        "Use your real information for faster verification",
        "Enable notifications to never miss a draw",
        "Complete your profile for personalized recommendations"
      ]
    },
    {
      id: 2,
      title: "Choose Your Dream Prize",
      subtitle: "Pick what excites your future self",
      icon: Star,
      description: "Browse hundreds of verified prizes. From cash to cars, phones to houses. Visualize your life after winning.",
      detailedDescription: "Choosing a specific prize activates the 'goal-setting theory' in psychology. Your brain starts creating neural pathways toward achieving that specific outcome.",
      psychologicalInsight: "Visualizing your desired prize increases dopamine production, making the pursuit more rewarding and motivating.",
      action: "Browse Prizes",
      actionLink: "/raffles",
      stats: "500+ prizes available",
      color: "from-purple-500 to-pink-500",
      tips: [
        "Choose prizes that genuinely excite you",
        "Consider prizes that solve real problems in your life",
        "Mix between big-ticket items and more frequent smaller wins"
      ]
    },
    {
      id: 3,
      title: "Buy Your Tickets",
      subtitle: "Small investment, infinite possibilities",
      icon: ShoppingBag,
      description: "Select ticket quantity. More tickets = better chances. Each ticket gives you a unique number in the draw.",
      detailedDescription: "The act of purchasing creates 'skin in the game' - psychological commitment that increases emotional investment and anticipation.",
      psychologicalInsight: "Buying tickets triggers the 'sunk cost fallacy' positively - you're more likely to follow through because you've invested.",
      action: "Buy Tickets",
      actionLink: "/raffles",
      stats: "Start from ₦500",
      color: "from-green-500 to-emerald-500",
      tips: [
        "Consider setting a monthly ticket budget",
        "More tickets increase odds mathematically",
        "Take advantage of bundle discounts"
      ]
    },
    {
      id: 4,
      title: "Watch Live & Win Big",
      subtitle: "Transparent excitement, guaranteed fairness",
      icon: Trophy,
      description: "Join our live Sunday draws. Watch as winning numbers are selected fairly. See real people become instant millionaires.",
      detailedDescription: "Watching live creates 'vicarious experience' - your brain processes others' wins as if they're your own, increasing belief in your own potential.",
      psychologicalInsight: "Live anticipation releases adrenaline and dopamine, creating memorable emotional peaks that reinforce participation.",
      action: "Watch Live Draw",
      actionLink: "/live-draw",
      stats: "Every Sunday 6PM WAT",
      color: "from-yellow-500 to-orange-500",
      tips: [
        "Invite friends to watch together for shared excitement",
        "Participate in live chat for community feeling",
        "Record the moment you win for lifelong memories"
      ]
    }
  ];

  // Success statistics with psychological impact
  const successStats = [
    {
      number: "1 in 50",
      label: "Monthly Win Rate",
      description: "Active users win prizes every month",
      icon: Percent,
      color: "text-green-400"
    },
    {
      number: "₦10.8M+",
      label: "Paid Out This Month",
      description: "Real money to real people",
      icon: DollarSign,
      color: "text-[#FFD700]"
    },
    {
      number: "100%",
      label: "Verified Winners",
      description: "Every win is transparently verified",
      icon: Shield,
      color: "text-blue-400"
    },
    {
      number: "37",
      label: "States Participating",
      description: "Nigerian community of winners",
      icon: Globe,
      color: "text-purple-400"
    }
  ];

  // Psychological principles explained
  const psychologicalPrinciples = [
    {
      principle: "The Power of Visualization",
      explanation: "When you choose a prize and imagine winning it, your brain creates neural pathways that make success feel more attainable.",
      icon: Target,
      benefit: "Increases motivation by 47%"
    },
    {
      principle: "Social Proof Effect",
      explanation: "Seeing real people win triggers your brain's mirror neurons, making you believe you can achieve the same.",
      icon: Users,
      benefit: "Builds confidence through others' success"
    },
    {
      principle: "Anticipatory Joy",
      explanation: "The excitement of waiting for the draw releases dopamine, making the experience rewarding even before winning.",
      icon: Heart,
      benefit: "Creates positive emotional association"
    },
    {
      principle: "Probability Weighting",
      explanation: "Even small chances feel significant when the potential reward is life-changing, creating optimistic bias.",
      icon: TrendingUp,
      benefit: "Makes participation feel valuable"
    }
  ];

  // Common concerns with psychological reassurance
  const concerns = [
    {
      question: "Is this really fair?",
      answer: "Yes! We use certified random number generators with live video verification. Your chance is mathematically equal to everyone else's.",
      reassurance: "Fairness is our #1 priority. We're audited monthly by independent third parties.",
      icon: ShieldIcon
    },
    {
      question: "What if I don't win?",
      answer: "Every ticket purchase is an entry. While not everyone wins every draw, our statistics show regular winners across all prize categories.",
      reassurance: "Multiple users win every single day. Your turn could be next!",
      icon: Trophy
    },
    {
      question: "How can I increase my chances?",
      answer: "Buy more tickets for specific draws, participate regularly, and choose raffles with fewer participants for better odds.",
      reassurance: "Strategic participation can significantly improve your win probability.",
      icon: BarChart
    },
    {
      question: "Is my money safe?",
      answer: "Absolutely. We use bank-level encryption, SSL security, and your funds are held in segregated accounts until winners are paid.",
      reassurance: "Your security is guaranteed with 256-bit encryption.",
      icon: Lock
    }
  ];

  // Emotional journey timeline
  const emotionalJourney = [
    {
      stage: "Day 1",
      emotion: "CURIOSITY",
      description: "You discover the possibility of winning",
      action: "Browse prizes and imagine possibilities",
      color: "from-blue-400 to-cyan-400"
    },
    {
      stage: "Day 3",
      emotion: "HOPE",
      description: "You see real winners and start believing",
      action: "Create account and choose first prize",
      color: "from-purple-400 to-pink-400"
    },
    {
      stage: "Day 7",
      emotion: "EXCITEMENT",
      description: "You buy tickets and join the draw",
      action: "Participate in your first live draw",
      color: "from-green-400 to-emerald-400"
    },
    {
      stage: "Day 14+",
      emotion: "TRANSFORMATION",
      description: "You experience life-changing results",
      action: "Join the winners' circle and inspire others",
      color: "from-yellow-400 to-orange-400"
    }
  ];

  const currentStep = steps.find(step => step.id === activeStep);
  const StepIcon = currentStep?.icon || UserPlus;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#141432] to-[#0c0c24] text-white w-full overflow-x-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/5 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="px-1 py-0.5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-xs text-white/70 active:scale-95"
            >
              ← Back
            </button>
            
            <h1 className="text-sm font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
              HOW TO WIN BIG
            </h1>
            
            <button
              onClick={() => navigate('/winners')}
              className="text-xs text-[#FFD700] font-bold"
            >
              🏆 WINNERS
            </button>
          </div>
        </div>
      </div>

      <main className="pt-8 pb-16 w-full px-0.5">
        {/* Hero Section with Psychological Hook */}
        <div className="mb-3 bg-gradient-to-r from-[#FFD700]/10 via-[#FFA500]/10 to-[#FFD700]/10 backdrop-blur-lg rounded-xl border border-[#FFD700]/20 p-3 text-center">
          <h1 className="text-lg font-black mb-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
            YOUR JOURNEY TO FINANCIAL FREEDOM STARTS HERE
          </h1>
          <p className="text-xs text-white/80 mb-2">
            Simple steps, transparent process, life-changing results. See how ordinary people achieve extraordinary wins.
          </p>
          <div className="flex items-center justify-center gap-1 text-[10px] text-white/60">
            <Zap className="w-3 h-3 text-[#FFD700]" />
            <span>4 Simple Steps</span>
            <span className="mx-1">•</span>
            <Clock className="w-3 h-3 text-blue-400" />
            <span>Start in 2 Minutes</span>
            <span className="mx-1">•</span>
            <Trophy className="w-3 h-3 text-green-400" />
            <span>Guaranteed Winners</span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-1 mb-3">
          {successStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-2 text-center">
                <div className={`text-sm font-bold ${stat.color}`}>{stat.number}</div>
                <div className="text-[10px] text-white/60">{stat.label}</div>
                <div className="text-[9px] text-white/40 mt-0.5">{stat.description}</div>
              </div>
            );
          })}
        </div>

        {/* Step Navigation */}
        <div className="mb-3">
          <div className="flex justify-between mb-2">
            <h2 className="text-sm font-bold text-[#FFD700]">YOUR WINNING PATH</h2>
            <div className="text-xs text-white/60">Step {activeStep} of 4</div>
          </div>
          
          <div className="grid grid-cols-4 gap-1 mb-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`py-1 rounded-lg text-center transition-all ${
                  activeStep === step.id
                    ? `bg-gradient-to-r ${step.color} text-black font-bold`
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <div className="text-xs">Step {step.id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Detail */}
        <div className="mb-3 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${currentStep.color} flex items-center justify-center`}>
              <StepIcon className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{currentStep.title}</h3>
              <p className="text-xs text-white/70">{currentStep.subtitle}</p>
            </div>
          </div>

          {/* Step Description */}
          <div className="mb-3">
            <p className="text-sm text-white/80 mb-2">{currentStep.description}</p>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-2 mb-2">
              <h4 className="text-xs font-bold text-[#FFD700] mb-1">🧠 Psychological Insight:</h4>
              <p className="text-[11px] text-white/70">{currentStep.psychologicalInsight}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <h4 className="text-xs font-bold text-white mb-1">📋 Pro Tips:</h4>
              <ul className="space-y-1">
                {currentStep.tips.map((tip, index) => (
                  <li key={index} className="text-[11px] text-white/70 flex items-start gap-1">
                    <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate(currentStep.actionLink)}
            className="w-full py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-sm font-bold rounded-lg hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all active:scale-95"
          >
            {currentStep.action} →
          </button>
        </div>

        {/* Psychological Benefits Bar */}
        <div className="mb-3">
          <h3 className="text-sm font-bold text-[#FFD700] mb-2 flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            EMOTIONAL JOURNEY
          </h3>
          <div className="grid grid-cols-2 gap-1">
            {psychologicalBenefits.map((benefit, index) => (
              <div 
                key={index}
                className={`bg-gradient-to-r ${benefit.color}/10 backdrop-blur-md rounded-lg border ${benefit.color}/20 p-2 text-center`}
              >
                <div className="text-xs font-bold text-white">{benefit.emotion}</div>
                <div className="text-[10px] text-white/60">{benefit.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Complete Process Overview */}
        <div className="mb-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-lg rounded-xl border border-blue-500/20 p-3">
          <h3 className="text-sm font-bold text-[#FFD700] mb-2 flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            COMPLETE PROCESS OVERVIEW
          </h3>
          
          <div className="space-y-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-start gap-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-black" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white">{step.title}</div>
                    <div className="text-[11px] text-white/70">{step.description}</div>
                    <div className="text-[10px] text-white/50 mt-0.5">{step.stats}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Psychological Principles */}
        <div className="mb-3">
          <h3 className="text-sm font-bold text-[#FFD700] mb-2 flex items-center gap-1">
            <Target className="w-4 h-4" />
            THE PSYCHOLOGY OF WINNING
          </h3>
          <div className="space-y-2">
            {psychologicalPrinciples.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-[#FFD700]" />
                    <div className="text-xs font-bold text-white">{principle.principle}</div>
                  </div>
                  <p className="text-[11px] text-white/70 mb-1">{principle.explanation}</p>
                  <div className="text-[10px] text-green-400 font-bold">{principle.benefit}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emotional Journey Timeline */}
        <div className="mb-3">
          <h3 className="text-sm font-bold text-[#FFD700] mb-2">YOUR 14-DAY EMOTIONAL JOURNEY</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-yellow-400"></div>
            
            {emotionalJourney.map((stage, index) => (
              <div key={index} className="relative flex items-start gap-3 mb-3 pl-8">
                {/* Timeline dot */}
                <div className={`absolute left-3 top-1 w-3 h-3 rounded-full bg-gradient-to-r ${stage.color} border-2 border-white`}></div>
                
                <div className={`flex-1 bg-gradient-to-r ${stage.color}/10 backdrop-blur-md rounded-lg border ${stage.color}/20 p-2`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-bold text-white">{stage.stage}</div>
                    <div className="text-xs font-bold text-[#FFD700]">{stage.emotion}</div>
                  </div>
                  <p className="text-[11px] text-white/70 mb-1">{stage.description}</p>
                  <div className="text-[10px] text-white/50">{stage.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Concerns Addressed */}
        <div className="mb-3">
          <button
            onClick={() => setShowFAQ(!showFAQ)}
            className="w-full flex items-center justify-between p-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10"
          >
            <h3 className="text-sm font-bold text-[#FFD700] flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              COMMON CONCERNS ADDRESSED
            </h3>
            <ChevronRight className={`w-4 h-4 transition-transform ${showFAQ ? 'rotate-90' : ''}`} />
          </button>
          
          {showFAQ && (
            <div className="mt-2 space-y-2">
              {concerns.map((concern, index) => {
                const Icon = concern.icon;
                return (
                  <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-2">
                    <div className="flex items-start gap-2 mb-1">
                      <Icon className="w-4 h-4 text-[#FFD700] mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">{concern.question}</div>
                        <p className="text-[11px] text-white/70 mt-1">{concern.answer}</p>
                        <div className="text-[10px] text-green-400 font-bold mt-1">✅ {concern.reassurance}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transparency & Security */}
        <div className="mb-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-xl border border-green-500/20 p-3">
          <h3 className="text-sm font-bold text-[#FFD700] mb-2 flex items-center gap-1">
            <Shield className="w-4 h-4" />
            TRANSPARENCY & SECURITY
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Live Video Draws</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Blockchain Verification</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Independent Auditors</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Segregated Funds</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Final CTA with Psychological Push */}
        <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 backdrop-blur-lg rounded-xl border border-[#FFD700]/20 p-3 text-center">
          <h3 className="text-sm font-bold text-white mb-1">READY TO START YOUR WINNING JOURNEY?</h3>
          <p className="text-xs text-white/80 mb-2">
            Thousands started exactly where you are now. Today, they're living their dreams.
          </p>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white/5 rounded p-2">
              <div className="text-xs font-bold text-[#FFD700]">What's Holding You Back?</div>
              <div className="text-[10px] text-white/60">Most regrets come from not trying</div>
            </div>
            <div className="bg-white/5 rounded p-2">
              <div className="text-xs font-bold text-green-400">What Could You Gain?</div>
              <div className="text-[10px] text-white/60">Life-changing possibilities</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/register')}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-sm font-bold rounded-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.7)] transition-all active:scale-95"
            >
              START WINNING NOW
            </button>
            <button
              onClick={() => navigate('/winners')}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-sm font-medium active:scale-95"
            >
              SEE WINNERS
            </button>
          </div>
          
          <div className="mt-2 text-[10px] text-white/60">
            <div className="flex items-center justify-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              <span>7-day money-back guarantee on unused tickets</span>
            </div>
          </div>
        </div>

        {/* Community & Support */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate('/forum')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-xs font-medium active:scale-95"
          >
            <div className="flex items-center justify-center gap-1">
              <MessageSquare className="w-4 h-4" />
              Join Community
            </div>
          </button>
          <button
            onClick={() => {/* Contact support */}}
            className="p-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20 text-xs font-medium active:scale-95"
          >
            <div className="flex items-center justify-center gap-1">
              <Headphones className="w-4 h-4" />
              Need Help?
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default HowItWorksPage;