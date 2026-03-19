import React from 'react';

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
    <header className="fixed top-0 left-0 right-0 bg-white/12 backdrop-blur-2xl border-b border-white/20 z-50">
      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-500/90 to-orange-500/90 backdrop-blur-lg rounded-2xl flex items-center justify-center">
              <div className="w-5 h-5 bg-white/30 rounded-full"></div>
            </div>
            <div className="w-24 h-6 bg-white/10 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-xl animate-pulse"></div>
            <div className="w-8 h-8 bg-white/10 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>

    <main className="pt-16 px-3">
      <div className="h-56 bg-white/5 rounded-3xl animate-pulse mb-3"></div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse"></div>
        ))}
      </div>
      <div className="flex gap-2 overflow-hidden mb-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-24 h-12 bg-white/5 rounded-2xl animate-pulse"></div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-2xl overflow-hidden">
            <div className="h-40 bg-white/10 animate-pulse"></div>
            <div className="p-3">
              <div className="h-4 bg-white/10 rounded animate-pulse mb-2"></div>
              <div className="h-6 bg-white/10 rounded animate-pulse mb-3"></div>
              <div className="h-2 bg-white/10 rounded animate-pulse mb-1"></div>
              <div className="h-8 bg-white/10 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>
);

// MAKE SURE THIS LINE IS PRESENT
export default LoadingSkeleton;