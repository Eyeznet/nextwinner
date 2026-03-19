import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Firebase imports
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  query, 
  where, 
  getDocs, 
  addDoc,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  increment,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { app } from './firebaseConfig';


// Lucide React Icons
import {
  User, Settings, LogOut, Bell, Wallet, Ticket, Gift, Users,
  ChevronRight, ChevronLeft, Home, HelpCircle, Shield, Mail,
  Phone, Lock, Globe, CreditCard, TrendingUp, Calendar, CheckCircle,
  XCircle, Clock, Award, Crown, Star, Share2, Copy, ExternalLink,
  Filter, Search, Plus, Minus, Eye, EyeOff, Edit2, Save, Trash2,
  MessageSquare, BarChart, Download, Upload, RefreshCw, Zap,
  Target, DollarSign, Percent, Package, ShoppingBag, Camera,
  Smartphone, Laptop, Car, Home as HomeIcon, Plane, BookOpen,
  Coffee, Gamepad, Watch, Diamond, Headphones, ShoppingCart,
  Heart, MapPin, Users as UsersIcon, Bell as BellIcon,
  TrendingUp as TrendingIcon, AlertCircle, Info,
  X, Menu, Grid, List, Trophy, ShoppingCart as CartIcon,
  UserCheck, Percent as PercentIcon, Loader, ArrowUpRight,
  MessageCircle, QrCode, ShieldCheck, TrendingDown, Briefcase,
  Image as ImageIcon, FileText, Bookmark, Flag, Heart as HeartIcon,
  ThumbsUp, Send, Paperclip, Mic, Smile, MoreVertical,
  Video, Music, File, Folder, Database, Server, Cpu, HardDrive,
  Wifi, Bluetooth, Battery, Volume2, Sun, Moon, Cloud, CloudRain,
  Wind, Thermometer, Droplet, Sunrise, Sunset, CloudSnow,
  CloudLightning, Umbrella, AlertTriangle, BatteryCharging,
  Power, Settings as SettingsIcon, BatteryLow, WifiOff,
  BluetoothConnected, Satellite, Map, Navigation,
  Compass, Target as TargetIcon, Crosshair, ZoomIn, ZoomOut,
  Layers, Globe as GlobeIcon, MapPin as MapPinIcon,
  Navigation2, Compass as CompassIcon, Map as MapIcon,
  Activity, Users as Users2, Ticket as TicketIcon,
  Package as PackageIcon, TrendingUp as TrendingUpIcon,
  Award as AwardIcon, PlayCircle, PauseCircle, StopCircle,
  Radio as RadioIcon, AlertOctagon, Server as ServerIcon,
  MessageCircle as MessageCircleIcon, Radio,
  Eye as EyeIcon, AlertTriangle as AlertTriangleIcon,
  Check, X as XIcon, Star as StarIcon, Filter as FilterIcon,
  Download as DownloadIcon, Upload as UploadIcon,
  Clock as ClockIcon, Calendar as CalendarIcon,
  DollarSign as DollarSignIcon, Percent as PercentIcon2,
  Shield as ShieldIcon, Key, Database as DatabaseIcon,
  Wifi as WifiIcon, Users as Users3, Zap as ZapIcon,
  Target as TargetIcon2, BarChart as BarChartIcon,
  ShoppingCart as ShoppingCartIcon, Crown as CrownIcon,
  Trophy as TrophyIcon, Gift as GiftIcon, CheckSquare,
  Square, Play, Pause, SkipForward, SkipBack,
  VolumeX, Volume2 as Volume2Icon, MicOff, VideoOff,
  Maximize2, Minimize2, RotateCcw, Hash,
  Type, Camera as CameraIcon, Video as VideoIcon,
  Mic as MicIcon, MessageSquare as MessageSquareIcon,
  Send as SendIcon, ThumbsUp as ThumbsUpIcon,
  Flag as FlagIcon, MoreHorizontal, MoreVertical as MoreVerticalIcon,
  ChevronUp, ChevronDown, ChevronUp as ChevronUpIcon,
  ChevronDown as ChevronDownIcon, ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, Move, Grid as GridIcon,
  List as ListIcon, Layout, Sidebar, SidebarClose,
  SidebarOpen, PanelLeft, PanelRight, PanelTop,
  PanelBottom, LayoutGrid, LayoutList, Columns,
  Rows, Container, Box, Truck, Building, Building2,
  Store, ShoppingBag as ShoppingBagIcon, CreditCard as CreditCardIcon,
  Wallet as WalletIcon, Banknote, Coins, Bitcoin,
  PieChart, LineChart, AreaChart, ScatterChart,
  Radar, GitBranch, GitCommit, GitPullRequest,
  GitMerge, GitFork, Code, Terminal, Command, Cpu as CpuIcon,
  HardDrive as HardDriveIcon, ServerCog, DatabaseZap,
  Cloud as CloudIcon, CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon, CloudLightning as CloudLightningIcon,
  Sun as SunIcon, Moon as MoonIcon, Sunrise as SunriseIcon,
  Sunset as SunsetIcon, Thermometer as ThermometerIcon,
  Droplet as DropletIcon, Wind as WindIcon,
  Umbrella as UmbrellaIcon, AlertTriangle as AlertTriangleIcon2,
  Battery as BatteryIcon, BatteryCharging as BatteryChargingIcon,
  Power as PowerIcon, Wifi as WifiIcon2, Bluetooth as BluetoothIcon,
  Radio as RadioIcon2, Satellite as SatelliteIcon,
  Map as MapIcon2, Navigation as NavigationIcon,
  Compass as CompassIcon2, Target as TargetIcon3,
  Crosshair as CrosshairIcon, ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon, Layers as LayersIcon,
  Globe as GlobeIcon2, MapPin as MapPinIcon2,
  Navigation2 as Navigation2Icon, Compass as CompassIcon3,
  Map as MapIcon3
} from 'lucide-react';
import WithdrawalRequestsButton from './components/WithdrawalRequestsButton';
// ... (all your lucide-react imports remain the same)

// ==================== FIREBASE INITIALIZATION ====================
const db = getFirestore(app);
const auth = getAuth(app);

// ==================== UTILITY FUNCTIONS ====================
const formatCurrency = (amount) => {
  // If amount is already a string with currency symbol, extract the number
  if (typeof amount === 'string') {
    // Remove all non-numeric characters except decimal point and minus sign
    const numericString = amount.replace(/[^\d.-]/g, '');
    amount = parseFloat(numericString);
    if (isNaN(amount)) amount = 0;
  }
  
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    let dateObj;
    
    if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date.seconds !== undefined) {
      dateObj = new Date(date.seconds * 1000);
      if (date.nanoseconds) {
        dateObj = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
      }
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

const formatTimeAgo = (date) => {
  if (!date) return 'Recently';
  
  try {
    let past;
    
    if (date.toDate && typeof date.toDate === 'function') {
      past = date.toDate();
    } else if (date.seconds !== undefined) {
      past = new Date(date.seconds * 1000);
      if (date.nanoseconds) {
        past = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
      }
    } else if (date instanceof Date) {
      past = date;
    } else {
      past = new Date(date);
    }
    
    if (isNaN(past.getTime())) {
      return 'Recently';
    }
    
    const now = new Date();
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    
    return `${Math.floor(diffDays / 365)}y ago`;
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return 'Recently';
  }
};

// ==================== REAL-TIME DATA HOOKS ====================
const useRealtimeCollection = (collectionName, conditions = [], order = null, limitCount = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const hasInvalidConditions = conditions.some(condition => 
      condition.some(val => val === undefined || val === null)
    );
    
    if (hasInvalidConditions) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      let queryRef = collection(db, collectionName);
      
      if (conditions && conditions.length > 0) {
        conditions.forEach(condition => {
          if (condition && condition.length === 3) {
            queryRef = query(queryRef, where(condition[0], condition[1], condition[2]));
          }
        });
      }
      
      if (order && order[0]) {
        queryRef = query(queryRef, orderBy(order[0], order[1] || 'desc'));
      }
      
      if (limitCount) {
        queryRef = query(queryRef, limit(limitCount));
      }

      const unsubscribe = onSnapshot(
        queryRef,
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error(`Error fetching ${collectionName}:`, err);
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error(`Error setting up query for ${collectionName}:`, err);
      setError(err);
      setLoading(false);
      return () => {};
    }
  }, [collectionName, JSON.stringify(conditions), JSON.stringify(order), limitCount]);

  return { data, loading, error };
};

// ==================== ADMIN LOGIN COMPONENT ====================
export const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user is admin
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists() && (userDoc.data().accountType === 'admin' || userDoc.data().accountType === 'super_admin')) {
        navigate('/admin');
      } else {
        setError('Access denied. Admin privileges required.');
        await signOut(auth);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admin Portal
          </h1>
          <p className="text-white/60 mt-2">Secure admin access only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              placeholder="admin@nextwinner.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Authenticating...
              </div>
            ) : 'Login as Admin'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== LIVE COUNTDOWN TIMER COMPONENT ====================
