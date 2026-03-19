// ====== IMPORTS ======
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Import only necessary icons
import { 
  ChevronLeft, Share2, Heart, Shield, CheckCircle,
  Users, Clock, DollarSign, Target, TrendingUp,
  Award, Zap, Star, MapPin, Truck,
  XCircle, Maximize2, Plus, Minus, X,
  Facebook, Twitter, Instagram, Copy, ChevronRight,
  ArrowRight, ShoppingCart, BarChart, Percent,
  Eye, Package, Globe, Bookmark, Tag,
  Info, HelpCircle, ExternalLink, Filter,
  User, Lock, Wallet, CreditCard, Ticket,
  AlertCircle, Sparkles, TrendingDown, Crown, Flame,
  ShoppingBag, Camera, Headphones, Wifi, Loader,
  RefreshCw, Megaphone, AlertTriangle, Calendar,
  Gift
} from 'lucide-react';

// Import react-medium-image-zoom for image zooming
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// Firebase imports
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebaseConfig';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc,
  writeBatch,
  serverTimestamp,
  increment,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';

// ====== REUSABLE COMPONENTS ======
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <div className="text-lg font-bold">Loading Raffle...</div>
      <div className="text-sm text-white/60 mt-2">Getting everything ready for you</div>
    </div>
  </div>
);

const ShareModal = ({ onClose, onCopyLink, url }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 backdrop-blur-xl rounded-2xl max-w-sm w-full p-6 border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Share This Raffle</h3>
        <button onClick={onClose}>
          <X size={20} className="text-white/60" />
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-3 mb-4">
        <button className="p-3 bg-blue-600/20 rounded-lg hover:bg-blue-600/30 transition-colors">
          <Facebook size={24} className="text-blue-400 mx-auto" />
        </button>
        <button className="p-3 bg-cyan-500/20 rounded-lg hover:bg-cyan-500/30 transition-colors">
          <Twitter size={24} className="text-cyan-400 mx-auto" />
        </button>
        <button className="p-3 bg-pink-600/20 rounded-lg hover:bg-pink-600/30 transition-colors">
          <Instagram size={24} className="text-pink-400 mx-auto" />
        </button>
        <button onClick={onCopyLink} className="p-3 bg-green-600/20 rounded-lg hover:bg-green-600/30 transition-colors">
          <Copy size={24} className="text-green-400 mx-auto" />
        </button>
      </div>
      
      <div className="bg-white/5 rounded-lg p-3 flex items-center gap-2">
        <div className="text-sm text-white/60 flex-1 truncate">
          {url}
        </div>
        <button 
          onClick={onCopyLink}
          className="text-yellow-400 text-sm font-bold"
        >
          Copy
        </button>
      </div>
    </div>
  </div>
);

