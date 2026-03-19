import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Zap, Trophy, Home as HomeIcon, User, 
  MessageSquare, Clock, Info, Menu, X, 
  Heart, Send, Bell, Shield,
  CheckCircle, AlertCircle, TrendingUp,
  Ticket, LogOut, Crown, Star,
  Phone, Smartphone, Globe, UserCircle
} from 'lucide-react';
import { LogIn } from 'lucide-react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  doc,
  setDoc,
  deleteDoc,
  limit,
  getDoc,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjCQdTT9EVxDUz8VAvVcGMJwuiheb_LP4",
  authDomain: "nextwinners-ng.firebaseapp.com",
  projectId: "nextwinners-ng",
  storageBucket: "nextwinners-ng.firebasestorage.app",
  messagingSenderId: "339655620",
  appId: "1:339655620:web:38cc0a3ead574b1e2e0291"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ForumPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [activeRoom, setActiveRoom] = useState('general');
  const [currentUser, setCurrentUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showRoomsMenu, setShowRoomsMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userTyping, setUserTyping] = useState(false);
  const [error, setError] = useState(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [roomStats, setRoomStats] = useState({});
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingUserInDB, setIsCheckingUserInDB] = useState(false);
  
  // New state for phone binding
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [isBindingPhone, setIsBindingPhone] = useState(false);
  const [phoneBindingStep, setPhoneBindingStep] = useState('choose'); // 'choose', 'phone', 'verify'
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  // Chat rooms configuration
  const chatRooms = [
    { 
      id: 'general', 
      name: '💬 General Chat', 
      description: 'General discussions about NextWinners',
      icon: Users,
      color: 'from-blue-500/80 to-cyan-500/80',
      cta: 'Join general discussions'
    },
    { 
      id: 'winners', 
      name: '🏆 Winners Circle', 
      description: 'Share your winning stories & celebrate',
      icon: Trophy,
      color: 'from-yellow-500/80 to-orange-500/80',
      cta: 'Share your winning story'
    },
    { 
      id: 'live-draw', 
      name: '🎯 Live Draw Chat', 
      description: 'Live discussions during Sunday 6PM draws',
      icon: Clock,
      color: 'from-red-500/80 to-orange-500/80',
      cta: 'Join live draw discussion'
    },
    { 
      id: 'strategies', 
      name: '💡 Tips & Strategies', 
      description: 'Share winning strategies and tips',
      icon: Zap,
      color: 'from-green-500/80 to-emerald-500/80',
      cta: 'Share your strategy'
    },
    { 
      id: 'announcements', 
      name: '📢 Official Announcements', 
      description: 'Official updates from NextWinners team',
      icon: Bell,
      color: 'from-purple-500/80 to-pink-500/80',
      cta: 'Read latest updates',
      adminOnly: true
    },
    { 
      id: 'support', 
      name: '🛟 Help & Support', 
      description: 'Get help with tickets, prizes & accounts',
      icon: Shield,
      color: 'from-gray-500/80 to-slate-500/80',
      cta: 'Get help here'
    }
  ];

  // Bottom Navigation
  const bottomNavItems = [
    { id: 'home', label: 'Home', icon: HomeIcon, route: '/' },
    { id: 'raffles', label: 'Raffles', icon: Ticket, route: '/raffles' },
    { id: 'winners', label: 'Winners', icon: Trophy, route: '/winners' },
    { id: 'draw', label: 'Live', icon: Clock, route: '/live-draw' },
    { id: 'forum', label: 'Forum', icon: MessageSquare, route: '/forum' },
    { id: 'profile', label: isLoggedIn ? 'Me' : 'Login', icon: User, route: isLoggedIn ? '/dashboard' : '/login' }
  ];

  // Check for saved device ID
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('forum_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('forum_device_id', deviceId);
    }
    return deviceId;
  };

  // Generate a simple verification code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Check if registered user exists in users collection
  const checkUserInDatabase = async (user) => {
    if (!user || !user.uid) return null;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: userData.uid,
          displayName: userData.displayName,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          photoURL: userData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.displayName || userData.email?.split('@')[0] || 'User')}&background=FFD700&color=000&bold=true`,
          accountType: userData.accountType || 'registered',
          isEmailVerified: userData.isEmailVerified || false,
          phone: userData.phone || '',
          preferences: userData.preferences || {
            emailNotifications: true,
            marketingEmails: false,
            smsNotifications: false
          }
        };
      }
      return null;
    } catch (error) {
      console.error('Error checking user in database:', error);
      return null;
    }
  };

  // Check if username is already taken by active user
  const isUsernameTaken = async (username) => {
    try {
      // Check in guests collection
      const guestsRef = collection(db, 'guests');
      const q = query(guestsRef, where('username', '==', username.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const guestData = querySnapshot.docs[0].data();
        // Check if guest is still active (last active within 30 days)
        if (guestData.lastActive) {
          const lastActive = guestData.lastActive.toDate();
          const now = new Date();
          const daysSinceLastActive = (now - lastActive) / (1000 * 60 * 60 * 24);
          
          if (daysSinceLastActive < 30) {
            return {
              taken: true,
              reason: 'This username is already in use'
            };
          }
        }
      }
      
      return { taken: false };
    } catch (error) {
      console.error('Error checking username:', error);
      return { taken: false };
    }
  };

  // Check for saved guest user on device
  const checkSavedGuestUser = async () => {
    const deviceId = getDeviceId();
    
    try {
      // Check if device has a saved guest user
      const guestsRef = collection(db, 'guests');
      const q = query(guestsRef, where('deviceId', '==', deviceId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const guestDoc = querySnapshot.docs[0];
        const guestData = guestDoc.data();
        
        // Check if guest is still active
        if (guestData.lastActive) {
          const lastActive = guestData.lastActive.toDate();
          const now = new Date();
          const daysSinceLastActive = (now - lastActive) / (1000 * 60 * 60 * 24);
          
          if (daysSinceLastActive < 30) {
            return {
              id: guestDoc.id,
              ...guestData
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking saved guest:', error);
      return null;
    }
  };

  // Enhanced auth state with device-based guest detection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsCheckingUserInDB(true);
      
      if (user) {
        console.log('Firebase Auth user detected:', user.email || 'Anonymous');
        
        // Check if user exists in users collection
        const dbUser = await checkUserInDatabase(user);
        
        if (dbUser) {
          // User exists in database - full registered user
          console.log('Registered user found in database:', dbUser.email);
          
          setCurrentUser(dbUser);
          setAuthUser(user);
          setIsLoggedIn(true);
          
          // Check if user is admin (based on email)
          const adminEmails = ['admin@nextwinners.com', 'nextwinners@gmail.com'];
          setIsAdmin(adminEmails.includes(user.email?.toLowerCase() || ''));
          
          // Update last activity
          await updateUserLastActivity(user.uid);
          
          setConnectionStatus('connected');
          setShowGuestInput(false);
        } else {
          // User authenticated but not in database
          console.log('User authenticated but not in database');
          
          // Check for saved guest user on this device
          const savedGuest = await checkSavedGuestUser();
          
          if (savedGuest) {
            // Auto-login with saved guest
            console.log('Auto-logging with saved guest:', savedGuest.username);
            
            const chatUser = {
              uid: savedGuest.uid,
              displayName: savedGuest.displayName,
              photoURL: savedGuest.photoURL,
              accountType: 'guest',
              username: savedGuest.username,
              phone: savedGuest.phone
            };
            
            setCurrentUser(chatUser);
            setConnectionStatus('connected');
            setShowGuestInput(false);
            
            // Update guest last active
            await updateGuestLastActive(savedGuest.uid);
          } else {
            // Show guest input
            setCurrentUser(null);
            setShowGuestInput(true);
            setPhoneBindingStep('choose');
          }
        }
      } else {
        // No Firebase auth - check for saved guest on device
        console.log('No Firebase auth - checking for saved guest');
        setIsLoggedIn(false);
        setAuthUser(null);
        setIsAdmin(false);
        
        const savedGuest = await checkSavedGuestUser();
        
        if (savedGuest) {
          // Auto-login with saved guest
          console.log('Auto-logging with saved guest:', savedGuest.username);
          
          const chatUser = {
            uid: savedGuest.uid,
            displayName: savedGuest.displayName,
            photoURL: savedGuest.photoURL,
            accountType: 'guest',
            username: savedGuest.username,
            phone: savedGuest.phone
          };
          
          setCurrentUser(chatUser);
          setConnectionStatus('connected');
          setShowGuestInput(false);
          
          // Update guest last active
          await updateGuestLastActive(savedGuest.uid);
        } else {
          // Show guest input after delay
          setTimeout(() => {
            setShowGuestInput(true);
            setPhoneBindingStep('choose');
          }, 1000);
        }
      }
      
      setIsCheckingUserInDB(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Update user's last activity
  const updateUserLastActivity = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  };

  // Update guest last active
  const updateGuestLastActive = async (guestId) => {
    try {
      const guestRef = doc(db, 'guests', guestId);
      await updateDoc(guestRef, {
        lastActive: serverTimestamp(),
        isOnline: true
      });
    } catch (error) {
      console.error('Error updating guest last active:', error);
    }
  };

  // Bind phone to guest account
  const bindPhoneToGuest = async (guestId, phoneNumber) => {
    try {
      const guestRef = doc(db, 'guests', guestId);
      await updateDoc(guestRef, {
        phone: phoneNumber,
        phoneVerified: true,
        lastUpdated: serverTimestamp()
      });
      
      // Also update in device storage
      const savedUser = localStorage.getItem('forum_guest_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        parsedUser.phone = phoneNumber;
        localStorage.setItem('forum_guest_user', JSON.stringify(parsedUser));
      }
      
      return true;
    } catch (error) {
      console.error('Error binding phone:', error);
      return false;
    }
  };

  // Send verification code (simulated - in production use SMS service)
  const sendVerificationCode = async (phoneNumber) => {
    const code = generateVerificationCode();
    setGeneratedCode(code);
    
    // Simulate sending code
    console.log(`Verification code for ${phoneNumber}: ${code}`);
    
    // In production, you would integrate with an SMS service here
    // Example: await smsService.send(phoneNumber, `Your verification code: ${code}`);
    
    // For demo, we'll just store it and move to verification step
    return true;
  };

  // Create guest user with unique username check and phone binding
  const createGuestUser = async (e) => {
    e?.preventDefault();
    
    if (phoneBindingStep === 'choose') {
      if (!guestName.trim()) {
        setUsernameError('Please enter a username');
        return;
      }
      
      if (guestName.length > 12) {
        setUsernameError('Username must be 12 characters or less');
        return;
      }
      
      const username = guestName.trim().toLowerCase();
      
      // Check for inappropriate usernames
      const inappropriateWords = ['admin', 'mod', 'owner', 'nextwinner', 'staff', 'support', 'official'];
      if (inappropriateWords.includes(username)) {
        setUsernameError('This username is not allowed');
        return;
      }
      
      // Check if username contains special characters
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setUsernameError('Only letters, numbers, and underscores allowed');
        return;
      }
      
      setIsCheckingUsername(true);
      setUsernameError('');
      
      try {
        // Check if username is taken
        const usernameCheck = await isUsernameTaken(username);
        
        if (usernameCheck.taken) {
          setUsernameError(usernameCheck.reason);
          setIsCheckingUsername(false);
          return;
        }
        
        // Username is available, move to phone binding step
        setPhoneBindingStep('phone');
        setIsCheckingUsername(false);
        
      } catch (error) {
        console.error('Error checking username:', error);
        setError('Failed to check username availability');
        setIsCheckingUsername(false);
      }
      return;
    }
    
    if (phoneBindingStep === 'phone') {
      if (!phoneNumber.trim()) {
        setError('Please enter your phone number');
        return;
      }
      
      // Simple phone validation
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
        setError('Please enter a valid phone number');
        return;
      }
      
      setIsBindingPhone(true);
      
      try {
        // Check if phone is already bound to another account
        const guestsRef = collection(db, 'guests');
        const q = query(guestsRef, where('phone', '==', phoneNumber));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Phone already in use - we can either link or show error
          setError('This phone number is already linked to another account');
          setIsBindingPhone(false);
          return;
        }
        
        // Send verification code
        await sendVerificationCode(phoneNumber);
        setPhoneBindingStep('verify');
        
      } catch (error) {
        console.error('Error checking phone:', error);
        setError('Failed to verify phone number');
      } finally {
        setIsBindingPhone(false);
      }
      return;
    }
    
    if (phoneBindingStep === 'verify') {
      if (!verificationCode.trim()) {
        setError('Please enter verification code');
        return;
      }
      
      if (verificationCode !== generatedCode) {
        setError('Invalid verification code');
        return;
      }
      
      await finalizeGuestCreation();
      return;
    }
  };

  // Finalize guest creation
  const finalizeGuestCreation = async () => {
    const username = guestName.trim().toLowerCase();
    const deviceId = getDeviceId();
    
    try {
      // Create unique guest ID
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Guest data for Firestore
      const guestData = {
        uid: guestId,
        username: username,
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=FFD700&color=000&bold=true&length=1`,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        isOnline: true,
        chatCount: 0,
        accountType: 'guest',
        deviceId: deviceId,
        phone: phoneNumber,
        phoneVerified: true,
        preferences: {
          notifications: true,
          soundEnabled: true,
          darkMode: true,
          autoLogin: true
        },
        stats: {
          totalMessages: 0,
          roomsJoined: 1,
          firstSeen: serverTimestamp(),
          lastRoom: 'general',
          devices: [deviceId]
        }
      };
      
      // Save to Firestore guests collection
      const guestRef = doc(db, 'guests', guestId);
      await setDoc(guestRef, guestData);
      
      console.log('Guest user saved to Firestore:', guestId);
      
      // Set current user for chat
      const chatUser = {
        uid: guestId,
        displayName: guestData.displayName,
        photoURL: guestData.photoURL,
        accountType: 'guest',
        username: username,
        phone: phoneNumber
      };
      
      // Save to localStorage for persistence
      localStorage.setItem('forum_guest_user', JSON.stringify(chatUser));
      
      // Set current user
      setCurrentUser(chatUser);
      setShowGuestInput(false);
      setGuestName('');
      setPhoneNumber('');
      setVerificationCode('');
      setPhoneBindingStep('choose');
      setConnectionStatus('connected');
      
      setError(null);
      
    } catch (error) {
      console.error('Error creating guest user in Firestore:', error);
      setError('Failed to create guest account. Please try again.');
      
      // Fallback to localStorage only if Firestore fails
      const fallbackUser = {
        uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        displayName: guestName.trim().charAt(0).toUpperCase() + guestName.trim().slice(1),
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(guestName.trim())}&background=FFD700&color=000&bold=true&length=1`,
        accountType: 'guest',
        username: guestName.trim().toLowerCase()
      };
      
      localStorage.setItem('forum_guest_user', JSON.stringify(fallbackUser));
      setCurrentUser(fallbackUser);
      setShowGuestInput(false);
      setGuestName('');
      setPhoneBindingStep('choose');
    }
  };

  // Skip phone binding
  const skipPhoneBinding = async () => {
    const username = guestName.trim().toLowerCase();
    const deviceId = getDeviceId();
    
    try {
      // Create unique guest ID
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Guest data for Firestore
      const guestData = {
        uid: guestId,
        username: username,
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=FFD700&color=000&bold=true&length=1`,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        isOnline: true,
        chatCount: 0,
        accountType: 'guest',
        deviceId: deviceId,
        phone: null,
        phoneVerified: false,
        preferences: {
          notifications: true,
          soundEnabled: true,
          darkMode: true,
          autoLogin: true
        },
        stats: {
          totalMessages: 0,
          roomsJoined: 1,
          firstSeen: serverTimestamp(),
          lastRoom: 'general',
          devices: [deviceId]
        }
      };
      
      // Save to Firestore guests collection
      const guestRef = doc(db, 'guests', guestId);
      await setDoc(guestRef, guestData);
      
      // Set current user for chat
      const chatUser = {
        uid: guestId,
        displayName: guestData.displayName,
        photoURL: guestData.photoURL,
        accountType: 'guest',
        username: username
      };
      
      // Save to localStorage for persistence
      localStorage.setItem('forum_guest_user', JSON.stringify(chatUser));
      
      // Set current user
      setCurrentUser(chatUser);
      setShowGuestInput(false);
      setGuestName('');
      setPhoneBindingStep('choose');
      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('Error creating guest without phone:', error);
      setError('Failed to create guest account. Please try again.');
    }
  };

  // Setup online presence in Firestore
  useEffect(() => {
    if (!currentUser || !activeRoom) return;

    const setupPresence = async () => {
      try {
        const onlineRef = doc(db, 'chatrooms', activeRoom, 'onlineUsers', currentUser.uid);
        
        await setDoc(onlineRef, {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          lastSeen: serverTimestamp(),
          isTyping: false,
          room: activeRoom,
          accountType: currentUser.accountType || 'guest',
          isRegistered: currentUser.accountType === 'registered',
          isGuest: currentUser.accountType === 'guest',
          username: currentUser.username || '',
          hasPhone: !!currentUser.phone
        });

        // Cleanup on page unload
        const handleBeforeUnload = async () => {
          try {
            await deleteDoc(onlineRef);
            
            // Update guest last active
            if (currentUser.accountType === 'guest') {
              await updateGuestLastActive(currentUser.uid);
            }
          } catch (error) {
            console.error('Cleanup error:', error);
          }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
          deleteDoc(onlineRef).catch(console.error);
          
          // Update guest last active
          if (currentUser.accountType === 'guest') {
            updateGuestLastActive(currentUser.uid).catch(console.error);
          }
        };
      } catch (error) {
        console.error('Presence setup error:', error);
      }
    };

    setupPresence();
  }, [currentUser, activeRoom]);

  // Load messages from Firestore
  useEffect(() => {
    if (!activeRoom) return;

    setIsLoading(true);
    setError(null);

    try {
      const messagesRef = collection(db, 'chatrooms', activeRoom, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const newMessages = [];
          snapshot.forEach((doc) => {
            newMessages.push({ id: doc.id, ...doc.data() });
          });
          setMessages(newMessages.reverse());
          
          setRoomStats(prev => ({
            ...prev,
            [activeRoom]: {
              ...prev[activeRoom],
              messages: newMessages.length
            }
          }));
          
          setIsLoading(false);
          setConnectionStatus('connected');
          
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }, 
        (error) => {
          console.error('Error loading messages:', error);
          setMessages([]);
          setIsLoading(false);
          setConnectionStatus('connected');
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Setup error:', error);
      setError('Failed to setup message listener.');
      setIsLoading(false);
      setConnectionStatus('error');
    }
  }, [activeRoom]);

  // Track online users from Firestore
  useEffect(() => {
    if (!activeRoom) return;

    try {
      const onlineRef = collection(db, 'chatrooms', activeRoom, 'onlineUsers');
      const unsubscribe = onSnapshot(onlineRef, (snapshot) => {
        const users = [];
        snapshot.forEach((doc) => {
          const user = doc.data();
          if (user.lastSeen) {
            const lastSeen = user.lastSeen.toDate();
            const now = new Date();
            const secondsSinceLastSeen = (now - lastSeen) / 1000;
            if (secondsSinceLastSeen < 30) {
              users.push(user);
            }
          }
        });
        setOnlineUsers(users);
        
        const typing = users.filter(u => u.isTyping).map(u => u.displayName);
        setTypingUsers(typing);
      }, (error) => {
        console.error('Online users error:', error);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Online setup error:', error);
    }
  }, [activeRoom]);

  // Send message to Firestore
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setShowGuestInput(true);
      return;
    }
    
    // Check if user can send in this room
    const room = chatRooms.find(r => r.id === activeRoom);
    if (room?.adminOnly && !isAdmin) {
      setError('Only admins can post in Official Announcements');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (!message.trim() || !activeRoom) {
      return;
    }

    const messageText = message.trim();
    setMessage('');
    setUserTyping(false);

    try {
      const messagesRef = collection(db, 'chatrooms', activeRoom, 'messages');
      
      // Create message data with safe defaults
      const messageData = {
        text: messageText,
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'User',
        photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=FFD700&color=000&bold=true`,
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
        room: activeRoom,
        userType: currentUser.accountType || 'guest',
        isAdmin: isAdmin,
        isRegistered: currentUser.accountType === 'registered',
        isGuest: currentUser.accountType === 'guest',
        username: currentUser.username || '',
        hasPhone: !!currentUser.phone
      };
      
      // Only add firstName and lastName if they exist
      if (currentUser.firstName) {
        messageData.firstName = currentUser.firstName;
      }
      
      if (currentUser.lastName) {
        messageData.lastName = currentUser.lastName;
      }
      
      // Only add email if it exists
      if (currentUser.email) {
        messageData.email = currentUser.email;
      }
      
      await addDoc(messagesRef, messageData);

      // Update user activity
      if (currentUser.accountType === 'registered') {
        await updateUserLastActivity(currentUser.uid);
      } else if (currentUser.accountType === 'guest') {
        try {
          const guestRef = doc(db, 'guests', currentUser.uid);
          await updateDoc(guestRef, {
            'stats.totalMessages': await getGuestMessageCount(currentUser.uid),
            lastActive: serverTimestamp()
          });
        } catch (error) {
          console.error('Error updating guest stats:', error);
        }
      }

      // Update typing status
      try {
        const typingRef = doc(db, 'chatrooms', activeRoom, 'onlineUsers', currentUser.uid);
        await updateDoc(typingRef, {
          isTyping: false,
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating typing status:', error);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      setMessage(messageText);
    }
  };

  // Get guest message count
  const getGuestMessageCount = async (uid) => {
    try {
      let count = 0;
      for (const room of chatRooms) {
        const messagesRef = collection(db, 'chatrooms', room.id, 'messages');
        const q = query(messagesRef, where('uid', '==', uid));
        const querySnapshot = await getDocs(q);
        count += querySnapshot.size;
      }
      return count;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  };

  // Like message
  const likeMessage = async (messageId, currentLikes, likedBy) => {
    if (!currentUser) {
      setShowGuestInput(true);
      return;
    }
    
    const hasLiked = likedBy?.includes(currentUser.uid);
    const newLikes = hasLiked ? currentLikes - 1 : currentLikes + 1;
    const newLikedBy = hasLiked 
      ? likedBy?.filter(uid => uid !== currentUser.uid) || []
      : [...(likedBy || []), currentUser.uid];
    
    try {
      const messageRef = doc(db, 'chatrooms', activeRoom, 'messages', messageId);
      await updateDoc(messageRef, {
        likes: newLikes,
        likedBy: newLikedBy
      });
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };

  // Handle typing input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    if (!userTyping && value.trim()) {
      setUserTyping(true);
      updateTypingStatus(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setUserTyping(false);
      updateTypingStatus(false);
    }, 1000);
  };

  // Update typing status in Firestore
  const updateTypingStatus = async (isTyping) => {
    if (!currentUser || !activeRoom) return;

    try {
      const typingRef = doc(db, 'chatrooms', activeRoom, 'onlineUsers', currentUser.uid);
      await updateDoc(typingRef, {
        isTyping: isTyping,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return '';
    }
  };

  // Get room CTA
  const getRoomCTA = () => {
    const room = chatRooms.find(r => r.id === activeRoom);
    if (room?.adminOnly && !isAdmin) {
      return 'Only admins can post here';
    }
    return room?.cta || 'Join the conversation';
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      if (authUser) {
        await signOut(auth);
      }
      
      // Clear guest data
      localStorage.removeItem('forum_guest_user');
      
      // Update guest status if guest user
      if (currentUser?.accountType === 'guest') {
        try {
          const guestRef = doc(db, 'guests', currentUser.uid);
          await updateDoc(guestRef, {
            isOnline: false,
            lastActive: serverTimestamp()
          });
        } catch (error) {
          console.error('Error updating guest offline status:', error);
        }
      }
      
      setCurrentUser(null);
      setAuthUser(null);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setShowGuestInput(true);
      setPhoneBindingStep('choose');
      
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Guest User Icon Component
  const GuestIcon = ({ size = 16, className = '' }) => (
    <UserCircle size={size} className={`text-blue-400 ${className}`} />
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pb-20">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled ? 'bg-white/12 backdrop-blur-2xl shadow-xl' : 'bg-white/8 backdrop-blur-xl'
      }`}>
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-yellow-500/90 to-orange-500/90 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/30 border border-white/20">
                <MessageSquare size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-black bg-gradient-to-r from-yellow-400/90 to-orange-400/90 bg-clip-text text-transparent">
                NEXTWINNER
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/about')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/12 backdrop-blur-xl rounded-xl text-sm font-medium hover:bg-white/20 transition-all border border-white/10 shadow-lg"
              >
                <Info size={14} />
                <span>About Us</span>
              </button>
              
              {currentUser && (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-yellow-400">
                        {currentUser.displayName}
                      </span>
                      {currentUser.accountType === 'guest' ? (
                        <GuestIcon size={12} />
                      ) : (
                        <CheckCircle size={12} className="text-green-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-white/60">
                      {currentUser.accountType === 'registered' 
                        ? 'Registered User'
                        : currentUser.phone
                          ? `Guest • ${currentUser.phone}`
                          : 'Guest User'
                      }
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/10"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}
              
              <button 
                onClick={() => setShowRoomsMenu(!showRoomsMenu)}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/10"
              >
                {showRoomsMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Guest Input Modal */}
        {showGuestInput && !currentUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4 pt-60">
            <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-2xl rounded-3xl max-w-sm w-full border border-yellow-500/30 shadow-2xl">
              <div className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                  {phoneBindingStep === 'verify' ? (
                    <Smartphone size={32} className="text-yellow-400" />
                  ) : (
                    <User size={32} className="text-yellow-400" />
                  )}
                </div>
                
                {isCheckingUserInDB ? (
                  <div className="py-8">
                    <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-white/80">Checking your account...</p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-black text-xl mb-2 text-white">
                      {phoneBindingStep === 'choose' && 'Choose Guest Name'}
                      {phoneBindingStep === 'phone' && 'Add Phone Number'}
                      {phoneBindingStep === 'verify' && 'Verify Phone Number'}
                    </h3>
                    
                    <form onSubmit={createGuestUser} className="space-y-4">
                      {/* Step 1: Choose Username */}
                      {phoneBindingStep === 'choose' && (
                        <>
                          <p className="text-sm text-white/80 mb-4">
                            Choose a unique username to chat. Usernames are reserved for 30 days.
                          </p>
                          
                          <div className="relative">
                            <input
                              type="text"
                              value={guestName}
                              onChange={(e) => {
                                setGuestName(e.target.value.slice(0, 12));
                                setUsernameError('');
                              }}
                              placeholder="Enter username (12 chars max)"
                              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 text-sm text-white placeholder-white/50 text-center font-mono text-lg"
                              maxLength={12}
                              autoFocus
                              disabled={isCheckingUsername}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-white/40">
                              {guestName.length}/12
                            </div>
                          </div>
                          
                          {usernameError && (
                            <div className="text-red-400 text-sm bg-red-400/10 p-2 rounded-lg">
                              {usernameError}
                            </div>
                          )}
                          
                          <div className="text-left text-xs text-white/60 space-y-1">
                            <p>✓ Unique username (cannot be taken)</p>
                            <p>✓ Auto-login on this device</p>
                            <p>✓ Phone binding for account recovery</p>
                          </div>
                        </>
                      )}
                      
                      {/* Step 2: Phone Number */}
                      {phoneBindingStep === 'phone' && (
                        <>
                          <p className="text-sm text-white/80 mb-4">
                            Bind your phone number to secure your username and enable auto-login on other devices.
                          </p>
                          
                          <div className="relative">
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => {
                                setPhoneNumber(e.target.value.replace(/\D/g, ''));
                                setError('');
                              }}
                              placeholder="Enter phone number (e.g., 08012345678)"
                              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 text-sm text-white placeholder-white/50 text-center"
                              autoFocus
                              disabled={isBindingPhone}
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              <Phone size={16} className="text-white/50" />
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={skipPhoneBinding}
                            className="w-full py-2 text-sm text-white/70 hover:text-white/90 transition-colors"
                          >
                            Skip phone binding →
                          </button>
                        </>
                      )}
                      
                      {/* Step 3: Verification */}
                      {phoneBindingStep === 'verify' && (
                        <>
                          <p className="text-sm text-white/80 mb-4">
                            Enter the 6-digit code sent to {phoneNumber}
                          </p>
                          
                          <div className="relative">
                            <input
                              type="text"
                              value={verificationCode}
                              onChange={(e) => {
                                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                setError('');
                              }}
                              placeholder="Enter 6-digit code"
                              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 text-sm text-white placeholder-white/50 text-center font-mono text-2xl tracking-widest"
                              maxLength={6}
                              autoFocus
                            />
                          </div>
                          
                          <div className="text-sm text-white/60">
                            Demo code: <span className="font-bold text-yellow-400">{generatedCode}</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setPhoneBindingStep('phone');
                              setVerificationCode('');
                            }}
                            className="w-full py-2 text-sm text-white/70 hover:text-white/90 transition-colors"
                          >
                            ← Change phone number
                          </button>
                        </>
                      )}
                      
                      {error && (
                        <div className="text-red-400 text-sm bg-red-400/10 p-2 rounded-lg">
                          {error}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        {phoneBindingStep === 'choose' && (
                          <>
                            <button 
                              type="button"
                              onClick={() => {
                                const randomName = `Guest${Math.floor(1000 + Math.random() * 9000)}`;
                                setGuestName(randomName);
                              }}
                              className="py-3 bg-white/10 backdrop-blur-xl border border-white/25 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm"
                              disabled={isCheckingUsername}
                            >
                              Random Name
                            </button>
                            <button 
                              type="submit"
                              disabled={!guestName.trim() || isCheckingUsername}
                              className={`py-3 font-bold rounded-xl transition-all text-sm ${
                                guestName.trim() && !isCheckingUsername
                                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:shadow-xl hover:shadow-yellow-500/40'
                                  : 'bg-white/10 text-white/50 cursor-not-allowed'
                              }`}
                            >
                              {isCheckingUsername ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-yellow-500 rounded-full animate-spin"></div>
                                  Checking...
                                </div>
                              ) : 'Continue →'}
                            </button>
                          </>
                        )}
                        
                        {phoneBindingStep === 'phone' && (
                          <>
                            <button 
                              type="button"
                              onClick={() => {
                                setPhoneBindingStep('choose');
                                setPhoneNumber('');
                              }}
                              className="py-3 bg-white/10 backdrop-blur-xl border border-white/25 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm"
                            >
                              ← Back
                            </button>
                            <button 
                              type="submit"
                              disabled={!phoneNumber.trim() || isBindingPhone}
                              className={`py-3 font-bold rounded-xl transition-all text-sm ${
                                phoneNumber.trim() && !isBindingPhone
                                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:shadow-xl hover:shadow-yellow-500/40'
                                  : 'bg-white/10 text-white/50 cursor-not-allowed'
                              }`}
                            >
                              {isBindingPhone ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-yellow-500 rounded-full animate-spin"></div>
                                  Verifying...
                                </div>
                              ) : 'Send Code →'}
                            </button>
                          </>
                        )}
                        
                        {phoneBindingStep === 'verify' && (
                          <>
                            <button 
                              type="button"
                              onClick={skipPhoneBinding}
                              className="py-3 bg-white/10 backdrop-blur-xl border border-white/25 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm"
                            >
                              Skip Phone
                            </button>
                            <button 
                              type="submit"
                              disabled={!verificationCode.trim()}
                              className={`py-3 font-bold rounded-xl transition-all text-sm ${
                                verificationCode.trim()
                                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:shadow-xl hover:shadow-yellow-500/40'
                                  : 'bg-white/10 text-white/50 cursor-not-allowed'
                              }`}
                            >
                              Verify & Start
                            </button>
                          </>
                        )}
                                           </div>
                      
                      {/* Registration Encouragement */}
                      {(phoneBindingStep === 'choose' || phoneBindingStep === 'phone') && (
                        <div className="pt-3 border-t border-white/10">
                          <p className="text-xs text-white/80 mb-2">
                            <span className="text-yellow-400 font-bold">✨ Want to win real prizes?</span>
                          </p>
                          <button 
                            type="button"
                            onClick={() => {
                              navigate('/register');
                              setShowGuestInput(false);
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                          >
                            <Trophy size={14} />
                            Register to Play Raffles & Win!
                          </button>
                          <p className="text-xs text-white/60 mt-2 text-center">
                            Free registration • Instant ₦500 bonus • Win millions!
                          </p>
                        </div>
                      )}
                      
                      {phoneBindingStep === 'verify' && (
                        <div className="pt-3 border-t border-white/10">
                          <p className="text-sm text-yellow-400 mb-2 text-center">
                            Almost there! Verify to secure your account
                          </p>
                          <button 
                            type="button"
                            onClick={() => navigate('/register')}
                            className="w-full py-2 text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                          >
                            Register for full account & win prizes →
                          </button>
                        </div>
                      )}
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Hamburger Menu */}
        {showRoomsMenu && (
          <div className="absolute top-full left-0 right-0 bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-2xl border-t border-white/20 shadow-2xl z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">NextWinners</h3>
                <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                  Community Portal
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { 
                    label: 'How It Works', 
                    description: 'Learn to play & win',
                    icon: Info,
                    color: 'from-blue-500/20 to-cyan-500/20',
                    borderColor: 'border-blue-500/30',
                    route: '/how-it-works'
                  },
                  { 
                    label: 'About Us', 
                    description: 'Our story & mission',
                    icon: Users,
                    color: 'from-purple-500/20 to-pink-500/20',
                    borderColor: 'border-purple-500/30',
                    route: '/about'
                  },
                  { 
                    label: 'Contact', 
                    description: 'Get in touch with us',
                    icon: MessageSquare,
                    color: 'from-green-500/20 to-emerald-500/20',
                    borderColor: 'border-green-500/30',
                    route: '/contact'
                  },
                  { 
                    label: 'Legal', 
                    description: 'Terms & Privacy',
                    icon: Shield,
                    color: 'from-gray-500/20 to-slate-500/20',
                    borderColor: 'border-gray-500/30',
                    route: '/legal'
                  },
                  ...(!isLoggedIn ? [
                    { 
                      label: 'Register', 
                      description: 'Create free account',
                      icon: User,
                      color: 'from-yellow-500/20 to-orange-500/20',
                      borderColor: 'border-yellow-500/30',
                      route: '/register'
                    },
                    { 
                      label: 'Login', 
                      description: 'Access your account',
                      icon: LogIn,
                      color: 'from-red-500/20 to-orange-500/20',
                      borderColor: 'border-red-500/30',
                      route: '/login'
                    }
                  ] : [])
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.route}
                      onClick={() => {
                        navigate(item.route);
                        setShowRoomsMenu(false);
                      }}
                      className={`bg-gradient-to-br ${item.color} backdrop-blur-xl rounded-2xl p-4 text-left border ${item.borderColor} hover:scale-[1.02] hover:border-white/40 transition-all duration-200 group`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color.replace('/20', '/40')} flex items-center justify-center border ${item.borderColor}`}>
                          <Icon size={18} className="text-white/90" />
                        </div>
                        <div className="text-xs text-white/50 group-hover:text-yellow-400 transition-colors">
                          →
                        </div>
                      </div>
                      <h4 className="font-bold text-white mb-1 text-sm">{item.label}</h4>
                      <p className="text-xs text-white/70">{item.description}</p>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>{onlineUsers.length} Online Now</span>
                  </div>
                  <span>•</span>
                  <span>{messages.length} Messages Today</span>
                  <span>•</span>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Error Banner */}
      {error && (
        <div className="fixed top-16 left-0 right-0 z-40 p-3 bg-red-500/20 backdrop-blur-sm border-b border-red-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-sm text-white/90">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-sm font-semibold text-yellow-400 hover:text-yellow-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-16">
        {/* Quick Stats */}
        <div className="mx-3 mt-3 grid grid-cols-4 gap-2">
          {[
            { 
              label: 'Online', 
              value: `${onlineUsers.length}`, 
              color: 'text-green-400', 
              icon: Users,
              description: `${onlineUsers.filter(u => u.isRegistered).length} registered`
            },
            { 
              label: 'Rooms', 
              value: chatRooms.length, 
              color: 'text-blue-400', 
              icon: MessageSquare 
            },
            { 
              label: 'Messages', 
              value: roomStats[activeRoom]?.messages || 0, 
              color: 'text-purple-400', 
              icon: TrendingUp 
            },
            { 
              label: 'You', 
              value: currentUser?.accountType === 'registered' ? '✓' : '👤', 
              color: currentUser?.accountType === 'registered' ? 'text-yellow-400' : 'text-blue-400', 
              icon: currentUser?.accountType === 'registered' ? CheckCircle : GuestIcon 
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/8 backdrop-blur-xl rounded-2xl p-3 text-center border border-white/15">
                <Icon size={18} className={`${stat.color} mx-auto mb-1`} />
                <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-white/70">{stat.label}</div>
                {stat.description && (
                  <div className="text-[8px] text-white/50 mt-0.5">{stat.description}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Chat Rooms */}
        <div className="mt-4 px-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black">💬 Chat Rooms</h2>
            <div className="text-xs text-white/60">
              {currentUser 
                ? `${currentUser.displayName} (${currentUser.accountType === 'registered' ? 'Registered ✓' : 'Guest 👤'})`
                : 'Choose a name to chat'
              }
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {chatRooms.map((room) => {
              const Icon = room.icon;
              const isActive = activeRoom === room.id;
              const roomStat = roomStats[room.id] || { online: 0, messages: 0 };
              
              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room.id)}
                  className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all backdrop-blur-xl min-w-[100px] ${
                    isActive
                      ? `bg-gradient-to-r ${room.color} text-white font-bold shadow-xl border border-white/30`
                      : 'bg-white/10 text-white/90 border border-white/10 hover:bg-white/15'
                  } ${room.adminOnly && !isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={room.adminOnly && !isAdmin && activeRoom !== room.id}
                >
                  <Icon size={20} />
                  <span className="text-xs">{room.name.split(' ')[0]}</span>
                  <div className="text-[10px] flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    {roomStat.online || 0}
                  </div>
                  {room.adminOnly && (
                    <div className="text-[8px] text-yellow-400">Admin Only</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="mt-4 px-2">
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl overflow-hidden border border-white/20">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${chatRooms.find(r => r.id === activeRoom)?.color || 'from-blue-500/80 to-cyan-500/80'} backdrop-blur-sm flex items-center justify-center border border-white/20`}>
                    {React.createElement(chatRooms.find(r => r.id === activeRoom)?.icon || Users, { className: "w-6 h-6 text-white" })}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {chatRooms.find(r => r.id === activeRoom)?.name || 'General Chat'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/60">
                        {typingUsers.length > 0 
                          ? `${typingUsers[0]} is typing...`
                          : `${onlineUsers.length} online • ${roomStats[activeRoom]?.messages || 0} messages`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="text-xs bg-yellow-500/20 backdrop-blur-sm px-2 py-1 rounded-full border border-yellow-500/30">
                    <Crown size={10} className="inline mr-1" />
                    Admin
                  </div>
                )}
              </div>
            </div>

            <div 
              className="h-[calc(100vh-320px)] min-h-[300px] overflow-y-auto p-4 space-y-4 mb-20"
              style={{ 
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {/* Welcome Banner */}
              {showWelcomeBanner && (
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl rounded-xl p-4 border border-yellow-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-white mb-1">
                        {currentUser?.accountType === 'registered' 
                          ? `Welcome back, ${currentUser.firstName || currentUser.displayName}! 🎉` 
                          : currentUser
                            ? `Welcome ${currentUser.displayName}! 👤`
                            : 'Welcome to NextWinners Community! 🎉'
                        }
                      </h3>
                      <p className="text-xs text-white/80 mb-2">
                        {currentUser?.accountType === 'registered'
                          ? 'Connect with other registered users. Enjoy full access to all chat rooms!'
                          : currentUser
                            ? 'You\'re chatting as a guest. Register for full access!'
                            : 'Connect with other players. Consider registering for full access to all features!'
                        }
                      </p>
                      {!currentUser && (
                        <button 
                          onClick={() => setShowGuestInput(true)}
                          className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-lg font-bold hover:shadow-sm transition-all"
                        >
                          CHOOSE USERNAME TO CHAT
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => setShowWelcomeBanner(false)}
                      className="text-white/40 hover:text-white/60"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                  <span className="ml-3 text-sm text-white/60">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
                    <MessageSquare className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Start the conversation!</h3>
                  <p className="text-sm text-white/60 mb-4">Be the first to post in this room</p>
                  {currentUser ? (
                    <button 
                      onClick={() => document.querySelector('input[type="text"]')?.focus()}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-yellow-500/30 transition-all"
                    >
                      SEND FIRST MESSAGE
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowGuestInput(true)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-yellow-500/30 transition-all"
                    >
                      CHOOSE USERNAME TO START
                    </button>
                  )}
                  <p className="text-xs text-white/50 mt-2">{getRoomCTA()}</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isCurrentUser = currentUser && msg.uid === currentUser.uid;
                    const hasLiked = msg.likedBy?.includes(currentUser?.uid);
                    
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                          {!isCurrentUser && (
                            <div className="flex items-center gap-2 mb-1">
                              <div className="relative">
                                <img 
                                  src={msg.photoURL} 
                                  alt={msg.displayName} 
                                  className="w-6 h-6 rounded-full border border-yellow-500/50"
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.displayName)}&background=FFD700&color=000&bold=true`;
                                  }}
                                />
                                {msg.isGuest && (
                                  <div className="absolute -top-1 -right-1">
                                    <GuestIcon size={10} />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-semibold text-white/90">{msg.displayName}</span>
                                {msg.isAdmin && (
                                  <span className="text-yellow-500 text-xs">👑</span>
                                )}
                                {msg.isRegistered && !msg.isAdmin && (
                                  <span className="text-green-400 text-xs">✓</span>
                                )}
                                {msg.isGuest && !msg.isAdmin && (
                                  <GuestIcon size={12} className="text-blue-400" />
                                )}
                              </div>
                              <span className="text-xs text-white/50">{formatTime(msg.timestamp)}</span>
                            </div>
                          )}

                          <div className={`rounded-2xl px-4 py-2 backdrop-blur-sm border ${
                            isCurrentUser
                              ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-500/30 text-white'
                              : 'bg-white/5 border-white/10 text-white'
                          } ${msg.isRegistered ? 'border-l-2 border-l-green-500/50' : ''} ${msg.isGuest ? 'border-l-2 border-l-blue-500/50' : ''}`}>
                            <p className="text-sm break-words">{msg.text}</p>
                            
                            <div className={`flex items-center justify-between mt-1 ${
                              isCurrentUser ? 'text-white/70' : 'text-white/50'
                            }`}>
                              <div className="flex items-center gap-2">
                                {isCurrentUser && (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    <span className="text-xs">Sent</span>
                                  </>
                                )}
                                {!isCurrentUser && (
                                  <span className="text-xs">{formatTime(msg.timestamp)}</span>
                                )}
                              </div>
                              
                              <button 
                                onClick={() => likeMessage(msg.id, msg.likes || 0, msg.likedBy || [])}
                                className={`flex items-center gap-1 p-1 rounded-full hover:opacity-80 transition-all ${
                                  hasLiked ? 'text-red-400' : ''
                                }`}
                                disabled={!currentUser}
                              >
                                <Heart className="w-3 h-3" fill={hasLiked ? 'currentColor' : 'none'} />
                                {msg.likes > 0 && (
                                  <span className="text-xs">{msg.likes}</span>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </main>

      {/* Chat Input Area */}
      {currentUser ? (
        <div className="fixed bottom-20 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/20 z-30 p-3">
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <div className="relative">
              <img 
                src={currentUser.photoURL} 
                alt="You" 
                className="w-8 h-8 rounded-full border-2 border-yellow-500 hidden sm:block"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName)}&background=FFD700&color=000&bold=true`;
                }}
              />
              {currentUser.accountType === 'guest' && (
                <div className="absolute -top-1 -right-1">
                  <GuestIcon size={10} />
                </div>
              )}
            </div>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`${getRoomCTA()}...`}
                className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 text-sm pr-20 text-white placeholder-white/50"
                maxLength={500}
                disabled={connectionStatus !== 'connected'}
              />
              
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <div className="text-xs text-white/40 hidden sm:block">
                  {message.length}/500
                </div>
                
                <button
                  type="submit"
                  disabled={!message.trim() || connectionStatus !== 'connected'}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                    message.trim() && connectionStatus === 'connected'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105'
                      : 'bg-white/10 cursor-not-allowed border border-white/10'
                  }`}
                >
                  <Send className={`w-4 h-4 ${message.trim() && connectionStatus === 'connected' ? 'text-white' : 'text-white/30'}`} />
                </button>
              </div>
            </div>
          </form>
          
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="text-xs text-white/50 flex items-center gap-1">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span>{onlineUsers.length} online</span>
              </div>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline text-[10px]">
                {typingUsers.length > 0 ? `${typingUsers[0]} typing...` : 'Press Enter to send'}
              </span>
            </div>
            <div className="text-xs text-white/50 flex items-center gap-1">
              {currentUser.accountType === 'registered' ? (
                <>
                  <CheckCircle size={10} className="text-green-400" />
                  <span>Registered</span>
                </>
              ) : (
                <>
                  <GuestIcon size={10} />
                  <span>Guest {currentUser.phone ? `• ${currentUser.phone}` : ''}</span>
                </>
              )}
              <span>•</span>
              <span>💬 {roomStats[activeRoom]?.messages || 0}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-20 left-0 right-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl p-3 z-30">
          <div className="text-center">
            <button 
              onClick={() => setShowGuestInput(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-yellow-500/40 transition-all"
            >
              CHOOSE USERNAME TO START CHATTING
            </button>
            <p className="text-xs text-white/80 mt-1">
              Auto-login on this device • Unique usernames • Phone binding available
            </p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/15 backdrop-blur-2xl border-t border-white/25 z-40 py-1.5">
        <div className="flex">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.route;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.route);
                  setShowRoomsMenu(false);
                }}
                className={`flex-1 flex flex-col items-center justify-center relative transition-all ${
                  isActive ? 'text-yellow-400' : 'text-white/80'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 w-3/4 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-b-full"></div>
                )}
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/15 backdrop-blur-sm' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[9px] mt-0.5 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default ForumPage;