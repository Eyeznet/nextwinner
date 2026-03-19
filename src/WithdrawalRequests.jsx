// src/admin/WithdrawalRequests.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth, onAuthStateChanged, signOut,
} from 'firebase/auth';
import {
  getFirestore, collection, query, where,
  getDocs, doc, getDoc, updateDoc, serverTimestamp,
  orderBy, Timestamp, addDoc, writeBatch
} from 'firebase/firestore';
import { app } from './firebaseConfig';
import {
  ArrowLeft, CheckCircle, XCircle, Clock,
  AlertCircle, DollarSign, CreditCard, User,
  Mail, Phone, Shield, Building, FileText,
  ExternalLink, Download, Filter, Search,
  RefreshCw, ChevronDown, ChevronRight,
  Eye, EyeOff, Check, X, Calendar,
  MessageSquare, Banknote, Wallet, Users,
  TrendingUp, Award, Crown, Zap,
  BarChart3, Settings, LogOut, Home,
  Info, HelpCircle, Clipboard, Star,
  Trophy, Tag, Bell, Trash2, Edit,
  MoreVertical, AlertTriangle, Lock,
  Unlock, UserCheck, UserX, Wallet as WalletIcon,
  Percent, Target, TrendingDown, BarChart
} from 'lucide-react';

const auth = getAuth(app);
const db = getFirestore(app);

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') amount = Number(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString('en-NG', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return new Date(date).toLocaleDateString('en-NG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTimeAgo = (date) => {
  if (!date) return 'Recently';
  const timestamp = date instanceof Timestamp ? date.toDate() : new Date(date);
  const seconds = Math.floor((new Date() - timestamp) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
};

const WithdrawalRequests = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  console.log('🔧 WithdrawalRequests component mounted');
  console.log('🔧 Current user state:', user);
  console.log('🔧 Loading state:', loading);
  
 
  
  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalAmountPending: 0,
    totalAmountApproved: 0,
    totalAmountRejected: 0
  });

  // Check admin authentication
 // In WithdrawalRequests.jsx - Replace the entire useEffect authentication block with:
