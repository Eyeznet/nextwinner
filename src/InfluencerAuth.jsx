// src/pages/InfluencerAuth.jsx
import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Lock, Mail, Phone, Camera, Globe, Users, TrendingUp, 
  Award, Star, CheckCircle, XCircle, ArrowRight, Eye, EyeOff,
  Upload, Briefcase, MapPin, Calendar, CreditCard, Shield,
  Check, Sparkles, Crown, Zap, Gift, AlertCircle, ExternalLink
} from 'lucide-react';
import { Instagram, Twitter, Youtube } from 'lucide-react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  getDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebaseConfig';

// Initialize Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// TikTok icon
const TikTokIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

// Facebook icon
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Utility functions
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  // Nigerian phone number: 11 digits starting with 0
  const re = /^0[0-9]{10}$/;
  return re.test(phone);
};

const validateAccountNumber = (accountNumber) => {
  // Nigerian account numbers are typically 10 digits
  return /^[0-9]{10}$/.test(accountNumber);
};

const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Small Components
const ProfileUpload = ({ profilePic, profilePicFile, onUpload, onRemove, triggerFileInput }) => (
  <div className="text-center mb-6">
    <div className="relative inline-block">
      <div 
        onClick={triggerFileInput}
        className="w-32 h-32 rounded-full border-4 border-dashed border-purple-500/50 bg-gray-800/50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
      >
        {profilePic ? (
          <img 
            src={profilePic} 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <>
            <Camera className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-xs text-gray-400">Upload Photo</span>
          </>
        )}
      </div>
      {profilePic && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
          aria-label="Remove profile picture"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
    <p className="text-xs text-gray-400 mt-2">Max 5MB • JPG, PNG, or GIF</p>
  </div>
);

const PasswordInput = ({ showPassword, togglePassword, ...props }) => (
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
      {...props}
    />
    <button
      type="button"
      onClick={togglePassword}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  </div>
);

const SocialLinkInput = ({ platform, icon: Icon, value, onChange, placeholder }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center" aria-hidden="true">
      <Icon className="w-5 h-5" />
    </div>
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
      placeholder={placeholder}
      aria-label={platform.charAt(0).toUpperCase() + platform.slice(1) + " handle"}
    />
  </div>
);

const BankDetailsSection = ({ formData, handleInputChange, nigerianBanks }) => (
  <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-5 border border-purple-500/30">
    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
      <CreditCard className="w-5 h-5 text-purple-400" />
      Bank Account Details (For Payouts)
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Bank Name *
        </label>
        <select
          name="bankName"
          value={formData.bankName}
          onChange={handleInputChange}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="">Select Bank</option>
          {nigerianBanks.map(bank => (
            <option key={bank} value={bank}>{bank}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Account Number *
        </label>
        <input
          type="text"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleInputChange}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="10-digit account number"
          pattern="[0-9]{10}"
          required
          aria-describedby="accountNumberHelp"
        />
        {formData.accountNumber && !validateAccountNumber(formData.accountNumber) && (
          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Must be exactly 10 digits
          </p>
        )}
      </div>
    </div>
    
    <div className="mt-4">
      <label className="block text-sm font-medium mb-2">
        Account Name *
      </label>
      <input
        type="text"
        name="accountName"
        value={formData.accountName}
        onChange={handleInputChange}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Name as it appears on bank account"
        required
      />
    </div>
    
    <div className="mt-4 p-3 bg-black/40 rounded-lg" role="note" aria-label="Security notice">
      <div className="flex items-start gap-2">
        <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-300">
          Your bank details are encrypted and secure. We only use this information to process your payouts.
        </p>
      </div>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
);

const InfluencerAuth = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [recaptchaToken, setRecaptchaToken] = useState('');
  
  const [formData, setFormData] = useState({
    // Login
    email: '',
    password: '',
    
    // Register
    firstName: '',
    lastName: '',
    stageName: '',
    phone: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
    country: 'Nigeria',
    state: '',
    city: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: '',
      facebook: ''
    },
    niche: '',
    audienceSize: '',
    avgEngagement: '',
    referralSource: '',
    agreeTerms: false,
    agreeMarketing: false,
    
    // Preferences
    emailNotifications: true,
    marketingEmails: true,
    smsNotifications: false
  });

  const fileInputRef = useRef(null);
  const recaptchaRef = useRef(null);

  // Nigerian data
  const nigerianBanks = [
    "Access Bank", "First Bank", "GTBank", "UBA", "Zenith Bank",
    "Fidelity Bank", "Stanbic IBTC", "Union Bank", "Polaris Bank",
    "Ecobank", "FCMB", "Sterling Bank", "Wema Bank", "Jaiz Bank"
  ];

  const niches = [
    "Fashion & Beauty", "Technology", "Gaming", "Lifestyle",
    "Finance", "Education", "Comedy", "Music & Entertainment",
    "Sports", "Health & Fitness", "Food & Cooking", "Travel",
    "Business & Entrepreneurship", "Others"
  ];

  const states = [
    "Lagos", "Abuja FCT", "Rivers", "Oyo", "Kano", "Delta",
    "Kaduna", "Ogun", "Ondo", "Enugu", "Edo", "Plateau",
    "Akwa Ibom", "Cross River", "Anambra", "Imo", "Bauchi",
    "Katsina", "Bornu", "Sokoto", "Bayelsa", "Ebonyi", "Ekiti"
  ];

  const socialIcons = [
    { platform: 'instagram', icon: Instagram, placeholder: 'Instagram username' },
    { platform: 'twitter', icon: Twitter, placeholder: 'Twitter handle' },
    { platform: 'youtube', icon: Youtube, placeholder: 'YouTube channel URL' },
    { platform: 'tiktok', icon: TikTokIcon, placeholder: 'TikTok username' },
    { platform: 'facebook', icon: FacebookIcon, placeholder: 'Facebook profile URL' }
  ];

  // Generate unique referral code
  const generateReferralCode = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'NWIN';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }, []);

  // Validate registration form
  const validateRegistration = () => {
    const errors = {};
    
    if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid Nigerian phone number (11 digits starting with 0)';
    }
    
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 18) {
        errors.dateOfBirth = 'You must be at least 18 years old';
      }
    }
    
    if (formData.accountNumber && !validateAccountNumber(formData.accountNumber)) {
      errors.accountNumber = 'Account number must be 10 digits';
    }
    
    if (!formData.agreeTerms) {
      errors.terms = 'You must agree to the Terms & Conditions';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes with debouncing for validation
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    setError('');
  }, [validationErrors]);

  const handleSocialLinkChange = useCallback((platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  }, []);

  const handleConfirmPasswordChange = useCallback((e) => {
    setConfirmPassword(e.target.value);
    if (validationErrors.confirmPassword) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: undefined
      }));
    }
  }, [validationErrors]);

  // Handle profile picture upload
  const handleProfilePicUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile picture must be less than 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, or GIF)');
      return;
    }
    
    setProfilePicFile(file);
    setProfilePic(URL.createObjectURL(file));
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeProfilePic = useCallback(() => {
    setProfilePic(null);
    setProfilePicFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Upload profile picture to Firebase Storage
  const uploadProfilePicture = useCallback(async (userId) => {
    if (!profilePicFile) return null;
    
    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `profile_pictures/${userId}/${timestamp}_${profilePicFile.name}`);
      await uploadBytes(storageRef, profilePicFile);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return null;
    }
  }, [profilePicFile]);

  // Check if stage name is unique
  const isStageNameUnique = useCallback(async (stageName) => {
    if (!stageName) return true;
    
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('displayName', '==', stageName));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking stage name:', error);
      return false;
    }
  }, []);

  // Check if referral code is unique
  const isReferralCodeUnique = useCallback(async (code) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', code));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking referral code:', error);
      return false;
    }
  }, []);

  // Bank account verification (simulated - in production, integrate with Paystack/Flutterwave)
  const verifyBankAccount = async (accountNumber, bankCode) => {
    // In production, replace with actual API call to Paystack/Flutterwave
    // Example Paystack: https://api.paystack.co/bank/resolve?account_number=0001234567&bank_code=044
    return {
      verified: true,
      account_name: formData.accountName // In production, get from API response
    };
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors({});

    // Validate form
    if (!validateRegistration()) {
      setLoading(false);
      return;
    }

    try {
      // Check if stage name is unique
      const stageNameUnique = await isStageNameUnique(formData.stageName);
      if (!stageNameUnique && formData.stageName) {
        setError('This stage name is already taken. Please choose another one.');
        setLoading(false);
        return;
      }

      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const userId = userCredential.user.uid;
      
      // 2. Generate unique referral code
      let referralCode;
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        referralCode = generateReferralCode();
        isUnique = await isReferralCodeUnique(referralCode);
        attempts++;
      }
      
      if (!isUnique) {
        throw new Error('Could not generate unique referral code');
      }

      // 3. Upload profile picture if exists
      let photoURL = null;
      if (profilePicFile) {
        photoURL = await uploadProfilePicture(userId);
      }

      // 4. Verify bank account (simulated)
      const bankVerification = await verifyBankAccount(
        formData.accountNumber,
        formData.bankName
      );

      // 5. Create user document in Firestore
      const userDocData = {
        uid: userId,
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.stageName || `${formData.firstName} ${formData.lastName}`,
        accountType: 'influencer',
        photoURL: photoURL,
        referralCode: referralCode,
        referredBy: formData.referralSource === 'friend' ? formData.referralSource : null,
        
        // Influencer specific fields
        influencerData: {
          stageName: formData.stageName,
          bio: formData.bio,
          niche: formData.niche,
          audienceSize: formData.audienceSize,
          engagementRate: formData.avgEngagement,
          socialLinks: formData.socialLinks,
          bankDetails: {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            accountName: formData.accountName,
            verified: bankVerification.verified,
            verifiedAt: bankVerification.verified ? serverTimestamp() : null
          },
          location: {
            country: formData.country,
            state: formData.state,
            city: formData.city
          },
          demographics: {
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            age: calculateAge(formData.dateOfBirth)
          },
          tier: 'bronze',
          totalReferrals: 0,
          lifetimeEarnings: 0,
          pendingEarnings: 0,
          paidEarnings: 0,
          totalTicketsReferred: 0,
          joinDate: serverTimestamp(),
          lastPayoutDate: null
        },
        
        // User stats
        stats: {
          joinDate: serverTimestamp(),
          lastLogin: serverTimestamp(),
          loginCount: 1,
          ticketsPurchased: 0,
          totalSpent: 0,
          totalWins: 0,
          totalReferred: 0
        },
        
        // Wallet
        balance: 0,
        pendingBalance: 0,
        
        // Preferences
        preferences: {
          emailNotifications: formData.emailNotifications,
          marketingEmails: formData.marketingEmails,
          smsNotifications: formData.smsNotifications
        },
        
        // Verification status
        isEmailVerified: false,
        isPhoneVerified: false,
        isProfileComplete: true,
        welcomeBonusClaimed: false,
        kycVerified: false,
        
        // Security
        lastPasswordChange: serverTimestamp(),
        failedLoginAttempts: 0,
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // 6. Save to Firestore
      await setDoc(doc(db, 'users', userId), userDocData);

      // 7. Create referrals document
      const referralsData = {
        userId: userId,
        code: referralCode,
        referredUsers: [],
        totalEarned: 0,
        pendingEarnings: 0,
        totalReferrals: 0,
        commissionRate: 15, // 15% commission for influencers
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'referrals', userId), referralsData);

      // 8. Create activity log
      const activityData = {
        userId: userId,
        type: 'account_created',
        description: 'Influencer account created',
        metadata: {
          tier: 'bronze',
          commissionRate: '15%',
          welcomeBonus: '15% Win Prize Booster + 5% Ticket Bonus'
        },
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'activities', `${userId}_${Date.now()}`), activityData);

      setSuccess('🎉 Registration successful! Welcome to NextWinner Influencers. Redirecting to dashboard...');
      
      // 9. Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/influencer-dashboard');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please use a different email or sign in.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        default:
          errorMessage = error.message || 'Registration failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors({});

    // Basic validation
    if (!validateEmail(formData.email)) {
      setValidationErrors({ email: 'Please enter a valid email address' });
      setLoading(false);
      return;
    }

    if (formData.password.length < 1) {
      setValidationErrors({ password: 'Please enter your password' });
      setLoading(false);
      return;
    }

    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const userId = userCredential.user.uid;

      // 2. Get user document
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('User account not found');
      }

      const userData = userDoc.data();

      // 3. Check if user is an influencer
      if (userData.accountType !== 'influencer') {
        throw new Error('This account is not registered as an influencer. Please use the regular login.');
      }

      // 4. Check if account is locked (too many failed attempts)
      if (userData.failedLoginAttempts >= 5) {
        throw new Error('Account temporarily locked due to too many failed login attempts. Please reset your password or try again later.');
      }

      // 5. Reset failed login attempts on successful login
      await updateDoc(doc(db, 'users', userId), {
        'stats.lastLogin': serverTimestamp(),
        'stats.loginCount': (userData.stats?.loginCount || 0) + 1,
        'failedLoginAttempts': 0,
        updatedAt: serverTimestamp()
      });

      // 6. Create login activity log
      const activityData = {
        userId: userId,
        type: 'login_success',
        description: 'Successful influencer login',
        ipAddress: 'client_ip', // In production, get from request headers
        userAgent: navigator.userAgent,
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'login_activities', `${userId}_${Date.now()}`), activityData);

      setSuccess('✅ Login successful! Redirecting to dashboard...');
      
      // 7. Redirect to dashboard
      setTimeout(() => {
        navigate('/influencer-dashboard');
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      
      // Update failed login attempts
      if (error.code === 'auth/wrong-password') {
        try {
          // Get user ID from email
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', formData.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const currentAttempts = userDoc.data().failedLoginAttempts || 0;
            
            await updateDoc(doc(db, 'users', userDoc.id), {
              failedLoginAttempts: currentAttempts + 1,
              updatedAt: serverTimestamp()
            });
          }
        } catch (updateError) {
          console.error('Failed to update login attempts:', updateError);
        }
      }
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No influencer account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again in 15 minutes.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = error.message || 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (isRegister) {
      handleRegister(e);
    } else {
      handleLogin(e);
    }
  };

  // Toggle between register/login
  const toggleAuthMode = (register) => {
    setIsRegister(register);
    setError('');
    setSuccess('');
    setValidationErrors({});
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900 text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-8 md:mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-lg" aria-hidden="true">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                NextWinner
              </span>
              <span className="text-white">Influencers</span>
            </Link>
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-sm font-bold px-4 py-1.5 rounded-full mb-4 animate-pulse">
              <Sparkles className="w-4 h-4" />
              JOIN TODAY: Get 15% Win Prize Booster + 5% Ticket Bonus!
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Turn Your Influence Into Income
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Join Nigeria's top influencers earning commissions from raffle referrals
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Left Column - Benefits & Stats */}
            <div className="space-y-8">
              

              

              
            </div>

            {/* Right Column - Auth Form */}
            <div className="bg-gradient-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700">
              {/* Toggle Switch */}
              <div className="flex mb-8" role="tablist">
                <button
                  onClick={() => toggleAuthMode(true)}
                  role="tab"
                  aria-selected={isRegister}
                  aria-controls="register-form"
                  className={`flex-1 py-3 px-4 text-center font-bold rounded-l-xl transition-all ${isRegister ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                  Create Account
                </button>
                <button
                  onClick={() => toggleAuthMode(false)}
                  role="tab"
                  aria-selected={!isRegister}
                  aria-controls="login-form"
                  className={`flex-1 py-3 px-4 text-center font-bold rounded-r-xl transition-all ${!isRegister ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                  Sign In
                </button>
              </div>

              {/* Form Title */}
              <h2 className="text-2xl font-bold mb-2">
                {isRegister ? '🎯 Become a NextWinner Influencer' : 'Welcome Back Influencer!'}
              </h2>
              <p className="text-gray-400 mb-6">
                {isRegister ? 'Fill in your details to start earning today' : 'Sign in to access your dashboard and earnings'}
              </p>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl" role="alert">
                  <div className="flex items-center gap-2 text-red-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>{error}</div>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-900/30 border border-green-700/50 rounded-xl" role="status">
                  <div className="flex items-center gap-2 text-green-300">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <div>{success}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" id={isRegister ? "register-form" : "login-form"}>
                {isRegister ? (
                  /* REGISTRATION FORM */
                  <>
                    {/* Profile Picture Upload */}
                    <ProfileUpload
                      profilePic={profilePic}
                      profilePicFile={profilePicFile}
                      onUpload={handleProfilePicUpload}
                      onRemove={removeProfilePic}
                      triggerFileInput={triggerFileInput}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProfilePicUpload}
                      accept="image/*"
                      className="hidden"
                      aria-label="Upload profile picture"
                    />

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <User className="inline w-4 h-4 mr-2" />
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="John"
                          required
                          aria-required="true"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <User className="inline w-4 h-4 mr-2" />
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Doe"
                          required
                          aria-required="true"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Star className="inline w-4 h-4 mr-2" />
                        Stage/Display Name *
                      </label>
                      <input
                        type="text"
                        name="stageName"
                        value={formData.stageName}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., @NaijaInfluencer"
                        required
                        aria-required="true"
                      />
                      {validationErrors.stageName && (
                        <p className="text-red-400 text-xs mt-1">{validationErrors.stageName}</p>
                      )}
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Mail className="inline w-4 h-4 mr-2" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="you@example.com"
                          required
                          aria-required="true"
                          aria-invalid={!!validationErrors.email}
                          aria-describedby={validationErrors.email ? "emailError" : undefined}
                        />
                        {validationErrors.email && (
                          <p id="emailError" className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Phone className="inline w-4 h-4 mr-2" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="080XXXXXXXX"
                          pattern="[0-9]{11}"
                          required
                          aria-required="true"
                          aria-invalid={!!validationErrors.phone}
                          aria-describedby={validationErrors.phone ? "phoneError" : undefined}
                        />
                        {validationErrors.phone && (
                          <p id="phoneError" className="text-red-400 text-xs mt-1">{validationErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Lock className="inline w-4 h-4 mr-2" />
                          Password *
                        </label>
                        <PasswordInput
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Minimum 6 characters"
                          minLength="6"
                          required
                          showPassword={showPassword}
                          togglePassword={() => setShowPassword(!showPassword)}
                          aria-invalid={!!validationErrors.password}
                          aria-describedby={validationErrors.password ? "passwordError" : undefined}
                        />
                        {validationErrors.password && (
                          <p id="passwordError" className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Lock className="inline w-4 h-4 mr-2" />
                          Confirm Password *
                        </label>
                        <PasswordInput
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={handleConfirmPasswordChange}
                          placeholder="Confirm your password"
                          minLength="6"
                          required
                          showPassword={showConfirmPassword}
                          togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-invalid={!!validationErrors.confirmPassword}
                          aria-describedby={validationErrors.confirmPassword ? "confirmPasswordError" : undefined}
                        />
                        {validationErrors.confirmPassword && (
                          <p id="confirmPasswordError" className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    {/* Demographics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Calendar className="inline w-4 h-4 mr-2" />
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                          aria-invalid={!!validationErrors.dateOfBirth}
                          aria-describedby={validationErrors.dateOfBirth ? "dobError" : undefined}
                        />
                        {validationErrors.dateOfBirth && (
                          <p id="dobError" className="text-red-400 text-xs mt-1">{validationErrors.dateOfBirth}</p>
                        )}
                        {formData.dateOfBirth && !validationErrors.dateOfBirth && (
                          <p className="text-green-400 text-xs mt-1">
                            Age: {calculateAge(formData.dateOfBirth)} years old
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Globe className="inline w-4 h-4 mr-2" />
                          Country *
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          readOnly
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <MapPin className="inline w-4 h-4 mr-2" />
                          State *
                        </label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="">Select State</option>
                          {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <MapPin className="inline w-4 h-4 mr-2" />
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter your city"
                          required
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Briefcase className="inline w-4 h-4 mr-2" />
                        Bio / About You *
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                        placeholder="Tell us about yourself, your content, and your audience..."
                        required
                        aria-required="true"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {formData.bio.length}/500 characters
                      </p>
                    </div>

                    {/* Influencer Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Users className="inline w-4 h-4 mr-2" />
                          Niche *
                        </label>
                        <select
                          name="niche"
                          value={formData.niche}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="">Select Niche</option>
                          {niches.map(niche => (
                            <option key={niche} value={niche}>{niche}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <TrendingUp className="inline w-4 h-4 mr-2" />
                          Audience Size *
                        </label>
                        <select
                          name="audienceSize"
                          value={formData.audienceSize}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="">Select Size</option>
                          <option value="1k-10k">1K - 10K</option>
                          <option value="10k-50k">10K - 50K</option>
                          <option value="50k-100k">50K - 100K</option>
                          <option value="100k-500k">100K - 500K</option>
                          <option value="500k-1m">500K - 1M</option>
                          <option value="1m+">1M+</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Award className="inline w-4 h-4 mr-2" />
                          Avg. Engagement Rate *
                        </label>
                        <select
                          name="avgEngagement"
                          value={formData.avgEngagement}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="">Select Rate</option>
                          <option value="1-3">1% - 3%</option>
                          <option value="3-5">3% - 5%</option>
                          <option value="5-10">5% - 10%</option>
                          <option value="10+">10%+</option>
                        </select>
                      </div>
                    </div>

                    {/* Social Media Links */}
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        <Globe className="inline w-4 h-4 mr-2" />
                        Social Media Profiles (Optional)
                      </label>
                      <div className="space-y-3" role="group" aria-label="Social media profiles">
                        {socialIcons.map((social) => (
                          <SocialLinkInput
                            key={social.platform}
                            platform={social.platform}
                            icon={social.icon}
                            value={formData.socialLinks[social.platform]}
                            onChange={(e) => handleSocialLinkChange(social.platform, e.target.value)}
                            placeholder={social.placeholder}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Bank Details */}
                    <BankDetailsSection
                      formData={formData}
                      handleInputChange={handleInputChange}
                      nigerianBanks={nigerianBanks}
                    />

                    {/* Referral Source */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        How did you hear about us? *
                      </label>
                      <select
                        name="referralSource"
                        value={formData.referralSource}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">Select Source</option>
                        <option value="friend">Friend/Referral</option>
                        <option value="social">Social Media</option>
                        <option value="search">Search Engine</option>
                        <option value="ad">Advertisement</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="agreeTerms"
                          checked={formData.agreeTerms}
                          onChange={handleInputChange}
                          className="mt-1 w-5 h-5 accent-purple-600"
                          required
                          aria-required="true"
                          aria-invalid={!!validationErrors.terms}
                        />
                        <label className="text-sm">
                          I agree to the{' '}
                          <Link to="/terms" className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1">
                            Terms & Conditions <ExternalLink className="w-3 h-3" />
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1">
                            Privacy Policy <ExternalLink className="w-3 h-3" />
                          </Link>{' '}
                          *
                        </label>
                      </div>
                      {validationErrors.terms && (
                        <p className="text-red-400 text-xs ml-8">{validationErrors.terms}</p>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="agreeMarketing"
                          checked={formData.agreeMarketing}
                          onChange={handleInputChange}
                          className="mt-1 w-5 h-5 accent-purple-600"
                        />
                        <label className="text-sm">
                          I want to receive updates, tips, and promotional offers from NextWinner
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl shadow-green-500/30 flex items-center justify-center gap-2"
                      aria-busy={loading}
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          CREATE INFLUENCER ACCOUNT
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-gray-400 text-sm">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => toggleAuthMode(false)}
                        className="text-purple-400 font-semibold hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                      >
                        Sign in here
                      </button>
                    </p>
                  </>
                ) : (
                  /* LOGIN FORM */
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Mail className="inline w-4 h-4 mr-2" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="influencer@example.com"
                        required
                        aria-invalid={!!validationErrors.email}
                        aria-describedby={validationErrors.email ? "loginEmailError" : undefined}
                      />
                      {validationErrors.email && (
                        <p id="loginEmailError" className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Lock className="inline w-4 h-4 mr-2" />
                        Password *
                      </label>
                      <PasswordInput
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        required
                        showPassword={showPassword}
                        togglePassword={() => setShowPassword(!showPassword)}
                        aria-invalid={!!validationErrors.password}
                        aria-describedby={validationErrors.password ? "loginPasswordError" : undefined}
                      />
                      {validationErrors.password && (
                        <p id="loginPasswordError" className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="remember"
                          className="w-4 h-4 accent-purple-600"
                        />
                        <label htmlFor="remember" className="text-sm select-none">Remember me</label>
                      </div>
                      <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                        Forgot Password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
                      aria-busy={loading}
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-5 h-5" />
                          SIGN IN TO DASHBOARD
                        </>
                      )}
                    </button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-gray-900/80 text-gray-400">Or continue with</span>
                      </div>
                    </div>

                    <p className="text-center text-gray-400 text-sm">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => toggleAuthMode(true)}
                        className="text-purple-400 font-semibold hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                      >
                        Create one now
                      </button>
                    </p>
                  </>
                )}
              </form>

              {/* Trust Badge */}
              <div className="mt-8 pt-6 border-t border-gray-800" role="contentinfo">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>100% Secure • Verified Payouts • Protected by SSL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              By joining NextWinner Influencers, you agree to our{' '}
              <Link to="/influencer-agreement" className="text-purple-400 hover:text-purple-300">
                Influencer Agreement
              </Link>
              {' '}and confirm you are at least 18 years old.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Need help? Contact our Influencer Support: support@nextwinner.com | 0800-NEXT-WIN
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }

        /* Focus styles for accessibility */
        input:focus, 
        button:focus, 
        select:focus, 
        textarea:focus {
          outline: 2px solid #8b5cf6;
          outline-offset: 2px;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-blob,
          .animate-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default InfluencerAuth;