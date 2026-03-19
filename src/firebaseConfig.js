// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
  addDoc
} from 'firebase/firestore';

// Your Firebase config
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

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount || 0);
};

// Format date
export const formatDate = (date) => {
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

// Format time ago
export const formatTimeAgo = (date) => {
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

// ==================== FIXED: Subscribe to Active Draws ====================
export const subscribeToActiveDraws = (callback) => {
  console.log('🎯 Subscribing to active draws...');
  
  const drawsQuery = query(
    collection(db, 'drawStates'),
    where('status', 'in', ['active', 'drawing']),
    orderBy('lastAction', 'desc'),
    limit(10)
  );
  
  const unsubscribe = onSnapshot(
    drawsQuery,
    (snapshot) => {
      const draws = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        };
      });
      
      console.log(`✅ Active draws: ${draws.length}`);
      callback(draws);
    },
    (error) => {
      console.error('❌ Error fetching active draws:', error);
      callback([]);
    }
  );
  
  return unsubscribe;
};

// ==================== FIXED: Subscribe to ALL Winners ====================
export const subscribeToRecentWinners = (callback) => {
  console.log('🏆 Subscribing to ALL winners...');
  
  const winnersQuery = query(
    collection(db, 'winners'),
    orderBy('date', 'desc'),
    limit(50)
  );
  
  const unsubscribe = onSnapshot(
    winnersQuery,
    (snapshot) => {
      const winners = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Log for debugging
        console.log('Winner found:', {
          id: doc.id,
          ticketNumber: data.ticketNumber || 'No ticket number',
          userName: data.userName || 'No name',
          raffleTitle: data.raffleTitle || 'No raffle'
        });
        
        return {
          id: doc.id,
          ticketNumber: data.ticketNumber || 'N/A',
          userName: data.userName || data.userEmail?.split('@')[0] || 'Anonymous',
          userEmail: data.userEmail || 'Not provided',
          userPhone: data.userPhone || 'Not provided',
          userLocation: data.userLocation || data.userCity || 'Not specified',
          raffleTitle: data.raffleTitle || 'Unknown Raffle',
          raffleId: data.raffleId,
          prize: data.prize || { name: 'Cash Prize', value: 0 },
          date: data.date,
          timestamp: data.timestamp,
          isoDate: data.isoDate,
          humanDate: data.humanDate
        };
      });
      
      console.log(`✅ Total winners loaded: ${winners.length}`);
      callback(winners);
    },
    (error) => {
      console.error('❌ Error fetching winners:', error);
      console.error('Error details:', error.message);
      callback([]);
    }
  );
  
  return unsubscribe;
};

// ==================== Subscribe to Upcoming Raffles ====================
export const subscribeToUpcomingRaffles = (callback) => {
  const rafflesQuery = query(
    collection(db, 'raffles'),
    where('status', 'in', ['upcoming', 'active']),
    orderBy('drawDate', 'asc'),
    limit(20)
  );
  
  const unsubscribe = onSnapshot(
    rafflesQuery,
    (snapshot) => {
      const raffles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(raffles);
    },
    (error) => {
      console.error('Error fetching upcoming raffles:', error);
      callback([]);
    }
  );
  
  return unsubscribe;
};

// ==================== Subscribe to Raffle Details ====================
export const subscribeToRaffleDetails = (raffleId, callback) => {
  if (!raffleId) return () => {};
  
  const raffleRef = doc(db, 'raffles', raffleId);
  
  const unsubscribe = onSnapshot(
    raffleRef,
    (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error fetching raffle details:', error);
      callback(null);
    }
  );
  
  return unsubscribe;
};

// ==================== Subscribe to Tickets Count ====================
export const subscribeToTicketsCount = (raffleId, callback) => {
  if (!raffleId) return () => {};
  
  const ticketsQuery = query(
    collection(db, 'tickets'),
    where('raffleId', '==', raffleId),
    where('status', '==', 'active')
  );
  
  const unsubscribe = onSnapshot(
    ticketsQuery,
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      console.error('Error fetching tickets count:', error);
      callback(0);
    }
  );
  
  return unsubscribe;
};

// ==================== Check Active Draw ====================
export const checkActiveDraw = async () => {
  try {
    const drawsQuery = query(
      collection(db, 'drawStates'),
      where('status', 'in', ['active', 'drawing']),
      limit(1)
    );
    
    const snapshot = await getDocs(drawsQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking active draw:', error);
    return false;
  }
};

// ==================== Get Latest Winner ====================
export const getLatestWinner = async (raffleId) => {
  try {
    const winnersQuery = query(
      collection(db, 'winners'),
      where('raffleId', '==', raffleId),
      orderBy('date', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(winnersQuery);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting latest winner:', error);
    return null;
  }
};

// ==================== Subscribe to Draw State ====================
export const subscribeToDrawState = (raffleId, callback) => {
  if (!raffleId) return () => {};
  
  const drawStateRef = doc(db, 'drawStates', raffleId);
  
  const unsubscribe = onSnapshot(
    drawStateRef,
    (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error fetching draw state:', error);
      callback(null);
    }
  );
  
  return unsubscribe;
};

// ==================== Get Draw State ====================
export const getDrawState = async (raffleId) => {
  try {
    const drawStateRef = doc(db, 'drawStates', raffleId);
    const docSnap = await getDoc(drawStateRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting draw state:', error);
    return null;
  }
};

// ==================== Send Live Draw Notification ====================
export const sendLiveDrawNotification = async (raffleId, message) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      type: 'live_draw',
      title: '🎥 Live Draw Update',
      message: message,
      raffleId: raffleId,
      createdAt: serverTimestamp(),
      forAll: true,
      read: false
    });
    
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Export db and app
export { db, app };