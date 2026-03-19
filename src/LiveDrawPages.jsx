// src/pages/LiveDrawPages.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import {
  subscribeToActiveDraws,
  subscribeToRecentWinners,
  subscribeToUpcomingRaffles,
  subscribeToRaffleDetails,
  subscribeToTicketsCount,
  formatCurrency,
  formatDate,
  formatTimeAgo,
  checkActiveDraw,
  getLatestWinner,
  getDrawState,
  subscribeToDrawState,
  db
} from './firebaseConfig';

// Firebase imports
import { 
  doc, onSnapshot, collection, query, where, 
  getDocs, deleteDoc, orderBy, limit 
} from 'firebase/firestore';

// Icons
import { 
  Radio, Calendar, Trophy, ChevronLeft, RefreshCw, Volume2, VolumeX, 
  Maximize2, Share2, Eye, ShoppingCart, Award, Zap, Target, 
  Phone, Mail, MapPin, Clock, User, Gift, DollarSign, Users,
  AlertCircle, Trash2, Image as ImageIcon, X, Home, MessageCircle, Ticket
} from 'lucide-react';

// ==================== COUNTDOWN TIMER COMPONENT ====================
const CountdownTimer = ({ endTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: '00', seconds: '00' });
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    if (!endTime) return;

    const updateTimer = () => {
      const end = new Date(endTime);
      const now = new Date();
      const diffMs = end - now;
      
      if (diffMs <= 0) {
        setTimeLeft({ minutes: '00', seconds: '00' });
        if (!isExpired) {
          setIsExpired(true);
          if (onComplete) onComplete();
        }
        return;
      }
      
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      
      setTimeLeft({
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      });
      setIsExpired(false);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onComplete, isExpired]);

  return (
    <div className={`text-center ${isExpired ? 'opacity-70' : ''}`}>
      <div className="flex justify-center items-center gap-1 mb-2">
        <div className="flex flex-col items-center">
          <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-mono bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            {timeLeft.minutes}
          </div>
          <div className="text-xs sm:text-sm text-white/60 mt-1">MINUTES</div>
        </div>
        <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white/50 pb-6 sm:pb-8">:</div>
        <div className="flex flex-col items-center">
          <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-mono bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            {timeLeft.seconds}
          </div>
          <div className="text-xs sm:text-sm text-white/60 mt-1">SECONDS</div>
        </div>
      </div>
      <div className={`text-sm sm:text-base font-medium ${isExpired ? 'text-green-400' : 'text-yellow-300'}`}>
        {isExpired ? '🎉 DRAW COMPLETED! 🎉' : '⏰ DRAW ENDS IN'}
      </div>
    </div>
  );
};