const SuccessModal = ({ quantity, total, ticketNumbers, raffleTitle, onViewTickets, onBrowseMore }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 backdrop-blur-xl rounded-2xl max-w-sm w-full p-6 border border-white/20">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-white" />
        </div>
        <h3 className="font-black text-xl mb-2 text-white">🎉 Tickets Purchased!</h3>
        <p className="text-white/80 mb-4">
          You've successfully purchased {quantity} ticket{quantity > 1 ? 's' : ''}
        </p>
        
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 mb-6">
          <div className="text-sm font-bold text-green-400 mb-2">Your Ticket Numbers:</div>
          <div className="space-y-1">
            {ticketNumbers.slice(0, 3).map((num, idx) => (
              <div key={idx} className="font-mono text-sm bg-black/30 px-2 py-1 rounded">
                {num}
              </div>
            ))}
            {ticketNumbers.length > 3 && (
              <div className="text-xs text-white/60 mt-1">
                +{ticketNumbers.length - 3} more tickets
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={onViewTickets}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:shadow-lg transition-all"
          >
            View My Tickets
          </button>
          <button 
            onClick={onBrowseMore}
            className="w-full py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-lg hover:bg-white/20 transition-all"
          >
            Browse More Raffles
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ====== ANNOUNCEMENT BAR COMPONENT ======
const AnnouncementBar = () => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const navigate = useNavigate();

  const announcements = [
    {
      id: 1,
      message: "🎯 If tickets don't sell out, draw will be postponed by 7 days to ensure fair odds!",
      icon: Calendar,
      link: null,
      color: "text-yellow-400",
      bgColor: "from-yellow-500/10 to-orange-500/10"
    },
    {
      id: 2,
      message: "🏆 Meet our winners! See real people winning amazing prizes.",
      icon: Award,
      link: "/winners",
      color: "text-blue-400",
      bgColor: "from-blue-500/10 to-cyan-500/10"
    },
    {
      id: 3,
      message: "📺 Watch live draws! Experience the excitement in real-time.",
      icon: Eye,
      link: "/live-draw",
      color: "text-purple-400",
      bgColor: "from-purple-500/10 to-pink-500/10"
    },
    {
      id: 4,
      message: "❓ How does it work? Learn about our transparent process.",
      icon: HelpCircle,
      link: "/how-it-works",
      color: "text-green-400",
      bgColor: "from-green-500/10 to-emerald-500/10"
    },
    {
      id: 5,
      message: "⚖️ 100% legal & secure. Read our terms and conditions.",
      icon: Shield,
      link: "/legal",
      color: "text-red-400",
      bgColor: "from-red-500/10 to-orange-500/10"
    },
    {
      id: 6,
      message: "💰 Create your own raffle! Turn your items into cash.",
      icon: TrendingUp,
      link: "/create-raffle",
      color: "text-pink-400",
      bgColor: "from-pink-500/10 to-rose-500/10"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  const currentAnn = announcements[currentAnnouncement];
  const Icon = currentAnn.icon;

  const handleClick = () => {
    if (currentAnn.link) {
      navigate(currentAnn.link);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`px-4 py-3 bg-gradient-to-r ${currentAnn.bgColor} backdrop-blur-sm border-y border-white/10 cursor-pointer transition-all duration-500 hover:opacity-90 ${
        currentAnn.link ? 'hover:scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-center gap-3 animate-fade-in">
        <div className={`p-1.5 rounded-full bg-white/10 ${currentAnn.color}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white">
            {currentAnn.message}
          </div>
          {currentAnn.link && (
            <div className="text-xs text-white/60 mt-0.5 flex items-center gap-1">
              Learn more <ArrowRight size={10} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {announcements.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                idx === currentAnnouncement 
                  ? 'bg-yellow-500 w-3' 
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ====== MARKETING STRATEGY COMPONENT ======
const MarketingStrategySection = ({ raffle }) => {
  const navigate = useNavigate();
  
  const strategies = [
    {
      title: "Social Proof",
      description: "See recent winners and join the winning community",
      icon: Users,
      link: "/winners",
      action: "View Winners",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Live Experience",
      description: "Watch live draws for transparency and excitement",
      icon: Eye,
      link: "/live-draw",
      action: "Watch Live",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Community Hub",
      description: "Join discussions, share strategies, connect with players",
      icon: Users,
      link: "/forum",
      action: "Join Forum",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Become a Host",
      description: "Have something valuable? Create your own raffle",
      icon: TrendingUp,
      link: "/",
      action: "Start Raffle",
      color: "from-orange-500 to-red-500"
    }
  ];

  const urgencyTriggers = [
    {
      id: 1,
      message: `Only ${raffle?.totalTickets - raffle?.ticketsSold || 0} tickets left! Don't miss your chance.`,
      emoji: "⏰"
    },
    {
      id: 2,
      message: `${raffle?.ticketsSold || 0} people have already bought tickets. Join them!`,
      emoji: "👥"
    },
    {
      id: 3,
      message: `Your ₦${(raffle?.ticketPrice || 0).toLocaleString()} could win you ${raffle?.value || 'prize'}. Imagine that!`,
      emoji: "🎯"
    }
  ];

  const [currentUrgency, setCurrentUrgency] = useState(0);

  useEffect(() => {
    if (!urgencyTriggers.length) return;
    
    const interval = setInterval(() => {
      setCurrentUrgency((prev) => (prev + 1) % urgencyTriggers.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [urgencyTriggers.length]);

  return (
    <div className="px-4 mt-6 space-y-6">
      {/* Urgency Triggers */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={20} className="text-yellow-400" />
          <h3 className="font-bold text-lg">Hurry! Limited Time</h3>
        </div>
        
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xl">{urgencyTriggers[currentUrgency]?.emoji || "⏰"}</span>
            <p className="text-sm font-medium text-white">
              {urgencyTriggers[currentUrgency]?.message || "Limited tickets available!"}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-white/60">
              {currentUrgency + 1} of {urgencyTriggers.length}
            </div>
            <div className="flex gap-1">
              {urgencyTriggers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentUrgency(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentUrgency ? 'bg-yellow-500 w-4' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Strategies Grid */}
      <div>
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Megaphone size={20} className="text-purple-400" />
          More Ways to Engage
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {strategies.map((strategy, index) => {
            const Icon = strategy.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(strategy.link)}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${strategy.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{strategy.title}</div>
                    <div className="text-xs text-white/60">{strategy.action}</div>
                  </div>
                </div>
                <div className="text-xs text-white/80 mt-2">
                  {strategy.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special Offer Section */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full mb-3">
            <Crown size={14} className="text-yellow-400" />
            <span className="text-xs font-bold text-purple-300">EXCLUSIVE OFFER</span>
          </div>
          <h3 className="font-black text-lg mb-2">First-Time Buyer Bonus!</h3>
          <p className="text-white/80 text-sm mb-4">
            Purchase 5+ tickets and get a FREE entry into our weekly ₦500,000 giveaway!
          </p>
          <button 
            onClick={() => navigate('/dashboard?tab=bonus')}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Gift size={20} />
            Claim Your Bonus
          </button>
        </div>
      </div>
    </div>
  );
};

// ====== CACHE IMPLEMENTATION ======
const createCache = () => {
  const cache = {
    raffles: new Map(),
    users: new Map(),
    favorites: new Map(),
    expiration: 5 * 60 * 1000 // 5 minutes
  };

  const getCached = (key, type) => {
    const item = cache[type]?.get(key);
    if (item && Date.now() - item.timestamp < cache.expiration) {
      return item.data;
    }
    return null;
  };

  const setCached = (key, data, type) => {
    cache[type]?.set(key, {
      data,
      timestamp: Date.now()
    });
  };

  const clearCache = (type, key) => {
    if (key) {
      cache[type]?.delete(key);
    } else {
      cache[type]?.clear();
    }
  };

  return { getCached, setCached, clearCache };
};

// ====== MAIN COMPONENT ======
const RaffleDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // ====== STATE MANAGEMENT ======
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTab, setSelectedTab] = useState('details');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [timer, setTimer] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [raffleLoading, setRaffleLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState(0);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [relatedRaffles, setRelatedRaffles] = useState([]);
  const [raffle, setRaffle] = useState(null);
  const [error, setError] = useState(null);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [imageLoading, setImageLoading] = useState(true);
  const [isDrawExpired, setIsDrawExpired] = useState(false);

  // Firebase
  const auth = getAuth(app);
  const db = getFirestore(app);

  // PayStack configuration
  const PAYSTACK_PUBLIC_KEY = 'pk_test_8659b5b554f5e935476df72b2e0950d3b1f560ad';

  // Initialize cache
  const cache = useMemo(() => createCache(), []);
  const { getCached, setCached, clearCache } = cache;

  // ====== DEBOUNCE FUNCTION ======
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // ====== CHECK DRAW DATE ======
  const checkDrawDate = useCallback((drawDate) => {
    if (!drawDate) return false;
    const now = new Date();
    const draw = new Date(drawDate);
    return now > draw;
  }, []);

  // ====== LOAD PAYSTACK SCRIPT ======
  useEffect(() => {
    const loadPaystack = () => {
      if (window.PaystackPop) {
        setPaystackLoaded(true);
        return;
      }

      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      if (existingScript) {
        setPaystackLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.defer = true;
      script.onload = () => setPaystackLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Paystack script');
        setPaystackLoaded(false);
      };
      
      document.body.appendChild(script);
    };

    loadPaystack();
  }, []);

  // ====== AUTH STATE ======
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoggedIn(!!currentUser);
      setUser(currentUser);
      
      if (currentUser) {
        await loadUserData(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [auth]);

  // ====== INITIAL LOAD ======
  useEffect(() => {
    const initialize = async () => {
      try {
        await loadRaffleData();
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Failed to initialize. Please refresh the page.');
        setRaffleLoading(false);
      }
    };

    initialize();
  }, [id]);

  // ====== FORMAT RAFFLE DATA ======
  const formatRaffleData = (data, docId, expired) => {
    // Handle images safely
    const imagesArray = Array.isArray(data.images) ? data.images : [];
    const formattedImages = imagesArray.slice(0, 5).map(img => {
      if (typeof img === 'string') {
        return {
          main: img,
          thumb: img
        };
      }
      return {
        main: img.url || img.main || '',
        thumb: img.thumb || img.url || img.main || ''
      };
    });

    // Add default image if none
    if (formattedImages.length === 0) {
      formattedImages.push({
        main: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
      });
    }

    return {
      id: docId,
      title: data.title || 'Untitled Raffle',
      description: data.description || '',
      longDescription: data.longDescription || data.description || '',
      value: data.value || '₦0',
      ticketPrice: data.ticketPrice || 1000,
      ticketsSold: data.ticketsSold || 0,
      totalTickets: data.totalTickets || 1000,
      category: data.category || 'others',
      location: data.location || 'Not specified',
      delivery: data.delivery || 'Free delivery nationwide',
      status: expired ? 'Expired' : (data.status || 'Active'),
      odds: data.odds || `1 in ${data.totalTickets || 1000}`,
      drawDate: data.drawDate || data.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      organizer: data.organizer || 'NextWinner Official',
      verified: data.verified || false,
      featured: data.featured || false,
      images: formattedImages,
      features: Array.isArray(data.features) ? data.features.slice(0, 6) : [],
      specifications: data.specifications || {},
      emotionalTriggers: Array.isArray(data.emotionalTriggers) ? data.emotionalTriggers.slice(0, 3) : [],
      faq: Array.isArray(data.faq) ? data.faq.slice(0, 5) : []
    };
  };

  // ====== LOAD RAFFLE DATA ======
  const loadRaffleData = async () => {
    try {
      setRaffleLoading(true);
      setError(null);

      if (!id) {
        setError('No raffle ID provided');
        setRaffleLoading(false);
        return;
      }

      // Check cache first
      const cachedRaffle = getCached(id, 'raffles');
      if (cachedRaffle) {
        setRaffle(cachedRaffle);
        const expired = checkDrawDate(cachedRaffle.drawDate);
        setIsDrawExpired(expired);
        updateTimer(cachedRaffle.drawDate);
        
        // Load related data in parallel
        await Promise.all([
          loadRelatedRaffles(cachedRaffle.category),
          loadRecentPurchases()
        ]);
        
        if (user) {
          await checkIfFavorite(user.uid, id);
        }
        
        setRaffleLoading(false);
        return;
      }

      const raffleRef = doc(db, 'raffles', id);
      const raffleSnap = await getDoc(raffleRef);

      if (!raffleSnap.exists()) {
        setError('Raffle not found');
        setRaffleLoading(false);
        return;
      }

      const data = raffleSnap.data();
      const expired = checkDrawDate(data.drawDate);
      setIsDrawExpired(expired);
      
      const formattedRaffle = formatRaffleData(data, raffleSnap.id, expired);
      setCached(id, formattedRaffle, 'raffles');
      setRaffle(formattedRaffle);
      
      updateTimer(formattedRaffle.drawDate);
      
      // Load related data in parallel
      await Promise.all([
        loadRelatedRaffles(formattedRaffle.category),
        loadRecentPurchases()
      ]);
      
      if (user) {
        await checkIfFavorite(user.uid, id);
      }
      
    } catch (error) {
      console.error('Error loading raffle:', error);
      setError(`Failed to load raffle: ${error.message}`);
    } finally {
      setRaffleLoading(false);
      setLoading(false);
    }
  };

  // ====== LOAD RELATED RAFFLES ======
  const loadRelatedRaffles = async (category) => {
    try {
      const cacheKey = `related_${category}`;
      const cachedRelated = getCached(cacheKey, 'raffles');
      if (cachedRelated) {
        setRelatedRaffles(cachedRelated);
        return;
      }

      const relatedQuery = query(
        collection(db, 'raffles'),
        where('category', '==', category),
        where('status', '==', 'Active'),
        orderBy('ticketsSold', 'desc'),
        limit(4)
      );

      const querySnapshot = await getDocs(relatedQuery);
      const related = [];

      querySnapshot.forEach((doc) => {
        if (doc.id !== id) {
          const data = doc.data();
          related.push({
            id: doc.id,
            title: data.title || 'Untitled',
            value: data.value || '₦0',
            ticketPrice: data.ticketPrice || 1000,
            ticketsSold: data.ticketsSold || 0,
            totalTickets: data.totalTickets || 1000,
            image: data.image || data.images?.[0] || '',
            urgency: `${(data.totalTickets || 1000) - (data.ticketsSold || 0)} left`,
            category: data.category || 'others'
          });
        }
      });

      setCached(cacheKey, related, 'raffles');
      setRelatedRaffles(related);
    } catch (error) {
      console.error('Error loading related raffles:', error);
    }
  };

  // ====== LOAD USER DATA ======
  const loadUserData = async (userId) => {
    try {
      const cachedUser = getCached(userId, 'users');
      if (cachedUser) {
        setBalance(cachedUser.balance || 0);
        return;
      }

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        setCached(userId, data, 'users');
        setBalance(data.balance || 0);
      } else {
        await createUserDocument(userId);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const createUserDocument = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        uid: userId,
        email: user?.email || '',
        displayName: user?.displayName || '',
        balance: 0,
        createdAt: serverTimestamp(),
        accountType: 'user'
      });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // ====== CHECK IF FAVORITE ======
  const checkIfFavorite = async (userId, raffleId) => {
    try {
      const cacheKey = `${userId}_${raffleId}`;
      const cachedFavorite = getCached(cacheKey, 'favorites');
      if (cachedFavorite !== null) {
        setIsFavorite(cachedFavorite);
        return;
      }

      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('raffleId', '==', raffleId),
        where('isActive', '==', true),
        limit(1)
      );
      
      const querySnapshot = await getDocs(favoritesQuery);
      const isFav = !querySnapshot.empty;
      
      setCached(cacheKey, isFav, 'favorites');
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  // ====== TOGGLE FAVORITE ======
  const toggleFavorite = async () => {
    if (!isLoggedIn || !user) {
      navigate(`/login?returnUrl=/item/${id}`);
      return;
    }

    try {
      const batch = writeBatch(db);
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', user.uid),
        where('raffleId', '==', id),
        where('isActive', '==', true),
        limit(1)
      );
      
      const querySnapshot = await getDocs(favoritesQuery);
      
      if (!querySnapshot.empty) {
        const favDoc = querySnapshot.docs[0];
        batch.update(doc(db, 'favorites', favDoc.id), {
          isActive: false,
          removedAt: serverTimestamp()
        });
        setIsFavorite(false);
        setCached(`${user.uid}_${id}`, false, 'favorites');
      } else {
        const favRef = doc(collection(db, 'favorites'));
        batch.set(favRef, {
          userId: user.uid,
          raffleId: id,
          raffleTitle: raffle?.title || '',
          createdAt: serverTimestamp(),
          isActive: true
        });
        setIsFavorite(true);
        setCached(`${user.uid}_${id}`, true, 'favorites');
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // ====== LOAD RECENT PURCHASES ======
  const loadRecentPurchases = async () => {
    try {
      const purchasesQuery = query(
        collection(db, 'transactions'),
        where('raffleId', '==', id),
        where('type', '==', 'purchase'),
        where('status', '==', 'completed'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const querySnapshot = await getDocs(purchasesQuery);
      if (querySnapshot.empty) {
        setRecentPurchases([]);
        return;
      }

      const purchases = [];
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        
        // Get user data if available
        let userName = 'Anonymous User';
        let userInitials = 'AU';
        
        if (data.userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userName = userData.displayName || userData.firstName || 'Anonymous User';
              userInitials = (userData.displayName || 'AU').charAt(0).toUpperCase();
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
          }
        }

        purchases.push({
          id: docSnapshot.id,
          userId: data.userId,
          userName,
          userInitials,
          quantity: data.ticketQuantity || 1,
          amount: data.amount || 0,
          time: data.createdAt || serverTimestamp()
        });
      }

      setRecentPurchases(purchases);
    } catch (error) {
      console.error('Error loading recent purchases:', error);
      setRecentPurchases([]);
    }
  };

  // ====== TIMER FUNCTIONS ======
  const updateTimer = useCallback((drawDate) => {
    if (!drawDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const draw = new Date(drawDate);
      const difference = draw - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimer(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimer(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ====== SCROLL PROGRESS ======
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrollTop / docHeight) * 100);
    };
    
    const debouncedScroll = debounce(handleScroll, 100);
    window.addEventListener('scroll', debouncedScroll);
    return () => window.removeEventListener('scroll', debouncedScroll);
  }, [debounce]);

  // ====== EMOTIONAL TRIGGER ROTATION ======
  useEffect(() => {
    if (!raffle || !raffle.emotionalTriggers || raffle.emotionalTriggers.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentTrigger((prev) => 
        (prev + 1) % raffle.emotionalTriggers.length
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [raffle]);

  // ====== PAYMENT FUNCTIONS ======
  const handleBuyTickets = async () => {
    if (!isLoggedIn || !user) {
      navigate(`/login?returnUrl=/item/${id}`);
      return;
    }

    if (!paystackLoaded) {
      setError('Payment system is still loading. Please wait a moment.');
      return;
    }

    if (!raffle || ticketQuantity < 1 || isDrawExpired) {
      setError(isDrawExpired ? 'This raffle has ended' : 'Invalid ticket quantity');
      return;
    }

    const totalAmount = ticketQuantity * raffle.ticketPrice;
    setProcessingPayment(true);
    setError(null);

    try {
      if (balance >= totalAmount) {
        await handleWalletPayment(totalAmount);
      } else {
        handlePaystackPayment(totalAmount);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
      setProcessingPayment(false);
    }
  };

  const handleWalletPayment = async (amount) => {
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', user.uid);
      
      batch.update(userRef, {
        balance: increment(-amount),
        'stats.totalSpent': increment(amount),
        lastActivity: serverTimestamp()
      });

      await batch.commit();
      setBalance(prev => prev - amount);
      await finalizePurchase('wallet', null, amount);
    } catch (error) {
      console.error('Wallet payment error:', error);
      throw error;
    }
  };

  const handlePaystackPayment = (amount) => {
    if (!window.PaystackPop) {
      setError('Payment system not available. Please refresh.');
      setProcessingPayment(false);
      return;
    }

    const reference = `NXTWINNER_${Date.now()}_${raffle.id}`;
    
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: amount * 100,
      ref: reference,
      currency: 'NGN',
      metadata: {
        raffleId: raffle.id,
        ticketQuantity,
        userId: user.uid
      },
      callback: async (response) => {
        try {
          await finalizePurchase('paystack', response, amount);
        } catch (error) {
          console.error('Error finalizing:', error);
          setError('Payment succeeded but ticket creation failed. Contact support.');
          setProcessingPayment(false);
        }
      },
      onClose: function() {
        setProcessingPayment(false);
      }
    });

    handler.openIframe();
  };

  const finalizePurchase = async (method, paystackResponse, amount) => {
    try {
      const batch = writeBatch(db);
      const timestamp = serverTimestamp();

      // Create transaction record
      const transactionRef = doc(collection(db, 'transactions'));
      batch.set(transactionRef, {
        userId: user.uid,
        amount: amount,
        type: 'purchase',
        status: 'completed',
        method: method,
        reference: paystackResponse?.reference || `WALLET_${Date.now()}`,
        raffleId: raffle.id,
        raffleTitle: raffle.title,
        ticketQuantity: ticketQuantity,
        createdAt: timestamp,
        userEmail: user.email
      });

      // Create tickets
      const ticketNumbers = Array.from({ length: ticketQuantity }, (_, i) => 
        `NXTWINNER-${raffle.id.slice(0, 4)}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      );

      ticketNumbers.forEach(ticketNumber => {
        const ticketRef = doc(collection(db, 'tickets'));
        batch.set(ticketRef, {
          ticketNumber,
          userId: user.uid,
          raffleId: raffle.id,
          raffleTitle: raffle.title,
          value: raffle.value,
          purchaseDate: timestamp,
          drawDate: raffle.drawDate,
          status: 'active',
          price: raffle.ticketPrice
        });
      });

      // Update raffle ticket count
      const raffleRef = doc(db, 'raffles', raffle.id);
      batch.update(raffleRef, {
        ticketsSold: increment(ticketQuantity),
        updatedAt: timestamp
      });

      // Update user stats
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        'stats.ticketsPurchased': increment(ticketQuantity),
        'stats.totalSpent': increment(amount),
        lastActivity: timestamp
      });

      await batch.commit();
      
      // Update cache
      if (raffle) {
        const updatedRaffle = { ...raffle };
        updatedRaffle.ticketsSold += ticketQuantity;
        setCached(id, updatedRaffle, 'raffles');
        setRaffle(updatedRaffle);
      }

      showSuccessModalHandler(ticketNumbers, amount);
      
      // Clear cache for related raffles
      clearCache('raffles', `related_${raffle.category}`);
      
    } catch (error) {
      console.error('Finalize purchase error:', error);
      throw error;
    } finally {
      setProcessingPayment(false);
    }
  };

  const showSuccessModalHandler = (ticketNumbers, amount) => {
    setShowSuccessModal({
      quantity: ticketQuantity,
      total: amount,
      ticketNumbers: ticketNumbers,
      raffleTitle: raffle.title
    });
    setTicketQuantity(1);
  };

  // ====== HELPER FUNCTIONS ======
  const calculateProgress = () => {
    if (!raffle || !raffle.totalTickets) return 0;
    return (raffle.ticketsSold / raffle.totalTickets) * 100;
  };

  const calculateOddsImprovement = (quantity) => {
    if (!raffle || !raffle.totalTickets) return "0";
    const baseOdds = raffle.totalTickets;
    const improvement = (quantity / baseOdds) * 100;
    return Math.min(99.9, improvement).toFixed(1);
  };

  const totalAmount = raffle ? ticketQuantity * raffle.ticketPrice : 0;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Win ${raffle?.title || 'Raffle'} worth ${raffle?.value || 'prize'}`,
          text: `Join me in winning this amazing ${raffle?.title || 'raffle'}! Ticket price: ₦${(raffle?.ticketPrice || 0).toLocaleString()}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareModal(false);
  };

  const handleRelatedRaffleClick = (raffleId) => {
    navigate(`/item/${raffleId}`);
  };

  const formatBalance = () => {
    return `₦${balance.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Coming soon';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Coming soon';
    }
  };

  const formatNumber = (num) => {
    return num?.toLocaleString('en-US') || '0';
  };

  // ====== RENDER LOADING ======
  if (raffleLoading || loading) {
    return <LoadingSpinner />;
  }

  // ====== RENDER ERROR ======
  if (error || !raffle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 z-40">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-white/80 hover:text-white"
              >
                <ChevronLeft size={20} />
                <span className="text-sm font-medium">Back</span>
              </button>
            </div>
          </div>
        </header>

        <main className="pt-20 px-4">
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20">
            <div className="text-5xl mb-4">😢</div>
            <h2 className="text-xl font-bold mb-2">Raffle Not Found</h2>
            <p className="text-white/80 mb-4">
              {error || 'The raffle you are looking for does not exist or has been removed.'}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="flex-1 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
              >
                Go Back
              </button>
              <button 
                onClick={() => navigate('/raffles')}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:shadow-xl transition-all"
              >
                Browse Raffles
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ====== MAIN RENDER ======
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pb-24">
      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 z-50"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/80 hover:text-white"
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleShare}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <Share2 size={20} />
              </button>
              <button 
                onClick={toggleFavorite}
                className={`p-2 rounded-lg ${isFavorite ? 'text-red-500' : 'hover:bg-white/10'}`}
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Rotating Announcement Bar */}
        <AnnouncementBar />

        {/* Image Gallery with Zoom */}
        <div className="relative">
          <div className="h-72 overflow-hidden relative">
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                <Clock size={12} />
                <span className="font-bold">Draw: {formatDate(raffle?.drawDate)}</span>
              </div>
            </div>
            
            {/* SAFE IMAGE DISPLAY */}
            {raffle && raffle.images && raffle.images.length > 0 && (
              <Zoom>
                <div className="w-full h-full">
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  <img
                    src={
                      raffle.images[selectedImage]?.main || 
                      raffle.images[0]?.main || 
                      'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
                    }
                    alt={raffle.title || 'Raffle Image'}
                    className={`w-full h-full object-cover transition-opacity duration-300 cursor-zoom-in ${
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    onLoad={() => setImageLoading(false)}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                      setImageLoading(false);
                    }}
                  />
                </div>
              </Zoom>
            )}
          </div>
          
          {/* Thumbnails with Zoom */}
          {raffle.images && raffle.images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 px-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-center">
                {raffle.images.map((img, index) => (
                  <Zoom key={index}>
                    <button
                      onClick={() => {
                        setSelectedImage(index);
                        setImageLoading(true);
                      }}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index 
                          ? 'border-yellow-500 shadow-lg' 
                          : 'border-white/30 hover:border-white/50'
                      } transition-all cursor-zoom-in`}
                    >
                      <img
                        src={img.thumb || img.main}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  </Zoom>
                ))}
              </div>
            </div>
          )}
          
          {/* Verified Badge */}
          {raffle.verified && (
            <div className="absolute top-3 left-12 bg-green-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle size={12} />
              Verified
            </div>
          )}
        </div>

        {/* Prize Value */}
        <div className="px-4 py-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-sm text-white/80">WIN THIS VALUABLE PRIZE</div>
            <div className="text-3xl font-black text-yellow-400 mt-1">{raffle.value}</div>
            <div className="text-lg font-bold">{raffle.title}</div>
          </div>
        </div>

        {/* Expired Banner */}
        {isDrawExpired && (
          <div className="px-4 py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border-y border-white/10">
            <div className="flex items-center gap-2 justify-center">
              <Clock size={16} className="text-red-400" />
              <div className="text-sm font-bold text-red-400">
                🎯 This raffle has ended. Draw date has passed.
              </div>
            </div>
          </div>
        )}

        {/* Emotional Trigger */}
        {raffle.emotionalTriggers && raffle.emotionalTriggers.length > 0 && !isDrawExpired && (
          <div className="px-4 py-3 bg-white/5 backdrop-blur-sm border-y border-white/10">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yellow-500 animate-pulse" />
              <div className="text-sm italic text-white/90">
                "{raffle.emotionalTriggers[currentTrigger]}"
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-white/5 rounded-xl p-3">
              <div className="text-2xl font-black text-white">{formatNumber(raffle.ticketsSold)}</div>
              <div className="text-xs text-white/60">Tickets Sold</div>
            </div>
            <div className="text-center bg-white/5 rounded-xl p-3">
              <div className="text-2xl font-black text-green-400">{raffle.odds}</div>
              <div className="text-xs text-white/60">Winning Odds</div>
            </div>
            <div className="text-center bg-white/5 rounded-xl p-3">
              <div className="text-2xl font-black text-blue-400">
                ₦{formatNumber(raffle.ticketPrice)}
              </div>
              <div className="text-xs text-white/60">Per Ticket</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/80">
              {formatNumber(raffle.ticketsSold)} of {formatNumber(raffle.totalTickets)} tickets
            </span>
            <span className="font-bold text-yellow-400">
              {Math.round(calculateProgress())}%
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          <div className="text-xs text-yellow-400 font-bold mt-2 flex items-center gap-1">
            <Flame size={12} />
            Only {formatNumber(raffle.totalTickets - raffle.ticketsSold)} tickets left!
          </div>
        </div>

        {/* Marketing Strategy Section */}
        <MarketingStrategySection raffle={raffle} />

        {/* Ticket Purchase Section */}
        <div className="px-4 py-5 bg-white/5 backdrop-blur-sm border-t border-white/10 mt-4">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg border border-red-500/20">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400" />
                <div className="text-sm text-white">{error}</div>
              </div>
            </div>
          )}

          {/* Wallet Balance */}
          {isLoggedIn && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-blue-400" />
                  <div>
                    <div className="text-sm font-bold text-blue-400">Wallet Balance</div>
                    <div className="text-lg font-black">{formatBalance()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-white/60">Select Tickets</div>
              <div className="text-2xl font-black">
                ₦{formatNumber(totalAmount)}
              </div>
              <div className="text-sm text-white/80">
                {ticketQuantity} ticket{ticketQuantity > 1 ? 's' : ''} × ₦{formatNumber(raffle.ticketPrice)}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                disabled={processingPayment || isDrawExpired}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-50 transition-colors"
              >
                <Minus size={20} />
              </button>
              <div className="text-2xl font-black min-w-[40px] text-center">
                {ticketQuantity}
              </div>
              <button 
                onClick={() => setTicketQuantity(Math.min(50, ticketQuantity + 1))}
                disabled={processingPayment || isDrawExpired}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center hover:shadow-lg disabled:opacity-50 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Odds Improvement */}
          {!isDrawExpired && (
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3 mb-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-green-400" />
                <span className="font-bold text-green-400">Boost Your Odds</span>
              </div>
              <div className="text-sm text-white/80 mb-1">
                Buying <span className="font-bold text-yellow-400">{ticketQuantity} tickets</span> gives you:
              </div>
              <div className="text-lg font-black text-white">
                {calculateOddsImprovement(ticketQuantity)}% better chance of winning!
              </div>
            </div>
          )}

          {/* Payment Info */}
          {isLoggedIn && !isDrawExpired && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-3 mb-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={16} className="text-yellow-400" />
                <span className="font-bold text-yellow-400">Payment Method</span>
              </div>
              <div className="text-sm text-white/80">
                {balance >= totalAmount 
                  ? "Funds will be auto-deducted from your wallet balance"
                  : "Pay with card (PayStack)"}
              </div>
            </div>
          )}

          {/* Main CTA Button */}
          <button 
            onClick={handleBuyTickets}
            disabled={processingPayment || !paystackLoaded || isDrawExpired}
            className={`w-full py-4 text-black font-black text-lg rounded-xl transition-all mb-3 ${
              isDrawExpired 
                ? 'bg-gray-500 cursor-not-allowed' 
                : processingPayment 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 opacity-70' 
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-2xl hover:shadow-yellow-500/30 hover:-translate-y-0.5'
            }`}
          >
            {isDrawExpired ? (
              '🎯 Raffle Ended'
            ) : processingPayment ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : !isLoggedIn ? (
              <>
                <User size={20} className="inline mr-2" />
                Login to Buy Tickets
              </>
            ) : balance >= totalAmount ? (
              `🎫 Buy ${ticketQuantity} Ticket${ticketQuantity > 1 ? 's' : ''} Now`
            ) : (
              `💳 Pay ₦${formatNumber(totalAmount)} with Card`
            )}
          </button>

          {/* Trust Badges */}
          {!isDrawExpired && (
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
              <div className="text-center group">
                <Shield size={18} className="text-green-400 mx-auto mb-1" />
                <div className="text-xs text-white/80">100% Secure</div>
              </div>
              <div className="text-center group">
                <Award size={18} className="text-blue-400 mx-auto mb-1" />
                <div className="text-xs text-white/80">Real Winners</div>
              </div>
              <div className="text-center group">
                <CheckCircle size={18} className="text-purple-400 mx-auto mb-1" />
                <div className="text-xs text-white/80">Legal & Fair</div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-4 mt-6">
          <div className="flex bg-white/5 backdrop-blur-sm rounded-xl p-1 overflow-hidden">
            {[
              { id: 'details', label: 'Details', icon: Info },
              { id: 'specs', label: 'Specs', icon: Package },
              { id: 'faq', label: 'FAQ', icon: HelpCircle },
              { id: 'activity', label: 'Activity', icon: BarChart }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex-1 py-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                    selectedTab === tab.id
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 shadow-inner'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <Icon 
                    size={18} 
                    className={`mb-1 ${
                      selectedTab === tab.id 
                        ? 'text-yellow-400' 
                        : 'text-white/60'
                    }`} 
                  />
                  <span className={`text-xs font-medium ${
                    selectedTab === tab.id 
                      ? 'text-yellow-400' 
                      : 'text-white/60'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="py-4">
            {selectedTab === 'details' && (
              <div className="space-y-4">
                <div 
                  className="text-white/80 text-justify leading-relaxed"
                  style={{ textAlign: 'justify' }}
                >
                  {raffle.longDescription.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {raffle.features && raffle.features.length > 0 && (
                  <div>
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Sparkles size={18} className="text-yellow-400" />
                      Key Features
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {raffle.features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="bg-white/5 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                            <CheckCircle size={16} className="text-green-400" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'specs' && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <Package size={20} className="text-blue-400" />
                  Specifications
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(raffle.specifications).map(([key, value]) => (
                    <div key={key} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                      <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className="font-bold">{value}</div>
                    </div>
                  ))}
                </div>
                
                {/* Location & Delivery */}
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin size={20} className="text-red-400" />
                    <div>
                      <div className="font-bold">Location</div>
                      <div className="text-sm text-white/80">{raffle.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck size={20} className="text-green-400" />
                    <div>
                      <div className="font-bold">Delivery</div>
                      <div className="text-sm text-white/80">{raffle.delivery}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'faq' && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg flex items-center gap-2 mb-4">
                  <HelpCircle size={20} className="text-yellow-400" />
                  Frequently Asked Questions
                </h4>
                <div className="space-y-3">
                  {raffle.faq.map((item, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                      <div className="font-bold mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold">{index + 1}</span>
                        </div>
                        {item.question}
                      </div>
                      <div className="text-sm text-white/80 leading-relaxed pl-8">{item.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'activity' && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <BarChart size={20} className="text-green-400" />
                  Recent Activity
                </h4>
                {recentPurchases.length > 0 ? (
                  <div className="space-y-3">
                    {recentPurchases.map((purchase, index) => (
                      <div key={purchase.id || index} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                              <span className="font-bold text-sm">
                                {purchase.userInitials}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold">{purchase.userName}</div>
                              <div className="text-sm text-white/60">
                                Purchased {purchase.quantity} ticket{purchase.quantity > 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-400">₦{formatNumber(purchase.amount)}</div>
                            <div className="text-xs text-white/60">
                              {purchase.time?.seconds 
                                ? new Date(purchase.time.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                : 'Recently'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white/5 rounded-xl">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-white/80">No recent activity yet</div>
                    <div className="text-sm text-white/60 mt-1">Be the first to purchase tickets!</div>
                    {!isDrawExpired && (
                      <button 
                        onClick={handleBuyTickets}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:shadow-lg transition-all"
                      >
                        Buy First Ticket
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Raffles */}
        {relatedRaffles.length > 0 && (
          <div className="px-4 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Flame size={20} className="text-orange-400" />
                You May Also Like
              </h3>
              <button 
                onClick={() => navigate('/raffles')}
                className="text-sm text-yellow-400 font-bold flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {relatedRaffles.map((related) => (
                <div 
                  key={related.id}
                  onClick={() => handleRelatedRaffleClick(related.id)}
                  className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-yellow-500/30 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="relative h-28">
                    <Zoom>
                      <img
                        src={related.image || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                        loading="lazy"
                      />
                    </Zoom>
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                      {related.urgency}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-xs mb-1 line-clamp-1">{related.title}</div>
                    <div className="text-sm font-black text-yellow-400 mb-1">{related.value}</div>
                    <div className="text-[10px] text-white/60">
                      ₦{formatNumber(related.ticketPrice)}/ticket
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom Bar */}
      {!isDrawExpired && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-4 z-40">
          <div className="flex gap-3">
            <button 
              onClick={handleBuyTickets}
              disabled={processingPayment || !paystackLoaded}
              className={`flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-lg transition-all ${
                processingPayment ? 'opacity-70' : 'hover:shadow-lg'
              }`}
            >
              {processingPayment ? 'Processing...' : !isLoggedIn ? 'Login to Buy Ticket' : `Buy ${ticketQuantity} Ticket${ticketQuantity > 1 ? 's' : ''}`}
            </button>
            <button 
              onClick={() => navigate('/dashboard?tab=tickets')}
              className="px-4 py-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Ticket size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showSuccessModal && (
        <SuccessModal
          quantity={showSuccessModal.quantity}
          total={showSuccessModal.total}
          ticketNumbers={showSuccessModal.ticketNumbers}
          raffleTitle={showSuccessModal.raffleTitle}
          onViewTickets={() => {
            setShowSuccessModal(false);
            navigate('/dashboard?tab=tickets');
          }}
          onBrowseMore={() => {
            setShowSuccessModal(false);
            navigate('/raffles');
          }}
        />
      )}

      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          onCopyLink={copyLink}
          url={window.location.href}
        />
      )}

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RaffleDetailPage;