// src/paystackUtils.jsx
import { getFirestore, increment, addDoc, serverTimestamp, updateDoc, doc, collection } from 'firebase/firestore';

// Paystack configuration
const PAYSTACK_PUBLIC_KEY = 'pk_test_8659b5b554f5e935476df72b2e0950d3b1f560ad'; // Replace with your actual public key

export const paystackUtils = {
  // Load Paystack script
  loadPaystackScript: () => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve(window.PaystackPop);
        return;
      }

      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      if (existingScript) {
        resolve(window.PaystackPop);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.PaystackPop) {
          resolve(window.PaystackPop);
        } else {
          reject(new Error('Paystack failed to load'));
        }
      };
      
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.body.appendChild(script);
    });
  },

  // Initialize Paystack payment for wallet funding
  initializeWalletFunding: async (user, amount, onSuccess, onClose) => {
    try {
      await paystackUtils.loadPaystackScript();
      
      const reference = `NXTWINNER_WALLET_${Date.now()}_${user.uid.slice(0, 8)}`;
      
      const handler = window.PaystackPop.setup({
  key: PAYSTACK_PUBLIC_KEY,
  email: user.email,
  amount: amount * 100,
  ref: reference,
  currency: 'NGN',
  metadata: {
    userId: user.uid,
    type: 'wallet_funding',
    amount: amount,
    userEmail: user.email
  },
  callback: function(response) {
    console.log('Payment successful:', response);
    
    // Call the success callback if it exists and is a function
    if (typeof onSuccess === 'function') {
      onSuccess(response, user, amount).catch(error => {
        console.error('Error in success callback:', error);
      });
    }
  },
  onClose: function() {
    console.log('Payment window closed');
    if (typeof onClose === 'function') {
      onClose();
    }
  }
});
      handler.openIframe();
      
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  },

  // Initialize Paystack payment for ticket purchase
  initializeTicketPurchase: async (user, raffle, quantity, amount, onSuccess, onClose) => {
    try {
      await paystackUtils.loadPaystackScript();
      
      const reference = `NXTWINNER_TICKET_${Date.now()}_${raffle.id.slice(0, 8)}`;
      
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: amount * 100, // Convert to kobo
        ref: reference,
        currency: 'NGN',
        metadata: {
          userId: user.uid,
          raffleId: raffle.id,
          ticketQuantity: quantity,
          raffleTitle: raffle.title,
          type: 'ticket_purchase'
        },
        callback: async (response) => {
          console.log('Payment successful:', response);
          
          try {
            // Call the success callback with payment response
            await onSuccess(response, user, raffle, quantity, amount);
          } catch (error) {
            console.error('Error processing successful payment:', error);
            throw error;
          }
        },
        onClose: () => {
          console.log('Payment window closed');
          if (onClose) onClose();
        }
      });

      handler.openIframe();
      
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  },

  // Create transaction record in Firebase
  createTransactionRecord: async (db, user, data) => {
    try {
      const transactionsRef = collection(db, 'transactions');
      const transactionData = {
        userId: user.uid,
        amount: data.amount,
        date: new Date().toISOString(),
        description: data.description,
        type: data.type, // 'wallet_funding' or 'ticket_purchase'
        status: 'completed',
        method: 'paystack',
        reference: data.reference,
        createdAt: serverTimestamp(),
        userEmail: user.email,
        ...(data.raffleId && { raffleId: data.raffleId }),
        ...(data.raffleTitle && { raffleTitle: data.raffleTitle }),
        ...(data.ticketQuantity && { ticketQuantity: data.ticketQuantity }),
        ...(data.ticketNumbers && { ticketNumbers: data.ticketNumbers })
      };

      const docRef = await addDoc(transactionsRef, transactionData);
      console.log('Transaction recorded:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Transaction record error:', error);
      throw error;
    }
  },

  // Update user wallet balance
  updateWalletBalance: async (db, userId, amount) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        balance: increment(amount),
        lastActivity: serverTimestamp()
      });
      console.log('Wallet balance updated by:', amount);
      return amount;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  },

  // Create tickets in database
  createTickets: async (db, user, raffle, quantity) => {
    const ticketNumbers = Array.from({ length: quantity }, (_, i) => 
      `NXTWINNER-${raffle.id.slice(0, 4)}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    );

    try {
      const ticketsRef = collection(db, 'tickets');
      const batchPromises = ticketNumbers.map(ticketNumber => 
        addDoc(ticketsRef, {
          ticketNumber,
          userId: user.uid,
          raffleId: raffle.id,
          raffleTitle: raffle.title,
          raffleValue: raffle.value,
          purchaseDate: serverTimestamp(),
          drawDate: raffle.drawDate,
          status: 'active',
          price: raffle.ticketPrice,
          paymentMethod: 'paystack'
        })
      );

      await Promise.all(batchPromises);
      console.log(`${quantity} tickets created`);
      return ticketNumbers;
    } catch (error) {
      console.error('Ticket creation error:', error);
      throw error;
    }
  },

  // Update raffle ticket count
  updateRaffleTickets: async (db, raffleId, quantity) => {
    try {
      const raffleRef = doc(db, 'raffles', raffleId);
      await updateDoc(raffleRef, {
        ticketsSold: increment(quantity),
        updatedAt: serverTimestamp()
      });
      console.log('Raffle tickets updated:', quantity);
    } catch (error) {
      console.error('Error updating raffle:', error);
      throw error;
    }
  },

  // Verify payment with Paystack (optional - for server-side verification)
  verifyPayment: async (reference) => {
    try {
      // Note: This requires a backend endpoint. You'll need to create an API route
      // that uses Paystack's secret key to verify payments securely
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });
      
      if (!response.ok) {
        throw new Error('Verification failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }
};

// Export individual functions for easier imports
export const loadPaystackScript = paystackUtils.loadPaystackScript;
export const initializeWalletFunding = paystackUtils.initializeWalletFunding;
export const initializeTicketPurchase = paystackUtils.initializeTicketPurchase;
export const createTransactionRecord = paystackUtils.createTransactionRecord;
export const updateWalletBalance = paystackUtils.updateWalletBalance;
export const createTickets = paystackUtils.createTickets;
export const updateRaffleTickets = paystackUtils.updateRaffleTickets;
export const verifyPayment = paystackUtils.verifyPayment;