useEffect(() => {
  const loadUserAndRequests = async () => {
    try {
      const currentUser = auth.currentUser;
      console.log('👤 Current auth user:', currentUser);
      
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('✅ User data loaded:', userData);
          setUser({ uid: currentUser.uid, ...userData });
        }
      }
      
      await loadWithdrawalRequests();
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  loadUserAndRequests();
}, []);

  const loadWithdrawalRequests = async () => {
    try {
      setLoading(true);
      setError('');

      let withdrawalsQuery;
      const baseQuery = collection(db, 'withdrawals');

      if (filter === 'all') {
        withdrawalsQuery = query(baseQuery, orderBy('createdAt', 'desc'));
      } else {
        withdrawalsQuery = query(
          baseQuery,
          where('status', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(withdrawalsQuery);
      const requests = [];

      for (const docSnap of snapshot.docs) {
        const request = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt,
          updatedAt: docSnap.data().updatedAt
        };

        // Load user details
        try {
          const userDoc = await getDoc(doc(db, 'users', request.userId));
          if (userDoc.exists()) {
            request.user = {
              id: userDoc.id,
              ...userDoc.data()
            };
            
            // Load influencer data if available
            if (userDoc.data().accountType === 'influencer') {
              const influencerDoc = await getDoc(doc(db, 'influencers', userDoc.id));
              if (influencerDoc.exists()) {
                request.influencer = influencerDoc.data();
              }
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }

        requests.push(request);
      }

      // Apply search filter
      const filteredRequests = searchTerm 
        ? requests.filter(request => {
            const searchLower = searchTerm.toLowerCase();
            return (
              request.user?.displayName?.toLowerCase().includes(searchLower) ||
              request.user?.email?.toLowerCase().includes(searchLower) ||
              request.id.toLowerCase().includes(searchLower) ||
              request.bankName?.toLowerCase().includes(searchLower) ||
              request.accountNumber?.toLowerCase().includes(searchLower)
            );
          })
        : requests;

      setWithdrawals(filteredRequests);

      // Calculate stats
      const statsData = {
        totalPending: 0,
        totalApproved: 0,
        totalRejected: 0,
        totalAmountPending: 0,
        totalAmountApproved: 0,
        totalAmountRejected: 0
      };

      requests.forEach(request => {
        if (request.status === 'pending') {
          statsData.totalPending++;
          statsData.totalAmountPending += request.amount || 0;
        } else if (request.status === 'approved') {
          statsData.totalApproved++;
          statsData.totalAmountApproved += request.amount || 0;
        } else if (request.status === 'rejected') {
          statsData.totalRejected++;
          statsData.totalAmountRejected += request.amount || 0;
        }
      });

      setStats(statsData);

    } catch (error) {
      console.error('Error loading withdrawals:', error);
      setError('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

 const handleStatusUpdate = async (requestId, status, reason = '') => {
  if (!user) {
    setError('Admin authentication required');
    return;
  }

  setIsProcessing(true);
  setError('');
  setSuccess('');

  try {
    const requestRef = doc(db, 'withdrawals', requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Withdrawal request not found');
    }

    const requestData = requestDoc.data();
    const userId = requestData.userId;
    
    // Prepare update data
    const updateData = {
      status: status,
      processedBy: user.uid,
      processedByName: user.displayName || user.email,
      processedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (reason) {
      updateData.rejectionReason = reason;
    }

    // Start a batch write
    const batch = writeBatch(db);

    if (status === 'approved') {
      const payoutReference = `PAYOUT-${Date.now()}-${requestId.slice(-6)}`;
      const transactionReference = `TRANS-${Date.now()}-${requestId.slice(-6)}`;
      
      // Create payout record
      const payoutRef = doc(collection(db, 'payouts'));
      batch.set(payoutRef, {
        influencerId: userId,
        amount: requestData.amount,
        type: 'bank_transfer',
        status: 'paid',
        bankDetails: {
          bankName: requestData.bankName,
          accountNumber: requestData.accountNumber,
          accountName: requestData.accountName
        },
        reference: payoutReference,
        processedBy: user.uid,
        processedByName: user.displayName || user.email,
        paidAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        breakdown: requestData.breakdown || {},
        withdrawalId: requestId
      });

      // Update user balance - clear pending balance
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        pendingBalance: 0,
        updatedAt: serverTimestamp()
      });

      // Create transaction record
      const transactionRef = doc(collection(db, 'transactions'));
      batch.set(transactionRef, {
        userId: userId,
        type: 'payout',
        amount: requestData.amount,
        status: 'completed',
        description: 'Withdrawal approved and paid',
        reference: transactionReference,
        metadata: {
          withdrawalId: requestId,
          processedBy: user.uid,
          bankName: requestData.bankName,
          accountNumber: requestData.accountNumber
        },
        createdAt: serverTimestamp()
      });

      // Create notification for user
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, {
        userId: userId,
        title: 'Withdrawal Approved',
        message: `Your withdrawal of ${formatCurrency(requestData.amount)} has been approved and paid.`,
        type: 'payout',
        read: false,
        createdAt: serverTimestamp(),
        metadata: {
          amount: requestData.amount,
          withdrawalId: requestId,
          reference: payoutReference
        }
      });

      setSuccess(`Withdrawal request approved and paid successfully!`);
    
    } else if (status === 'rejected') {
      const refundReference = `REFUND-${Date.now()}-${requestId.slice(-6)}`;
      
      // Refund amount to user's available balance
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        balance: requestData.amount, // Add back to balance
        pendingBalance: 0, // Clear pending balance
        updatedAt: serverTimestamp()
      });

      // Create transaction record for refund
      const transactionRef = doc(collection(db, 'transactions'));
      batch.set(transactionRef, {
        userId: userId,
        type: 'refund',
        amount: requestData.amount,
        status: 'completed',
        description: `Withdrawal rejected: ${reason || 'No reason provided'}`,
        reference: refundReference,
        metadata: {
          withdrawalId: requestId,
          processedBy: user.uid,
          rejectionReason: reason || ''
        },
        createdAt: serverTimestamp()
      });

      // Create notification for user
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, {
        userId: userId,
        title: 'Withdrawal Rejected',
        message: `Your withdrawal of ${formatCurrency(requestData.amount)} was rejected. ${reason || ''}`,
        type: 'payout',
        read: false,
        createdAt: serverTimestamp(),
        metadata: {
          amount: requestData.amount,
          withdrawalId: requestId,
          reason: reason || ''
        }
      });

      setSuccess(`Withdrawal request rejected and amount refunded.`);
    }

    // Update withdrawal request
    batch.update(requestRef, updateData);

    // Commit all changes
    await batch.commit();

    // Refresh data
    await loadWithdrawalRequests();
    setSelectedRequest(null);

  } catch (error) {
    console.error('Error updating withdrawal:', error);
    setError(`Failed to update withdrawal: ${error.message}`);
  } finally {
    setIsProcessing(false);
  }
};

  const handleExportCSV = () => {
    const csvRows = [
      ['ID', 'User', 'Email', 'Amount', 'Bank', 'Account Number', 'Account Name', 'Status', 'Created', 'Processed By', 'Processed At']
    ];

    withdrawals.forEach(request => {
      csvRows.push([
        request.id,
        request.user?.displayName || 'N/A',
        request.user?.email || 'N/A',
        formatCurrency(request.amount),
        request.bankName || 'N/A',
        request.accountNumber || 'N/A',
        request.accountName || 'N/A',
        request.status,
        formatDate(request.createdAt),
        request.processedByName || 'N/A',
        request.processedAt ? formatDate(request.processedAt) : 'N/A'
      ]);
    });

    const csvString = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `withdrawal_requests_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    setSuccess('Data exported successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'paid': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'paid': return <DollarSign className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-900/80 rounded-2xl border border-red-500/30 max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/admin-login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Withdrawal Requests</h1>
                <p className="text-sm text-gray-400">Manage and process payout requests</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                  {user?.displayName?.charAt(0) || 'A'}
                </div>
                <div className="text-sm hidden md:block">
                  <p className="font-medium">{user?.displayName}</p>
                  <p className="text-gray-400">Admin</p>
                </div>
              </div>
              <button
                onClick={() => signOut(auth).then(() => navigate('/admin-login'))}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 p-4 rounded-xl border border-yellow-800/50">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Pending Requests</p>
                <p className="text-xl font-bold">{stats.totalPending}</p>
                <p className="text-xs text-yellow-400">{formatCurrency(stats.totalAmountPending)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 p-4 rounded-xl border border-green-800/50">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Approved</p>
                <p className="text-xl font-bold">{stats.totalApproved}</p>
                <p className="text-xs text-green-400">{formatCurrency(stats.totalAmountApproved)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900/50 to-pink-900/50 p-4 rounded-xl border border-red-800/50">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Rejected</p>
                <p className="text-xl font-bold">{stats.totalRejected}</p>
                <p className="text-xs text-red-400">{formatCurrency(stats.totalAmountRejected)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or bank..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={loadWithdrawalRequests}
                className="p-2 hover:bg-gray-800 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Withdrawal Requests Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-400">Loading withdrawal requests...</p>
            </div>
          ) : withdrawals.length > 0 ? (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/50">
                      <th className="text-left p-4">User</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Bank Details</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((request) => (
                      <tr key={request.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                              {request.user?.displayName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-medium">{request.user?.displayName || 'Unknown User'}</p>
                              <p className="text-sm text-gray-400">{request.user?.email || 'No email'}</p>
                              {request.user?.accountType === 'influencer' && (
                                <span className="text-xs text-yellow-400">Influencer</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-xl font-bold text-green-400">
                            {formatCurrency(request.amount)}
                          </p>
                          {request.user?.balance !== undefined && (
                            <p className="text-xs text-gray-400">
                              Balance: {formatCurrency(request.user.balance)}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{request.bankName}</p>
                            <p className="text-sm text-gray-400">
                              {request.accountNumber ? `***${request.accountNumber.slice(-4)}` : 'N/A'} • {request.accountName}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="capitalize">{request.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{formatDate(request.createdAt)}</p>
                          <p className="text-xs text-gray-400">
                            {formatTimeAgo(request.createdAt)}
                          </p>
                        </td>
                        <td className="p-4">
                          {request.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatusUpdate(request.id, 'approved')}
                                disabled={isProcessing}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setSelectedRequest({ ...request, action: 'reject' })}
                                disabled={isProcessing}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => setSelectedRequest({ ...request, action: 'view' })}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedRequest({ ...request, action: 'view' })}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              View Details
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden">
                <div className="p-4 space-y-4">
                  {withdrawals.map((request) => (
                    <div key={request.id} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                            {request.user?.displayName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold">{request.user?.displayName || 'Unknown User'}</p>
                            <p className="text-sm text-gray-400">{request.user?.email}</p>
                            <div className={`px-2 py-1 rounded text-xs mt-1 inline-flex items-center gap-1 ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span className="capitalize">{request.status}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-green-400">
                          {formatCurrency(request.amount)}
                        </p>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Bank:</span>
                          <span className="font-medium">{request.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Account:</span>
                          <span className="font-medium">***{request.accountNumber?.slice(-4) || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Name:</span>
                          <span className="font-medium">{request.accountName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date:</span>
                          <span className="font-medium">{formatDate(request.createdAt)}</span>
                        </div>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'approved')}
                            disabled={isProcessing}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setSelectedRequest({ ...request, action: 'reject' })}
                            disabled={isProcessing}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setSelectedRequest({ ...request, action: 'view' })}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium"
                          >
                            View
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No withdrawal requests found</p>
              <p className="text-sm text-gray-500 mt-1">
                {filter !== 'all' ? `No ${filter} requests` : 'No withdrawal requests yet'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {selectedRequest.action === 'view' ? 'Withdrawal Details' : 
                   selectedRequest.action === 'reject' ? 'Reject Withdrawal' : 'Review Request'}
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* User Information */}
              <div className="bg-gray-800/50 rounded-xl p-5 mb-6">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  User Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-xl font-bold">
                      {selectedRequest.user?.displayName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{selectedRequest.user?.displayName}</p>
                      <p className="text-gray-400">{selectedRequest.user?.email}</p>
                      <p className="text-sm">
                        <span className={`px-2 py-1 rounded ${selectedRequest.user?.accountType === 'influencer' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {selectedRequest.user?.accountType || 'user'}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">User ID:</span>
                      <span className="font-mono text-sm">{selectedRequest.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone:</span>
                      <span>{selectedRequest.user?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Joined:</span>
                      <span>{formatDate(selectedRequest.user?.createdAt)}</span>
                    </div>
                    {selectedRequest.user?.influencerData && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Influencer Tier:</span>
                        <span className="text-yellow-400">{selectedRequest.user.influencerData.tier || 'Bronze'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-5 mb-6 border border-purple-800/50">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  Bank Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Bank Name</p>
                    <p className="font-bold text-lg">{selectedRequest.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Account Number</p>
                    <p className="font-bold text-lg font-mono">{selectedRequest.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Account Name</p>
                    <p className="font-bold text-lg">{selectedRequest.accountName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Account Type</p>
                    <p className="font-bold">{selectedRequest.accountType || 'Savings'}</p>
                  </div>
                </div>
              </div>

              {/* Withdrawal Details */}
              <div className="bg-gray-800/50 rounded-xl p-5 mb-6">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Withdrawal Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Amount</p>
                    <p className="text-3xl font-bold text-green-400">
                      {formatCurrency(selectedRequest.amount)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Status</p>
                    <div className={`px-4 py-2 rounded-full text-lg inline-flex items-center gap-2 ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="capitalize">{selectedRequest.status}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Request Date</p>
                    <p className="text-lg font-bold">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                </div>
                
                {selectedRequest.breakdown && (
                  <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                    <h5 className="font-bold mb-2">Breakdown</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ticket Commissions:</span>
                        <span className="text-green-400">
                          {formatCurrency(selectedRequest.breakdown.ticketCommissions || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Prize Bonuses:</span>
                        <span className="text-purple-400">
                          {formatCurrency(selectedRequest.breakdown.prizeBonuses || 0)}
                        </span>
                      </div>
                      <div className="border-t border-gray-700 pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{formatCurrency(selectedRequest.amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedRequest.action === 'reject' && (
                <div className="bg-gradient-to-br from-red-900/20 to-pink-900/20 rounded-xl p-5 mb-6 border border-red-800/50">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    Rejection Reason
                  </h4>
                  <textarea
                    id="rejectionReason"
                    placeholder="Enter reason for rejection (optional)"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4"
                    rows="3"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const reason = document.getElementById('rejectionReason').value;
                        handleStatusUpdate(selectedRequest.id, 'rejected', reason);
                      }}
                      disabled={isProcessing}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Reject Withdrawal
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {selectedRequest.action === 'view' && selectedRequest.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Approve & Pay
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedRequest({ ...selectedRequest, action: 'reject' })}
                    disabled={isProcessing}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}

              {selectedRequest.action === 'view' && selectedRequest.status !== 'pending' && (
                <div className="text-center">
                  <p className="text-gray-400 mb-4">
                    This request was {selectedRequest.status} on {formatDate(selectedRequest.processedAt)}
                  </p>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>{success}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequests;