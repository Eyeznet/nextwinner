// src/components/GlassmorphicUI.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Home,
  Gift,
  Users,
  Trophy,
  User,
  ArrowLeft,
  Filter,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  X,
  Menu,
  Clock,
  Bell,
  Calendar,
  DollarSign,
  TrendingUp,
  Check,
  Copy,
  Download,
  QrCode,
  MessageSquare,
  Twitter,
  Facebook,
  Instagram,
  Mail,
  Link as LinkIcon,
  Award,
  Crown,
  Star,
  Percent,
  BarChart,
  Target
} from 'lucide-react';

// GLASSMORPHIC CARD COMPONENT
export const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-[0_8px_32px_rgba(31,38,135,0.37)] ${className}`}>
    {children}
  </div>
);

// BASE GRADIENT BACKGROUND
export const GradientBackground = ({ children, className = "" }) => (
  <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white pb-20 ${className}`}>
    {children}
  </div>
);

// COLOR SCHEME CONSTANTS
export const COLOR_SCHEME = {
  primary: {
    gradient: 'from-pink-500 to-purple-500',
    hover: 'from-pink-600 to-purple-600',
    text: 'text-pink-400'
  },
  secondary: {
    gradient: 'from-blue-500 to-indigo-600',
    hover: 'from-blue-600 to-indigo-700',
    text: 'text-blue-400'
  },
  success: {
    gradient: 'from-green-500 to-emerald-500',
    hover: 'from-green-600 to-emerald-600',
    text: 'text-green-400'
  },
  warning: {
    gradient: 'from-yellow-500 to-amber-500',
    hover: 'from-yellow-600 to-amber-600',
    text: 'text-yellow-400'
  },
  info: {
    gradient: 'from-cyan-500 to-blue-500',
    hover: 'from-cyan-600 to-blue-600',
    text: 'text-cyan-400'
  }
};

// CATEGORY BADGE COMPONENT
export const CategoryBadge = ({ icon: Icon, name, color = 'from-blue-500 to-cyan-500', size = 'sm' }) => {
  const sizes = {
    sm: 'w-6 h-6 rounded-lg',
    md: 'w-8 h-8 rounded-lg',
    lg: 'w-10 h-10 rounded-xl'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`${sizes[size]} bg-gradient-to-r ${color} flex items-center justify-center shadow`}>
      <Icon className={`${iconSizes[size]} text-white`} />
      {name && (
        <span className="text-xs font-semibold text-white ml-1">{name}</span>
      )}
    </div>
  );
};

// STATS CARD COMPONENT
export const StatsCard = ({ label, value, change, trend = "up", icon: Icon, color = "from-blue-500 to-cyan-500" }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-2 shadow"
  >
    <div className="flex items-center justify-between mb-1">
      <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
        <Icon className="w-3 h-3 text-white" />
      </div>
      <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded-full text-xs ${
        trend === "up" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
      }`}>
        <TrendingUp className="w-2 h-2" />
        <span>{change}</span>
      </div>
    </div>
    <div className="text-sm font-bold text-white mb-0.5">{value}</div>
    <div className="text-gray-300 text-xs">{label}</div>
  </motion.div>
);

// SEARCH BAR COMPONENT
export const SearchBar = ({ placeholder = "Search...", value, onChange, className = "" }) => (
  <div className={`relative flex-1 max-w-2xl ${className}`}>
    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-7 pr-3 py-1.5 text-xs border border-white/20 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-transparent bg-white/10 text-white placeholder-gray-400"
    />
  </div>
);

// GLASS BUTTON COMPONENTS
export const PrimaryButton = ({ children, icon: Icon, onClick, className = "", size = "md", ...props }) => {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  return (
    <motion.button
      onClick={onClick}
      className={`${sizes[size]} bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-lg shadow hover:from-pink-600 hover:to-purple-600 transition-all ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </motion.button>
  );
};

export const SecondaryButton = ({ children, icon: Icon, onClick, className = "", size = "md", ...props }) => {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  return (
    <motion.button
      onClick={onClick}
      className={`${sizes[size]} backdrop-blur-md bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-all ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </motion.button>
  );
};

// SELECT COMPONENT
export const GlassSelect = ({ value, onChange, children, className = "" }) => (
  <select
    value={value}
    onChange={onChange}
    className={`w-full px-2 py-1.5 backdrop-blur-md bg-white/10 text-white rounded-lg border border-white/20 focus:ring-1 focus:ring-pink-500 focus:border-transparent text-xs ${className}`}
  >
    {children}
  </select>
);

// PAGINATION COMPONENT
export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const paginate = (pageNumber) => onPageChange(pageNumber);

  return (
    <GlassCard className="p-2 mb-4">
      <div className="flex items-center justify-between">
        <motion.button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 backdrop-blur-md bg-white/10 text-white rounded-lg border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all flex items-center gap-1 text-xs"
          whileHover={{ scale: currentPage !== 1 ? 1.02 : 1 }}
          whileTap={{ scale: currentPage !== 1 ? 0.98 : 1 }}
        >
          <ChevronLeft className="w-3 h-3" />
          Prev
        </motion.button>

        {/* Page Numbers */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <motion.button
                key={pageNumber}
                onClick={() => paginate(pageNumber)}
                className={`w-7 h-7 rounded-lg transition-all text-xs font-medium ${
                  currentPage === pageNumber
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow'
                    : 'backdrop-blur-md bg-white/10 text-white hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {pageNumber}
              </motion.button>
            );
          })}
        </div>

        <motion.button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 backdrop-blur-md bg-white/10 text-white rounded-lg border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all flex items-center gap-1 text-xs"
          whileHover={{ scale: currentPage !== totalPages ? 1.02 : 1 }}
          whileTap={{ scale: currentPage !== totalPages ? 0.98 : 1 }}
        >
          Next
          <ChevronRight className="w-3 h-3" />
        </motion.button>
      </div>
    </GlassCard>
  );
};

// HEADER COMPONENT
export const GlassHeader = ({ title, subtitle, onBack, rightSection, showBorder = true }) => (
  <div className={`backdrop-blur-xl bg-white/5 sticky top-0 z-40 ${showBorder ? 'border-b border-white/20' : ''}`}>
    <div className="max-w-7xl mx-auto px-2 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <motion.button
              onClick={onBack}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4 text-gray-300" />
            </motion.button>
          )}
          <div>
            <h1 className="font-bold text-white text-sm">{title}</h1>
            {subtitle && <p className="text-xs text-gray-300">{subtitle}</p>}
          </div>
        </div>
        
        {rightSection && (
          <div className="flex items-center gap-1">
            {rightSection}
          </div>
        )}
      </div>
    </div>
  </div>
);

// EMPTY STATE COMPONENT
export const EmptyState = ({ icon: Icon, title, description, actionButton }) => (
  <GlassCard className="text-center py-6">
    <Icon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
    <h3 className="text-sm font-semibold text-gray-300 mb-1">{title}</h3>
    <p className="text-gray-400 text-xs mb-3">{description}</p>
    {actionButton}
  </GlassCard>
);

// COUNTDOWN NOTICE COMPONENT
export const CountdownNotice = ({ days, startDate, title = "VOTING STARTS IN" }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-3"
  >
    <GlassCard className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center shadow">
          <Clock className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <Bell className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-300">{title}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-white">{days} DAYS</div>
              <div className="text-xs text-yellow-200">{startDate}</div>
            </div>
            <div className="flex items-center gap-1 text-xs text-yellow-300">
              <Calendar className="w-3 h-3" />
              <span>Get Ready!</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  </motion.div>
);

// CALL TO ACTION COMPONENT
export const CallToAction = ({ 
  title, 
  description, 
  primaryAction, 
  secondaryAction, 
  icon: Icon = Trophy,
  gradient = "from-pink-500/20 to-purple-500/20" 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-3"
  >
    <GlassCard className={`p-3 bg-gradient-to-r ${gradient}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="text-xs text-gray-300">{description}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {primaryAction}
          {secondaryAction}
        </div>
      </div>
    </GlassCard>
  </motion.div>
);

// MOBILE HAMBURGER MENU
export const MobileHamburgerMenu = ({ mobileMenuOpen, setMobileMenuOpen, menuItems = [] }) => {
  const defaultMenuItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Raffles", path: "/raffles", icon: Gift },
    { name: "Partners", path: "/partners", icon: Users },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Profile", path: "/profile", icon: User }
  ];

  const items = menuItems.length > 0 ? menuItems : defaultMenuItems;

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden p-1.5 rounded-lg backdrop-blur-md bg-white/10 border border-white/20"
      >
        {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              className="absolute top-16 left-3 right-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 shadow-xl max-h-[80vh] overflow-y-auto"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-1">
                  <Menu className="w-4 h-4" />
                  Menu
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((page) => (
                    <Link
                      key={page.name}
                      to={page.path}
                      className="flex items-center gap-2 p-2 backdrop-blur-md bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <page.icon className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-medium text-white">{page.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// BOTTOM NAVIGATION
export const BottomNavigation = ({ tabs }) => {
  const location = useLocation();

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-gray-900/95 to-gray-900/80 backdrop-blur-xl border-t border-white/20"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="flex justify-center px-2 py-1">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl px-1 py-1 shadow-xl max-w-md w-full">
          <div className="flex justify-between items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className="flex-1 flex flex-col items-center gap-0.5 py-0.5 px-0.5 min-w-0"
                >
                  <motion.div
                    className={`p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
                      isActive 
                        ? "bg-gradient-to-tr from-pink-500 to-purple-500 text-white shadow" 
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-3 h-3 flex-shrink-0" />
                  </motion.div>
                  <div className={`text-[10px] text-center leading-tight ${isActive ? "text-pink-400 font-semibold" : "text-gray-400"}`}>
                    {tab.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

// VIEW MODE TOGGLE
export const ViewModeToggle = ({ viewMode, setViewMode }) => (
  <div className="flex backdrop-blur-md bg-white/10 rounded-lg p-0.5 border border-white/20">
    <motion.button
      onClick={() => setViewMode('grid')}
      className={`p-1 rounded transition-all ${
        viewMode === 'grid' ? 'bg-white/20 shadow-sm' : 'text-gray-400'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <Grid className="w-3 h-3" />
    </motion.button>
    <motion.button
      onClick={() => setViewMode('list')}
      className={`p-1 rounded transition-all ${
        viewMode === 'list' ? 'bg-white/20 shadow-sm' : 'text-gray-400'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <List className="w-3 h-3" />
    </motion.button>
  </div>
);

// CATEGORY QUICK FILTERS
export const CategoryFilters = ({ categories, selectedCategory, onSelectCategory }) => (
  <div className="relative mb-3">
    <motion.div
      className="flex overflow-x-auto gap-1 pb-1 scrollbar-hide"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1, duration: 0.2 }}
    >
      {categories.map(category => {
        const Icon = category.icon;
        return (
          <motion.button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg whitespace-nowrap transition-all text-xs flex-shrink-0 ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow'
                : 'backdrop-blur-md bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className="w-3 h-3" />
            <span>{category.name}</span>
          </motion.button>
        );
      })}
    </motion.div>
  </div>
);

// MAIN CONTAINER
export const MainContainer = ({ children, className = "" }) => (
  <div className={`max-w-7xl mx-auto px-2 py-2 ${className}`}>
    {children}
  </div>
);