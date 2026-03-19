import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { app } from './firebaseConfig';

// Lazy load heavy icons
const LazyIcon = ({ iconName, ...props }) => {
  const IconComponent = lazy(() => 
    import('lucide-react').then(module => ({ 
      default: module[iconName] || (() => <span>...</span>)
    }))
  );
  
  return (
    <Suspense fallback={<span className="inline-block w-5 h-5 bg-gray-700 animate-pulse rounded" />}>
      <IconComponent {...props} />
    </Suspense>
  );
};

// FIXED: Separated EmotionalTriggerBanner with fixed dimensions
const EmotionalTriggerBanner = React.memo(() => {
  const [currentTrigger, setCurrentTrigger] = useState(0);
  
  // Emotional triggers with memoization - moved inside component
  const emotionalTriggers = useMemo(() => [
    { 
      title: "🚀 Your Financial Breakthrough Starts Here", 
      subtitle: "Join 50+ winners who transformed their lives",
      color: "from-purple-600/20 to-pink-600/20",
      iconName: "Rocket",
      iconColor: "text-purple-400"
    },
    { 
      title: "💰 Dream Big, Win Bigger with NextWinner", 
      subtitle: "Your next ₦1M could be one ticket away",
      color: "from-yellow-600/20 to-orange-600/20",
      iconName: "Trophy",
      iconColor: "text-yellow-400"
    },
    { 
      title: "🏆 From Dreamer to Winner in Minutes", 
      subtitle: "Join Nigeria's trusted winner community",
      color: "from-blue-600/20 to-cyan-600/20",
      iconName: "Crown",
      iconColor: "text-blue-400"
    },
    { 
      title: "⚡ Instant Wins, Real Wealth", 
      subtitle: "Live draws every Sunday • 24/7 withdrawals",
      color: "from-green-600/20 to-emerald-600/20",
      iconName: "Zap",
      iconColor: "text-green-400"
    }
  ], []);

  // Rotate emotional triggers - isolated in this component only
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTrigger(prev => (prev + 1) % emotionalTriggers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [emotionalTriggers.length]);

  const trigger = emotionalTriggers[currentTrigger];
  
  return (
    <div className="mb-6">
      <div className={`p-4 rounded-2xl bg-gradient-to-r ${trigger.color} backdrop-blur-xl border border-white/10 transition-all duration-500 h-[120px] flex items-center`}>
        <div className="flex items-start gap-3 w-full">
          <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
            <LazyIcon iconName={trigger.iconName} size={20} className={trigger.iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white line-clamp-2">{trigger.title}</h2>
            <p className="text-sm text-white/80 mt-1 line-clamp-2">{trigger.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

const auth = getAuth(app);
const db = getFirestore(app);

const LoginRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  // State management - NO emotional trigger state here anymore
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    profession: '',
    otherProfession: '',
    referralCode: '',
    city: '',
    age: '',
    newPassword: '',
    resetCode: ''
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [user, setUser] = useState(null);
  const [showReferralField, setShowReferralField] = useState(false);

  // Handle auth mode from route
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/verify-email')) {
      setAuthMode('verify');
    } else if (path.includes('/forgot-password')) {
      setAuthMode('forgot');
    } else if (path.includes('/register')) {
      setAuthMode('register');
    } else {
      setAuthMode('login');
    }
  }, [location]);

  // Check auth state with cleanup
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (isMounted) {
        setUser(currentUser);
        if (currentUser && currentUser.emailVerified && authMode === 'login') {
          const from = location.state?.from || '/dashboard';
          navigate(from);
        }
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate, location, authMode]);

  // Optimized image handler
  const handleImageSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Optimized image upload with caching
  const uploadImageToImgBB = useCallback(async (file) => {
    if (!file) return null;
    
    const cacheKey = `img_${file.name}_${file.size}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return cached;
    
    setImageUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('https://api.imgbb.com/1/upload?key=6ba4e07f4118ef0579427c40a7207eef', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        sessionStorage.setItem(cacheKey, data.data.url);
        return data.data.url;
      } else {
        throw new Error(data.error?.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setImageUploading(false);
    }
  }, []);

  // Optimized user document creation
  const createUserDocument = useCallback(async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      try {
        const createdAt = new Date();
        const referralCode = `NW${Date.now().toString().slice(-5)}`;
        const finalProfession = additionalData.profession === 'Other' 
          ? additionalData.otherProfession 
          : additionalData.profession;

        // Single write operation with all data
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: `${additionalData.firstName} ${additionalData.lastName}`,
          firstName: additionalData.firstName,
          lastName: additionalData.lastName,
          phone: additionalData.phone || '',
          profession: finalProfession,
          city: additionalData.city || '',
          age: additionalData.age ? parseInt(additionalData.age) : '',
          photoURL: additionalData.photoURL || '',
          isEmailVerified: user.emailVerified,
          accountType: 'standard',
          balance: 500,
          totalWins: 0,
          ticketsPurchased: 0,
          totalSpent: 0,
          referralCode,
          referredBy: additionalData.referralCode || '',
          preferences: {
            emailNotifications: true,
            smsNotifications: false,
            marketingEmails: false
          },
          stats: {
            joinDate: createdAt,
            lastLogin: createdAt,
            loginCount: 1,
            welcomeBonusClaimed: true,
            referralCount: 0,
            totalEarned: 500
          },
          createdAt
        });

        // Only process referral if code exists
        if (additionalData.referralCode) {
          await addReferralBonus(additionalData.referralCode, user.uid, `${additionalData.firstName} ${additionalData.lastName}`);
        }
      } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
      }
    }
  }, []);

  // Optimized referral bonus
  const addReferralBonus = useCallback(async (referralCode, newUserId, newUserName) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', referralCode));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const referrerDoc = querySnapshot.docs[0];
        const referrerData = referrerDoc.data();
        
        // Update referrer's stats
        await updateDoc(doc(db, 'users', referrerData.uid), {
          'stats.referralCount': (referrerData.stats?.referralCount || 0) + 1,
          'stats.totalEarned': (referrerData.stats?.totalEarned || 0) + 500
        });
      }
    } catch (error) {
      console.error('Error adding referral bonus:', error);
    }
  }, []);

  const sendVerificationEmail = useCallback(async (userToVerify) => {
    if (!userToVerify) return;
    
    try {
      await sendEmailVerification(userToVerify);
      setSuccess('📧 Verification email sent! Check your inbox/Spam inbox.');
    } catch (error) {
      console.error('Send verification error:', error);
      setError('Failed to send verification email.');
    }
  }, []);

  // Main form submission handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const { email, password } = formData;
        
        if (!email || !password) {
          throw new Error('Please fill in all fields');
        }
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user.emailVerified) {
          setError('Check your email/Spam box to Verify account!');
          await sendVerificationEmail(userCredential.user);
          await auth.signOut();
          return;
        }
        
        setSuccess('🎯 Welcome back! Loading dashboard...');
        setTimeout(() => navigate('/dashboard'), 1000);
        
      } else if (authMode === 'register') {
        const { email, password, confirmPassword, firstName, lastName, phone, profession, otherProfession, referralCode, city, age } = formData;
        
        // Validation
        if (!email || !password || !firstName || !lastName || !profession || !city || !age) {
          throw new Error('Please fill in all required fields');
        }
        
        if (!profileImage) {
          throw new Error('Please upload a profile picture');
        }
        
        if (password !== confirmPassword) {
          throw new Error('Passwords must match');
        }
        
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        
        const userAge = parseInt(age);
        if (isNaN(userAge) || userAge < 18) {
          throw new Error('You must be at least 18 years old');
        }

        if (profession === 'Other' && !otherProfession.trim()) {
          throw new Error('Please specify your profession');
        }

        // Upload image
        let photoURL = '';
        try {
          photoURL = await uploadImageToImgBB(profileImage);
          if (!photoURL) {
            throw new Error('Failed to upload profile image');
          }
        } catch (error) {
          throw new Error('Image upload failed. Please try again.');
        }
        
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile
        await updateProfile(userCredential.user, {
          displayName: `${firstName} ${lastName}`,
          photoURL: photoURL
        });
        
        // Send verification email
        await sendVerificationEmail(userCredential.user);
        
        // Create user document with all data
        await createUserDocument(userCredential.user, {
          firstName,
          lastName,
          phone,
          profession,
          otherProfession,
          city,
          age: userAge,
          photoURL,
          referralCode: referralCode || ''
        });
        
        setSuccess(`🎉 Welcome to NextWinner, ${firstName}! Check your email to verify your account.`);
        
        // Reset form
        setFormData({
          email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '',
          profession: '', otherProfession: '', referralCode: '', city: '', age: '',
          newPassword: '', resetCode: ''
        });
        setProfileImage(null);
        setProfileImagePreview('');
        
        // Switch to login after delay
        setTimeout(() => {
          setAuthMode('login');
        }, 3000);
        
      } else if (authMode === 'forgot') {
        const { email } = formData;
        if (!email) throw new Error('Enter your email to recover your account');
        
        await sendPasswordResetEmail(auth, email);
        setSuccess(`🔑 Recovery link sent to ${email}`);
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // User-friendly error messages
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [authMode, formData, profileImage, navigate, uploadImageToImgBB, sendVerificationEmail, createUserDocument]);

  // Memoized profession options
  const professionOptions = useMemo(() => [
    'Student', 'Entrepreneur', 'Developer', 'Designer', 'Marketer', 
    'Engineer', 'Doctor', 'Lawyer', 'Teacher', 'Freelancer',
    'Business Owner', 'Corporate Employee', 'Government Worker', 
    'Healthcare Worker', 'Retail', 'Other'
  ], []);

  // Optimized input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Helper functions
  const getPageTitle = useCallback(() => {
    switch (authMode) {
      case 'register': return 'Start Winning Now';
      case 'forgot': return 'Recover Your Account';
      case 'verify': return 'Verify & Win';
      default: return 'Welcome Back Winner';
    }
  }, [authMode]);

  const getSubmitButtonText = useCallback(() => {
    if (loading) {
      return imageUploading ? 'Uploading Profile...' : 'Processing...';
    }
    
    if (authMode === 'register') {
      const missingFields = [];
      if (!profileImage) missingFields.push('profile picture');
      if (!formData.profession) missingFields.push('profession');
      if (!formData.city) missingFields.push('city');
      if (!formData.age) missingFields.push('age');
      
      if (missingFields.length > 0) {
        return `Complete: ${missingFields.join(', ')}`;
      }
      
      return '🎯 Claim ₦500 Bonus';
    }
    
    return '🚀 Sign In & Start Winning';
  }, [loading, authMode, profileImage, formData, imageUploading]);

  // Render profile image upload section
  const renderProfileImageUpload = () => (
    authMode === 'register' && (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Profile Picture <span className="text-red-500">*</span>
          {profileImagePreview && (
            <span className="ml-2 text-xs text-green-500">✓ Uploaded</span>
          )}
        </label>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${profileImagePreview ? 'border-green-500' : 'border-red-500'} flex items-center justify-center bg-gray-900`}>
              {profileImagePreview ? (
                <img 
                  src={profileImagePreview} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <LazyIcon iconName="Camera" size={24} className="text-gray-500" />
              )}
            </div>
            {imageUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <label className="w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="profileImageInput"
                required
              />
              <div className="cursor-pointer py-2 px-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl transition-all flex items-center justify-center gap-2">
                <LazyIcon iconName="Upload" size={16} />
                <span className="text-sm font-medium">
                  {profileImage ? 'Change Image' : 'Upload Profile Image *'}
                </span>
              </div>
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Required • Max 2MB • JPG, PNG, GIF
            </p>
          </div>
        </div>
      </div>
    )
  );

  // Render other profession input when "Other" is selected
  const renderOtherProfessionInput = () => (
    formData.profession === 'Other' && (
      <div className="mt-2">
        <label className="block text-sm font-medium mb-1 text-gray-300">
          Specify your profession <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="otherProfession"
          value={formData.otherProfession}
          onChange={handleInputChange}
          required={formData.profession === 'Other'}
          className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
          placeholder="Enter your profession"
        />
      </div>
    )
  );

  // Render password fields
  const renderPasswordFields = () => {
    if (authMode !== 'login' && authMode !== 'register') return null;
    
    return (
      <>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Password {authMode === 'register' && '(min 6 characters)'}
          </label>
          <div className="relative">
            <LazyIcon iconName="Lock" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={authMode === 'register'}
              minLength={6}
              className="w-full pl-10 pr-12 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              placeholder={authMode === 'login' ? "Your password" : "Create secure password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
            >
              <LazyIcon iconName={showPassword ? "EyeOff" : "Eye"} size={18} />
            </button>
          </div>
        </div>

        {authMode === 'register' && (
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <LazyIcon iconName="Lock" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-12 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
              >
                <LazyIcon iconName={showConfirmPassword ? "EyeOff" : "Eye"} size={18} />
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="absolute animate-pulse" style={{
            top: `${20 + i * 30}%`,
            left: `${10 + i * 40}%`,
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, rgba(255,193,7,0.05) 0%, transparent 70%)`,
            filter: 'blur(40px)'
          }} />
        ))}
      </div>

      {/* Brand Header */}
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-lg border-b border-yellow-500/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-xl border border-yellow-500/30 transition-all"
          >
            <LazyIcon iconName="Home" size={20} />
            <span className="text-sm font-bold">{user ? 'Dashboard' : 'Home'}</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <LazyIcon iconName="Trophy" size={16} />
            </div>
            <div>
              <div className="text-sm font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                NEXTWINNER
              </div>
              <div className="text-[10px] text-gray-400">Your Winning Partner</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative px-4 py-6 max-w-md mx-auto z-10">
        {/* FIXED: Use the separate EmotionalTriggerBanner component */}
        <EmotionalTriggerBanner />

        {/* Form Card */}
        <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden mb-6">
          <div className="p-6">
            {/* Form Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {authMode === 'register' 
                    ? 'Join Nigeria\'s trusted winner community' 
                    : 'Access your winning dashboard'}
                </p>
              </div>
              
              {authMode === 'login' ? (
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-sm bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-all"
                >
                  <span className="text-yellow-400">New? </span>
                  <span className="font-semibold">Join Free</span>
                  <LazyIcon iconName="ArrowRight" size={14} className="inline ml-1" />
                </button>
              ) : authMode === 'register' ? (
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-sm bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                >
                  <span className="font-semibold">Have Account?</span>
                  <LazyIcon iconName="ArrowRight" size={14} className="inline ml-1" />
                </button>
              ) : null}
            </div>

            {/* Status Messages */}
            {error && (
              <div className="mb-4 p-3 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-xl rounded-xl border border-red-500/30 flex items-start gap-3">
                <LazyIcon iconName="AlertCircle" size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-red-300">Attention Needed</div>
                  <div className="text-red-200/80 mt-0.5">{error}</div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl border border-green-500/30 flex items-start gap-3">
                <LazyIcon iconName="CheckCircle" size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-green-300">Success!</div>
                  <div className="text-green-200/80 mt-0.5">{success}</div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Required Fields Note - Register Only */}
              {authMode === 'register' && (
                <div className="mb-4 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="text-xs text-yellow-400 flex items-center gap-1">
                    <LazyIcon iconName="AlertCircle" size={12} />
                    All fields marked with * are required including profile picture
                  </div>
                </div>
              )}

              {renderProfileImageUpload()}

              {/* Email Field */}
              {(authMode === 'login' || authMode === 'register' || authMode === 'forgot') && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <LazyIcon iconName="Mail" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required={authMode !== 'verify'}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              )}

              {/* Registration Fields */}
              {authMode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <LazyIcon iconName="User" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <LazyIcon iconName="User" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Age Field */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <LazyIcon iconName="Calendar" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="number"
                        name="age"
                        min="18"
                        max="120"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                        placeholder="Enter your age"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Must be 18 years or older</p>
                  </div>

                  {/* City Field */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <LazyIcon iconName="MapPin" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                        placeholder="e.g., Lagos, Abuja, Port Harcourt"
                      />
                    </div>
                  </div>

                  {/* Profession Field */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Profession <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <LazyIcon iconName="Briefcase" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <select
                        name="profession"
                        value={formData.profession}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all appearance-none"
                      >
                        <option value="">Select your profession *</option>
                        {professionOptions.map((prof, index) => (
                          <option key={index} value={prof}>{prof}</option>
                        ))}
                      </select>
                    </div>
                    {renderOtherProfessionInput()}
                    <p className="text-xs text-gray-400 mt-1">
                      Helps us personalize your experience
                    </p>
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <LazyIcon iconName="Phone" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                  </div>

                  {/* Referral Code Field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-300">
                        Referral Code (Optional)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowReferralField(!showReferralField)}
                        className="text-xs text-yellow-500 hover:text-yellow-400 flex items-center gap-1"
                      >
                        <LazyIcon iconName="Tag" size={12} />
                        {showReferralField ? 'Hide' : '🎁 Have a code?'}
                      </button>
                    </div>
                    
                    {showReferralField && (
                      <div className="relative">
                        <LazyIcon iconName="Gift" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          name="referralCode"
                          value={formData.referralCode}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                          placeholder="Enter friend's code"
                          maxLength="15"
                        />
                      </div>
                    )}
                    {showReferralField && (
                      <p className="text-xs text-gray-400 mt-1">
                        Enter a friend's code to both earn ₦500 bonus each!
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Password Fields */}
              {renderPasswordFields()}

              {/* Terms and Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                {authMode === 'login' ? (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-900 checked:bg-yellow-500 focus:ring-0"
                      />
                      <span className="text-sm text-gray-400">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </>
                ) : authMode === 'register' ? (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-gray-600 bg-gray-900 checked:bg-yellow-500 focus:ring-0 flex-shrink-0"
                      required
                    />
                    <span className="text-xs text-gray-400">
                      I agree to{' '}
                      <Link to="/legal" className="text-yellow-500 hover:text-yellow-400 underline">
                        Terms
                      </Link>
                      {' '}&{' '}
                      <Link to="/legal" className="text-yellow-500 hover:text-yellow-400 underline">
                        Privacy
                      </Link>
                      . I am 18+ years old.
                    </span>
                  </label>
                ) : null}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (authMode === 'register' && (!agreedToTerms || !profileImage || !formData.profession || !formData.city || !formData.age))}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  loading || (authMode === 'register' && (!agreedToTerms || !profileImage || !formData.profession || !formData.city || !formData.age))
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 hover:shadow-2xl hover:shadow-yellow-500/40 active:scale-[0.98]'
                } text-gray-900`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></div>
                    {getSubmitButtonText()}
                  </span>
                ) : (
                  getSubmitButtonText()
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Quick Links (Optional - can be removed for faster load) */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <LazyIcon iconName="Sparkles" size={20} className="text-yellow-400" />
            Explore NextWinner
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '🎯 Live Draws', route: '/live-draw', color: 'bg-red-500/20 border-red-500/30' },
              { label: '🏆 Recent Winners', route: '/winners', color: 'bg-yellow-500/20 border-yellow-500/30' },
              { label: '🎫 Buy Tickets', route: '/raffles', color: 'bg-green-500/20 border-green-500/30' },
              { label: '💬 Community', route: '/forum', color: 'bg-blue-500/20 border-blue-500/30' },
            ].map((link, index) => (
              <button
                key={index}
                onClick={() => navigate(link.route)}
                className={`${link.color} backdrop-blur-xl rounded-xl p-3 border hover:scale-[1.02] transition-all duration-200 text-left`}
              >
                <div className="text-sm font-medium text-white">{link.label}</div>
                <div className="text-xs text-white/60 mt-1">Tap to explore →</div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default React.memo(LoginRegister);