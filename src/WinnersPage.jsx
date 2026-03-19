import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where, 
  startAfter,
  Timestamp,
  updateDoc,
  increment,
  doc,
  getDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebaseConfig';

import {
  Trophy, Crown, Star, Users, Calendar, DollarSign,
  Zap, Clock, Heart, Target, Shield, ChevronRight,
  ChevronLeft, TrendingUp, CheckCircle, ArrowRight,
  ShoppingCart, TrendingDown, BarChart, Percent,
  Car, Smartphone, Laptop, Home, Plane,
  Search, Menu, X, Filter, Grid, List,
  MessageCircle, User, Ticket, Award as AwardIcon,
  Plus, Minus, Briefcase, Diamond, Watch, Camera,
  BookOpen, Tag, Eye, Share2, ArrowLeft, ExternalLink,
  Bookmark, Flag, Gift as GiftIcon, Package, UserCheck,
  RefreshCw, AlertCircle, Loader, CreditCard, Wallet,
  Flame, Sparkles, Target as TargetIcon, Globe,
  ThumbsUp, MessageSquare, Instagram, Twitter, Facebook,
  Youtube, Linkedin, Download, Video, Play, Pause,
  Volume2, Mic, Headphones, Camera as CameraIcon,
  MapPin, Navigation, Award, ChevronDown, ChevronUp,
  Filter as FilterIcon, SortAsc, SortDesc, Calendar as CalendarIcon,
  TrendingUp as TrendingIcon, TrendingDown as TrendingDownIcon,
  Award as AwardStar, Verified, ShieldCheck, BadgeCheck,
  Trophy as TrophyIcon, Medal, Ribbon, Gift, PartyPopper,
  Clapperboard, Film, Music,
  Heart as HeartIcon, Smile, ThumbsUp as ThumbsUpIcon,
  MessageCircle as MessageIcon, Share, Eye as EyeIcon,
  Download as DownloadIcon, Flag as FlagIcon,
  Bookmark as BookmarkIcon, MoreVertical,
  LogIn, UserPlus, ChevronUp as UpIcon,
  Target as Bullseye, Users as TeamIcon,
  Award as BadgeIcon, BarChart as StatsIcon,
  LineChart, Zap as ZapIcon, Rocket, Users as InfluencerIcon,
  Percent as PercentIcon, TrendingUp as GrowthIcon,
  Gamepad, Diamond as Gem, Ship, Coffee, Headphones as Headset,
  ShoppingBag, Book as BookIcon, Home as HomeAppliance,
  Gamepad as GamingIcon, ShoppingBag as FashionIcon,
  BookOpen as EducationIcon, Coffee as FoodIcon,
  Plane as TravelIcon, Home as PropertyIcon,
  Megaphone, TrendingUp as TrendIcon, Users as CommunityIcon
} from 'lucide-react';