// ==================== RAFFLE IMAGE DISPLAY ====================
const RaffleImage = ({ raffle, className = "w-full h-48 object-cover" }) => {
  const [imageError, setImageError] = useState(false);
  
  // Get image from multiple possible fields
  const imageUrl = raffle?.image || raffle?.imageUrl || raffle?.mainImage || 
                   raffle?.thumbnail || raffle?.photoUrl;
  
  if (!imageUrl || imageError) {
    return (
      <div className={`${className} bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center rounded-xl`}>
        <ImageIcon className="text-white/40" size={48} />
      </div>
    );
  }
  
  return (
    <img
      src={imageUrl}
      alt={raffle?.title || "Raffle"}
      className={`${className} rounded-xl`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

// ==================== WINNER CARD COMPONENT ====================
const WinnerCard = ({ winner, isNew = false }) => {
  return (
    <div className={`bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border ${isNew ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20 animate-pulse' : 'border-yellow-500/20'} rounded-2xl p-4 sm:p-5`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
              <Award size={24} className="text-yellow-400" />
            </div>
            {isNew && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-xs font-bold">NEW</span>
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-lg sm:text-xl">🎫 Ticket #{winner.ticketNumber}</div>
            <div className="text-sm text-white/60">Won {formatTimeAgo(winner.date)}</div>
            {winner.raffleTitle && (
              <div className="text-xs text-purple-400 mt-1">🏆 {winner.raffleTitle}</div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl sm:text-2xl font-bold text-yellow-400">
            {formatCurrency(winner.prize?.value || 0)}
          </div>
          <div className="text-sm text-white/60">{winner.prize?.name || 'Cash Prize'}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-white/60 mb-1">👤 Winner</div>
          <div className="font-medium truncate">{winner.userName || winner.userEmail?.split('@')[0] || 'Anonymous'}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-white/60 mb-1">📧 Email</div>
          <div className="font-medium truncate">{winner.userEmail || 'Not provided'}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-white/60 mb-1">📍 Location</div>
          <div className="font-medium truncate">{winner.userLocation || winner.userCity || 'Not specified'}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-white/60 mb-1">📅 Win Date</div>
          <div className="font-medium">{formatDate(winner.date)}</div>
        </div>
      </div>
    </div>
  );
};

// ==================== UPCOMING RAFFLE CARD ====================
const UpcomingRaffleCard = ({ raffle }) => {
  const navigate = useNavigate();
  
  // Get the actual value from raffle data
  const raffleValue = raffle.value || ((raffle.ticketPrice || 0) * (raffle.totalTickets || 100));
  
  const drawDate = raffle.drawDate?.toDate?.() || raffle.drawDate;
  const timeUntil = drawDate ? new Date(drawDate) - new Date() : null;
  const hoursUntil = timeUntil ? Math.floor(timeUntil / (1000 * 60 * 60)) : null;
  const minutesUntil = timeUntil ? Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60)) : null;
  
  const ticketsSold = raffle.ticketsSold || 0;
  const totalTickets = raffle.totalTickets || 100;
  const progress = Math.min((ticketsSold / totalTickets) * 100, 100);
  const remainingTickets = totalTickets - ticketsSold;
  
  return (
    <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-xl p-3 border border-white/12 hover:border-purple-500/40 transition-all duration-300">
      {/* Raffle Image */}
      <div className="mb-3">
        <RaffleImage raffle={raffle} className="w-full h-32 object-cover" />
      </div>
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[15px] leading-tight truncate">
            {raffle.title}
          </div>
          <div className="text-[11px] text-white/60 leading-none">
            {raffle.category || 'General Raffle'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-yellow-400 mt-[2px]">
            <Calendar size={13} />
            <span>Draw {formatDate(raffle.drawDate)}</span>
          </div>
        </div>
      </div>

      {/* Prize Value - USING ACTUAL VALUE FIELD */}
      <div className="mb-2">
        <div className="text-[11px] text-white/70 leading-none mb-[2px]">
          🏆 Prize Value
        </div>
        <div className="text-lg font-bold text-yellow-400 text-center leading-tight">
          {formatCurrency(raffleValue)}
        </div>
      </div>

      {/* Time Until Draw */}
      {hoursUntil !== null && hoursUntil >= 0 && (
        <div className="mb-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg px-2 py-1.5">
          <div className="text-[11px] text-white/70 leading-none mb-[2px]">
            ⏰ Draw starts in
          </div>
          <div className="text-lg font-bold text-center leading-tight">
            {hoursUntil > 0
              ? `${hoursUntil}h ${minutesUntil}m`
              : `${minutesUntil}m`}
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-2">
        <div className="flex justify-between text-[11px] text-white/60 leading-none mb-[2px]">
          <span>Tickets</span>
          <span>{progress.toFixed(1)}%</span>
        </div>

        <div className="h-[5px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-white/60 leading-none mt-[2px]">
          <span>{ticketsSold} sold</span>
          <span>{remainingTickets} left</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-[3px]">
        <button
          onClick={() => navigate(`/raffle/${raffle.id}`)}
          className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-[12px] font-semibold flex items-center justify-center gap-1 hover:opacity-90"
        >
          <ShoppingCart size={14} />
          Buy Ticket
        </button>

        <button
          onClick={() => {
            if (drawDate) {
              const event = new window.Event('addToCalendar');
              event.detail = {
                title: raffle.title,
                start: drawDate,
                description: `Don't miss the ${raffle.title} raffle draw!`,
                location: 'NextWinner Platform'
              };
              window.dispatchEvent(event);
            }
          }}
          className="px-2 py-1.5 rounded-lg bg-white/12 border border-white/15 hover:bg-white/20 flex items-center justify-center"
        >
          <Calendar size={14} />
        </button>
      </div>
    </div>
  );
};

// ==================== LIVE ANNOUNCEMENT COMPONENT ====================
const LiveAnnouncement = ({ announcement, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  
  useEffect(() => {
    // Auto-hide confetti after 15 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!announcement) return null;
  
  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          gravity={0.15}
          colors={['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#9370DB', '#00CED1']}
        />
      )}
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
        <div className="bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full border-2 border-yellow-500/50 shadow-2xl">
          <div className="p-6 sm:p-8 text-center">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-all"
            >
              <X size={24} />
            </button>
            
            {/* Celebration Header */}
            <div className="text-5xl sm:text-6xl mb-4 animate-bounce">🎉</div>
            
            {/* Title */}
            <div className="font-black text-2xl sm:text-3xl text-yellow-400 mb-4">
              🎉 WINNER ANNOUNCED! 🎉
            </div>
            
            {/* Message */}
            <div className="text-lg sm:text-xl mb-6 text-white/90">
              Congratulations to our lucky winner!
            </div>
            
            {/* Winner Details */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-white/60 mb-1">🎫 Ticket Number</div>
                  <div className="text-2xl font-bold font-mono text-white">
                    #{announcement.ticketNumber || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-white/60 mb-1">👤 Winner Name</div>
                  <div className="text-2xl font-bold text-white">
                    {announcement.userName || 'Winner'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-white/60 mb-1">💰 Prize Value</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {formatCurrency(announcement.prizeValue || 0)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-white/60 mb-1">🏆 Raffle</div>
                  <div className="text-xl font-bold text-purple-400">
                    {announcement.raffleTitle || 'Current Raffle'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <button 
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300"
            >
              Continue Watching Live Draw
            </button>
            
            {/* Note */}
            <div className="mt-4 text-sm text-white/60">
              Winner verification will begin shortly
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ==================== MAIN LIVE DRAW PAGE ====================
const LiveDrawPages = () => {
  const navigate = useNavigate();
  
  // State Management
  const [activeDraws, setActiveDraws] = useState([]);
  const [activeDraw, setActiveDraw] = useState(null);
  const [recentWinners, setRecentWinners] = useState([]);
  const [upcomingRaffles, setUpcomingRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [ticketsCount, setTicketsCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volumeOn, setVolumeOn] = useState(true);
  const [viewMode, setViewMode] = useState('live');
  const [raffleDetails, setRaffleDetails] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Fixed: Added missing state
  
  // Live Announcement State
  const [liveAnnouncement, setLiveAnnouncement] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [lastAnnouncementId, setLastAnnouncementId] = useState('');
  
  // Refs
  const announcementsProcessed = useRef(new Set());
  const drawStateUnsubscribe = useRef(null);
  
  // Authentication check
  useEffect(() => {
    // Check if user is logged in (simplified version)
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true' || 
                         localStorage.getItem('userToken') ||
                         sessionStorage.getItem('userToken');
    setIsLoggedIn(!!userLoggedIn);
  }, []);
  
  // Cleanup function for completed draws
  const cleanupCompletedDraw = useCallback(async (raffleId) => {
    try {
      console.log('🧹 Cleaning up completed draw:', raffleId);
      
      // Clear draw state from Firestore
      const drawStateRef = doc(db, 'drawStates', raffleId);
      await deleteDoc(drawStateRef);
      
      // Clear local storage
      localStorage.removeItem(`drawTimer_${raffleId}`);
      
      // Clear processed announcements
      announcementsProcessed.current.clear();
      
      // Update state
      setActiveDraws(prev => prev.filter(draw => draw.raffleId !== raffleId));
      setActiveDraw(null);
      setLiveAnnouncement(null);
      setShowAnnouncement(false);
      
    } catch (error) {
      console.error('Error cleaning up draw:', error);
    }
  }, []);
  
  // Subscribe to active draws with error handling
  useEffect(() => {
    let unsubscribeActiveDraws;
    
    const setupActiveDrawsSubscription = async () => {
      try {
        if (!subscribeToActiveDraws) {
          console.error('subscribeToActiveDraws is not defined');
          setLoading(false);
          return;
        }
        
        unsubscribeActiveDraws = subscribeToActiveDraws((draws) => {
          console.log('Active draws received:', draws.length);
          setActiveDraws(draws);
          
          if (draws.length > 0) {
            setActiveDraw(draws[0]);
          } else {
            setActiveDraw(null);
          }
          
          setLoading(false);
        }, (error) => {
          console.error('Error in active draws subscription:', error);
          setLoading(false);
        });
        
      } catch (error) {
        console.error('Failed to setup active draws subscription:', error);
        setLoading(false);
      }
    };
    
    setupActiveDrawsSubscription();
    
    return () => {
      if (unsubscribeActiveDraws) {
        unsubscribeActiveDraws();
      }
    };
  }, []);
  
  // Subscribe to recent winners with error handling
  useEffect(() => {
    let unsubscribeRecentWinners;
    
    const setupRecentWinnersSubscription = async () => {
      try {
        if (!subscribeToRecentWinners) {
          console.error('subscribeToRecentWinners is not defined');
          return;
        }
        
        unsubscribeRecentWinners = subscribeToRecentWinners((winners) => {
          setRecentWinners(winners);
        }, (error) => {
          console.error('Error in recent winners subscription:', error);
        });
        
      } catch (error) {
        console.error('Failed to setup recent winners subscription:', error);
      }
    };
    
    setupRecentWinnersSubscription();
    
    return () => {
      if (unsubscribeRecentWinners) {
        unsubscribeRecentWinners();
      }
    };
  }, []);
  
  // Subscribe to upcoming raffles with error handling
  useEffect(() => {
    let unsubscribeUpcomingRaffles;
    
    const setupUpcomingRafflesSubscription = async () => {
      try {
        if (!subscribeToUpcomingRaffles) {
          console.error('subscribeToUpcomingRaffles is not defined');
          return;
        }
        
        unsubscribeUpcomingRaffles = subscribeToUpcomingRaffles((raffles) => {
          setUpcomingRaffles(raffles);
        }, (error) => {
          console.error('Error in upcoming raffles subscription:', error);
        });
        
      } catch (error) {
        console.error('Failed to setup upcoming raffles subscription:', error);
      }
    };
    
    setupUpcomingRafflesSubscription();
    
    return () => {
      if (unsubscribeUpcomingRaffles) {
        unsubscribeUpcomingRaffles();
      }
    };
  }, []);
  
  // Subscribe to raffle details
  useEffect(() => {
    if (!activeDraw?.raffleId) return;
    
    let unsubscribeRaffleDetails;
    
    const setupRaffleDetailsSubscription = async () => {
      try {
        if (!subscribeToRaffleDetails) {
          console.error('subscribeToRaffleDetails is not defined');
          return;
        }
        
        unsubscribeRaffleDetails = subscribeToRaffleDetails(activeDraw.raffleId, (raffle) => {
          setRaffleDetails(raffle);
        }, (error) => {
          console.error('Error in raffle details subscription:', error);
        });
        
      } catch (error) {
        console.error('Failed to setup raffle details subscription:', error);
      }
    };
    
    setupRaffleDetailsSubscription();
    
    return () => {
      if (unsubscribeRaffleDetails) {
        unsubscribeRaffleDetails();
      }
    };
  }, [activeDraw?.raffleId]);
  
  // Subscribe to tickets count
  useEffect(() => {
    if (!activeDraw?.raffleId) return;
    
    let unsubscribeTicketsCount;
    
    const setupTicketsCountSubscription = async () => {
      try {
        if (!subscribeToTicketsCount) {
          console.error('subscribeToTicketsCount is not defined');
          return;
        }
        
        unsubscribeTicketsCount = subscribeToTicketsCount(activeDraw.raffleId, (count) => {
          setTicketsCount(count);
        }, (error) => {
          console.error('Error in tickets count subscription:', error);
        });
        
      } catch (error) {
        console.error('Failed to setup tickets count subscription:', error);
      }
    };
    
    setupTicketsCountSubscription();
    
    return () => {
      if (unsubscribeTicketsCount) {
        unsubscribeTicketsCount();
      }
    };
  }, [activeDraw?.raffleId]);
  
  // Subscribe to draw state for live announcements
  useEffect(() => {
    if (!activeDraw?.raffleId) {
      if (drawStateUnsubscribe.current) {
        drawStateUnsubscribe.current();
        drawStateUnsubscribe.current = null;
      }
      return;
    }
    
    const drawStateRef = doc(db, 'drawStates', activeDraw.raffleId);
    
    const unsubscribe = onSnapshot(
      drawStateRef,
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          console.log('No draw state found');
          return;
        }
        
        const drawState = docSnapshot.data();
        console.log('Draw state updated:', drawState);
        
        // Check if draw is completed
        if (drawState.status === 'completed') {
          console.log('Draw completed, cleaning up...');
          setTimeout(() => {
            cleanupCompletedDraw(activeDraw.raffleId);
          }, 5000); // Wait 5 seconds before cleanup
          return;
        }
        
        // Check for new winner announcement
        if (drawState.currentWinner && drawState.liveAnnouncement?.show) {
          const announcementId = `${drawState.raffleId}_${drawState.currentWinner.ticketNumber}_${drawState.liveAnnouncement.timestamp}`;
          
          // Only process if we haven't seen this announcement before
          if (!announcementsProcessed.current.has(announcementId)) {
            announcementsProcessed.current.add(announcementId);
            
            setLiveAnnouncement({
              ticketNumber: drawState.currentWinner.ticketNumber,
              userName: drawState.currentWinner.userName,
              prizeValue: drawState.currentWinner.prizeValue,
              raffleTitle: drawState.raffleTitle,
              timestamp: drawState.liveAnnouncement.timestamp
            });
            
            setShowAnnouncement(true);
            setLastAnnouncementId(announcementId);
            
            // Auto-hide announcement after 20 seconds
            setTimeout(() => {
              setShowAnnouncement(false);
            }, 20000);
          }
        }
      },
      (error) => {
        console.error('Draw state listener error:', error);
      }
    );
    
    drawStateUnsubscribe.current = unsubscribe;
    
    return () => {
      if (drawStateUnsubscribe.current) {
        drawStateUnsubscribe.current();
        drawStateUnsubscribe.current = null;
      }
    };
  }, [activeDraw?.raffleId, cleanupCompletedDraw]);
  
  // Loading timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout reached - forcing state to false');
        setLoading(false);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);
  
  // Handle countdown completion
  const handleCountdownComplete = useCallback(() => {
    if (volumeOn) {
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-completion-of-a-level-2063.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    }
  }, [volumeOn]);
  
  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);
  
  // Share function
  const shareLiveDraw = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: '🎥 Live Draw in Progress!',
        text: `Watch "${activeDraw?.raffleTitle}" live draw happening now on NextWinner!`,
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }, [activeDraw]);
  
  // Manual cleanup button
  const handleManualCleanup = useCallback(async () => {
    if (!activeDraw?.raffleId) {
      alert('No active draw to cleanup');
      return;
    }
    
    if (window.confirm('Are you sure you want to cleanup this draw? This will clear all announcements.')) {
      await cleanupCompletedDraw(activeDraw.raffleId);
      alert('Draw cleaned up successfully!');
    }
  }, [activeDraw?.raffleId, cleanupCompletedDraw]);
  
  // Get actual raffle value
  const getRaffleValue = useCallback(() => {
    if (!raffleDetails) return 0;
    
    // First try to get the actual value field
    if (raffleDetails.value !== undefined) {
      return raffleDetails.value;
    }
    
    // Fallback to calculated value
    return (raffleDetails.ticketPrice || 0) * (raffleDetails.totalTickets || 100);
  }, [raffleDetails]);
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg mb-2">Loading Live Draw...</div>
          <div className="text-sm text-white/60">Connecting to real-time updates</div>
          <button 
            onClick={() => {
              console.log('Manual loading skip');
              setLoading(false);
            }}
            className="mt-4 px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-all duration-300 font-medium"
          >
            Skip Loading
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      
      
      {/* Live Announcement Modal */}
      {showAnnouncement && liveAnnouncement && (
        <LiveAnnouncement 
          announcement={liveAnnouncement}
          onClose={() => setShowAnnouncement(false)}
        />
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-2xl border-b border-white/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')}
                className="p-2 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                aria-label="Go back"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <div className="text-sm text-white/80">NextWinner</div>
                <div className="font-black text-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  LIVE DRAW CENTER
                </div>
                {activeDraw && (
                  <div className="text-xs text-green-400 mt-1">
                    Current: {activeDraw.raffleTitle}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setVolumeOn(!volumeOn)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                title={volumeOn ? 'Mute sounds' : 'Unmute sounds'}
              >
                {volumeOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button 
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                <Maximize2 size={20} />
              </button>
              <button 
                onClick={shareLiveDraw}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                title="Share live draw"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* View Mode Toggle */}
      <div className="sticky top-16 z-30 bg-gradient-to-b from-gray-900/80 to-transparent backdrop-blur-lg px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setViewMode('live')}
            className={`flex-1 min-w-[100px] py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              viewMode === 'live'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/40'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Radio size={18} />
              <span>Live Draw</span>
              {activeDraw && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </button>
          <button
            onClick={() => setViewMode('upcoming')}
            className={`flex-1 min-w-[100px] py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              viewMode === 'upcoming'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/40'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar size={18} />
              <span>Upcoming</span>
              {upcomingRaffles.length > 0 && (
                <span className="text-xs bg-blue-500/20 px-1.5 py-0.5 rounded-full">
                  {upcomingRaffles.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setViewMode('winners')}
            className={`flex-1 min-w-[100px] py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              viewMode === 'winners'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/40'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy size={18} />
              <span>Winners</span>
              {recentWinners.length > 0 && (
                <span className="text-xs bg-green-500/20 px-1.5 py-0.5 rounded-full">
                  {recentWinners.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="px-4 pb-24">
        {/* LIVE DRAW VIEW */}
        {viewMode === 'live' && (
          <>
            {activeDraw ? (
              <div className="space-y-6 animate-fadeIn">
                {/* Live Draw Status Banner */}
                <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-2 border-yellow-500/40 rounded-2xl p-4 text-center animate-pulse">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-yellow-300 text-sm sm:text-base">🎥 LIVE DRAW IN PROGRESS</span>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black mb-1">{activeDraw.raffleTitle}</div>
                  <div className="text-sm text-yellow-300">Watch winner selection in real-time!</div>
                </div>

                {/* Raffle Image */}
                {raffleDetails && (
                  <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-2xl rounded-2xl p-4 border border-white/20">
                    <RaffleImage raffle={raffleDetails} className="w-full h-64 sm:h-80 object-cover" />
                  </div>
                )}

                {/* Big Countdown Timer Section */}
                <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl">
                  <div className="text-center mb-6">
                    <div className="text-sm sm:text-base text-white/60 mb-2">⏳ COUNTDOWN TO DRAW END</div>
                    <CountdownTimer 
                      endTime={activeDraw.drawEndTime} 
                      onComplete={handleCountdownComplete}
                    />
                  </div>
                  
                  {/* Current Selection Display */}
                  {activeDraw.currentTicket && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-2xl p-4 sm:p-5 text-center mb-6 animate-pulse">
                      <div className="text-sm sm:text-base text-green-400 mb-2 flex items-center justify-center gap-2">
                        <Zap size={16} /> 🎯 CURRENT SELECTION
                      </div>
                      <div className="text-4xl sm:text-5xl md:text-6xl font-black font-mono text-white mb-2">
                        #{activeDraw.currentTicket}
                      </div>
                    </div>
                  )}

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center hover:bg-white/10 transition-all">
                      <div className="text-xs sm:text-sm text-white/60 mb-1">🎟️ Total Tickets</div>
                      <div className="text-lg sm:text-xl font-bold">{raffleDetails?.totalTickets || 100}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center hover:bg-white/10 transition-all">
                      <div className="text-xs sm:text-sm text-white/60 mb-1">💰 Tickets Sold</div>
                      <div className="text-lg sm:text-xl font-bold text-green-400">
                        {ticketsCount}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center hover:bg-white/10 transition-all">
                      <div className="text-xs sm:text-sm text-white/60 mb-1">📊 Remaining</div>
                      <div className="text-lg sm:text-xl font-bold">
                        {(raffleDetails?.totalTickets || 100) - ticketsCount}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center hover:bg-white/10 transition-all">
                      <div className="text-xs sm:text-sm text-white/60 mb-1">🏆 Prize Value</div>
                      <div className="text-lg sm:text-xl font-bold text-yellow-400">
                        {formatCurrency(getRaffleValue())}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => navigate(`/raffle/${activeDraw.raffleId}`)}
                      className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Eye size={20} />
                      View Raffle Details
                    </button>
                    <button 
                      onClick={handleManualCleanup}
                      className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/40 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <AlertCircle size={20} />
                      Refresh after Draw to see next Draw!
                    </button>
                  </div>
                </div>

                {/* Recent Winners for This Draw */}
                {recentWinners.filter(w => w.raffleId === activeDraw.raffleId).length > 0 && (
                  <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/15">
                    <h3 className="font-bold text-lg sm:text-xl mb-4 flex items-center gap-2">
                      <Trophy size={24} className="text-yellow-400" />
                      🎉 Recent Winners for {activeDraw.raffleTitle}
                    </h3>
                    
                    <div className="space-y-4">
                      {recentWinners
                        .filter(winner => winner.raffleId === activeDraw.raffleId)
                        .slice(0, 3)
                        .map((winner, index) => (
                          <WinnerCard 
                            key={winner.id} 
                            winner={winner} 
                            isNew={index === 0}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🎥</div>
                <div className="font-bold mb-2">No Active Live Draw</div>
                <div className="text-sm text-white/60 mb-4">
                  There are no live draws right now. Check upcoming raffles or come back later.
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setViewMode('upcoming')}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition"
                  >
                    Upcoming Raffles
                  </button>
                  <button
                    onClick={() => navigate('/raffles')}
                    className="px-4 py-2 text-sm rounded-lg bg-white/12 border border-white/15 hover:bg-white/20 transition"
                  >
                    Browse All
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* UPCOMING RAFFLES VIEW */}
        {viewMode === 'upcoming' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-xl sm:text-2xl">Upcoming Raffles</h3>
                <div className="text-sm text-white/60">
                  Get your tickets before the draw starts!
                </div>
              </div>
              <div className="text-sm text-white/60">
                {upcomingRaffles.length} scheduled
              </div>
            </div>

            {upcomingRaffles.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {upcomingRaffles.map(raffle => (
                  <UpcomingRaffleCard key={raffle.id} raffle={raffle} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="text-6xl sm:text-7xl mb-4">📅</div>
                <div className="font-bold text-2xl sm:text-3xl mb-3">No Upcoming Raffles</div>
                <div className="text-sm sm:text-base text-white/60 mb-8 max-w-md mx-auto">
                  All raffles are either completed or currently live. Check back later for new raffle announcements!
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* WINNERS VIEW */}
        {viewMode === 'winners' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-xl sm:text-2xl">Recent Winners</h3>
                <div className="text-sm text-white/60">
                  Congratulations to all our winners! 🎉
                </div>
              </div>
              <div className="text-sm text-white/60">
                {recentWinners.length} winners total
              </div>
            </div>

            {recentWinners.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {recentWinners.map((winner, index) => (
                  <WinnerCard 
                    key={winner.id} 
                    winner={winner} 
                    isNew={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="text-6xl sm:text-7xl mb-4">🏆</div>
                <div className="font-bold text-2xl sm:text-3xl mb-3">No Winners Yet</div>
                <div className="text-sm sm:text-base text-white/60 mb-8 max-w-md mx-auto">
                  Winners will appear here as soon as draws are completed. Stay tuned!
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/15 backdrop-blur-2xl border-t border-white/25 z-40 py-1.5">
        <div className="flex">
          {[
            { id: 'home', label: 'Home', icon: Home, route: '/' },
            { id: 'raffles', label: 'Raffles', icon: Ticket, route: '/raffles'},
            { id: 'winners', label: 'Winners', icon: Trophy, route: '/winners' },
            { id: 'draw', label: 'Live', icon: Clock, route: '/live-draw', active: true },
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
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default LiveDrawPages;