const LiveCountdownTimer = ({ raffleId }) => {
  const [timeLeft, setTimeLeft] = useState('05:00');
  const [drawEndTime, setDrawEndTime] = useState(null);

  useEffect(() => {
    const fetchDrawState = async () => {
      try {
        const drawStateRef = doc(db, 'drawStates', raffleId);
        const drawStateDoc = await getDoc(drawStateRef);
        
        if (drawStateDoc.exists()) {
          const data = drawStateDoc.data();
          if (data.drawEndTime) {
            setDrawEndTime(data.drawEndTime);
          }
        }
      } catch (error) {
        console.error('Error fetching draw state:', error);
      }
    };

    fetchDrawState();
    
    const unsubscribe = onSnapshot(doc(db, 'drawStates', raffleId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.drawEndTime) {
          setDrawEndTime(data.drawEndTime);
        }
      }
    });

    return () => unsubscribe();
  }, [raffleId]);

  useEffect(() => {
    if (!drawEndTime) return;

    const updateTimer = () => {
      const endTime = new Date(drawEndTime);
      const now = new Date();
      const diffMs = endTime - now;
      
      if (diffMs <= 0) {
        setTimeLeft('00:00');
        return;
      }
      
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');
      
      setTimeLeft(`${formattedMinutes}:${formattedSeconds}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [drawEndTime]);

  return <span className="text-6xl font-mono">{timeLeft}</span>;
};

// ==================== MAIN ADMIN DASHBOARD ====================
const CompleteAdminDashboard = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = tab || 'overview';
  
  // State Management
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [drawTimers, setDrawTimers] = useState({});
  const [drawState, setDrawState] = useState({});
  
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeRaffles: 0,
    ticketsSold: 0,
    totalRevenue: 0,
    completedRaffles: 0,
    verifiedWinners: 0
  });

  // ADD: Withdrawal stats state
  const [withdrawalStats, setWithdrawalStats] = useState({ 
    pendingCount: 0, 
    pendingAmount: 0 
  });

  // Real-time data fetching
  const { data: users, loading: usersLoading, error: usersError } = useRealtimeCollection(
    'users',
    [],
    ['createdAt', 'desc'],
    1000
  );

  const { data: raffles, loading: rafflesLoading } = useRealtimeCollection(
    'raffles',
    [],
    ['createdAt', 'desc'],
    1000
  );

  const { data: tickets, loading: ticketsLoading } = useRealtimeCollection(
    'tickets',
    [],
    ['purchaseDate', 'desc'],
    5000
  );

  const { data: winners, loading: winnersLoading } = useRealtimeCollection(
    'winners',
    [],
    ['date', 'desc'],
    1000
  );

  const { data: notifications, loading: notificationsLoading } = useRealtimeCollection(
    'notifications',
    [],
    ['createdAt', 'desc'],
    1000
  );

  const { data: onlineUsers, loading: onlineLoading } = useRealtimeCollection(
    'online',
    [],
    ['lastSeen', 'desc'],
    100
  );

  const { data: chatMessages, loading: chatLoading } = useRealtimeCollection(
    'messages',
    [],
    ['timestamp', 'desc'],
    100
  );

  // ADD: Withdrawals real-time collection
  const { data: withdrawals, loading: withdrawalsLoading } = useRealtimeCollection(
    'withdrawals',
    [],
    ['createdAt', 'desc'],
    1000
  );

  // Load admin data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            if (data.accountType === 'admin' || data.accountType === 'super_admin') {
              setUser(currentUser);
              setAdminData({ id: userDoc.id, ...data });
              setLoading(false);
            } else {
              console.log('Not an admin, redirecting...');
              navigate('/admin-login?error=unauthorized');
            }
          } else {
            console.log('No user document, redirecting...');
            navigate('/admin-login?error=no_document');
          }
        } catch (error) {
          console.error('Error loading admin:', error);
          navigate('/admin-login');
        }
      } else {
        console.log('No authenticated user, redirecting...');
        navigate('/admin-login');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  // Calculate withdrawal stats
  useEffect(() => {
    const calculateWithdrawalStats = () => {
      if (!withdrawals) return;
      
      const pendingRequests = withdrawals.filter(w => w.status === 'pending');
      const pendingCount = pendingRequests.length;
      const pendingAmount = pendingRequests.reduce((total, request) => {
        return total + (request.amount || 0);
      }, 0);
      
      setWithdrawalStats({
        pendingCount,
        pendingAmount
      });
    };
    
    calculateWithdrawalStats();
  }, [withdrawals]);

  // Calculate system stats
  useEffect(() => {
    if (users && raffles && tickets && winners) {
      const activeRaffles = raffles.filter(r => r.status === 'active').length;
      const completedRaffles = raffles.filter(r => r.status === 'completed').length;
      const verifiedWinners = winners.filter(w => w.verified).length;
      
      const totalRevenue = tickets.reduce((sum, ticket) => {
        const price = typeof ticket.price === 'string' ? 
          parseFloat(ticket.price.replace(/[^\d.-]/g, '')) || 0 : 
          ticket.price || 0;
        return sum + price;
      }, 0);
      
      setSystemStats({
        totalUsers: users.length,
        activeRaffles,
        ticketsSold: tickets.length,
        totalRevenue,
        completedRaffles,
        verifiedWinners
      });
    }
  }, [users, raffles, tickets, winners]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(drawTimers).forEach(intervalId => {
        if (intervalId) clearInterval(intervalId);
      });
    };
  }, [drawTimers]);

  // Timer management functions
  const startDrawTimer = useCallback(async (raffleId, durationMinutes) => {
    console.log(`Starting timer for ${durationMinutes} minutes for raffle: ${raffleId}`);
    
    const timerData = {
      raffleId,
      durationMinutes,
      startedAt: new Date().toISOString(),
      endTime: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
      active: true
    };
    
    localStorage.setItem(`drawTimer_${raffleId}`, JSON.stringify(timerData));
    
    const timerInterval = setInterval(async () => {
      const storedTimer = JSON.parse(localStorage.getItem(`drawTimer_${raffleId}`) || '{}');
      
      if (!storedTimer.active) {
        clearInterval(timerInterval);
        return;
      }
      
      const now = new Date();
      const endTime = new Date(storedTimer.endTime);
      
      if (now >= endTime) {
        clearInterval(timerInterval);
        localStorage.removeItem(`drawTimer_${raffleId}`);
        
        await selectWinner(raffleId);
        await endDraw(raffleId);
        
        console.log(`Draw timer completed for raffle: ${raffleId}`);
      }
    }, 1000);
    
    return timerInterval;
  }, []);

  const calculateTimeRemainingPercent = useCallback((raffleId) => {
    try {
      const storedTimer = JSON.parse(localStorage.getItem(`drawTimer_${raffleId}`) || '{}');
      
      if (!storedTimer.active) return 0;
      
      const now = new Date();
      const startTime = new Date(storedTimer.startedAt);
      const endTime = new Date(storedTimer.endTime);
      
      const totalDuration = endTime - startTime;
      const elapsed = now - startTime;
      
      if (totalDuration <= 0 || elapsed <= 0) return 0;
      if (elapsed >= totalDuration) return 100;
      
      return (elapsed / totalDuration) * 100;
    } catch (error) {
      console.error('Error calculating time remaining:', error);
      return 0;
    }
  }, []);

  // Admin Actions
  const suspendUser = async (userId, suspend = true) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        suspended: suspend,
        lastActivity: serverTimestamp()
      });
      
      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'admin',
        title: suspend ? 'Account Suspended' : 'Account Restored',
        message: suspend ? 'Your account has been suspended by admin.' : 'Your account has been restored.',
        read: false,
        createdAt: serverTimestamp()
      });
      
      alert(`User ${suspend ? 'suspended' : 'restored'} successfully.`);
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Error: ' + error.message);
    }
  };

  const adjustBalance = async (userId, amount) => {
    const newAmount = typeof amount === 'string' ? 
      parseFloat(amount.replace(/[^\d.-]/g, '')) || 0 : 
      parseFloat(amount) || 0;
    
    if (isNaN(newAmount)) return;
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        balance: increment(newAmount),
        lastActivity: serverTimestamp()
      });
      
      await addDoc(collection(db, 'transactions'), {
        userId,
        type: 'admin_adjustment',
        amount: newAmount,
        status: 'completed',
        date: serverTimestamp(),
        description: `Balance adjustment by admin`,
        method: 'admin'
      });
      
      alert(`Balance adjusted by ${formatCurrency(newAmount)}`);
    } catch (error) {
      console.error('Error adjusting balance:', error);
      alert('Error: ' + error.message);
    }
  };

  const promoteToAdmin = async (userId, promote = true) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        accountType: promote ? 'admin' : 'user',
        lastActivity: serverTimestamp()
      });
      
      alert(`User ${promote ? 'promoted to admin' : 'demoted to user'}`);
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Error: ' + error.message);
    }
  };

  const updateRaffleStatus = async (raffleId, status) => {
    try {
      await updateDoc(doc(db, 'raffles', raffleId), {
        status,
        lastUpdated: serverTimestamp()
      });
      
      alert(`Raffle ${status} successfully.`);
    } catch (error) {
      console.error('Error updating raffle:', error);
      alert('Error: ' + error.message);
    }
  };

  const verifyWinner = async (winnerId, verify = true) => {
    try {
      await updateDoc(doc(db, 'winners', winnerId), {
        verified: verify,
        verifiedAt: serverTimestamp()
      });
      
      alert(`Winner ${verify ? 'verified' : 'unverified'} successfully.`);
    } catch (error) {
      console.error('Error verifying winner:', error);
      alert('Error: ' + error.message);
    }
  };

  const startDraw = async (raffleId, durationMinutes = 5) => {
    try {
      console.log('Starting draw for raffle:', raffleId, 'Duration:', durationMinutes, 'minutes');
      
      if (drawTimers[raffleId]) {
        if (window.confirm('Draw is already active. Do you want to restart it?')) {
          clearInterval(drawTimers[raffleId]);
          setDrawTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[raffleId];
            return newTimers;
          });
        } else {
          return;
        }
      }
      
      const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
      if (!raffleDoc.exists()) {
        alert('Raffle not found');
        return;
      }
      
      const raffleData = raffleDoc.data();
      const now = new Date();
      const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);
      
      const drawStateRef = doc(db, 'drawStates', raffleId);
      
      const drawStateData = {
        raffleId,
        raffleTitle: raffleData.title || 'Unknown Raffle',
        status: 'active',
        startedAt: serverTimestamp(),
        drawStartedAt: now.toISOString(),
        drawEndTime: endTime.toISOString(),
        durationMinutes: durationMinutes,
        currentTicket: null,
        selectedWinners: [],
        totalTickets: raffleData.totalTickets || 100,
        ticketsSold: raffleData.ticketsSold || 0,
        lastAction: serverTimestamp(),
        autoDraw: true,
        completed: false
      };
      
      await setDoc(drawStateRef, drawStateData);
      console.log('Created new draw state with timer');
      
      setDrawState(prev => ({ ...prev, [raffleId]: 'active' }));
      
      await updateDoc(doc(db, 'raffles', raffleId), {
        status: 'drawing',
        lastUpdated: serverTimestamp()
      });
      
      const newIntervalId = await startDrawTimer(raffleId, durationMinutes);
      setDrawTimers(prev => ({ ...prev, [raffleId]: newIntervalId }));
      
      alert(`✅ Draw started successfully! Draw will automatically complete in ${durationMinutes} minutes.`);
      
    } catch (error) {
      console.error('Error starting draw:', error);
      alert('Error starting draw: ' + error.message);
    }
  };

  const selectWinner = async (raffleId) => {
    try {
      console.log('🎯 SELECTING WINNER FOR RAFFLE:', raffleId);
      
      // 1. Get raffle details
      const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
      if (!raffleDoc.exists()) {
        alert('❌ Raffle not found');
        return;
      }
      
      const raffleData = raffleDoc.data();
      const timestampNow = new Date();
      
      // 2. Get all active tickets
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('raffleId', '==', raffleId),
        where('status', '==', 'active')
      );
      
      const ticketsSnapshot = await getDocs(ticketsQuery);
      const ticketList = ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`📊 Total tickets: ${ticketList.length}`);
      
      if (ticketList.length === 0) {
        alert('❌ No active tickets for this raffle.');
        return;
      }
      
      // 3. Select random winner
      const randomIndex = Math.floor(Math.random() * ticketList.length);
      const winningTicket = ticketList[randomIndex];
      
      console.log('🏆 Selected winning ticket:', winningTicket);
      
      // 4. GET CORRECT TICKET NUMBER
      let ticketNumber = '';
      
      // Debug: Show all ticket properties
      console.log('🎫 Ticket properties:', Object.keys(winningTicket));
      
      // Method 1: Check existing ticketNumber
      if (winningTicket.ticketNumber) {
        ticketNumber = winningTicket.ticketNumber;
      } 
      // Method 2: Check for other common field names
      else if (winningTicket.number) {
        ticketNumber = winningTicket.number;
      }
      // Method 3: Generate consistent format
      else {
        ticketNumber = `TICKET-${winningTicket.id.substring(0, 8).toUpperCase()}`;
        // Update ticket document with this number
        await updateDoc(doc(db, 'tickets', winningTicket.id), {
          ticketNumber: ticketNumber,
          updatedAt: serverTimestamp()
        });
      }
      
      console.log('✅ Final ticket number:', ticketNumber);
      
      // 5. Get user details
      let userDetails = {
        fullName: 'Winner',
        email: winningTicket.userEmail || 'unknown@email.com',
        phone: 'Not provided',
        firstName: '',
        lastName: ''
      };
      
      try {
        const userDoc = await getDoc(doc(db, 'users', winningTicket.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userDetails = {
            fullName: userData.displayName || 
                     `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 
                     'Winner',
            email: userData.email || winningTicket.userEmail || 'unknown@email.com',
            phone: userData.phone || 'Not provided',
            firstName: userData.firstName || '',
            lastName: userData.lastName || ''
          };
        }
      } catch (userError) {
        console.error('Error fetching user:', userError);
      }
      
      // 6. Prepare prize data - USE ACTUAL VALUE FIELD FROM RAFFLE
      let raffleValue = 0;
      if (raffleData.value !== undefined && raffleData.value !== null) {
        raffleValue = typeof raffleData.value === 'string' ? 
          parseFloat(raffleData.value.replace(/[^\d.-]/g, '')) || 0 : 
          raffleData.value;
      } else {
        // Fallback to calculated value
        const ticketPrice = typeof raffleData.ticketPrice === 'string' ?
          parseFloat(raffleData.ticketPrice.replace(/[^\d.-]/g, '')) || 0 :
          raffleData.ticketPrice || 0;
        const totalTickets = raffleData.totalTickets || 100;
        raffleValue = ticketPrice * totalTickets;
      }
      
      const prizeData = {
        name: raffleData.prizeName || 'Cash Prize',
        value: raffleValue, // Use actual value field from raffle
        description: `Winner of ${raffleData.title}`,
        type: 'cash'
      };
      
      // 7. Create COMPLETE winner document
      const winnerData = {
        // Core identifiers
        raffleId: raffleId,
        raffleTitle: raffleData.title || 'Unknown Raffle',
        userId: winningTicket.userId,
        ticketId: winningTicket.id,
        ticketNumber: ticketNumber,
        
        // User details
        userEmail: userDetails.email,
        userName: userDetails.fullName,
        userFirstName: userDetails.firstName,
        userLastName: userDetails.lastName,
        userPhone: userDetails.phone,
        userLocation: 'Not specified',
        userCity: 'Not specified',
        userState: 'Not specified',
        
        // Prize details - USE ACTUAL VALUE FIELD
        prize: {
          name: prizeData.name,
          value: prizeData.value,
          description: prizeData.description,
          type: prizeData.type
        },
        
        // Draw details
        date: serverTimestamp(),
        verified: false,
        public: true,
        drawMethod: 'random_selection',
        selectedBy: user?.uid || 'system',
        drawId: `DRAW-${Date.now()}`,
        
        // Additional metadata for live display
        timestamp: Date.now(),
        isoDate: new Date().toISOString(),
        humanDate: new Date().toLocaleString(),
        showOnLiveDraw: true,
        announcementMade: false,
        
        // Raffle image for display
        raffleImage: raffleData.image || raffleData.imageUrl || raffleData.mainImage
      };
      
      // 8. Save winner to Firestore
      const winnerRef = await addDoc(collection(db, 'winners'), winnerData);
      console.log('✅ Winner saved with ID:', winnerRef.id);
      
      // 9. Update ticket status
      await updateDoc(doc(db, 'tickets', winningTicket.id), {
        status: 'won',
        wonAt: serverTimestamp(),
        winnerId: winnerRef.id
      });
      
      // 10. UPDATE DRAW STATE (MOST IMPORTANT STEP)
      const drawStateRef = doc(db, 'drawStates', raffleId);
      
      // Create complete winner entry for draw state
      const winnerEntryForDrawState = {
        ticketNumber: ticketNumber,
        userId: winningTicket.userId,
        userName: userDetails.fullName,
        userEmail: userDetails.email,
        userPhone: userDetails.phone,
        timestamp: timestampNow.toISOString(),
        winnerId: winnerRef.id,
        prizeValue: prizeData.value,
        prizeName: prizeData.name,
        raffleTitle: raffleData.title,
        raffleImage: raffleData.image || raffleData.imageUrl,
        announcementText: `🎉 CONGRATULATIONS! ${userDetails.fullName} won ${raffleData.title} with ticket #${ticketNumber}!`,
        displayTime: new Date().toLocaleTimeString(),
        showAnnouncement: true
      };
      
      // Update draw state
      await setDoc(drawStateRef, {
        raffleId: raffleId,
        raffleTitle: raffleData.title,
        status: 'drawing',
        startedAt: serverTimestamp(),
        
        // CRITICAL: Set current ticket with ALL details
        currentTicket: ticketNumber,
        currentTicketDetails: {
          number: ticketNumber,
          userId: winningTicket.userId,
          userName: userDetails.fullName,
          userEmail: userDetails.email
        },
        
        // CRITICAL: Set current winner with ALL details
        currentWinner: {
          ticketNumber: ticketNumber,
          userName: userDetails.fullName,
          userEmail: userDetails.email,
          userPhone: userDetails.phone,
          prizeValue: prizeData.value,
          prizeName: prizeData.name,
          timestamp: timestampNow.toISOString(),
          raffleImage: raffleData.image || raffleData.imageUrl
        },
        
        selectedWinners: [winnerEntryForDrawState],
        totalTickets: raffleData.totalTickets || 100,
        ticketsSold: raffleData.ticketsSold || 0,
        lastAction: serverTimestamp(),
        
        // NEW: Special field for live draw page
        liveAnnouncement: {
          show: true,
          title: `🎉 WINNER SELECTED!`,
          message: `${userDetails.fullName} won ${formatCurrency(prizeData.value)} with ticket #${ticketNumber}`,
          timestamp: new Date().toISOString(),
          autoHide: false,
          ticketNumber: ticketNumber,
          userName: userDetails.fullName,
          prizeValue: prizeData.value,
          raffleTitle: raffleData.title,
          raffleImage: raffleData.image || raffleData.imageUrl
        }
      }, { merge: true });
      
      console.log('✅ Draw state updated with winner announcement');
      
      // 11. Send notifications
      try {
        // Notification to winner
        await addDoc(collection(db, 'notifications'), {
          userId: winningTicket.userId,
          type: 'win',
          title: '🎉 Congratulations! You Won!',
          message: `You won "${raffleData.title}"! Prize: ${prizeData.name} (${formatCurrency(prizeData.value)})`,
          read: false,
          createdAt: serverTimestamp(),
          metadata: {
            raffleId: raffleId,
            winnerId: winnerRef.id,
            ticketNumber: ticketNumber
          }
        });
        
        // SYSTEM-WIDE announcement (for live draw page)
        await addDoc(collection(db, 'notifications'), {
          type: 'system',
          title: '🎉 NEW WINNER ANNOUNCED!',
          message: `TICKET #${ticketNumber} - ${userDetails.fullName} won ${formatCurrency(prizeData.value)} in "${raffleData.title}"`,
          read: false,
          createdAt: serverTimestamp(),
          forAll: true,
          forLiveDraw: true,
          announcementData: winnerEntryForDrawState
        });
        
        console.log('✅ Notifications sent');
      } catch (notifError) {
        console.error('Error creating notifications:', notifError);
      }
      
      // 12. Show admin alert
      const winnerAlertMessage = `
🎉 WINNER SELECTED! 🎉

🏆 RAFFLE: ${raffleData.title}
🎫 WINNING TICKET: #${ticketNumber}

👤 WINNER DETAILS:
• Name: ${userDetails.fullName}
• Email: ${userDetails.email}
• Phone: ${userDetails.phone}

💰 PRIZE DETAILS:
• Prize: ${prizeData.name}
• Value: ${formatCurrency(prizeData.value)}

✅ Winner saved to database
✅ Draw state updated
✅ Notifications sent
`;
      
      alert(winnerAlertMessage);
      
      // 13. Force refresh live draw data
      setTimeout(() => {
        console.log('🔄 Forcing live draw page refresh...');
        const refreshEvent = new CustomEvent('liveDrawRefresh', { 
          detail: { raffleId: raffleId } 
        });
        window.dispatchEvent(refreshEvent);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error selecting winner:', error);
      alert('❌ Error selecting winner: ' + error.message);
    }
  };

  const endDraw = async (raffleId) => {
    try {
      const drawStateRef = doc(db, 'drawStates', raffleId);
      const drawStateDoc = await getDoc(drawStateRef);
      
      if (drawStateDoc.exists()) {
        await updateDoc(drawStateRef, {
          status: 'completed',
          endedAt: serverTimestamp(),
          lastAction: serverTimestamp()
        });
      }
      
      await updateDoc(doc(db, 'raffles', raffleId), {
        status: 'completed',
        completedAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      
      setDrawState(prev => ({ ...prev, [raffleId]: 'completed' }));
      
      if (drawTimers[raffleId]) {
        clearInterval(drawTimers[raffleId]);
        setDrawTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[raffleId];
          return newTimers;
        });
      }
      
      localStorage.removeItem(`drawTimer_${raffleId}`);
      
      const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
      if (raffleDoc.exists()) {
        const raffleData = raffleDoc.data();
        await addDoc(collection(db, 'notifications'), {
          type: 'system',
          title: '🏁 Draw Completed',
          message: `The "${raffleData.title}" raffle draw has been completed.`,
          read: false,
          createdAt: serverTimestamp(),
          forAll: true
        });
      }
      
      alert('✅ Draw completed successfully.');
      
    } catch (error) {
      console.error('Error ending draw:', error);
      alert('Error ending draw: ' + error.message);
    }
  };

  const extendDrawTime = async (raffleId, additionalMinutes) => {
    try {
      const drawStateRef = doc(db, 'drawStates', raffleId);
      const drawStateDoc = await getDoc(drawStateRef);
      
      if (drawStateDoc.exists()) {
        const data = drawStateDoc.data();
        if (data.drawEndTime) {
          const currentEndTime = new Date(data.drawEndTime);
          const newEndTime = new Date(currentEndTime.getTime() + additionalMinutes * 60 * 1000);
          
          await updateDoc(drawStateRef, {
            drawEndTime: newEndTime.toISOString(),
            durationMinutes: (data.durationMinutes || 5) + additionalMinutes
          });
          
          const storedTimer = JSON.parse(localStorage.getItem(`drawTimer_${raffleId}`) || '{}');
          if (storedTimer.active) {
            storedTimer.endTime = newEndTime.toISOString();
            storedTimer.durationMinutes = (storedTimer.durationMinutes || 5) + additionalMinutes;
            localStorage.setItem(`drawTimer_${raffleId}`, JSON.stringify(storedTimer));
          }
          
          alert(`Draw time extended by ${additionalMinutes} minutes`);
        }
      }
    } catch (error) {
      console.error('Error extending draw time:', error);
      alert('Error extending draw time: ' + error.message);
    }
  };

  // NEW: Cleanup completed draws
  const cleanupCompletedDraws = useCallback(async () => {
    try {
      // Get all completed draws
      const completedDraws = raffles.filter(r => r.status === 'completed');
      
      for (const raffle of completedDraws) {
        // Clear draw state
        const drawStateRef = doc(db, 'drawStates', raffle.id);
        await deleteDoc(drawStateRef);
        
        // Clear local storage
        localStorage.removeItem(`drawTimer_${raffle.id}`);
        
        console.log(`🧹 Cleaned up completed draw: ${raffle.title}`);
      }
      
      alert(`Cleaned up ${completedDraws.length} completed draws`);
    } catch (error) {
      console.error('Error cleaning up draws:', error);
      alert('Error cleaning up draws: ' + error.message);
    }
  }, [raffles]);

  // NEW: Cleanup old announcements
  const cleanupOldAnnouncements = useCallback(async () => {
    try {
      // Get all draw states
      const drawStatesQuery = query(collection(db, 'drawStates'));
      const drawStatesSnapshot = await getDocs(drawStatesQuery);
      
      const activeRaffleIds = raffles
        .filter(r => r.status === 'active' || r.status === 'drawing')
        .map(r => r.id);
      
      let deletedCount = 0;
      
      for (const doc of drawStatesSnapshot.docs) {
        const drawState = doc.data();
        
        // Delete draw states for completed or non-existent raffles
        if (!activeRaffleIds.includes(drawState.raffleId)) {
          await deleteDoc(doc.ref);
          deletedCount++;
          console.log(`🧹 Deleted old draw state for: ${drawState.raffleTitle}`);
        }
      }
      
      alert(`Cleaned up ${deletedCount} old announcements`);
    } catch (error) {
      console.error('Error cleaning up announcements:', error);
      alert('Error cleaning up announcements: ' + error.message);
    }
  }, [raffles]);

  // Filter data based on search
  const filteredUsers = useMemo(() => 
    users?.filter(user => 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.uid?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [], [users, searchQuery]);

  const filteredRaffles = useMemo(() => 
    raffles?.filter(raffle =>
      raffle.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      raffle.id?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [], [raffles, searchQuery]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  // ==================== RENDER COMPONENTS ====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-2xl border-b border-white/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowDrawer(!showDrawer)}
                className="p-2 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                <Menu size={20} />
              </button>
              <div>
                <div className="text-sm text-white/80">Admin Dashboard</div>
                <div className="font-black text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  NextWinner Admin
                </div>
              </div>
            </div>

            
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white/80">
                  {onlineUsers?.length || 0} online
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm w-48 focus:w-64 transition-all"
                />
                <Search size={16} className="absolute right-3 top-2.5 text-white/40" />
              </div>
              
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    signOut(auth).then(() => navigate('/admin-login'));
                  }
                }}
                className="p-2 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-4">
        {/* System Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { 
              label: 'Total Users', 
              value: systemStats.totalUsers, 
              icon: Users, 
              color: 'from-blue-500 to-cyan-500',
              change: '+12%'
            },
            { 
              label: 'Active Raffles', 
              value: systemStats.activeRaffles, 
              icon: Ticket, 
              color: 'from-green-500 to-emerald-500',
              change: systemStats.activeRaffles > 0 ? 'Active' : 'None'
            },
            { 
              label: 'Tickets Sold', 
              value: systemStats.ticketsSold, 
              icon: ShoppingCart, 
              color: 'from-yellow-500 to-orange-500',
              change: '+24%'
            },
            { 
              label: 'Total Revenue', 
              value: formatCurrency(systemStats.totalRevenue), 
              icon: DollarSign, 
              color: 'from-purple-500 to-pink-500',
              change: '+18%'
            },
            { 
              label: 'Winners', 
              value: systemStats.verifiedWinners, 
              icon: Award, 
              color: 'from-red-500 to-rose-500',
              change: 'Verified'
            },
            { 
              label: 'Online Now', 
              value: onlineUsers?.length || 0, 
              icon: Activity, 
              color: 'from-indigo-500 to-violet-500',
              change: 'Live'
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/60">{stat.label}</div>
                    <div className="text-lg font-black">{stat.value}</div>
                    <div className="text-xs text-green-400">{stat.change}</div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
          <WithdrawalRequestsButton 
          pendingCount={withdrawalStats.pendingCount}
          pendingAmount={withdrawalStats.pendingAmount}
        />
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/15 overflow-hidden mb-20">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-white/10">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'tickets', label: 'Tickets', icon: Ticket },
              { id: 'raffles', label: 'All Raffles', icon: Gift },
              { id: 'won-raffles', label: 'Won Raffles', icon: Trophy },
              { id: 'transactions', label: 'Transactions', icon: DollarSign },
              { id: 'winners', label: 'Winners', icon: Award },
              { id: 'live-draw', label: 'Live Draw', icon: Radio },
              { id: 'system', label: 'System', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/admin/${tab.id}`)}
                  className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b-2 border-purple-500'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Panels */}
          <div className="p-4">
            {/* Overview Panel */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl">System Overview</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={cleanupCompletedDraws}
                      className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all"
                      title="Cleanup completed draws"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                    <button 
                      onClick={() => window.location.reload()}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Activity size={18} /> Recent Activity
                    </h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {notifications.slice(0, 10).map(notification => (
                        <div key={notification.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            notification.type === 'win' ? 'bg-yellow-500/20' :
                            notification.type === 'purchase' ? 'bg-green-500/20' :
                            'bg-blue-500/20'
                          }`}>
                            {notification.type === 'win' ? <Award size={14} /> :
                             notification.type === 'purchase' ? <ShoppingCart size={14} /> :
                             <Bell size={14} />}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{notification.title}</div>
                            <div className="text-xs text-white/60">{notification.message}</div>
                            <div className="text-xs text-white/40 mt-1">
                              {formatTimeAgo(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  

              

<button
  onClick={() => navigate('/admin-influ')}
  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2"
>
  <Users className="w-5 h-5" />
  Manage Influencers
</button>

                  {/* Quick Stats */}
                  
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">

                  
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <TrendingUp size={18} /> Performance Metrics
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-white/60 mb-1">Conversion Rate</div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${Math.min((tickets.length / (users.length || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-white/60 mt-1">
                          {((tickets.length / (users.length || 1)) * 100).toFixed(1)}% of users bought tickets
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-white/60 mb-1">Average Ticket Value</div>
                        <div className="text-lg font-black">
                          {formatCurrency(tickets.length > 0 ? systemStats.totalRevenue / tickets.length : 0)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-white/60 mb-1">Active Users (Last 24h)</div>
                        <div className="text-lg font-black">
                          {users.filter(u => u.lastActivity && 
                            new Date(u.lastActivity.toDate ? u.lastActivity.toDate() : u.lastActivity) > 
                            new Date(Date.now() - 24 * 60 * 60 * 1000)
                          ).length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Tickets & Winners */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                    <h4 className="font-bold mb-3">Recent Ticket Purchases</h4>
                    <div className="space-y-2">
                      {tickets.slice(0, 5).map(ticket => {
                        const price = typeof ticket.price === 'string' ? 
                          parseFloat(ticket.price.replace(/[^\d.-]/g, '')) || 0 : 
                          ticket.price || 0;
                        
                        return (
                          <div key={ticket.id} className="flex items-center justify-between p-2 bg-white/5 rounded-xl">
                            <div>
                              <div className="text-sm font-medium truncate max-w-[180px]">
                                #{ticket.ticketNumber}
                              </div>
                              <div className="text-xs text-white/60">
                                {ticket.userEmail?.split('@')[0] || 'User'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-yellow-400">
                                {formatCurrency(price)}
                              </div>
                              <div className="text-xs text-white/60">
                                {formatTimeAgo(ticket.purchaseDate)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                    <h4 className="font-bold mb-3">Recent Winners</h4>
                    <div className="space-y-2">
                      {winners.slice(0, 5).map(winner => (
                        <div key={winner.id} className="flex items-center justify-between p-2 bg-white/5 rounded-xl">
                          <div>
                            <div className="text-sm font-medium truncate max-w-[180px]">
                              Ticket #{winner.ticketNumber}
                            </div>
                            <div className="text-xs text-white/60">
                              {winner.userEmail?.split('@')[0] || 'Winner'}
                            </div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            winner.verified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {winner.verified ? 'Verified' : 'Pending'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Panel */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl">User Management ({users.length})</h3>
                  <button 
                    onClick={() => setShowCreateModal('user')}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    + Add User
                  </button>
                </div>
                
                {/* User Stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Total</div>
                    <div className="text-xl font-black text-blue-400">{users.length}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Admins</div>
                    <div className="text-xl font-black text-purple-400">
                      {users.filter(u => u.accountType === 'admin').length}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Active</div>
                    <div className="text-xl font-black text-green-400">
                      {users.filter(u => !u.suspended).length}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Suspended</div>
                    <div className="text-xl font-black text-red-400">
                      {users.filter(u => u.suspended).length}
                    </div>
                  </div>
                  
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-2 text-sm font-medium">User</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Email</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Balance</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Tickets</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Status</th>
                        <th className="text-left py-3 px-2 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                <User size={14} />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{user.displayName || 'No Name'}</div>
                                <div className="text-xs text-white/60">ID: {user.id.substring(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-sm">{user.email}</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-sm font-bold text-green-400">
                              {formatCurrency(user.balance || 0)}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-sm">
                              {tickets.filter(t => t.userId === user.id).length}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                user.accountType === 'admin' ? 'bg-purple-500' :
                                user.suspended ? 'bg-red-500' : 'bg-green-500'
                              }`}></div>
                              <span className="text-sm">
                                {user.accountType === 'admin' ? 'Admin' : 
                                 user.suspended ? 'Suspended' : 'Active'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => setSelectedUser(user)}
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                                title="Edit User"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => suspendUser(user.id, !user.suspended)}
                                className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
                                title={user.suspended ? 'Unsuspend' : 'Suspend'}
                              >
                                {user.suspended ? <UserCheck size={14} /> : <User size={14} />}
                              </button>
                              <button 
                                onClick={() => promoteToAdmin(user.id, user.accountType !== 'admin')}
                                className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-all"
                                title={user.accountType === 'admin' ? 'Demote' : 'Promote to Admin'}
                              >
                                <Shield size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tickets Panel */}
            {activeTab === 'tickets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl">Ticket Management ({tickets.length})</h3>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-sm">
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Won</option>
                      <option>Used</option>
                    </select>
                  </div>
                </div>
                
                {/* Ticket Stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Total Tickets</div>
                    <div className="text-xl font-black text-blue-400">{tickets.length}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Active</div>
                    <div className="text-xl font-black text-green-400">
                      {tickets.filter(t => t.status === 'active').length}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Won</div>
                    <div className="text-xl font-black text-yellow-400">
                      {tickets.filter(t => t.status === 'won').length}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Used</div>
                    <div className="text-xl font-black text-gray-400">
                      {tickets.filter(t => t.status === 'used').length}
                    </div>
                  </div>
                </div>

                {/* Tickets List */}
                <div className="space-y-3">
                  {tickets.slice(0, 50).map(ticket => {
                    const price = typeof ticket.price === 'string' ? 
                      parseFloat(ticket.price.replace(/[^\d.-]/g, '')) || 0 : 
                      ticket.price || 0;
                    
                    return (
                      <div key={ticket.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="font-bold text-lg">#{ticket.ticketNumber}</div>
                            <div className="text-sm text-white/60">
                              Raffle: {ticket.raffleTitle || 'Unknown Raffle'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-yellow-400">
                              {formatCurrency(price)}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              ticket.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              ticket.status === 'won' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {ticket.status || 'active'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="bg-white/5 rounded-xl p-2">
                            <div className="text-xs text-white/60">User</div>
                            <div className="font-medium text-sm truncate">
                              {users.find(u => u.id === ticket.userId)?.email?.split('@')[0] || 'Unknown'}
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-xl p-2">
                            <div className="text-xs text-white/60">Purchase Date</div>
                            <div className="font-medium text-sm">
                              {ticket.purchaseDate ? formatDate(ticket.purchaseDate) : 'N/A'}
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-xl p-2">
                            <div className="text-xs text-white/60">Draw Date</div>
                            <div className="font-medium text-sm">
                              {ticket.drawDate ? formatDate(ticket.drawDate) : 'Pending'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Raffles Panel */}
            {activeTab === 'raffles' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl">Raffle Management ({raffles.length})</h3>
                  <button 
                    onClick={() => navigate('/create-raffle')}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    + Create Raffle
                  </button>
                </div>
                
                {/* Raffle Stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Active</div>
                    <div className="text-xl font-black text-green-400">
                      {raffles.filter(r => r.status === 'active').length}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Upcoming</div>
                    <div className="text-xl font-black text-blue-400">
                      {raffles.filter(r => r.status === 'upcoming').length}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Completed</div>
                    <div className="text-xl font-black text-yellow-400">
                      {raffles.filter(r => r.status === 'completed').length}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Total Value</div>
                    <div className="text-xl font-black text-purple-400">
                      {formatCurrency(raffles.reduce((sum, r) => {
                        let value = 0;
                        if (r.value !== undefined && r.value !== null) {
                          value = typeof r.value === 'string' ? 
                            parseFloat(r.value.replace(/[^\d.-]/g, '')) || 0 : 
                            r.value;
                        } else {
                          const ticketPrice = typeof r.ticketPrice === 'string' ?
                            parseFloat(r.ticketPrice.replace(/[^\d.-]/g, '')) || 0 :
                            r.ticketPrice || 0;
                          const totalTickets = r.totalTickets || 100;
                          value = ticketPrice * totalTickets;
                        }
                        return sum + value;
                      }, 0))}
                    </div>
                  </div>
                </div>

                {/* Raffles Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRaffles.map(raffle => {
                    // Get actual value field
                    let raffleValue = 0;
                    if (raffle.value !== undefined && raffle.value !== null) {
                      raffleValue = typeof raffle.value === 'string' ? 
                        parseFloat(raffle.value.replace(/[^\d.-]/g, '')) || 0 : 
                        raffle.value;
                    } else {
                      const ticketPrice = typeof raffle.ticketPrice === 'string' ?
                        parseFloat(raffle.ticketPrice.replace(/[^\d.-]/g, '')) || 0 :
                        raffle.ticketPrice || 0;
                      const totalTickets = raffle.totalTickets || 100;
                      raffleValue = ticketPrice * totalTickets;
                    }
                    
                    return (
                      <div key={raffle.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                        {/* Raffle Image */}
                        {(raffle.image || raffle.imageUrl || raffle.mainImage) && (
                          <div className="mb-3">
                            <img 
                              src={raffle.image || raffle.imageUrl || raffle.mainImage} 
                              alt={raffle.title}
                              className="w-full h-40 object-cover rounded-xl"
                              loading="lazy"
                            />
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="font-bold text-lg truncate">{raffle.title}</div>
                            <div className="text-sm text-white/60">
                              {raffle.category || 'General'}
                            </div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            raffle.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            raffle.status === 'completed' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {raffle.status}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-sm text-white/60 mb-1">Progress</div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                              style={{ width: `${Math.min((raffle.ticketsSold || 0) / (raffle.totalTickets || 1) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-white/60 mt-1">
                            <span>{raffle.ticketsSold || 0} sold</span>
                            <span>{raffle.totalTickets || 100} total</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-white/5 rounded-xl p-2">
                            <div className="text-xs text-white/60">Ticket Price</div>
                            <div className="font-bold text-sm">{formatCurrency(raffle.ticketPrice || 0)}</div>
                          </div>
                          <div className="bg-white/5 rounded-xl p-2">
                            <div className="text-xs text-white/60">Prize Value</div>
                            <div className="font-bold text-sm text-yellow-400">{formatCurrency(raffleValue)}</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => startDraw(raffle.id)}
                            className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
                          >
                            Start Draw
                          </button>
                          <button 
                            onClick={() => setSelectedRaffle(raffle)}
                            className="flex-1 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-medium hover:bg-white/25 transition-all"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Won Raffles Panel */}
            {activeTab === 'won-raffles' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl">Completed Raffles</h3>
                  <div className="text-sm text-white/60">
                    {raffles.filter(r => r.status === 'completed').length} completed
                  </div>
                </div>
                
                <div className="space-y-4">
                  {raffles
                    .filter(r => r.status === 'completed')
                    .map(raffle => {
                      const raffleWinners = winners.filter(w => w.raffleId === raffle.id);
                      
                      // Get actual value field
                      let raffleValue = 0;
                      if (raffle.value !== undefined && raffle.value !== null) {
                        raffleValue = typeof raffle.value === 'string' ? 
                          parseFloat(raffle.value.replace(/[^\d.-]/g, '')) || 0 : 
                          raffle.value;
                      } else {
                        const ticketPrice = typeof raffle.ticketPrice === 'string' ?
                          parseFloat(raffle.ticketPrice.replace(/[^\d.-]/g, '')) || 0 :
                          raffle.ticketPrice || 0;
                        const totalTickets = raffle.totalTickets || 100;
                        raffleValue = ticketPrice * totalTickets;
                      }
                      
                      return (
                        <div key={raffle.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="font-bold text-xl">{raffle.title}</div>
                              <div className="text-sm text-white/60">
                                Completed on {raffle.completedAt ? formatDate(raffle.completedAt) : 'N/A'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-yellow-400">
                                {formatCurrency(raffleValue)}
                              </div>
                              <div className="text-sm text-white/60">
                                {raffleWinners.length} winners
                              </div>
                            </div>
                          </div>
                          
                          {raffleWinners.length > 0 ? (
                            <div className="space-y-3">
                              <div className="text-sm font-medium">Winners:</div>
                              {raffleWinners.map(winner => (
                                <div key={winner.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                                      <Award size={20} className="text-yellow-400" />
                                    </div>
                                    <div>
                                      <div className="font-medium">Ticket #{winner.ticketNumber}</div>
                                      <div className="text-xs text-white/60">
                                        {winner.userEmail || 'Unknown User'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      winner.verified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                      {winner.verified ? 'Verified' : 'Pending'}
                                    </span>
                                    <button 
                                      onClick={() => verifyWinner(winner.id, !winner.verified)}
                                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                                    >
                                      {winner.verified ? <X size={14} /> : <Check size={14} />}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-white/60">
                              No winners recorded for this raffle
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Transactions Panel */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl">Transaction History</h3>
                  <div className="text-lg font-bold text-green-400">
                    {formatCurrency(systemStats.totalRevenue)}
                  </div>
                </div>
                
                {/* Revenue Breakdown */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="text-sm text-white/60">Today</div>
                    <div className="text-lg font-bold text-green-400">
                      {formatCurrency(
                        tickets
                          .filter(t => t.purchaseDate && 
                            new Date(t.purchaseDate.toDate ? t.purchaseDate.toDate() : t.purchaseDate) > 
                            new Date(Date.now() - 24 * 60 * 60 * 1000)
                          )
                          .reduce((sum, t) => {
                            const price = typeof t.price === 'string' ? 
                              parseFloat(t.price.replace(/[^\d.-]/g, '')) || 0 : 
                              t.price || 0;
                            return sum + price;
                          }, 0)
                      )}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="text-sm text-white/60">This Week</div>
                    <div className="text-lg font-bold text-green-400">
                      {formatCurrency(
                        tickets
                          .filter(t => t.purchaseDate && 
                            new Date(t.purchaseDate.toDate ? t.purchaseDate.toDate() : t.purchaseDate) > 
                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                          )
                          .reduce((sum, t) => {
                            const price = typeof t.price === 'string' ? 
                              parseFloat(t.price.replace(/[^\d.-]/g, '')) || 0 : 
                              t.price || 0;
                            return sum + price;
                          }, 0)
                      )}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="text-sm text-white/60">All Time</div>
                    <div className="text-lg font-bold text-green-400">
                      {formatCurrency(systemStats.totalRevenue)}
                    </div>
                  </div>
                </div>

                {/* Transactions List */}
                <div className="space-y-2">
                  {tickets.slice(0, 100).map(ticket => {
                    const price = typeof ticket.price === 'string' ? 
                      parseFloat(ticket.price.replace(/[^\d.-]/g, '')) || 0 : 
                      ticket.price || 0;
                    
                    return (
                      <div key={ticket.id} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
                            <ShoppingCart size={20} className="text-green-400" />
                          </div>
                          <div>
                            <div className="font-medium">Ticket #{ticket.ticketNumber}</div>
                            <div className="text-xs text-white/60">
                              {users.find(u => u.id === ticket.userId)?.email || 'Unknown User'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400">
                            {formatCurrency(price)}
                          </div>
                          <div className="text-xs text-white/60">
                            {ticket.purchaseDate ? formatDate(ticket.purchaseDate) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Winners Panel */}
            {activeTab === 'winners' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl">Winner Management ({winners.length})</h3>
                  <div className="text-sm">
                    <span className="text-green-400">{winners.filter(w => w.verified).length} verified</span>
                    {' • '}
                    <span className="text-yellow-400">{winners.filter(w => !w.verified).length} pending</span>
                  </div>
                </div>
                
                {/* Winner Stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Total Winners</div>
                    <div className="text-xl font-black text-blue-400">{winners.length}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Verified</div>
                    <div className="text-xl font-black text-green-400">
                      {winners.filter(w => w.verified).length}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Pending</div>
                    <div className="text-xl font-black text-yellow-400">
                      {winners.filter(w => !w.verified).length}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Total Prize Value</div>
                    <div className="text-xl font-black text-purple-400">
                      {formatCurrency(winners.reduce((sum, w) => {
                        const prizeValue = w.prize?.value || 0;
                        const value = typeof prizeValue === 'string' ? 
                          parseFloat(prizeValue.replace(/[^\d.-]/g, '')) || 0 : 
                          prizeValue;
                        return sum + value;
                      }, 0))}
                    </div>
                  </div>
                </div>

                {/* Winners List */}
                <div className="space-y-3">
                  {winners.map(winner => {
                    const user = users.find(u => u.id === winner.userId);
                    const raffle = raffles.find(r => r.id === winner.raffleId);
                    
                    // Get prize value
                    const prizeValue = winner.prize?.value || 0;
                    const value = typeof prizeValue === 'string' ? 
                      parseFloat(prizeValue.replace(/[^\d.-]/g, '')) || 0 : 
                      prizeValue;
                    
                    return (
                      <div key={winner.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                        {/* Raffle Image */}
                        {(winner.raffleImage || raffle?.image || raffle?.imageUrl) && (
                          <div className="mb-4">
                            <img 
                              src={winner.raffleImage || raffle?.image || raffle?.imageUrl} 
                              alt={raffle?.title || 'Raffle'}
                              className="w-full h-48 object-cover rounded-xl"
                              loading="lazy"
                            />
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                              <Award size={24} className="text-yellow-400" />
                            </div>
                            <div>
                              <div className="font-bold text-lg">Ticket #{winner.ticketNumber}</div>
                              <div className="text-sm text-white/60">
                                {raffle?.title || 'Unknown Raffle'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-yellow-400">
                              {formatCurrency(value)}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              winner.verified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {winner.verified ? 'Verified' : 'Pending Verification'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-white/5 rounded-xl p-2">
                            <div className="text-xs text-white/60">Winner</div>
                            <div className="font-medium text-sm truncate">
                              {user?.displayName || user?.email?.split('@')[0] || 'Unknown'}
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-xl p-2">
                            <div className="text-xs text-white/60">Win Date</div>
                            <div className="font-medium text-sm">
                              {formatDate(winner.date || winner.dateString || winner.isoDate || winner.timestamp || raffle?.completedAt)}
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-xl p-2">
                            <div className="text-xs text-white/60">Prize</div>
                            <div className="font-medium text-sm truncate">
                              {winner.prize?.name || 'Cash Prize'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => verifyWinner(winner.id, !winner.verified)}
                            className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                          >
                            {winner.verified ? 'Unverify' : 'Verify Winner'}
                          </button>
                          <button 
                            onClick={() => navigate(`/winner/${winner.id}`)}
                            className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => setShowCreateModal('winner')}
                            className="flex-1 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl font-medium hover:bg-white/25 transition-all"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live Draw Panel */}
            {activeTab === 'live-draw' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl">Live Draw Control Center</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Live Updates Active</span>
                  </div>
                </div>
                
                {/* Cleanup Controls */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15 mb-4">
                  <h4 className="font-bold mb-3">Cleanup Controls</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={cleanupCompletedDraws}
                      className="py-3 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all"
                    >
                      <div className="font-bold">Clean Completed Draws</div>
                      <div className="text-xs text-white/60">Clear old draw states</div>
                    </button>
                    <button
                      onClick={cleanupOldAnnouncements}
                      className="py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/30 transition-all"
                    >
                      <div className="font-bold">Clean Old Announcements</div>
                      <div className="text-xs text-white/60">Remove old winner announcements</div>
                    </button>
                  </div>
                </div>
                
                {/* Quick Draw Controls */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15 mb-4">
                  <h4 className="font-bold mb-3">Quick Start Draw</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 3, 5, 10].map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() => {
                          const activeRaffle = raffles.find(r => r.status === 'active');
                          if (activeRaffle) {
                            startDraw(activeRaffle.id, minutes);
                          } else {
                            alert('No active raffles available to start draw');
                          }
                        }}
                        className="py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all"
                      >
                        <div className="text-lg font-bold">{minutes} min</div>
                        <div className="text-xs text-white/60">Draw</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Active Draws with Big Countdown */}
                <div className="space-y-4">
                  {raffles && raffles.length > 0 ? (
                    raffles
                      .filter(r => r.status === 'active' || r.status === 'drawing')
                      .map(raffle => {
                        const raffleTickets = tickets.filter(t => t.raffleId === raffle.id);
                        const soldTickets = raffleTickets.length;
                        const totalTickets = raffle.totalTickets || 100;
                        const progress = Math.min((soldTickets / totalTickets) * 100, 100);
                        const isDrawing = raffle.status === 'drawing';
                        const raffleWinners = winners.filter(w => w.raffleId === raffle.id);
                        
                        // Get actual value field
                        let raffleValue = 0;
                        if (raffle.value !== undefined && raffle.value !== null) {
                          raffleValue = typeof raffle.value === 'string' ? 
                            parseFloat(raffle.value.replace(/[^\d.-]/g, '')) || 0 : 
                            raffle.value;
                        } else {
                          const ticketPrice = typeof raffle.ticketPrice === 'string' ?
                            parseFloat(raffle.ticketPrice.replace(/[^\d.-]/g, '')) || 0 :
                            raffle.ticketPrice || 0;
                          raffleValue = ticketPrice * totalTickets;
                        }
                        
                        return (
                          <div key={raffle.id} className={`bg-white/10 backdrop-blur-xl rounded-2xl p-4 border ${
                            isDrawing ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20' : 'border-white/15'
                          }`}>
                            {/* Raffle Image */}
                            {(raffle.image || raffle.imageUrl || raffle.mainImage) && (
                              <div className="mb-4">
                                <img 
                                  src={raffle.image || raffle.imageUrl || raffle.mainImage} 
                                  alt={raffle.title}
                                  className="w-full h-48 object-cover rounded-xl"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="font-bold text-xl flex items-center gap-2">
                                  {raffle.title}
                                  {isDrawing && (
                                    <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full animate-pulse">
                                      🎥 LIVE DRAW IN PROGRESS
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm text-white/60">
                                  Draw: {raffle.drawDate ? formatDate(raffle.drawDate) : 'Pending'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-yellow-400">
                                  {formatCurrency(raffleValue)}
                                </div>
                                <div className="text-sm text-white/60">
                                  {soldTickets} / {totalTickets} sold
                                </div>
                              </div>
                            </div>
                            
                            {/* BIG COUNTDOWN TIMER */}
                            {isDrawing && (
                              <div className="mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30 rounded-2xl p-6 text-center">
                                <div className="text-sm font-medium text-yellow-400 mb-2">DRAW ENDS IN</div>
                                <div className="text-5xl font-black text-white mb-2 font-mono">
                                  <LiveCountdownTimer raffleId={raffle.id} />
                                </div>
                                <div className="text-sm text-yellow-300">
                                  Winner will be automatically selected when timer reaches 00:00
                                </div>
                                <div className="h-2 bg-yellow-500/20 rounded-full overflow-hidden mt-4">
                                  <div 
                                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                    style={{ 
                                      width: `${calculateTimeRemainingPercent(raffle.id)}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            <div className="mb-4">
                              <div className="flex justify-between text-sm text-white/60 mb-1">
                                <span>Ticket Sales Progress</span>
                                <span>{progress.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    isDrawing ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                                    'bg-gradient-to-r from-green-500 to-emerald-500'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              <div className="bg-white/5 rounded-xl p-2 text-center">
                                <div className="text-xs text-white/60">Total Value</div>
                                <div className="font-bold text-sm">
                                  {formatCurrency(raffleValue)}
                                </div>
                              </div>
                              <div className="bg-white/5 rounded-xl p-2 text-center">
                                <div className="text-xs text-white/60">Remaining</div>
                                <div className="font-bold text-sm">{totalTickets - soldTickets}</div>
                              </div>
                              <div className="bg-white/5 rounded-xl p-2 text-center">
                                <div className="text-xs text-white/60">Status</div>
                                <div className={`font-bold text-sm ${
                                  isDrawing ? 'text-yellow-400' : 'text-green-400'
                                }`}>
                                  {raffle.status}
                                </div>
                              </div>
                            </div>
                            
                            {/* Recent Winners for this Raffle */}
                            {raffleWinners.length > 0 && (
                              <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                                <h5 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                                  <Award size={16} /> 🏆 RECENT WINNERS:
                                </h5>
                                <div className="space-y-2">
                                  {raffleWinners
                                    .slice(0, 3)
                                    .map(winner => {
                                      const prizeValue = winner.prize?.value || 0;
                                      const value = typeof prizeValue === 'string' ? 
                                        parseFloat(prizeValue.replace(/[^\d.-]/g, '')) || 0 : 
                                        prizeValue;
                                      
                                      return (
                                        <div key={winner.id} className="flex items-center justify-between bg-green-500/5 p-3 rounded-lg">
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                                              <Trophy size={16} className="text-yellow-400" />
                                            </div>
                                            <div>
                                              <div className="text-sm font-bold">
                                                🎫 Ticket #{winner.ticketNumber}
                                              </div>
                                              <div className="text-xs font-medium text-white">
                                                👤 {winner.userName || 'Winner'}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-sm font-bold text-yellow-400">
                                              {formatCurrency(value)}
                                            </div>
                                            <div className="text-xs text-white/60">
                                              {formatTimeAgo(winner.date)}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              {!isDrawing ? (
                                <>
                                  <button 
                                    onClick={() => startDraw(raffle.id, 5)}
                                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                  >
                                    Start 5-min Draw
                                  </button>
                                  <button 
                                    onClick={() => navigate(`/raffle/${raffle.id}`)}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                  >
                                    View Raffle
                                  </button>
                                  <button 
                                    onClick={() => selectWinner(raffle.id)}
                                    className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                  >
                                    Select Winner
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => selectWinner(raffle.id)}
                                    className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                  >
                                    🎯 DRAW WINNER NOW
                                  </button>
                                  <button 
                                    onClick={() => navigate(`/raffle/${raffle.id}`)}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                  >
                                    📺 WATCH LIVE
                                  </button>
                                  <button 
                                    onClick={() => endDraw(raffle.id)}
                                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                  >
                                    ⏹️ END DRAW
                                  </button>
                                </>
                              )}
                            </div>
                            
                            {/* Quick Draw Duration Selector */}
                            {isDrawing && (
                              <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="text-sm text-white/60 mb-2">Extend Draw Time:</div>
                                <div className="flex gap-2">
                                  {[1, 2, 5, 10].map((minutes) => (
                                    <button
                                      key={minutes}
                                      onClick={() => extendDrawTime(raffle.id, minutes)}
                                      className="flex-1 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-sm"
                                    >
                                      +{minutes} min
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🎥</div>
                      <div className="font-bold mb-2">No Raffles Available</div>
                      <div className="text-sm text-white/60 mb-4">
                        Create raffles first to start live draws
                      </div>
                      <button 
                        onClick={() => navigate('/admin/raffles')}
                        className="py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                      >
                        Create Raffle
                      </button>
                    </div>
                  )}
                  
                  {raffles && raffles.filter(r => r.status === 'active' || r.status === 'drawing').length === 0 && raffles.length > 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🎥</div>
                      <div className="font-bold mb-2">No Active Draws</div>
                      <div className="text-sm text-white/60 mb-4">
                        Activate a raffle to start a live draw
                      </div>
                      <button 
                        onClick={() => navigate('/admin/raffles')}
                        className="py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                      >
                        Manage Raffles
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Recent Completed Draws */}
                {raffles && raffles.filter(r => r.status === 'completed').length > 0 && (
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                    <h4 className="font-bold mb-3">🏆 Recently Completed Draws</h4>
                    <div className="space-y-3">
                      {raffles
                        .filter(r => r.status === 'completed')
                        .slice(0, 5)
                        .map(raffle => {
                          const raffleWinners = winners.filter(w => w.raffleId === raffle.id);
                          const lastWinner = raffleWinners[raffleWinners.length - 1];
                          
                          return (
                            <div key={raffle.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                              <div className="flex justify-between items-center mb-3">
                                <div className="font-bold text-lg">{raffle.title}</div>
                                <div className="text-xs text-white/60">
                                  {formatTimeAgo(raffle.completedAt)}
                                </div>
                              </div>
                              {lastWinner ? (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                                      <Trophy size={18} className="text-yellow-400" />
                                    </div>
                                    <div>
                                      <div className="font-medium">Ticket #{lastWinner.ticketNumber}</div>
                                      <div className="text-xs text-white/60">
                                        {lastWinner.userName || lastWinner.userEmail?.split('@')[0] || 'Winner'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-yellow-400">
                                      {formatCurrency(lastWinner.prize?.value || 0)}
                                    </div>
                                    <button 
                                      onClick={() => navigate(`/admin/winners`)}
                                      className="text-xs px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-all mt-1"
                                    >
                                      View All
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-2 text-white/60">No winners recorded</div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* System Panel */}
            {activeTab === 'system' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl">System Control Panel</h3>
                  <div className="text-sm text-green-400">All Systems Operational</div>
                </div>
                
                {/* System Health */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Server size={18} /> System Health
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Firestore Database</span>
                        <span className="text-green-400">✓ Online</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Authentication</span>
                        <span className="text-green-400">✓ Online</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Real-time Updates</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Storage</span>
                        <span className="text-green-400">✓ Normal</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Users size={18} /> Online Users
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {onlineUsers.map(onlineUser => (
                        <div key={onlineUser.id} className="flex items-center justify-between p-2 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm truncate max-w-[150px]">
                              {users.find(u => u.id === onlineUser.userId)?.email || 'Unknown'}
                            </span>
                          </div>
                          <div className="text-xs text-white/60">
                            {formatTimeAgo(onlineUser.lastSeen)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Chat Moderation */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <MessageSquare size={18} /> Chat Moderation
                  </h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {chatMessages.map(message => (
                      <div key={message.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <User size={14} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              {users.find(u => u.id === message.userId)?.displayName || 'User'}
                            </span>
                            <span className="text-xs text-white/60">
                              {formatTimeAgo(message.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm mt-1">{message.text}</div>
                          <div className="flex gap-2 mt-2">
                            <button className="text-xs px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition-all">
                              Delete
                            </button>
                            <button className="text-xs px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition-all">
                              Warn User
                            </button>
                            <button className="text-xs px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition-all">
                              Pin
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* System Controls */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                  <h4 className="font-bold mb-3">System Controls</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all">
                      Send Announcement
                    </button>
                    <button className="py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all">
                      Backup Database
                    </button>
                    <button className="py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/30 transition-all">
                      Clear Cache
                    </button>
                    <button className="py-3 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all">
                      Emergency Stop
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Side Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDrawer(false)}
          ></div>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-2xl border-r border-white/20 shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Shield size={24} />
                  </div>
                  <div>
                    <div className="font-bold">{adminData?.displayName || 'Admin'}</div>
                    <div className="text-sm text-white/60 truncate">{user?.email}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-sm text-white/60">Admin Level</div>
                  <div className="font-bold text-purple-400 flex items-center gap-2">
                    <Crown size={16} /> Super Admin
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-sm text-white/60">Last Login</div>
                  <div className="font-bold">
                    {formatTimeAgo(adminData?.lastActivity)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                {[
                  { label: 'Dashboard', icon: BarChart, action: () => { navigate('/admin/overview'); setShowDrawer(false); } },
                  { label: 'User Management', icon: Users, action: () => { navigate('/admin/users'); setShowDrawer(false); } },
                  { label: 'Ticket Management', icon: Ticket, action: () => { navigate('/admin/tickets'); setShowDrawer(false); } },
                  { label: 'Raffle Management', icon: Gift, action: () => { navigate('/admin/raffles'); setShowDrawer(false); } },
                  { label: 'Live Draw Control', icon: Radio, action: () => { navigate('/admin/live-draw'); setShowDrawer(false); } },
                  { label: 'Winner Management', icon: Award, action: () => { navigate('/admin/winners'); setShowDrawer(false); } },
                  { label: 'System Controls', icon: Settings, action: () => { navigate('/admin/system'); setShowDrawer(false); } },
                  { label: 'Logout', icon: LogOut, action: () => signOut(auth).then(() => navigate('/admin-login')), color: 'text-red-400' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all text-left"
                    >
                      <Icon size={20} className={item.color || 'text-white/70'} />
                      <span className={item.color || ''}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedUser && (
        <UserModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          adjustBalance={adjustBalance}
          db={db}
          serverTimestamp={serverTimestamp}
        />
      )}
      
      {selectedRaffle && (
        <RaffleModal 
          raffle={selectedRaffle} 
          onClose={() => setSelectedRaffle(null)} 
          updateRaffleStatus={updateRaffleStatus}
          db={db}
          serverTimestamp={serverTimestamp}
        />
      )}
      
      
    </div>
  );
};

// ==================== MODAL COMPONENTS ====================

// User Modal Component
const UserModal = ({ user, onClose, adjustBalance, db, serverTimestamp }) => {
  const [balanceAdjustment, setBalanceAdjustment] = useState('');
  
  const handleAdjustBalance = async () => {
    await adjustBalance(user.id, balanceAdjustment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-2xl rounded-3xl max-w-md w-full border border-white/20 shadow-2xl">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-xl">User Management</h3>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-all"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <div className="font-bold text-lg">{user.displayName || 'No Name'}</div>
                <div className="text-sm text-white/60">{user.email}</div>
                <div className="text-xs text-white/60">ID: {user.id.substring(0, 12)}...</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-sm text-white/60">Balance</div>
                <div className="text-lg font-bold text-green-400">
                  {formatCurrency(user.balance || 0)}
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-sm text-white/60">Account Type</div>
                <div className="text-lg font-bold text-purple-400">
                  {user.accountType || 'user'}
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-white/60 mb-2">Adjust Balance</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={balanceAdjustment}
                  onChange={(e) => setBalanceAdjustment(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl"
                />
                <button 
                  onClick={handleAdjustBalance}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Apply
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                View Tickets
              </button>
              <button className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Raffle Modal Component
const RaffleModal = ({ raffle, onClose, updateRaffleStatus, db, serverTimestamp }) => {
  const [status, setStatus] = useState(raffle.status || 'active');
  
  // Get numeric value from raffle
  const getNumericValue = (value) => {
    if (value === undefined || value === null) return '';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') {
      // Extract numeric value from string
      const numericString = value.replace(/[^\d.-]/g, '');
      return numericString || '';
    }
    return '';
  };
  
  const [raffleValue, setRaffleValue] = useState(getNumericValue(raffle.value));
  
  const handleUpdateStatus = async () => {
    await updateRaffleStatus(raffle.id, status);
    
    // Update value field if changed
    if (raffleValue !== getNumericValue(raffle.value)) {
      const numericValue = parseFloat(raffleValue) || 0;
      await updateDoc(doc(db, 'raffles', raffle.id), {
        value: numericValue,
        lastUpdated: serverTimestamp()
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-2xl rounded-3xl max-w-md w-full border border-white/20 shadow-2xl">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-xl">Raffle Management</h3>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-all"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="font-bold text-lg">{raffle.title}</div>
              <div className="text-sm text-white/60">{raffle.description || 'No description'}</div>
            </div>
            
            <div>
              <div className="text-sm text-white/60 mb-2">Prize Value (NGN)</div>
              <input
                type="number"
                value={raffleValue}
                onChange={(e) => setRaffleValue(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl"
                placeholder="Enter prize value in NGN"
              />
              <div className="text-xs text-white/40 mt-1">
                Current: {formatCurrency(raffle.value || 0)}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-white/60 mb-2">Status</div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl"
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <button 
              onClick={handleUpdateStatus}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Update Raffle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteAdminDashboard;