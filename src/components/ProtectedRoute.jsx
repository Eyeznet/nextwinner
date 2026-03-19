// src/components/ProtectedRoute.jsx - FINAL VERSION
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;
      
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.warn('Could not fetch user data (permissions may be restricted):', error.message);
          // Continue without user data - we'll check uid/email
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [auth, db]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white/80">Loading authentication...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check for admin access
  if (adminOnly) {
    const adminUids = [
      '40EhrqIR7kbOrskaIrNgVkIxYDp2', // Your admin UID
      'admin' // Fallback admin UID
    ];
    
    const adminEmails = [
      'idumozng@gmail.com', // Your email
      'admin@nextwinner.com'
    ];
    
    const accountType = userData?.accountType;
    
    // Multiple ways to check if admin
    const isAdmin = 
      adminUids.includes(user.uid) ||
      adminEmails.includes(user.email?.toLowerCase()) ||
      accountType === 'super_admin' ||
      accountType === 'admin' ||
      user.email?.toLowerCase().includes('admin');
    
    console.log('✅ Admin Access Check:', {
      uid: user.uid,
      email: user.email,
      accountType: accountType,
      isAdmin: isAdmin,
      matchedUid: adminUids.includes(user.uid),
      matchedEmail: adminEmails.includes(user.email?.toLowerCase())
    });
    
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
            <p className="text-gray-400 mb-6">
              You need administrator privileges to access this page.
            </p>
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-gray-400 mb-1">Your account:</p>
              <p className="font-mono text-xs mb-1">UID: {user.uid}</p>
              <p className="font-mono text-xs">Email: {user.email}</p>
              <p className="font-mono text-xs mt-1">Account Type: {accountType || 'Not found'}</p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    
    console.log('✅ ADMIN ACCESS GRANTED to:', user.email);
  }

  return children;
};

export default ProtectedRoute;