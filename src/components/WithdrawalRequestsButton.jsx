import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const WithdrawalRequestsButton = ({ pendingCount = 0, pendingAmount = 0 }) => {
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') amount = Number(amount) || 0;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <button onClick={() => navigate('/admin/withdrawals')}
      className="relative group w-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 hover:from-purple-900/30 hover:to-blue-900/30 p-5 rounded-xl border border-purple-800/50 hover:border-purple-700/70 transition-all duration-300 hover:scale-[1.02] text-left"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {pendingCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
          <AlertCircle className="w-3 h-3" />
          {pendingCount}
        </div>
      )}
      
      <div className="relative z-10">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-4">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        
        <h3 className="font-bold text-lg mb-1">Withdrawal Requests</h3>
        <p className="text-sm text-gray-400 mb-3">Manage payout requests</p>
        
        <div className="space-y-2">
          {pendingCount > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Pending:</span>
                <span className="font-bold text-yellow-400">{pendingCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Amount:</span>
                <span className="font-bold text-green-400">
                  {formatCurrency(pendingAmount)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between text-sm text-green-400">
              <span>All clear</span>
              <TrendingUp className="w-4 h-4" />
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-400 group-hover:text-blue-300">
          <span>Manage requests</span>
          <div className="group-hover:translate-x-1 transition-transform duration-300">→</div>
        </div>
      </div>
    </button>
  );
};

export default WithdrawalRequestsButton;