const WinnersPage = () => {
  const navigate = useNavigate();
  const auth = getAuth(app);
  const [db, setDb] = useState(null);
  
  // Initialize Firestore with error handling
  useEffect(() => {
    try {
      const firestore = getFirestore(app);
      setDb(firestore);
    } catch (error) {
      console.error('Error initializing Firestore:', error);
    }
  }, []);

  // State management
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState({
    totalWinners: 0,
    totalPrizes: '₦0',
    biggestWin: '₦0',
    countries: 0,
    thisMonth: 0
  });

  // Marketing notification state
  const [magicNotification, setMagicNotification] = useState(null);
  const notificationIntervalRef = useRef(null);

  // Cache management
  const winnersCache = useRef({});
  const userCache = useRef({});
  const raffleCache = useRef({});

  // Refs
  const searchInputRef = useRef(null);
  const observerRef = useRef(null);

  // CLEAR MARKETING MESSAGES - USER vs INFLUENCER
  const magicNotifications = useMemo(() => [
    "🏆 REGULAR USERS: See real people winning amazing prizes!",
    "💰 INFLUENCERS: Earn 15% commission by sharing winners' stories",
    "⚡ Users: Play to win prizes | Influencers: Share to earn money",
    "🎯 Two paths: Regular users win prizes, Influencers earn commissions",
    "✨ See real winners! Join as user to play OR as influencer to earn",
    "🚀 User = Buy tickets, win prizes | Influencer = Share, earn 15%",
    "💡 Choose: Want to win? Join as user. Want to earn? Join as influencer."
  ], []);

  // Categories for filtering - Updated with better organization
  const categories = useMemo(() => [
    { id: 'all', label: '🏆 All Winners', icon: Trophy, color: 'from-yellow-500 to-orange-500', plasticColor: 'bg-gradient-to-b from-yellow-400 to-orange-600' },
    { id: 'featured', label: '⭐ Featured', icon: Star, color: 'from-blue-500 to-cyan-500', plasticColor: 'bg-gradient-to-b from-blue-400 to-blue-600' },
    { id: 'verified', label: '✅ Verified', icon: CheckCircle, color: 'from-green-500 to-emerald-500', plasticColor: 'bg-gradient-to-b from-green-400 to-green-600' },
    { id: 'cars', label: '🚗 Cars', icon: Car, color: 'from-red-500 to-orange-500', plasticColor: 'bg-gradient-to-b from-red-400 to-red-600' },
    { id: 'cash', label: '💰 Cash', icon: DollarSign, color: 'from-green-500 to-lime-500', plasticColor: 'bg-gradient-to-b from-green-400 to-green-600' },
    { id: 'property', label: '🏠 Property', icon: PropertyIcon, color: 'from-blue-600 to-indigo-600', plasticColor: 'bg-gradient-to-b from-blue-400 to-blue-600' },
    { id: 'electronics', label: '📱 Tech', icon: Smartphone, color: 'from-purple-600 to-violet-600', plasticColor: 'bg-gradient-to-b from-purple-400 to-purple-600' },
    { id: 'luxury', label: '💎 Luxury', icon: Gem, color: 'from-pink-500 to-rose-500', plasticColor: 'bg-gradient-to-b from-pink-400 to-pink-600' },
    { id: 'other', label: '🎁 Other Prizes', icon: GiftIcon, color: 'from-gray-500 to-slate-500', plasticColor: 'bg-gradient-to-b from-gray-400 to-gray-600' }
  ], []);

  // Years for filtering
  const years = useMemo(() => [
    { id: 'all', label: 'All Time' },
    { id: '2024', label: '2024' },
    { id: '2023', label: '2023' },
    { id: '2022', label: '2022' },
    { id: '2021', label: '2021' }
  ], []);

  // Sort options
  const sortOptions = useMemo(() => [
    { id: 'recent', label: 'Most Recent', icon: CalendarIcon },
    { id: 'biggest', label: 'Biggest Wins', icon: TrendingUp },
    { id: 'oldest', label: 'Oldest First', icon: Calendar },
    { id: 'popular', label: 'Most Popular', icon: ThumbsUp }
  ], []);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsLoggedIn(!!currentUser);
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // Magic notification interval
  useEffect(() => {
    // Clear any existing interval
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }

    // Set new interval for random notifications
    notificationIntervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * magicNotifications.length);
      setMagicNotification(magicNotifications[randomIndex]);
      
      // Auto hide after 8 seconds
      setTimeout(() => {
        setMagicNotification(null);
      }, 8000);
    }, 180000); // Every 3 minutes

    // Show first notification after 20 seconds
    const initialTimeout = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * magicNotifications.length);
      setMagicNotification(magicNotifications[randomIndex]);
      
      setTimeout(() => {
        setMagicNotification(null);
      }, 8000);
    }, 20000);

    return () => {
      clearInterval(notificationIntervalRef.current);
      clearTimeout(initialTimeout);
    };
  }, [magicNotifications]);

  // Helper function to format numbers with commas
  const formatNumberWithCommas = useCallback((num) => {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }, []);

  // Helper function to parse prize value
  const parsePrizeValue = useCallback((valueStr) => {
    if (!valueStr) return 0;
    
    // Extract numeric value from string (handles ₦1,000,000 format)
    const numericString = valueStr.toString().replace(/[^0-9.]/g, '');
    if (!numericString) return 0;
    
    const value = parseFloat(numericString);
    
    // Handle millions (M)
    if (valueStr.toString().toLowerCase().includes('m')) {
      return value * 1000000;
    }
    // Handle thousands (K)
    else if (valueStr.toString().toLowerCase().includes('k')) {
      return value * 1000;
    }
    
    return isNaN(value) ? 0 : value;
  }, []);

  // Helper function to format prize value
  const formatPrizeValue = useCallback((value) => {
    if (!value) return '₦0';
    if (typeof value === 'number') {
      if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `₦${(value / 1000).toFixed(1)}K`;
      return `₦${value.toLocaleString()}`;
    }
    return value;
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = useCallback((timestamp) => {
    if (!timestamp) return 'Recently';
    
    let date;
    try {
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return 'Recently';
      }
    } catch (error) {
      return 'Recently';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  // Get user data from cache or fetch from users collection
  const getUserData = useCallback(async (userId) => {
    if (!userId || !db) return null;
    
    // Check cache first
    if (userCache.current[userId]) {
      return userCache.current[userId];
    }
    
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userInfo = {
          photoURL: userData.photoURL || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          displayName: userData.displayName || '',
          profession: userData.occupation || '',
          city: userData.city || '',
          state: userData.state || '',
          location: userData.location || '',
          age: userData.age || 0,
          email: userData.email || '',
          accountType: userData.accountType || 'user',
          phone: userData.phone || ''
        };
        userCache.current[userId] = userInfo;
        return userInfo;
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
    }
    
    return null;
  }, [db]);

  // Get raffle data from cache or fetch
  const getRaffleData = useCallback(async (raffleId) => {
    if (!raffleId || !db) return null;
    
    // Check cache first
    if (raffleCache.current[raffleId]) {
      return raffleCache.current[raffleId];
    }
    
    try {
      const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
      if (raffleDoc.exists()) {
        const raffleData = raffleDoc.data();
        raffleCache.current[raffleId] = {
          title: raffleData.title || '',
          ticketPrice: raffleData.ticketPrice || 0,
          value: raffleData.value || '₦0',
          image: raffleData.image || raffleData.images?.[0] || ''
        };
        return raffleCache.current[raffleId];
      }
    } catch (error) {
      console.log('Error fetching raffle data:', error);
    }
    
    return null;
  }, [db]);

  // Fetch winners from Firebase with your actual collection structure
  const fetchWinners = useCallback(async (isLoadMore = false) => {
    if (!db) return;
    
    if (!isLoadMore) {
      setLoading(true);
      setLoadingError(null);
    } else {
      setLoadingMore(true);
    }
    
    try {
      // Check cache first for initial load
      const cacheKey = 'winners_cache';
      if (!isLoadMore) {
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        
        // Use cache if less than 10 minutes old
        if (cachedData && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 600000) {
          const parsedData = JSON.parse(cachedData);
          setWinners(parsedData.winners);
          setStats(parsedData.stats);
          setLastVisible(null);
          setHasMore(false);
          setLoading(false);
          console.log('Loaded winners from cache');
          return;
        }
      }
      
      // Build query using your actual winners collection structure
      let winnersQuery;
      if (isLoadMore && lastVisible) {
        winnersQuery = query(
          collection(db, 'winners'),
          where('public', '==', true),
          orderBy('timestamp', 'desc'),
          startAfter(lastVisible),
          limit(12)
        );
      } else {
        winnersQuery = query(
          collection(db, 'winners'),
          where('public', '==', true),
          orderBy('timestamp', 'desc'),
          limit(12)
        );
      }
      
      const querySnapshot = await getDocs(winnersQuery);
      
      if (querySnapshot.empty) {
        if (isLoadMore) {
          setHasMore(false);
        } else {
          setWinners([]);
        }
        return;
      }
      
      const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      if (!isLoadMore) {
        setLastVisible(newLastVisible);
        setHasMore(querySnapshot.docs.length === 12);
      } else {
        setLastVisible(newLastVisible);
        setHasMore(querySnapshot.docs.length === 12);
      }
      
      // Process winners using YOUR actual collection structure
      const winnersData = [];
      let totalPrizesValue = 0;
      let biggestWinValue = 0;
      const countriesSet = new Set();
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      let thisMonthCount = 0;
      
      for (const docSnap of querySnapshot.docs) {
        const winnerData = docSnap.data();
        
        // Parse date from your actual timestamp field
        let winDate;
        try {
          if (winnerData.timestamp) {
            if (winnerData.timestamp.toDate && typeof winnerData.timestamp.toDate === 'function') {
              winDate = winnerData.timestamp.toDate();
            } else if (winnerData.timestamp instanceof Date) {
              winDate = winnerData.timestamp;
            } else if (winnerData.isoDate) {
              winDate = new Date(winnerData.isoDate);
            } else if (winnerData.date) {
              winDate = new Date(winnerData.date);
            } else {
              winDate = new Date();
            }
          } else if (winnerData.isoDate) {
            winDate = new Date(winnerData.isoDate);
          } else if (winnerData.date) {
            winDate = new Date(winnerData.date);
          } else {
            winDate = new Date();
          }
        } catch (error) {
          winDate = new Date();
        }
        
        // Get winner information from YOUR collection fields
       // Get winner information from YOUR collection fields
let winnerName = winnerData.userName || 
                (winnerData.userFirstName && winnerData.userLastName 
                  ? `${winnerData.userFirstName} ${winnerData.userLastName}` 
                  : winnerData.userFirstName || winnerData.userLastName || 'Anonymous Winner');

// FIRST: Try to get city from user data (users collection)
let winnerLocation = 'Nigeria'; // Default fallback

// Always try to get user data first
if (winnerData.userId) {
  const userData = await getUserData(winnerData.userId);
  if (userData) {
    // Priority 1: Use city from users collection
    if (userData.city && userData.city.trim() !== '') {
      winnerLocation = userData.city.trim();
    }
    // Priority 2: Use location from users collection
    else if (userData.location && userData.location.trim() !== '') {
      winnerLocation = userData.location.trim();
    }
    // Priority 3: Combine city and state if both exist
    else if (userData.city && userData.state) {
      winnerLocation = `${userData.city}, ${userData.state}`;
    }
  }
}

// SECOND: If user data didn't have location, check winner document directly
if (winnerLocation === 'Nigeria' || winnerLocation === '') {
  if (winnerData.userCity && winnerData.userCity.trim() !== '') {
    winnerLocation = winnerData.userCity.trim();
  } else if (winnerData.userLocation && winnerData.userLocation.trim() !== '') {
    winnerLocation = winnerData.userLocation.trim();
  } else if (winnerData.city && winnerData.city.trim() !== '') {
    winnerLocation = winnerData.city.trim();
  } else if (winnerData.location && winnerData.location.trim() !== '') {
    winnerLocation = winnerData.location.trim();
  }
}

// Format location nicely
if (winnerLocation && winnerLocation !== 'Nigeria') {
  winnerLocation = winnerLocation
    .split(',')
    .map(part => 
      part.trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    )
    .join(', ');
}
        
        // Get prize information from YOUR collection structure
        let prizeTitle = winnerData.raffleTitle || 
                        winnerData.prize?.name || 
                        'Amazing Prize';
        
        let prizeValue = formatPrizeValue(winnerData.prize?.value) || 
                        formatPrizeValue(winnerData.value) || 
                        '₦0';
        
        let prizeImage = winnerData.raffleImage || 
                        'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        
        let ticketNumber = winnerData.ticketNumber || 'N/A';
        let winnerEmail = winnerData.userEmail || '';
        let winnerPhone = winnerData.userPhone || '';
        
        // Determine prize category based on prize name
        let prizeCategory = 'other';
        const prizeTitleLower = prizeTitle.toLowerCase();
        const prizeDescription = winnerData.prize?.description || '';
        const prizeDescriptionLower = prizeDescription.toLowerCase();
        
        if (prizeTitleLower.includes('car') || prizeTitleLower.includes('vehicle') || 
            prizeDescriptionLower.includes('car') || prizeDescriptionLower.includes('vehicle')) {
          prizeCategory = 'cars';
        } else if (prizeTitleLower.includes('cash') || prizeTitleLower.includes('money') || 
                  prizeDescriptionLower.includes('cash') || prizeDescriptionLower.includes('money')) {
          prizeCategory = 'cash';
        } else if (prizeTitleLower.includes('house') || prizeTitleLower.includes('apartment') || 
                  prizeTitleLower.includes('property') || prizeDescriptionLower.includes('house') || 
                  prizeDescriptionLower.includes('apartment') || prizeDescriptionLower.includes('property')) {
          prizeCategory = 'property';
        } else if (prizeTitleLower.includes('phone') || prizeTitleLower.includes('laptop') || 
                  prizeTitleLower.includes('tv') || prizeTitleLower.includes('tech') || 
                  prizeDescriptionLower.includes('phone') || prizeDescriptionLower.includes('laptop') || 
                  prizeDescriptionLower.includes('tv') || prizeDescriptionLower.includes('tech')) {
          prizeCategory = 'electronics';
        } else if (prizeTitleLower.includes('watch') || prizeTitleLower.includes('jewelry') || 
                  prizeTitleLower.includes('diamond') || prizeTitleLower.includes('luxury') ||
                  prizeDescriptionLower.includes('watch') || prizeDescriptionLower.includes('jewelry') || 
                  prizeDescriptionLower.includes('diamond') || prizeDescriptionLower.includes('luxury')) {
          prizeCategory = 'luxury';
        }
        
        // Get additional user data if available from users collection
        let winnerImage = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
        let winnerProfession = '';
        let ticketPrice = 0;
        let ticketsPurchased = 1;
        
        if (winnerData.userId) {
          const userData = await getUserData(winnerData.userId);
          if (userData) {
            if (userData.photoURL) winnerImage = userData.photoURL;
            winnerProfession = userData.profession || '';
            if (!winnerLocation || winnerLocation === 'Unknown Location') {
              winnerLocation = userData.city ? 
                `${userData.city}${userData.state ? ', ' + userData.state : ''}` : 
                userData.location || winnerLocation;
            }
          }
        }
        
        // Get raffle data for ticket price
        if (winnerData.raffleId) {
          const raffleData = await getRaffleData(winnerData.raffleId);
          if (raffleData) {
            ticketPrice = raffleData.ticketPrice || 0;
          }
        }
        
        // Calculate stats
        const prizeValueNum = parsePrizeValue(prizeValue);
        totalPrizesValue += prizeValueNum;
        if (prizeValueNum > biggestWinValue) {
          biggestWinValue = prizeValueNum;
        }
        
        if (winnerLocation && winnerLocation !== 'Unknown Location') {
          countriesSet.add(winnerLocation);
        }
        
        if (winDate >= thisMonth) {
          thisMonthCount++;
        }
        
        const winner = {
          id: docSnap.id,
          winnerId: winnerData.userId,
          winnerName: winnerName,
          winnerImage: winnerImage,
          winnerLocation: winnerLocation,
          winnerProfession: winnerProfession,
          winnerEmail: winnerEmail,
          winnerPhone: winnerPhone,
          prizeTitle: prizeTitle,
          prizeValue: prizeValue,
          prizeCategory: prizeCategory,
          prizeImage: prizeImage,
          ticketNumber: ticketNumber,
          ticketPrice: ticketPrice,
          ticketsPurchased: ticketsPurchased,
          winDate: winDate,
          verified: winnerData.verified || false,
          story: winnerData.prize?.description || `I won ${prizeTitle}! It's an amazing feeling to be a winner!`,
          featured: winnerData.featured || false,
          userId: winnerData.userId,
          raffleId: winnerData.raffleId,
          timeAgo: formatTimeAgo(winnerData.timestamp),
          shareCount: winnerData.shareCount || 0,
          views: winnerData.views || 0,
          // Additional fields from your collection
          drawId: winnerData.drawId,
          drawMethod: winnerData.drawMethod,
          userCity: winnerData.userCity,
          userState: winnerData.userState,
          prizeType: winnerData.prize?.type || 'prize'
        };
        
        winnersData.push(winner);
        winnersCache.current[docSnap.id] = winner;
      }
      
      if (isLoadMore) {
        setWinners(prev => [...prev, ...winnersData]);
      } else {
        setWinners(winnersData);
        
        // Cache the data
        const cacheData = {
          winners: winnersData,
          stats: {
            totalWinners: winnersData.length,
            totalPrizes: formatPrizeValue(totalPrizesValue),
            biggestWin: formatPrizeValue(biggestWinValue),
            countries: countriesSet.size,
            thisMonth: thisMonthCount
          }
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      }
      
      // Update stats for initial load
      if (!isLoadMore) {
        setStats({
          totalWinners: winnersData.length,
          totalPrizes: formatPrizeValue(totalPrizesValue),
          biggestWin: formatPrizeValue(biggestWinValue),
          countries: countriesSet.size,
          thisMonth: thisMonthCount
        });
      }
      
    } catch (error) {
      console.error('Error fetching winners:', error);
      if (!isLoadMore) {
        setLoadingError(`Failed to load winners: ${error.message}`);
        setWinners([]);
      }
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [db, lastVisible, getUserData, getRaffleData, formatPrizeValue, parsePrizeValue, formatTimeAgo]);

  // Initial load
  useEffect(() => {
    if (!db) return;
    fetchWinners(false);
  }, [db, fetchWinners]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchWinners(true);
        }
      },
      { threshold: 0.5 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, loadingMore, loading, fetchWinners]);

  // Focus search input when opened
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);

  // Filter winners based on selections - FIXED VERSION
  const getFilteredWinners = useCallback(() => {
    let filtered = [...winners];

    // Category filter
    if (selectedCategory !== 'all') {
      switch (selectedCategory) {
        case 'featured':
          filtered = filtered.filter(w => w.featured);
          break;
        case 'verified':
          filtered = filtered.filter(w => w.verified);
          break;
        default:
          filtered = filtered.filter(w => w.prizeCategory === selectedCategory);
      }
    }

    // Year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(w => {
        if (!w.winDate) return false;
        try {
          const date = w.winDate instanceof Date ? w.winDate : new Date(w.winDate);
          return date.getFullYear().toString() === selectedYear;
        } catch (error) {
          return false;
        }
      });
    }

    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w =>
        w.winnerName?.toLowerCase().includes(query) ||
        w.prizeTitle?.toLowerCase().includes(query) ||
        w.winnerLocation?.toLowerCase().includes(query) ||
        w.story?.toLowerCase().includes(query) ||
        w.winnerProfession?.toLowerCase().includes(query)
      );
    }

    // Sort - FIXED VERSION
    filtered.sort((a, b) => {
      const getTime = (date) => {
        if (!date) return 0;
        try {
          const d = date instanceof Date ? date : new Date(date);
          return isNaN(d.getTime()) ? 0 : d.getTime();
        } catch (error) {
          return 0;
        }
      };

      const aTime = getTime(a.winDate);
      const bTime = getTime(b.winDate);

      switch (sortBy) {
        case 'recent':
          return bTime - aTime; // Most recent first
        case 'biggest':
          return parsePrizeValue(b.prizeValue) - parsePrizeValue(a.prizeValue);
        case 'oldest':
          return aTime - bTime; // Oldest first
        case 'popular':
          return (b.shareCount || 0) - (a.shareCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [winners, selectedCategory, selectedYear, searchQuery, sortBy, parsePrizeValue]);

  // Format date - FIXED VERSION
  const formatDate = useCallback((date) => {
    if (!date) return 'N/A';
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return 'N/A';
      
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  }, []);

  // Format number with commas
  const formatNumber = useCallback((num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('en-US');
  }, []);

  // Handle share with minimal Firebase write
  const handleShare = useCallback(async (winner) => {
    const shareUrl = `${window.location.origin}/winners/${winner.id}`;
    const shareText = `Check out this amazing win on NextWinner! ${winner.winnerName} won ${winner.prizeValue} worth of ${winner.prizeTitle}!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Amazing Win on NextWinner!',
          text: shareText,
          url: shareUrl,
        });
        
        // Only update share count if winner has an ID and we have a db connection
        if (winner.id && db) {
          try {
            const winnerRef = doc(db, 'winners', winner.id);
            await updateDoc(winnerRef, {
              shareCount: increment(1),
              updatedAt: Timestamp.now()
            });
            
            // Update local cache
            if (winnersCache.current[winner.id]) {
              winnersCache.current[winner.id].shareCount = (winnersCache.current[winner.id].shareCount || 0) + 1;
            }
            
            // Update state
            setWinners(prev => prev.map(w => 
              w.id === winner.id 
                ? { ...w, shareCount: (w.shareCount || 0) + 1 }
                : w
            ));
          } catch (error) {
            console.error('Error updating share count:', error);
          }
        }
      } catch (error) {
        console.log('Share cancelled:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  }, [db]);

  // Plastic Card Component
  const PlasticCard = ({ children, className = '', border = true, plasticColor = 'bg-gradient-to-b from-white/15 to-white/5' }) => (
    <div className={`
      ${plasticColor}
      backdrop-blur-2xl 
      ${border ? 'border border-white/30 shadow-2xl' : ''}
      rounded-2xl
      shadow-lg
      overflow-hidden
      relative
      before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:via-transparent before:to-transparent
      before:pointer-events-none
      ${className}
    `}>
      {children}
    </div>
  );

  // Plastic Button Component
  const PlasticButton = ({ children, onClick, className = '', plasticColor = 'bg-gradient-to-b from-yellow-400 to-orange-500', disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${plasticColor}
        text-white font-bold
        rounded-xl
        px-4 py-3
        relative
        overflow-hidden
        transition-all
        duration-300
        hover:scale-105
        hover:shadow-2xl
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-50
        after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-black/10
        shadow-lg
        border border-white/40
        ${className}
      `}
    >
      <span className="relative z-10 drop-shadow-sm">{children}</span>
    </button>
  );

  // PATH SELECTION BANNER - Clear User/Influencer Differentiation
  const PathSelectionBanner = () => (
    <div className="mt-2 px-2">
      <PlasticCard plasticColor="bg-gradient-to-b from-gray-900/40 to-gray-800/40">
        <div className="p-3 text-center">
          <h3 className="text-base font-black text-white mb-2">🎯 SEE REAL WINNERS - CHOOSE YOUR PATH</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Regular User Path */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-xl rounded-xl p-3 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <UserPlus size={16} className="text-white" />
                </div>
                <div className="leading-none">
                  <h4 className="text-sm font-extrabold">PLAY TO WIN</h4>
                  <p className="text-[10px] text-blue-200">Regular User</p>
                </div>
              </div>
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle size={10} className="text-green-400" />
                  Buy tickets & win prizes
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle size={10} className="text-green-400" />
                  Join raffles like these winners
                </div>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-2 text-[11px] font-bold rounded-lg bg-gradient-to-r from-blue-500 to-blue-600"
              >
                🎫 Register as User
              </button>
            </div>

            {/* Influencer Path */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-xl rounded-xl p-3 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Crown size={16} className="text-white" />
                </div>
                <div className="leading-none">
                  <h4 className="text-sm font-extrabold">EARN MONEY</h4>
                  <p className="text-[10px] text-purple-200">Influencer</p>
                </div>
              </div>
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle size={10} className="text-green-400" />
                  15% commission on shares
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle size={10} className="text-green-400" />
                  Earn by sharing winners
                </div>
              </div>
              <button
                onClick={() => navigate('/influencers/auth')}
                className="w-full py-2 text-[11px] font-bold rounded-lg bg-gradient-to-r from-purple-500 to-purple-600"
              >
                👑 Become Influencer
              </button>
            </div>
          </div>
          
          <p className="text-xs text-white/60">
            Users: Play to win prizes | Influencers: Share to earn commissions
          </p>
        </div>
      </PlasticCard>
    </div>
  );

  // Loading skeleton
  if (loading && winners.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        <header className="fixed top-0 left-0 right-0 bg-white/12 backdrop-blur-2xl border-b border-white/20 z-50">
          <div className="px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-yellow-500/90 to-orange-500/90 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                  <Trophy size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-black bg-gradient-to-r from-yellow-400/90 to-orange-400/90 bg-clip-text text-transparent">
                  NEXTWINNER
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-xl animate-pulse"></div>
                <div className="w-8 h-8 bg-white/10 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-16 px-3">
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          
          {/* Filters skeleton */}
          <div className="flex gap-2 overflow-hidden mb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-24 h-10 bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          
          {/* Winners cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl overflow-hidden">
                <div className="h-48 bg-white/10 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-4 bg-white/10 rounded animate-pulse mb-2 w-3/4"></div>
                  <div className="h-6 bg-white/10 rounded animate-pulse mb-3 w-1/2"></div>
                  <div className="h-2 bg-white/10 rounded animate-pulse mb-1"></div>
                  <div className="h-10 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pb-20">
      {/* Magic Notification */}
      {magicNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] animate-bounce">
          <div className="bg-gradient-to-r from-yellow-500/95 to-orange-500/95 backdrop-blur-2xl text-white text-sm font-bold px-4 py-3 rounded-2xl shadow-2xl border border-yellow-300/30 max-w-xs text-center">
            ✨ {magicNotification}
            <button 
              onClick={() => setMagicNotification(null)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/15 backdrop-blur-2xl border-b border-white/25 z-50">
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-yellow-500/90 to-orange-500/90 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/30 border border-white/20">
                <Trophy size={20} className="text-white" />
              </div>
              <div className="leading-tight">
                <h1 className="text-xl font-black bg-gradient-to-r from-yellow-400/90 to-orange-400/90 bg-clip-text text-transparent">
                  NEXTWINNER
                </h1>
                <p className="text-[9px] tracking-widest text-white/60">
                  Winners Hall of Fame
                </p>
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              {/* User Balance if logged in */}
              {isLoggedIn && (
                <button 
                  onClick={() => navigate('/dashboard?tab=balance')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl text-sm font-bold hover:from-blue-500/30 hover:to-purple-500/30 transition-all border border-blue-500/30"
                >
                  <Wallet size={14} />
                  <span className="font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </button>
              )}
              
              {/* Search Icon */}
              <button 
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/10"
              >
                <Search size={18} />
              </button>
              
              {/* Back to Home */}
              <button 
                onClick={() => navigate('/')}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/10"
              >
                <ArrowLeft size={18} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearchBar && (
            <div className="mt-2 bg-white/12 backdrop-blur-2xl rounded-xl border border-white/20 shadow-2xl p-2 animate-slideDown">
              <div className="flex items-center gap-2">
                <Search size={18} className="text-white/70" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search winners, prizes, locations..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-white/10 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Banner */}
        <div className="relative mx-3 mt-2 rounded-3xl overflow-hidden">
          <div className="relative h-44 md:h-52">
            <img
              src="https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Winners Celebration"
              className="w-full h-full object-cover brightness-110 contrast-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/40 via-orange-500/40 to-red-500/40 opacity-60"></div>
            <div className="absolute inset-0 backdrop-blur-[2px] bg-white/5"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">🎉 WINNERS HALL OF FAME</h1>
              <p className="text-sm text-white/95 mt-2 drop-shadow">
                Real people winning real prizes - See what's possible!
              </p>
              <div className="mt-2 flex flex-wrap gap-1 justify-center">
                <div className="px-2 py-1 bg-white/25 backdrop-blur-xl border border-white/40 text-white text-[10px] font-bold rounded-full">
                  {stats.totalWinners}+ Winners
                </div>
                <div className="px-2 py-1 bg-white/25 backdrop-blur-xl border border-white/40 text-white text-[10px] font-bold rounded-full">
                  {stats.countries} Locations
                </div>
                <div className="px-2 py-1 bg-white/25 backdrop-blur-xl border border-white/40 text-white text-[10px] font-bold rounded-full">
                  {stats.totalPrizes} in Prizes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PATH SELECTION BANNER - Immediately after hero */}
        <PathSelectionBanner />

        {/* Stats Cards - Compact Design */}
        <div className="mx-2 mt-2 grid grid-cols-2 md:grid-cols-5 gap-[6px]">
          {[
            { 
              label: 'Winners', 
              value: stats.totalWinners, 
              color: 'text-yellow-400', 
              icon: Trophy,
              gradient: 'from-yellow-500/20 to-orange-500/20'
            },
            { 
              label: 'Total Prizes', 
              value: stats.totalPrizes, 
              color: 'text-green-400', 
              icon: DollarSign,
              gradient: 'from-green-500/20 to-emerald-500/20'
            },
            { 
              label: 'Biggest Win', 
              value: stats.biggestWin, 
              color: 'text-red-400', 
              icon: Crown,
              gradient: 'from-red-500/20 to-pink-500/20'
            },
            { 
              label: 'Locations', 
              value: stats.countries, 
              color: 'text-blue-400', 
              icon: Globe,
              gradient: 'from-blue-500/20 to-cyan-500/20'
            },
            { 
              label: 'This Month', 
              value: stats.thisMonth, 
              color: 'text-purple-400', 
              icon: TrendingUp,
              gradient: 'from-purple-500/20 to-pink-500/20'
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <PlasticCard key={index} border={false}>
                <div className="px-2 py-2 text-center leading-none">
                  <div className={`w-8 h-8 mx-auto mb-1 rounded-lg bg-gradient-to-r ${stat.gradient} flex items-center justify-center`}>
                    <Icon size={16} className={stat.color} />
                  </div>
                  <div className={`text-sm md:text-base font-extrabold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-white/70">
                    {stat.label}
                  </div>
                </div>
              </PlasticCard>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mx-3 mt-3 grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-3 flex items-center gap-3 border border-white/20">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white">100% Verified</div>
              <div className="text-xs text-white/80">Real winners, real prizes</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-3 flex items-center gap-3 border border-white/20">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white">Live Draws</div>
              <div className="text-xs text-white/80">Winners announced weekly</div>
            </div>
          </div>
        </div>

        {/* Filters and Sort Section */}
        <div className="mt-4 px-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-black">Real Winners, Real Stories</h2>
              <p className="text-sm text-white/70">Filter by category, year, or sort by your preference</p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl rounded-xl p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                >
                  <List size={18} />
                </button>
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 appearance-none pr-8"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-white/60" />
              </div>
            </div>
          </div>

          {/* Year Filter */}
          <div className="mb-4">
            <div className="text-sm font-bold text-white mb-2">Filter by Year:</div>
            <div className="flex flex-wrap gap-2">
              {years.map(year => (
                <button
                  key={year.id}
                  onClick={() => setSelectedYear(year.id)}
                  className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                    selectedYear === year.id 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold' 
                      : 'bg-white/10 hover:bg-white/20 text-white/90'
                  }`}
                >
                  {year.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filters - Plastic Design */}
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all backdrop-blur-xl
                      ${selectedCategory === category.id
                        ? `${category.plasticColor} text-white font-bold shadow-2xl border border-white/40 relative overflow-hidden
                           before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-30
                           after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-black/10`
                        : 'bg-white/10 text-white/90 border border-white/10 hover:border-white/20 hover:bg-white/15'}`
                    }
                  >
                    <Icon size={20} />
                    <span className="text-sm">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Winners Grid/List */}
        <div className="px-2">
          {loadingError && (
            <div className="mx-1 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-2xl rounded-2xl border border-white/20 text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle size={20} className="text-red-400" />
                <h3 className="font-bold text-white">Showing Cached Data</h3>
              </div>
              <p className="text-sm text-white/80 mb-3">
                {loadingError}
              </p>
              <button 
                onClick={() => fetchWinners(false)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:shadow-xl transition-all"
              >
                Retry Connection
              </button>
            </div>
          )}

          {getFilteredWinners().length === 0 ? (
            <div className="mx-1 p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-bold text-white mb-2">No Winners Found</h3>
              <p className="text-sm text-white/80 mb-4">
                {winners.length === 0 
                  ? 'No winners have been recorded yet. Check back later!' 
                  : 'Try adjusting your filters or check back later for new winners.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedYear('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                >
                  Clear All Filters
                </button>
                {!isLoggedIn && (
                  <button 
                    onClick={() => navigate('/register')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                  >
                    Register to Win
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Grid / List View */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-[6px] px-1 md:px-0 md:gap-2">
                  {getFilteredWinners().map((winner) => (
                    <WinnerCard 
                      key={winner.id}
                      winner={winner}
                      setSelectedWinner={setSelectedWinner}
                      handleShare={handleShare}
                      formatDate={formatDate}
                      formatNumber={formatNumber}
                    />
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-[6px] px-1 md:px-0 md:space-y-2">
                  {getFilteredWinners().map((winner) => (
                    <WinnerListItem 
                      key={winner.id}
                      winner={winner}
                      setSelectedWinner={setSelectedWinner}
                      handleShare={handleShare}
                      formatDate={formatDate}
                      formatNumber={formatNumber}
                    />
                  ))}
                </div>
              )}

              {/* Load More Trigger */}
              {hasMore && winners.length > 0 && (
                <div 
                  ref={observerRef}
                  className="mt-4 flex justify-center"
                >
                  {loadingMore ? (
                    <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <PlasticButton
                      onClick={() => fetchWinners(true)}
                      plasticColor="bg-gradient-to-b from-blue-400 to-purple-500"
                    >
                      Load More Winners
                    </PlasticButton>
                  )}
                </div>
              )}

              {/* End of Results */}
              {!hasMore && getFilteredWinners().length > 0 && (
                <div className="mt-6 text-center text-white/70 text-sm">
                  <div className="w-16 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mb-3"></div>
                  You've reached the end! No more winners to show.
                </div>
              )}
            </>
          )}

          {/* CALL TO ACTION BANNER - Clear Dual Options */}
          {winners.length > 0 && (
            <div className="mt-6 mx-1">
              <PlasticCard plasticColor="bg-gradient-to-b from-gray-900/40 to-gray-800/40">
                <div className="p-4 text-center">
                  <div className="text-2xl mb-3">🎯</div>
                  <h3 className="font-bold text-white text-lg mb-3">COULD YOU BE NEXT?</h3>
                  <p className="text-sm text-white/80 mb-4">
                    These real people took a chance and won. Your story could be next!
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Regular User CTA */}
                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-3 border border-blue-500/30">
                      <div className="text-lg mb-2">🎫</div>
                      <h4 className="font-bold text-white mb-1">PLAY TO WIN</h4>
                      <p className="text-xs text-blue-200 mb-2">Regular User</p>
                      <PlasticButton
                        onClick={() => navigate('/register')}
                        plasticColor="bg-gradient-to-b from-blue-400 to-blue-600"
                        className="w-full py-2 text-xs"
                      >
                        Register as User
                      </PlasticButton>
                    </div>
                    
                    {/* Influencer CTA */}
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-3 border border-purple-500/30">
                      <div className="text-lg mb-2">👑</div>
                      <h4 className="font-bold text-white mb-1">EARN MONEY</h4>
                      <p className="text-xs text-purple-200 mb-2">Influencer</p>
                      <PlasticButton
                        onClick={() => navigate('/influencers/auth')}
                        plasticColor="bg-gradient-to-b from-purple-400 to-pink-500"
                        className="w-full py-2 text-xs"
                      >
                        Become Influencer
                      </PlasticButton>
                    </div>
                  </div>
                  
                  <p className="text-xs text-white/60">
                    Already have an account?{' '}
                    <button 
                      onClick={() => navigate('/login')}
                      className="text-yellow-300 hover:text-yellow-200 font-bold"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </PlasticCard>
            </div>
          )}
        </div>
      </main>

      {/* Winner Detail Modal */}
      {selectedWinner && (
        <WinnerDetailModal
          winner={selectedWinner}
          setSelectedWinner={setSelectedWinner}
          handleShare={handleShare}
          formatDate={formatDate}
          formatNumber={formatNumber}
          isLoggedIn={isLoggedIn}
          navigate={navigate}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/15 backdrop-blur-2xl border-t border-white/25 z-40 py-1.5">
        <div className="flex">
          {[
            { id: 'home', label: 'Home', icon: ArrowLeft, route: '/' },
            { id: 'raffles', label: 'Raffles', icon: Ticket, route: '/raffles' },
            { id: 'winners', label: 'Winners', icon: Trophy, route: '/winners', active: true },
            { id: 'draw', label: 'Live', icon: Clock, route: '/live-draw' },
            { id: 'forum', label: 'Forum', icon: MessageCircle, route: '/forum' },
            { id: 'profile', label: isLoggedIn ? 'Me' : 'Login', icon: User, route: isLoggedIn ? '/dashboard' : '/login' }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.route || item.active;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className={`flex-1 flex flex-col items-center justify-center relative transition-all ${
                  isActive ? 'text-yellow-400' : 'text-white/80'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 w-3/4 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-b-full shadow-lg shadow-yellow-500/30"></div>
                )}
                <div className={`p-1.5 rounded-lg transition-all ${
                  isActive ? 'bg-white/15 backdrop-blur-sm shadow-lg' : 'hover:bg-white/10'
                }`}>
                  <Icon size={20} />
                </div>
                <span className="text-[9px] mt-0.5 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* CSS for animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

// Winner Card Component for Grid View
const WinnerCard = ({ winner, setSelectedWinner, handleShare, formatDate, formatNumber }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group cursor-pointer"
      onClick={() => setSelectedWinner(winner)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-2xl rounded-2xl overflow-hidden border border-white/20 shadow-lg hover:border-yellow-500/40 transition-all">
        {/* Prize Image with Zoom Effect */}
        <div className="relative h-36 md:h-40 overflow-hidden">
          <img
            src={winner.prizeImage}
            alt={winner.prizeTitle}
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          
          {/* Animated Prize Value */}
          <div className="absolute top-2 right-2">
            <div className={`px-2 py-1 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-lg text-white font-black text-xs rounded-lg transition-all duration-300 ${isHovered ? 'scale-110 rotate-1' : 'scale-100'}`}>
              {winner.prizeValue}
            </div>
          </div>
          
          {/* Verified Badge */}
          {winner.verified && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
              <CheckCircle size={8} /> Verified
            </div>
          )}
          
          {/* Prize Title */}
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="text-xs font-bold text-white truncate">{winner.prizeTitle}</div>
          </div>
        </div>

        {/* Winner Info */}
        <div className="p-3">
          {/* Winner Details */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-yellow-500/40 flex-shrink-0">
              <img
                src={winner.winnerImage}
                alt={winner.winnerName}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">
                {winner.winnerName}
              </div>
              <div className="text-[10px] text-white/60 flex items-center gap-1">
                <MapPin size={8} /> {winner.winnerLocation}
              </div>
              {winner.winnerProfession && (
                <div className="text-[10px] text-yellow-400">
                  {winner.winnerProfession}
                </div>
              )}
            </div>
          </div>

          {/* Win Date */}
          <div className="mb-2">
            <div className="text-[10px] text-white/60">Won On</div>
            <div className="text-xs font-bold text-white">
              {formatDate(winner.winDate)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWinner(winner);
              }}
              className="flex-1 py-1.5 bg-white/15 backdrop-blur-xl border border-white/25 rounded-lg text-[11px] font-medium hover:bg-white/25 transition-all"
            >
              View Story
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleShare(winner);
              }}
              className="px-2 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-blue-500/30 transition-all"
              title="Share this win"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Winner List Item Component for List View
const WinnerListItem = ({ winner, setSelectedWinner, handleShare, formatDate, formatNumber }) => {
  return (
    <div 
      className="bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-2xl rounded-2xl border border-white/20 hover:border-yellow-500/40 transition-all p-3 cursor-pointer"
      onClick={() => setSelectedWinner(winner)}
    >
      <div className="flex flex-col md:flex-row gap-3">
        {/* Image */}
        <div className="relative w-full md:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={winner.prizeImage}
            alt={winner.prizeTitle}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            }}
          />
          {winner.verified && (
            <div className="absolute top-2 left-2 bg-green-500/80 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle size={8} /> Verified
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-lg text-white font-black text-xs px-2 py-0.5 rounded-lg">
            {winner.prizeValue}
          </div>
        </div>
        
        {/* Details */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-yellow-500/40 flex-shrink-0">
                  <img
                    src={winner.winnerImage}
                    alt={winner.winnerName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{winner.winnerName}</h3>
                  {winner.winnerProfession && (
                    <div className="text-sm text-yellow-400 flex items-center gap-1">
                      <Briefcase size={10} /> {winner.winnerProfession}
                    </div>
                  )}
                  <div className="text-sm text-white/70 flex items-center gap-1">
                    <MapPin size={10} /> {winner.winnerLocation}
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-lg font-black text-yellow-400 mb-1">{winner.prizeValue} • {winner.prizeTitle}</div>
                
                <div className="flex flex-wrap gap-3 mb-2">
                  <div className="flex items-center gap-1 text-sm text-white/70">
                    <Calendar size={12} />
                    {formatDate(winner.winDate)}
                  </div>
                  {winner.ticketPrice > 0 && (
                    <div className="flex items-center gap-1 text-sm text-white/70">
                      <Ticket size={12} />
                      ₦{formatNumber(winner.ticketPrice)} ticket
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(winner);
                }}
                className="p-2 bg-white/10 backdrop-blur-xl border border-white/25 rounded-xl hover:bg-white/20 transition-all"
                title="Share"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWinner(winner);
              }}
              className="flex-1 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
            >
              View Full Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Winner Detail Modal
const WinnerDetailModal = ({ winner, setSelectedWinner, handleShare, formatDate, formatNumber, isLoggedIn, navigate }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-2xl rounded-xl md:rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl">
        
        <div className="p-4 md:p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-yellow-400">
              Winner's Story
            </h2>
            <button
              onClick={() => setSelectedWinner(null)}
              className="text-white/60 hover:text-white p-1 md:p-2"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 md:space-y-6">

            {/* Prize Display */}
            <div className="relative h-44 md:h-64 rounded-lg md:rounded-2xl overflow-hidden">
              <img
                src={winner.prizeImage}
                alt={winner.prizeTitle}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6">
                <div className="text-base md:text-2xl font-bold text-white">
                  {winner.prizeTitle}
                </div>
                <div className="text-xl md:text-4xl font-black text-yellow-400">
                  {winner.prizeValue}
                </div>
              </div>

              {/* Verified Badge */}
              {winner.verified && (
                <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-green-500/80 backdrop-blur text-white text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1">
                  <CheckCircle size={12} /> Verified Win
                </div>
              )}
            </div>

            {/* Winner + Win Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">

              {/* Winner Profile */}
              <div className="bg-white/10 backdrop-blur rounded-lg md:rounded-2xl p-3 md:p-5">
                <div className="flex items-center md:flex-col md:text-center gap-3 md:gap-4">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-2 md:border-4 border-yellow-500">
                    <img 
                      src={winner.winnerImage} 
                      alt={winner.winnerName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-base md:text-xl font-bold text-white">
                      {winner.winnerName}
                    </h3>
                    {winner.winnerProfession && (
                      <div className="text-xs md:text-sm text-yellow-400 font-medium">
                        {winner.winnerProfession}
                      </div>
                    )}
                    <div className="text-xs md:text-sm text-white/60 flex items-center gap-1">
                      <MapPin size={12} /> {winner.winnerLocation}
                    </div>
                    
                    {winner.ticketsPurchased > 0 && (
                      <div className="text-xs md:text-sm text-yellow-400 mt-1">
                        {winner.ticketsPurchased} ticket{winner.ticketsPurchased > 1 ? 's' : ''} purchased
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Win Details */}
              <div className="bg-white/10 backdrop-blur rounded-lg md:rounded-2xl p-3 md:p-5 md:col-span-2">
                <h4 className="text-base md:text-lg font-bold text-white mb-2 md:mb-4">
                  Win Details
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                  {[
                    ['Ticket', winner.ticketNumber],
                    ['Date', formatDate(winner.winDate)],
                    ['Prize Value', winner.prizeValue],
                    ['Prize Type', winner.prizeType || 'Prize'],
                  ].map(([label, value], i) => (
                    <div key={i} className="bg-white/5 rounded-md md:rounded-xl p-2 md:p-3">
                      <div className="text-[10px] md:text-xs text-white/60">{label}</div>
                      <div className="text-sm md:text-lg font-bold">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Winner's Story */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur rounded-lg md:rounded-2xl p-4 md:p-6 border border-yellow-500/20">
              <h4 className="text-base md:text-xl font-bold text-white mb-2 md:mb-4">Winner's Story</h4>
              <p className="text-sm md:text-base text-white/90 leading-relaxed">
                "{winner.story}"
              </p>
              <div className="mt-3 md:mt-4 text-xs md:text-sm text-yellow-300 font-bold">
                🎯 "Never underestimate small chances - one ticket can change your life!"
              </div>
            </div>

            {/* ACTION BANNER - Clear User/Influencer Choice */}
            <div className="bg-gradient-to-b from-gray-900/40 to-gray-800/40 backdrop-blur-2xl rounded-2xl border border-white/20 p-4 md:p-6">
              <h4 className="text-base md:text-xl font-bold text-white mb-3 md:mb-4 text-center">
                🎯 INSPIRED BY THIS WIN?
              </h4>
              
              <p className="text-sm text-white/80 mb-4 text-center">
                Choose your path: Play to win OR Earn as influencer
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Regular User Option */}
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl md:rounded-2xl p-3 md:p-4 border border-blue-500/30">
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center">
                      <UserPlus size={20} className="text-white" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white">PLAY TO WIN</h5>
                      <p className="text-xs text-blue-200">Regular User Path</p>
                    </div>
                  </div>
                  <ul className="space-y-1 mb-3 md:mb-4">
                    <li className="flex items-center gap-2 text-xs md:text-sm">
                      <CheckCircle size={12} className="text-green-400" />
                      Buy tickets & win prizes
                    </li>
                    <li className="flex items-center gap-2 text-xs md:text-sm">
                      <CheckCircle size={12} className="text-green-400" />
                      Simple registration
                    </li>
                    <li className="flex items-center gap-2 text-xs md:text-sm">
                      <CheckCircle size={12} className="text-green-400" />
                      Join raffles like this winner
                    </li>
                  </ul>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full py-2 md:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg md:rounded-xl hover:shadow-xl transition-all"
                  >
                    🎫 Register as User
                  </button>
                </div>

                {/* Influencer Option */}
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl md:rounded-2xl p-3 md:p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center">
                      <Crown size={20} className="text-white" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white">EARN MONEY</h5>
                      <p className="text-xs text-purple-200">Influencer Path</p>
                    </div>
                  </div>
                  <ul className="space-y-1 mb-3 md:mb-4">
                    <li className="flex items-center gap-2 text-xs md:text-sm">
                      <CheckCircle size={12} className="text-green-400" />
                      15% commission on referrals
                    </li>
                    <li className="flex items-center gap-2 text-xs md:text-sm">
                      <CheckCircle size={12} className="text-green-400" />
                      Earn by sharing winners
                    </li>
                    <li className="flex items-center gap-2 text-xs md:text-sm">
                      <CheckCircle size={12} className="text-green-400" />
                      Separate influencer dashboard
                    </li>
                  </ul>
                  <button
                    onClick={() => navigate('/influencers/auth')}
                    className="w-full py-2 md:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg md:rounded-xl hover:shadow-xl transition-all"
                  >
                    👑 Become Influencer
                  </button>
                </div>
              </div>
              
              {isLoggedIn && (
                <p className="text-center text-xs text-white/60 mt-3 md:mt-4">
                  Already playing?{' '}
                  <button 
                    onClick={() => navigate('/raffles')}
                    className="text-yellow-300 hover:text-yellow-200 font-bold"
                  >
                    Browse more raffles
                  </button>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <button
                onClick={() => handleShare(winner)}
                className="flex-1 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg md:rounded-xl text-sm md:text-base font-bold"
              >
                Share This Win
              </button>
              <button
                onClick={() => navigate('/raffles')}
                className="flex-1 py-2 md:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg md:rounded-xl text-sm md:text-base font-bold"
              >
                Try Your Luck
              </button>
              <button
                onClick={() => setSelectedWinner(null)}
                className="py-2 md:py-3 px-4 bg-white/15 rounded-lg md:rounded-xl text-sm font-bold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnersPage;