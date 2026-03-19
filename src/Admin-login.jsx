// Admin-login.jsx - FIXED VERSION
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  query,
  where,
  getDocs,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import { app } from './firebaseConfig';

const auth = getAuth(app);
const db = getFirestore(app);

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      console.log('Attempting login with:', email);
      
      // 1. Try to sign in to Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase Auth successful, UID:', user.uid);
      console.log('Email verified:', user.emailVerified);
      
      // 2. Check Firestore for user document
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      console.log('User document exists:', userDoc.exists());
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data:', userData);
        console.log('Account type:', userData.accountType);
        
        // Check if user is admin
        if (userData.accountType === 'admin' || userData.accountType === 'super_admin') {
          console.log('✅ Admin access granted');
          
          // Update last activity without overwriting other fields
          await setDoc(userDocRef, {
            lastActivity: serverTimestamp()
          }, { merge: true });
          
          // Navigate to admin dashboard
          navigate('/admin');
          return;
        } else {
          console.log('❌ Not an admin, logging out');
          setError('Access denied. Admin privileges required.');
          await auth.signOut();
        }
      } else {
        // User exists in Auth but not Firestore
        console.log('User exists in Auth but not Firestore');
        
        // Check if there's any user with this email in Firestore (different UID)
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const existingUser = querySnapshot.docs[0];
          const existingData = existingUser.data();
          
          console.log('Found user in Firestore with different UID');
          console.log('Firestore UID:', existingUser.id);
          console.log('Auth UID:', user.uid);
          
          if (existingData.accountType === 'admin' || existingData.accountType === 'super_admin') {
            // Create new document with Auth UID
            await setDoc(doc(db, 'users', user.uid), {
              ...existingData,
              uid: user.uid,
              migratedFrom: existingUser.id,
              lastActivity: serverTimestamp()
            });
            
            console.log('✅ Created new user document with Auth UID');
            navigate('/admin');
            return;
          }
        }
        
        // Create new admin document
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: email,
          displayName: 'System Administrator',
          accountType: 'super_admin',
          balance: 0,
          createdAt: serverTimestamp(),
          isEmailVerified: user.emailVerified,
          lastActivity: serverTimestamp()
        });
        
        console.log('✅ Created new admin document');
        navigate('/admin');
      }
      
    } catch (error) {
      console.error('Login error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. User might not exist in Firebase Authentication.');
      } else if (error.code === 'auth/user-not-found') {
        setError('User not found. Please create an admin account first.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Try again later.');
      } else {
        setError('Login failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('Creating admin account...');

    try {
      // Check if user already exists in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      let existingUser = null;
      if (!querySnapshot.empty) {
        existingUser = querySnapshot.docs[0];
        console.log('Found existing user in Firestore:', existingUser.id);
      }
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Auth user created, UID:', user.uid);
      
      // Create or update Firestore document
      const userData = {
        uid: user.uid,
        email: email,
        displayName: 'System Administrator',
        accountType: 'super_admin',
        balance: 0,
        createdAt: serverTimestamp(),
        isEmailVerified: false,
        lastActivity: serverTimestamp(),
        referralCode: 'ADMIN' + Math.random().toString(36).substr(2, 8).toUpperCase()
      };
      
      if (existingUser) {
        // Merge with existing data
        const existingData = existingUser.data();
        await setDoc(doc(db, 'users', user.uid), {
          ...existingData,
          ...userData,
          migratedFrom: existingUser.id
        }, { merge: true });
        
        console.log('✅ Merged with existing Firestore data');
      } else {
        // Create new document
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log('✅ Created new Firestore document');
      }
      
      setInfo('✅ Admin account created successfully! You can now login.');
      alert('Admin account created! You can now login.');
      
    } catch (error) {
      console.error('Create admin error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('This email already has an authentication account. Try logging in instead.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Error creating admin: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admin Portal
          </h1>
          <p className="text-white/60 mt-2">Super Admin Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40"
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
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}

          {info && (
            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
              <div className="text-sm text-green-400">{info}</div>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging in...
                </div>
              ) : 'Login as Admin'}
            </button>

            <button
              type="button"
              onClick={handleCreateAdmin}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50"
            >
              Create Admin Account
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-sm text-white/60 mb-2">Debug Info:</div>
          <ul className="text-xs text-white/60 space-y-1">
            <li>• Check browser console (F12) for detailed logs</li>
            <li>• Ensure user has 'admin' or 'super_admin' accountType</li>
            <li>• UIDs must match between Auth and Firestore</li>
          </ul>
        </div>

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

export default AdminLogin;