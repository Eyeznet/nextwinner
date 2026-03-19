import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Phone, MapPin, MessageSquare, Clock,
  Shield, CheckCircle, Users, Globe, Award,
  ChevronLeft, Send, Smartphone, Headphones,
  HelpCircle, BookOpen, ShieldCheck, Zap,
  TrendingUp, Heart, Star, Facebook, Twitter,
  Instagram, Youtube, Linkedin, MessageCircle,
  AlertCircle, Coffee, Building, Globe as World,
  Mail as MailIcon, Phone as PhoneIcon, MapPin as PinIcon,
  Trophy, Sparkles, Target
} from 'lucide-react';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general',
    priority: 'normal',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [activeContactMethod, setActiveContactMethod] = useState('chat');
  const [currentTip, setCurrentTip] = useState(0);

  // Psychological reassurance tips
  const supportTips = [
    {
      title: "Instant Response Guarantee",
      description: "We respond to urgent queries within 15 minutes",
      icon: Clock,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "24/7 Naija Support",
      description: "Real humans available round the clock",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Verified & Secure",
      description: "Your information is protected with bank-level security",
      icon: ShieldCheck,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Winner Priority",
      description: "5K+ winners trust our dedicated support",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500"
    }
  ];

  // Contact methods with psychological benefits
  const contactMethods = [
    {
      id: 'chat',
      title: "Live Chat",
      description: "Instant answers from our Naija support team",
      responseTime: "5-15 minutes",
      bestFor: "Urgent issues & quick questions",
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500",
      psychologicalBenefit: "Immediate relief from anxiety"
    },
    {
      id: 'email',
      title: "Email Support",
      description: "Detailed responses with comprehensive solutions",
      responseTime: "1-4 hours",
      bestFor: "Detailed inquiries & documentation",
      icon: Mail,
      color: "from-green-500 to-emerald-500",
      psychologicalBenefit: "Thorough problem resolution"
    },
    {
      id: 'phone',
      title: "Phone Support",
      description: "Direct conversation with Nigerian support specialists",
      responseTime: "2-10 minutes",
      bestFor: "Complex issues needing explanation",
      icon: Phone,
      color: "from-purple-500 to-pink-500",
      psychologicalBenefit: "Personal connection and reassurance"
    },
    {
      id: 'whatsapp',
      title: "WhatsApp",
      description: "Quick messaging with our support team",
      responseTime: "5-15 minutes",
      bestFor: "Ongoing support & updates",
      icon: MessageCircle,
      color: "from-green-500 to-teal-500",
      psychologicalBenefit: "Continuous support feeling"
    }
  ];

  // Support categories with emotional mapping
  const supportCategories = [
    {
      id: 'general',
      name: "General Inquiry",
      description: "Questions about NEXT WINNERS platform",
      icon: HelpCircle,
      emotional: "Curiosity & learning"
    },
    {
      id: 'technical',
      name: "Technical Support",
      description: "App issues or bugs",
      icon: Zap,
      emotional: "Frustration resolution"
    },
    {
      id: 'winnings',
      name: "Winnings & Payouts",
      description: "Prize collection and ₦ payments",
      icon: Award,
      emotional: "Excitement & anticipation"
    },
    {
      id: 'security',
      name: "Security Concern",
      description: "Account safety issues",
      icon: Shield,
      emotional: "Anxiety relief"
    },
    {
      id: 'feedback',
      name: "Feedback & Suggestions",
      description: "Share your Nigerian experience",
      icon: MessageSquare,
      emotional: "Valued contribution"
    },
    {
      id: 'emergency',
      name: "Emergency Support",
      description: "Urgent assistance needed",
      icon: AlertCircle,
      emotional: "Crisis resolution"
    }
  ];

  // Nigerian offices
  const nigerianOffices = [
    {
      state: "Lagos",
      city: "Victoria Island",
      address: "123 Winner's Avenue, Victoria Island",
      phone: "+234 800 NEXT WIN",
      email: "lagos@nextwinners.ng",
      hours: "24/7",
      icon: "🏙️"
    },
    {
      state: "Abuja",
      city: "Central Business District",
      address: "45 Fortune Road, Central Area",
      phone: "+234 803 NEXT WIN",
      email: "abuja@nextwinners.ng",
      hours: "24/7",
      icon: "🏛️"
    },
    {
      state: "Port Harcourt",
      city: "GRA Phase 2",
      address: "78 Success Street, GRA",
      phone: "+234 805 NEXT WIN",
      email: "ph@nextwinners.ng",
      hours: "7AM-10PM",
      icon: "⛽"
    },
    {
      state: "Kano",
      city: "Nasarawa GRA",
      address: "92 Victory Lane, Nasarawa",
      phone: "+234 807 NEXT WIN",
      email: "kano@nextwinners.ng",
      hours: "7AM-10PM",
      icon: "🕌"
    }
  ];

  // FAQ for quick answers
  const quickFAQs = [
    {
      question: "How quickly do you respond?",
      answer: "Live chat: 1-5 minutes, Email: 1-4 hours, Phone: 2-10 minutes",
      emotional: "Peace of mind knowing help is near"
    },
    {
      question: "Is my information safe with NEXT WINNERS?",
      answer: "Yes! We use bank-level encryption and never share your data",
      emotional: "Complete security reassurance"
    },
    {
      question: "Can winners get priority support?",
      answer: "Absolutely! 5K+ winners trust our dedicated support team",
      emotional: "VIP treatment for your success"
    },
    {
      question: "Do you support local languages?",
      answer: "English, Pidgin, and major Nigerian languages",
      emotional: "Comfort in your preferred language"
    }
  ];

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % supportTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      setSubmitStatus({ type: 'error', message: 'Please agree to the terms' });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitStatus({
        type: 'success',
        message: 'Message sent successfully! Our  team will contact you soon.',
        details: [
          'Ticket #' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          'Priority: ' + formData.priority.toUpperCase(),
          'Expected response: ' + (formData.priority === 'urgent' ? '15 minutes' : '1-4 hours')
        ]
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general',
        priority: 'normal',
        agreeToTerms: false
      });
      
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again or use live chat.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'live-chat':
        window.open('https://wa.me/2348185450556', '_blank');
        break;
      case 'call':
        window.location.href = 'tel:+234800NEXTWIN';
        break;
      case 'email':
        window.location.href = 'mailto:support@nextwinners.ng';
        break;
      case 'help-center':
        navigate('/help-center');
        break;
      default:
        break;
    }
  };

  const currentMethod = contactMethods.find(m => m.id === activeContactMethod);
  const MethodIcon = currentMethod?.icon || MessageSquare;
  const currentTipData = supportTips[currentTip];
  const TipIcon = currentTipData.icon;

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
              NEXT WINNERS SUPPORT
            </h1>
            
            <button
              onClick={() => navigate('/live-draw')}
              className="text-xs text-[#FFD700] font-bold"
            >
              🔴 LIVE
            </button>
          </div>
        </div>
      </div>

      <main className="pt-8 pb-16 w-full px-0.5">
        {/* Hero Section with Psychological Reassurance */}
        <div className="mb-3 bg-gradient-to-r from-[#FFD700]/10 via-[#FFA500]/10 to-[#FFD700]/10 backdrop-blur-lg rounded-xl border border-[#FFD700]/20 p-3 text-center">
          <h1 className="text-lg font-black mb-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
            YOUR SUCCESS IS OUR PRIORITY
          </h1>
          <p className="text-xs text-white/80 mb-2">
            Proudly Nigerian support team here 24/7 to ensure your winning journey is smooth.
          </p>
          <div className="flex items-center justify-center gap-1 text-[10px] text-white/60">
            <Heart className="w-3 h-3 text-red-400" />
            <span>100% Nigerian Team</span>
            <span className="mx-1">•</span>
            <Shield className="w-3 h-3 text-blue-400" />
            <span>Bank-Level Secure</span>
            <span className="mx-1">•</span>
            <Clock className="w-3 h-3 text-green-400" />
            <span>24/7 Naija Time</span>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="mb-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-black text-white">₦10.8M+</div>
              <div className="text-[10px] text-white/60">Paid to Winners</div>
            </div>
            <div>
              <div className="text-lg font-black text-white">5K+</div>
              <div className="text-[10px] text-white/60">Happy Winners</div>
            </div>
            <div>
              <div className="text-lg font-black text-white">98.7%</div>
              <div className="text-[10px] text-white/60">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Rotating Support Tip */}
        <div className={`mb-3 bg-gradient-to-r ${currentTipData.color}/20 backdrop-blur-lg rounded-xl border ${currentTipData.color}/30 p-3 transition-all duration-500`}>
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 bg-gradient-to-r ${currentTipData.color} rounded-full flex items-center justify-center`}>
              <TipIcon className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{currentTipData.title}</div>
              <div className="text-[11px] text-white/70">{currentTipData.description}</div>
            </div>
          </div>
          <div className="flex justify-center gap-1 mt-2">
            {supportTips.map((_, index) => (
              <div
                key={index}
                className={`w-1 h-1 rounded-full ${index === currentTip ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-1 mb-3">
          <button
            onClick={() => handleQuickAction('live-chat')}
            className="p-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md rounded-lg border border-green-500/20 active:scale-95"
          >
            <div className="flex flex-col items-center">
              <MessageSquare className="w-4 h-4 text-green-400 mb-1" />
              <div className="text-xs font-bold">Live Chat</div>
              <div className="text-[10px] text-white/60">Instant Help</div>
            </div>
          </button>
          <button
            onClick={() => handleQuickAction('call')}
            className="p-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-md rounded-lg border border-blue-500/20 active:scale-95"
          >
            <div className="flex flex-col items-center">
              <Phone className="w-4 h-4 text-blue-400 mb-1" />
              <div className="text-xs font-bold">Call Now</div>
              <div className="text-[10px] text-white/60">+234 800 NEXT WIN</div>
            </div>
          </button>
          <button
            onClick={() => handleQuickAction('email')}
            className="p-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-500/20 active:scale-95"
          >
            <div className="flex flex-col items-center">
              <Mail className="w-4 h-4 text-purple-400 mb-1" />
              <div className="text-xs font-bold">Email</div>
              <div className="text-[10px] text-white/60">support@nextwinners.ng</div>
            </div>
          </button>
          <button
            
            className="p-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-md rounded-lg border border-yellow-500/20 active:scale-95"
          >
            <div className="flex flex-col items-center">
              <BookOpen className="w-4 h-4 text-yellow-400 mb-1" />
              <div className="text-xs font-bold">Help Center</div>
              <div className="text-[10px] text-white/60">Self-Help Guides</div>
            </div>
          </button>
        </div>

        {/* Contact Method Selection */}
        <div className="mb-3">
          <h3 className="text-sm font-bold text-[#FFD700] mb-2">HOW TO REACH OUR NAJA TEAM</h3>
          <div className="grid grid-cols-4 gap-1 mb-2">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setActiveContactMethod(method.id)}
                  className={`p-1 rounded-lg transition-all active:scale-95 ${
                    activeContactMethod === method.id
                      ? `bg-gradient-to-r ${method.color} text-black font-bold`
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <Icon className="w-3 h-3 mb-0.5" />
                    <div className="text-[10px]">{method.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Method Details */}
          <div className={`bg-gradient-to-r ${currentMethod.color}/10 backdrop-blur-md rounded-xl border ${currentMethod.color}/20 p-3`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 bg-gradient-to-r ${currentMethod.color} rounded-full flex items-center justify-center`}>
                <MethodIcon className="w-4 h-4 text-black" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{currentMethod.title}</div>
                <div className="text-[11px] text-white/70">{currentMethod.description}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="text-white/60">Response Time:</div>
                <div className="font-bold text-green-400">{currentMethod.responseTime}</div>
              </div>
              <div>
                <div className="text-white/60">Best For:</div>
                <div className="font-bold">{currentMethod.bestFor}</div>
              </div>
            </div>
            
            <div className="mt-2 p-2 bg-black/20 rounded-lg">
              <div className="text-[10px] text-[#FFD700] font-bold mb-0.5">Psychological Benefit:</div>
              <div className="text-[11px] text-white/70">{currentMethod.psychologicalBenefit}</div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mb-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-3">
          <h3 className="text-sm font-bold text-[#FFD700] mb-2">SEND MESSAGE TO NEXT WINNERS</h3>
          
          {/* Status Messages */}
          {submitStatus && (
            <div className={`mb-3 p-2 rounded-lg border ${
              submitStatus.type === 'success' 
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30' 
                : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                <div className="text-xs font-bold">{submitStatus.message}</div>
              </div>
              
              {submitStatus.details && (
                <div className="pl-5">
                  {submitStatus.details.map((detail, index) => (
                    <div key={index} className="text-[10px] text-white/70">• {detail}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name & Email */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-white/70">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-sm placeholder-white/30 focus:outline-none focus:border-[#FFD700]/30"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-white/70">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-sm placeholder-white/30 focus:outline-none focus:border-[#FFD700]/30"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Phone & Category */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-white/70">Phone (Nigeria)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-sm placeholder-white/30 focus:outline-none focus:border-[#FFD700]/30"
                  placeholder="+234 800 000 0000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-white/70">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#FFD700]/30"
                >
                  {supportCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Subject & Priority */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-white/70">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-sm placeholder-white/30 focus:outline-none focus:border-[#FFD700]/30"
                  placeholder="Brief summary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-white/70">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#FFD700]/30"
                >
                  <option value="normal">Normal (1-4 hours)</option>
                  <option value="urgent">Urgent (15 minutes)</option>
                  <option value="emergency">Emergency (Immediate)</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="mb-2">
              <label className="block text-xs font-medium mb-1 text-white/70">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-sm placeholder-white/30 focus:outline-none focus:border-[#FFD700]/30"
                placeholder="Please describe your issue or question in detail..."
              />
            </div>

            {/* Category Emotional Context */}
            <div className="mb-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 p-2">
              <div className="text-xs font-bold text-[#FFD700] mb-0.5">Emotional Context:</div>
              <div className="text-[11px] text-white/70">
                {supportCategories.find(c => c.id === formData.category)?.emotional || 'General inquiry'}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="mb-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-0.5"
                />
                <div className="text-xs text-white/70">
                  I agree to share my information for support purposes. I understand responses may take 1-4 hours for normal queries.
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-sm font-bold rounded-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-1">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Sending Message...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  Send to NEXT WINNERS Team
                  <Send className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Quick FAQ */}
        <div className="mb-3">
          <h3 className="text-sm font-bold text-[#FFD700] mb-2">QUICK ANSWERS ABOUT NEXT WINNERS</h3>
          <div className="space-y-2">
            {quickFAQs.map((faq, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-2">
                <div className="text-xs font-bold text-white mb-0.5">{faq.question}</div>
                <div className="text-[11px] text-white/70 mb-1">{faq.answer}</div>
                <div className="text-[10px] text-[#FFD700]">{faq.emotional}</div>
              </div>
            ))}
          </div>
        </div>


        {/* Nigerian Presence Stats */}
        <div className="mb-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md rounded-xl border border-green-500/20 p-3">
          <h4 className="text-sm font-bold text-[#FFD700] mb-2 text-center">SERVING ALL NIGERIA</h4>
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="text-xs font-bold text-white/70">36 States</div>
            <div className="text-xs font-bold text-white/70">+774 LGAs</div>
            <div className="text-xs font-bold text-white/70">All Banks</div>
            <div className="text-xs font-bold text-white/70">24/7</div>
          </div>
          <p className="text-[10px] text-white/50 text-center mt-1">Proudly serving every Nigerian</p>
        </div>

        {/* Security Reassurance */}
        <div className="mb-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md rounded-xl border border-green-500/20 p-3">
          <h4 className="text-sm font-bold text-[#FFD700] mb-1 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            BANK-LEVEL SECURITY GUARANTEE
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Data Never Shared</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>SSL Certified</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>NDPR Compliant</span>
            </div>
          </div>
        </div>

        {/* Psychological Comfort Section */}
        <div className="mb-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-md rounded-xl border border-blue-500/20 p-3">
          <h4 className="text-sm font-bold text-[#FFD700] mb-1">WHY 50K+ NIGERIANS TRUST US</h4>
          <p className="text-[11px] text-white/70 mb-2">
            We understand Nigerian users better than anyone. That's why we've designed our support to provide comfort at every step.
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-start gap-1">
              <Heart className="w-3 h-3 text-red-400 mt-0.5" />
              <span>100% Nigerian team</span>
            </div>
            <div className="flex items-start gap-1">
              <Clock className="w-3 h-3 text-green-400 mt-0.5" />
              <span>Naija-friendly response times</span>
            </div>
            <div className="flex items-start gap-1">
              <Users className="w-3 h-3 text-blue-400 mt-0.5" />
              <span>Local language support</span>
            </div>
            <div className="flex items-start gap-1">
              <Trophy className="w-3 h-3 text-yellow-400 mt-0.5" />
              <span>Winner priority treatment</span>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="mb-3">
          <h4 className="text-sm font-bold text-[#FFD700] mb-2 text-center">FOLLOW NEXT WINNERS</h4>
          <div className="flex justify-center gap-3">
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
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-xs text-white/60 mb-1">
            Still need help? Don't hesitate to reach our Naija team!
          </p>
          <button
            onClick={() => handleQuickAction('live-chat')}
            className="text-xs text-[#FFD700] hover:underline"
          >
            Chat with NEXT WINNERS Team →
          </button>
        </div>
      </main>

      {/* Floating Emergency Button */}
      <button
        onClick={() => setFormData(prev => ({ ...prev, priority: 'emergency' }))}
        className="fixed bottom-16 right-2 w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-[0_0_15px_rgba(255,0,0,0.5)] hover:scale-110 transition-all active:scale-95 z-40"
      >
        <AlertCircle className="w-5 h-5 text-white" />
      </button>
    </div>
  );
};

export default ContactPage;