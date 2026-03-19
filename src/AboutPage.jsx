import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, Trophy, CheckCircle, Award,
  Heart, TrendingUp, Clock, Zap, ChevronLeft,
  Globe, Star, Target, BarChart, Lock, Gift,
  TrendingDown, Users as UsersIcon, Sparkles,
  BookOpen, ShieldCheck, Crown, MessageSquare,
  Phone, Mail, MapPin, Award as AwardIcon,
  Play, Share2, Facebook, Twitter, Instagram,
  Youtube, Linkedin, ThumbsUp, Coffee, Home, Scale
} from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('story');
  const [currentStat, setCurrentStat] = useState(0);
  const [teamIndex, setTeamIndex] = useState(0);

  // Rotating impact statistics
  const impactStats = [
    {
      number: "₦10MB+",
      label: "Paid to Winners",
      description: "Life-changing money distributed",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500"
    },
    {
      number: "few",
      label: "Happy Winners",
      description: "Dreams turned into reality",
      icon: Users,
      color: "from-green-500 to-emerald-500"
    },
    {
      number: "98.7%",
      label: "Satisfaction Rate",
      description: "Verified happy customers",
      icon: Star,
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "36 States",
      label: "Across Nigeria",
      description: "Winners from every state",
      icon: Globe,
      color: "from-purple-500 to-pink-500"
    }
  ];

  // Our Story timeline
  const storyTimeline = [
    {
      year: "2019",
      title: "The Beginning",
      description: "Started as an offline raffle operation  with local community draws and physical ticket sales.",
      emotional: "Built on trust and community relationships",
      icon: Zap
    },
    {
      year: "2020",
      title: "Digital Transformation",
      description: "Launched NEXTWINNER online platform to reach more Nigerians across the country.",
      emotional: "Brought traditional raffle into the digital age",
      icon: Trophy
    },
    {
      year: "2021",
      title: "First Major Online Winner",
      description: "Users have be wining various Tickets from all categories with the highest being ₦1M+ through our web app.",
      emotional: "Proved the power of digital accessibility",
      icon: Heart
    },
    {
      year: "2022",
      title: "National Recognition",
      description: "Became Nigeria's fastest-growing raffle platform with winners from major 36 states.",
      emotional: "United Nigeria through winning opportunities",
      icon: Globe
    },
    {
      year: "2023",
      title: "Technology Upgrade",
      description: "Implemented live-streaming and real-time verification for all draws.",
      emotional: "Set new transparency standards in Nigeria",
      icon: Shield
    },
    {
      year: "Today",
      title: "Nigeria's Trusted Platform",
      description: "Creating new winners weekly across Nigeria with 100% Nigerian ownership and operation.",
      emotional: "Proudly Nigerian, globally inspired",
      icon: TrendingUp
    }
  ];

  // Core values with psychological impact
  const coreValues = [
    {
      title: "Radical Transparency",
      description: "Every draw is live-streamed, every winner is verified, every process is open for scrutiny.",
      psychologicalImpact: "Builds absolute trust and eliminates doubt",
      icon: ShieldCheck,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Life-Changing Impact",
      description: "We measure success not by profits, but by lives transformed and dreams fulfilled.",
      psychologicalImpact: "Creates emotional connection and purpose",
      icon: Heart,
      color: "from-red-500 to-pink-500"
    },
    {
      title: "Community First",
      description: "Our winners become our ambassadors, creating a supportive network of success stories.",
      psychologicalImpact: "Fosters belonging and social proof",
      icon: UsersIcon,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Innovation & Fairness",
      description: "Using cutting-edge technology to ensure every participant has an equal, verifiable chance.",
      psychologicalImpact: "Reduces anxiety and builds confidence",
      icon: AwardIcon,
      color: "from-purple-500 to-indigo-500"
    }
  ];

  // Team members with stories
  const teamMembers = [
    {
      name: "David O.",
      role: "Founder & CEO",
      story: "Started with small community raffles and expanded to create Nigeria's most trusted digital raffle platform.",
      quote: "Every Nigerian deserves a fair chance at changing their life.",
      avatarColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
      achievements: ["Created 500K+ winners", "₦45.8B+ distributed", "Digital pioneer"]
    },
    {
      name: "Christopher E.",
      role: "Head of Operations",
      story: "Joined as our one time offline winner and brought his experience to help scale operations across Nigeria.",
      quote: "From winner to helping others win - that's the NEXT WINNERS way.",
      avatarColor: "bg-gradient-to-r from-purple-500 to-pink-500",
      achievements: ["Former winner", "Operations expert", "User experience champion"]
    },
    {
      name: "Joy A.",
      role: "Technology Director",
      story: "Built our secure platform from the ground up, ensuring reliability and transparency for all Nigerian users.",
      quote: "Technology should make winning accessible to every Nigerian.",
      avatarColor: "bg-gradient-to-r from-green-500 to-emerald-500",
      achievements: ["Platform architect", "Security systems", "Mobile innovation"]
    }
  ];

  // Psychological principles we follow
  const psychologicalPrinciples = [
    {
      principle: "The Fairness Effect",
      explanation: "Humans are naturally drawn to fair systems. Our transparent process taps into this deep psychological need.",
      benefit: "Creates long-term trust and loyalty",
      icon: Scale
    },
    {
      principle: "Hope Theory",
      explanation: "We create pathways to goals, agency to pursue them, and belief in positive outcomes - the three pillars of hope.",
      benefit: "Builds optimistic engagement",
      icon: Target
    },
    {
      principle: "Social Proof",
      explanation: "Real winner stories create vicarious experience, making success feel attainable for everyone.",
      benefit: "Accelerates belief and participation",
      icon: Users
    },
    {
      principle: "Dopamine Release",
      explanation: "The anticipation of winning releases dopamine, creating positive emotional associations with participation.",
      benefit: "Makes the experience rewarding",
      icon: Sparkles
    }
  ];

  // FAQ with emotional reassurance
  const faqs = [
    {
      question: "How do we ensure 100% fairness?",
      answer: "Live-streamed draws, real-time verification, independent observers, and transparent algorithms. Every draw is open for public viewing ON THE PLATFORM.",
      emotional: "Peace of mind through transparency"
    },
    {
      question: "What makes NEXT WINNERS different?",
      answer: "We're 100% Nigerian-owned and operated, built on community trust. Our team understands Nigerian users better than anyone.",
      emotional: "Built by Nigerians, for Nigerians"
    },
    {
      question: "How do winners receive their prizes?",
      answer: "Within 24 hours for cash prizes via bank transfer. We work with all major Nigerian banks for instant payments. Physicals goods are delivered freely within 3-5 days depending on the weight",
      emotional: "From dream to reality, seamlessly"
    },
    {
      question: "Can I really win?",
      answer: "Yes! Our winners include market traders, students, civil servants, entrepreneurs - ordinary Nigerians from all walks of life.",
      emotional: "Your chance is as real as our winners"
    }
  ];

  // Rotate statistics
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % impactStats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Rotate team members
  useEffect(() => {
    const interval = setInterval(() => {
      setTeamIndex(prev => (prev + 1) % teamMembers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentStatData = impactStats[currentStat];
  const StatIcon = currentStatData.icon;
  const currentTeamMember = teamMembers[teamIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#141432] to-[#0c0c24] text-white w-full overflow-x-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/5 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="px-1 py-0.5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-xs text-white/70 active:scale-95"
            >
              <ChevronLeft className="w-3 h-3" />
              Back
            </button>
            
            <h1 className="text-sm font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
              OUR STORY • OUR MISSION
            </h1>
            
            <button
              onClick={() => navigate('/contact')}
              className="text-xs text-[#FFD700] font-bold"
            >
              CONTACT
            </button>
          </div>
        </div>
      </div>

      <main className="pt-8 pb-16 w-full px-0.5">
        {/* Hero Section */}
        <div className="mb-3 bg-gradient-to-r from-[#FFD700]/10 via-[#FFA500]/10 to-[#FFD700]/10 backdrop-blur-lg rounded-xl border border-[#FFD700]/20 p-3 text-center">
          <h1 className="text-lg font-black mb-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
            NEXT WINNERS
          </h1>
          <p className="text-xs text-white/80 mb-2">
            Nigeria's most trusted raffle platform. Proudly Nigerian, built on transparency, technology, and trust.
          </p>
          <div className="flex items-center justify-center gap-1 text-[10px] text-white/60">
            <Heart className="w-3 h-3 text-red-400" />
            <span>Made in Nigeria</span>
            <span className="mx-1">•</span>
            <Shield className="w-3 h-3 text-blue-400" />
            <span>100% Transparent</span>
            <span className="mx-1">•</span>
            <Users className="w-3 h-3 text-green-400" />
            <span>Community Driven</span>
          </div>
        </div>

        {/* Rotating Impact Stat */}
        <div className={`mb-3 bg-gradient-to-r ${currentStatData.color}/20 backdrop-blur-lg rounded-xl border ${currentStatData.color}/30 p-3 text-center transition-all duration-500`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className={`w-10 h-10 bg-gradient-to-r ${currentStatData.color} rounded-full flex items-center justify-center`}>
              <StatIcon className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-xl font-black text-white">{currentStatData.number}</div>
              <div className="text-xs font-bold text-white">{currentStatData.label}</div>
            </div>
          </div>
          <p className="text-[11px] text-white/70">{currentStatData.description}</p>
          <div className="flex justify-center gap-1 mt-2">
            {impactStats.map((_, index) => (
              <div
                key={index}
                className={`w-1 h-1 rounded-full ${index === currentStat ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-3 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
          <div className="grid grid-cols-4 gap-0">
            {['story', 'values', 'team', 'faq'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`py-2 text-xs font-medium transition-all ${
                  activeSection === section
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {section.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Sections */}
        <div className="transition-all duration-300">
          {/* Our Story Timeline */}
          {activeSection === 'story' && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-md rounded-xl border border-blue-500/20 p-3">
                <h3 className="text-sm font-bold text-[#FFD700] mb-2 flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  OUR JOURNEY
                </h3>
                <div className="relative pl-4">
                  {/* Timeline line */}
                  <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-yellow-400"></div>
                  
                  {storyTimeline.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="relative mb-3 last:mb-0">
                        {/* Timeline dot */}
                        <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white"></div>
                        
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs font-bold text-[#FFD700]">{item.year}</div>
                            <Icon className="w-4 h-4 text-white/60" />
                          </div>
                          <h4 className="text-xs font-bold text-white mb-1">{item.title}</h4>
                          <p className="text-[11px] text-white/70 mb-1">{item.description}</p>
                          <div className="text-[10px] text-white/50 italic">{item.emotional}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mission & Vision */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md rounded-xl border border-green-500/20 p-3">
                  <h4 className="text-xs font-bold text-[#FFD700] mb-1 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    OUR MISSION
                  </h4>
                  <p className="text-[11px] text-white/70">
                    To create a Nigeria where everyone has an equal, transparent opportunity to achieve financial freedom through fair chance.
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-xl border border-purple-500/20 p-3">
                  <h4 className="text-xs font-bold text-[#FFD700] mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    OUR VISION
                  </h4>
                  <p className="text-[11px] text-white/70">
                    To be Nigeria's most trusted platform for life-changing opportunities, creating 100,000 new millionaires by 2030.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Core Values */}
          {activeSection === 'values' && (
            <div className="space-y-2">
              {coreValues.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div 
                    key={index}
                    className={`bg-gradient-to-r ${value.color}/10 backdrop-blur-lg rounded-xl border ${value.color}/20 p-3`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-10 h-10 bg-gradient-to-r ${value.color} rounded-full flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{value.title}</h4>
                        <p className="text-[11px] text-white/70">{value.description}</p>
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2">
                      <div className="text-xs font-bold text-[#FFD700] mb-0.5">Psychological Impact:</div>
                      <p className="text-[11px] text-white/70">{value.psychologicalImpact}</p>
                    </div>
                  </div>
                );
              })}

              {/* Psychological Principles */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-md rounded-xl border border-blue-500/20 p-3 mt-3">
                <h4 className="text-sm font-bold text-[#FFD700] mb-2 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  THE PSYCHOLOGY OF TRUST
                </h4>
                <div className="space-y-2">
                  {psychologicalPrinciples.map((principle, index) => {
                    const Icon = principle.icon;
                    return (
                      <div key={index} className="bg-white/5 rounded-lg p-2">
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
            </div>
          )}

          {/* Team Section */}
          {activeSection === 'team' && (
            <div className="space-y-3">
              {/* Featured Team Member */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${currentTeamMember.avatarColor}`}>
                    {currentTeamMember.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{currentTeamMember.name}</div>
                    <div className="text-xs text-[#FFD700]">{currentTeamMember.role}</div>
                    <div className="text-[10px] text-white/60 italic">"{currentTeamMember.quote}"</div>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-xs font-bold text-white mb-1">Their Story</div>
                  <p className="text-[11px] text-white/70">{currentTeamMember.story}</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {currentTeamMember.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 bg-white/5 rounded-lg text-[10px] text-white/70"
                    >
                      {achievement}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-1 mt-2">
                  {teamMembers.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${index === teamIndex ? 'bg-white' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-2 text-center">
                  <div className="text-xs font-bold text-[#FFD700]">100%</div>
                  <div className="text-[10px] text-white/60">Nigerian Team</div>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-2 text-center">
                  <div className="text-xs font-bold text-green-400">10+</div>
                  <div className="text-[10px] text-white/60">Team Members</div>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-2 text-center">
                  <div className="text-xs font-bold text-blue-400">24/7</div>
                  <div className="text-[10px] text-white/60">Naija Support</div>
                </div>
              </div>

              {/* Team Philosophy */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md rounded-xl border border-green-500/20 p-3">
                <h4 className="text-sm font-bold text-[#FFD700] mb-1">OUR TEAM PHILOSOPHY</h4>
                <p className="text-[11px] text-white/70 mb-2">
                  We're 100% Nigerian, hiring from our community, promoting from within, and ensuring every team member shares our passion for changing Nigerian lives.
                </p>
                <div className="flex items-center gap-1 text-[10px] text-white/60">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>30% of our team are former winners</span>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {activeSection === 'faq' && (
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-3">
                  <h4 className="text-sm font-bold text-white mb-1">{faq.question}</h4>
                  <p className="text-[11px] text-white/70 mb-2">{faq.answer}</p>
                  <div className="text-[10px] text-[#FFD700] font-bold">{faq.emotional}</div>
                </div>
              ))}

              {/* Contact Options */}
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-md rounded-xl border border-blue-500/20 p-3">
                <h4 className="text-sm font-bold text-[#FFD700] mb-2">NEED MORE ANSWERS?</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all active:scale-95">
                    <MessageSquare className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-xs font-bold">Live Chat</div>
                      <div className="text-[10px] text-white/60">Instant answers 24/7</div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all active:scale-95">
                    <Mail className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-xs font-bold">Email Support</div>
                      <div className="text-[10px] text-white/60">support@nextwinners.ng</div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all active:scale-95">
                    <Phone className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-xs font-bold">Phone Support</div>
                      <div className="text-[10px] text-white/60">+234 800 NEXT WIN</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transparency Badges */}
        <div className="my-3">
          <h4 className="text-sm font-bold text-[#FFD700] mb-2 text-center">OUR COMMITMENT TO YOU</h4>
          <div className="grid grid-cols-3 gap-1">
            <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-2 text-center">
              <Shield className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <div className="text-xs font-bold">Trusted</div>
              <div className="text-[10px] text-white/60">Less 5K Winners</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-2 text-center">
              <Lock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <div className="text-xs font-bold">Secure</div>
              <div className="text-[10px] text-white/60">Bank-Level Security</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-2 text-center">
              <CheckCircle className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <div className="text-xs font-bold">Verified</div>
              <div className="text-[10px] text-white/60">Live Draw Verification</div>
            </div>
          </div>
        </div>

        {/* Nigerian Presence */}
        <div className="mb-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md rounded-xl border border-green-500/20 p-3">
          <h4 className="text-sm font-bold text-[#FFD700] mb-2 text-center">WE ARE FULLY ONLINE ACROSS NIGERIA</h4>
    
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 backdrop-blur-lg rounded-xl border border-[#FFD700]/20 p-3 text-center">
          <h4 className="text-sm font-bold text-white mb-1">READY TO BE THE NEXT WINNER?</h4>
          <p className="text-xs text-white/70 mb-2">
            Join Nigeria's most trusted raffle community and change your life today.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/register')}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-sm font-bold rounded-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all active:scale-95"
            >
              JOIN NOW
            </button>
            <button
              onClick={() => navigate('/live-draw')}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-sm font-medium active:scale-95"
            >
              WATCH LIVE
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-3 flex justify-center gap-3">
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 active:scale-95">
            <Facebook className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 active:scale-95">
            <Twitter className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 active:scale-95">
            <Instagram className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 active:scale-95">
            <Youtube className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;