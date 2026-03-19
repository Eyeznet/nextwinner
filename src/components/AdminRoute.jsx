// src/components/AdminRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';

const auth = getAuth(app);
const db = getFirestore(app);

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Check for ALL admin types
            const adminCheck = 
              userData.accountType === 'admin' || 
              userData.accountType === 'super_admin' || 
              userData.isAdmin === true;
            
            console.log('🔍 AdminRoute - User data:', userData);
            console.log('🔍 AdminRoute - Account type:', userData.accountType);
            console.log('🔍 AdminRoute - Is admin?', adminCheck);
            
            setIsAdmin(adminCheck);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setAuthChecked(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  console.log('🚀 AdminRoute - Auth checked:', authChecked);
  console.log('🚀 AdminRoute - Is admin?', isAdmin);
  console.log('🚀 AdminRoute - Auth current user:', auth.currentUser);

  if (!authChecked || !isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default AdminRoute;