import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAuth, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { app } from './firebaseConfig';
import {
  Upload, Image as ImageIcon, DollarSign, Calendar,
  MapPin, Truck, Tag, Award, Zap, Shield,
  CheckCircle, Plus, X, Globe, Clock,
  Package, Home, Car, Smartphone, Plane,
  Diamond, Watch, Gamepad, ShoppingBag,
  BookOpen, Briefcase, Ship, TrendingUp,
  Save, Upload as UploadIcon, Camera,
  Trash2, Copy, Link, Eye, ChevronLeft,
  Info, HelpCircle, AlertCircle, Battery,
  Cpu, HardDrive, MemoryStick, Smartphone as Phone,
  Building, GraduationCap, Briefcase as Case,
  Sofa, Anchor, Bitcoin, Fuel, Users,
  Palette, Gauge, ShieldCheck, Trophy,
  Coffee, Gift, Tag as TagIcon, Zap as ZapIcon,
  Target, TrendingDown, Percent, Crown
} from 'lucide-react';

// Initialize Firebase
const db = getFirestore(app);
const auth = getAuth(app);

// Updated Categories constant with all categories
export const CATEGORIES = [
  { value: 'featured', label: '🔥 Featured', icon: ZapIcon, color: 'from-red-500 to-orange-500' },
  { value: 'cars', label: '🚗 Cars', icon: Car, color: 'from-blue-500 to-cyan-500' },
  { value: 'cash', label: '💰 Cash', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
  { value: 'electronics', label: '📱 Tech & Electronics', icon: Smartphone, color: 'from-purple-500 to-pink-500' },
  { value: 'property', label: '🏠 Property', icon: Building, color: 'from-yellow-500 to-amber-500' },
  { value: 'travel', label: '✈️ Travel', icon: Plane, color: 'from-indigo-500 to-blue-500' },
  { value: 'luxury', label: '💎 Luxury Items', icon: Diamond, color: 'from-pink-500 to-rose-500' },
  { value: 'food', label: '🍔 Food & Dining', icon: Coffee, color: 'from-amber-500 to-orange-500' },
  { value: 'watches', label: '⌚ Watches', icon: Watch, color: 'from-gray-500 to-gray-700' },
  { value: 'gaming', label: '🎮 Gaming', icon: Gamepad, color: 'from-green-500 to-lime-500' },
  { value: 'fashion', label: '👔 Fashion', icon: ShoppingBag, color: 'from-purple-500 to-violet-500' },
  { value: 'education', label: '📚 Education', icon: GraduationCap, color: 'from-blue-500 to-indigo-500' },
  { value: 'business', label: '💼 Business', icon: Briefcase, color: 'from-amber-500 to-yellow-500' },
  { value: 'home', label: '🏡 Home Appliances', icon: Sofa, color: 'from-teal-500 to-emerald-500' },
  { value: 'others', label: '📦 Others', icon: Package, color: 'from-gray-500 to-slate-500' }
];

// Default FAQ based on category
const DEFAULT_FAQ = {
  general: [
    {
      question: "How is the winner selected?",
      answer: "Winners are selected via a transparent live draw broadcast on our platform. The draw uses a verified random number generator and is witnessed by an independent auditor. The entire process is recorded and available for review."
    },
    {
      question: "Are the tickets refundable?",
      answer: "Tickets are non-refundable as they contribute to the prize pool. However, if the raffle doesn't reach its minimum ticket threshold, all purchases will be automatically refunded within 24 hours."
    },
    {
      question: "Can I increase my chances of winning?",
      answer: "Yes! Buying multiple tickets increases your odds proportionally. For example, buying 10 tickets gives you 10 times better chances than buying just 1 ticket. Many of our winners purchased multiple tickets."
    }
  ],
  cars: [
    {
      question: "How will I receive the car if I win?",
      answer: "We deliver the car to your specified location within 7 working days after verification. Our delivery team will handle all paperwork and ensure the car is delivered in perfect condition with all necessary documentation."
    }
  ],
  cash: [
    {
      question: "How will the cash prize be paid out?",
      answer: "Cash prizes are transferred directly to your bank account within 24 hours of verification. We support all major Nigerian banks for instant transfers."
    }
  ],
  electronics: [
    {
      question: "How will the electronics be delivered?",
      answer: "All electronics are delivered in their original sealed packaging via insured courier. We ensure proper handling and provide tracking information once shipped."
    }
  ],
  property: [
    {
      question: "How is property ownership transferred?",
      answer: "Property ownership is transferred through proper legal channels. We provide legal assistance and cover all transfer fees and documentation costs."
    }
  ]
};

// Category-specific specifications templates
const SPECIFICATION_TEMPLATES = {
  featured: {
    highlight: '',
    exclusivity: '',
    specialOffer: '',
    limitedTime: '',
    bonus: '',
    promotion: ''
  },
  cars: {
    engine: '',
    fuel: '',
    transmission: '',
    color: '',
    seats: '',
    mileage: '',
    warranty: '',
    year: '',
    model: '',
    features: ''
  },
  cash: {
    amount: '',
    currency: '',
    transferMethod: '',
    taxInfo: '',
    payoutTime: '',
    minimumTickets: ''
  },
  electronics: {
    brand: '',
    model: '',
    processor: '',
    ram: '',
    storage: '',
    screenSize: '',
    battery: '',
    warranty: '',
    os: '',
    color: ''
  },
  property: {
    type: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    location: '',
    yearBuilt: '',
    condition: '',
    amenities: '',
    parking: '',
    furnished: ''
  },
  travel: {
    destination: '',
    duration: '',
    accommodation: '',
    meals: '',
    activities: '',
    airline: '',
    class: '',
    validUntil: '',
    passengers: '',
    transfers: ''
  },
  luxury: {
    brand: '',
    model: '',
    material: '',
    year: '',
    authenticity: '',
    condition: '',
    accessories: '',
    certification: '',
    origin: '',
    limitedEdition: ''
  },
  food: {
    type: '',
    value: '',
    validity: '',
    restaurants: '',
    cuisine: '',
    delivery: '',
    alcohol: '',
    persons: '',
    timing: '',
    specialNotes: ''
  },
  watches: {
    brand: '',
    model: '',
    movement: '',
    material: '',
    waterResistance: '',
    year: '',
    condition: '',
    boxPapers: '',
    limitedEdition: '',
    warranty: ''
  },
  gaming: {
    console: '',
    model: '',
    storage: '',
    gamesIncluded: '',
    accessories: '',
    condition: '',
    warranty: '',
    onlineCapable: '',
    year: '',
    specialFeatures: ''
  },
  fashion: {
    brand: '',
    type: '',
    size: '',
    material: '',
    condition: '',
    season: '',
    authenticity: '',
    limitedEdition: '',
    careInstructions: '',
    accessories: ''
  },
  education: {
    institution: '',
    course: '',
    duration: '',
    format: '',
    level: '',
    accreditation: '',
    startDate: '',
    supportIncluded: '',
    materials: '',
    certification: ''
  },
  business: {
    type: '',
    value: '',
    established: '',
    revenue: '',
    location: '',
    employees: '',
    assets: '',
    opportunities: '',
    training: '',
    support: ''
  },
  home: {
    brand: '',
    model: '',
    type: '',
    capacity: '',
    energyRating: '',
    warranty: '',
    dimensions: '',
    features: '',
    smartFeatures: '',
    condition: ''
  },
  others: {
    type: '',
    description: '',
    condition: '',
    warranty: '',
    dimensions: '',
    weight: '',
    specialFeatures: '',
    usage: '',
    age: '',
    origin: ''
  }
};

const RaffleUploadForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Initial state for the form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    value: '',
    ticketPrice: '',
    totalTickets: '',
    ticketsSold: 0, // Default to 0
    category: 'featured',
    location: '',
    delivery: 'Free delivery nationwide',
    status: 'Active',
    drawDate: '',
    endDate: '', // Added for Firebase
    organizer: 'NextWinner Official',
    verified: false,
    featured: false,
    
    // Emotional triggers for marketing
    emotionalTrigger: 'Imagine winning this incredible prize!',
    urgency: 'Limited time offer!',
    odds: '1 in 1000', // Default odds
    
    // Images
    images: [],
    
    // Features
    features: ['Brand new condition', 'Full documentation', 'Warranty included'],
    
    // Specifications - Initialize with featured specs
    specifications: SPECIFICATION_TEMPLATES.featured,
    
    // Emotional Triggers (multiple)
    emotionalTriggers: ['Imagine you were called to come collect your winnings!', 'Your chance to upgrade your lifestyle dramatically'],
    
    // FAQ - Initialize with category-specific FAQ
    faq: [...DEFAULT_FAQ.general]
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsLoggedIn(!!currentUser);
      setUser(currentUser);
      
      // If not logged in, redirect to login
      if (!currentUser) {
        navigate('/login', { 
          state: { from: 'create-raffle', returnTo: '/create-raffle' }
        });
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  // Update specifications when category changes
  useEffect(() => {
    const newSpecs = SPECIFICATION_TEMPLATES[formData.category] || {};
    setFormData(prev => ({
      ...prev,
      specifications: newSpecs
    }));
    
    // Update FAQ based on category
    const categoryFAQ = DEFAULT_FAQ[formData.category] || [];
    const generalFAQ = DEFAULT_FAQ.general;
    
    // Remove any existing FAQ that matches default FAQ
    setFormData(prevFormData => {
      const customFAQ = prevFormData.faq.filter(faqItem => 
        ![...generalFAQ, ...categoryFAQ].some(defaultFAQ => 
          defaultFAQ.question === faqItem.question
        )
      );
      
      return {
        ...prevFormData,
        faq: [...generalFAQ, ...categoryFAQ, ...customFAQ]
      };
    });
  }, [formData.category]);

  // Step titles
  const steps = [
    { number: 1, title: 'Basic Info', icon: Info },
    { number: 2, title: 'Prize Details', icon: Award },
    { number: 3, title: 'Images', icon: ImageIcon },
    { number: 4, title: 'Features & Specs', icon: Tag },
    { number: 5, title: 'Marketing', icon: Zap },
    { number: 6, title: 'Review', icon: Eye }
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle nested object changes (specifications)
  const handleSpecificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  };

  // Handle features array changes
  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const updatedFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, features: updatedFeatures }));
    }
  };

  // Handle emotional triggers
  const handleEmotionalTriggerChange = (index, value) => {
    const updatedTriggers = [...formData.emotionalTriggers];
    updatedTriggers[index] = value;
    setFormData(prev => ({ ...prev, emotionalTriggers: updatedTriggers }));
  };

  const addEmotionalTrigger = () => {
    setFormData(prev => ({ ...prev, emotionalTriggers: [...prev.emotionalTriggers, ''] }));
  };

  const removeEmotionalTrigger = (index) => {
    if (formData.emotionalTriggers.length > 1) {
      const updatedTriggers = formData.emotionalTriggers.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, emotionalTriggers: updatedTriggers }));
    }
  };

  // Handle FAQ changes
  const handleFAQChange = (index, field, value) => {
    const updatedFAQ = [...formData.faq];
    updatedFAQ[index] = { ...updatedFAQ[index], [field]: value };
    setFormData(prev => ({ ...prev, faq: updatedFAQ }));
  };

  const addFAQ = () => {
    setFormData(prev => ({ ...prev, faq: [...prev.faq, { question: '', answer: '' }] }));
  };

  const removeFAQ = (index) => {
    if (formData.faq.length > 1) {
      const updatedFAQ = formData.faq.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, faq: updatedFAQ }));
    }
  };

  // Upload image to imgBB API
  const uploadImageToImgBB = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('https://api.imgbb.com/1/upload?key=6ba4e07f4118ef0579427c40a7207eef', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        return {
          url: data.data.url,
          thumb: data.data.thumb.url,
          delete_url: data.data.delete_url
        };
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 10;
    
    if (files.length + uploadedImages.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }
    
    setUploadProgress(0);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const preview = URL.createObjectURL(file);
      setImagePreviews(prev => [...prev, preview]);
      
      try {
        const uploadedImage = await uploadImageToImgBB(file);
        setUploadedImages(prev => [...prev, uploadedImage]);
        
        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert(`Failed to upload image: ${file.name}`);
      }
    }
    
    setUploadProgress(0);
  };

  const removeImage = (index) => {
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    const updatedUploadedImages = uploadedImages.filter((_, i) => i !== index);
    setImagePreviews(updatedPreviews);
    setUploadedImages(updatedUploadedImages);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.value) newErrors.value = 'Prize value is required';
    if (!formData.ticketPrice || formData.ticketPrice <= 0) newErrors.ticketPrice = 'Valid ticket price is required';
    if (!formData.totalTickets || formData.totalTickets <= 0) newErrors.totalTickets = 'Valid total tickets is required';
    if (!formData.drawDate) newErrors.drawDate = 'Draw date is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (uploadedImages.length === 0) newErrors.images = 'At least one image is required';
    if (!formData.emotionalTrigger.trim()) newErrors.emotionalTrigger = 'Emotional trigger is required';
    if (!formData.urgency.trim()) newErrors.urgency = 'Urgency message is required';
    if (!formData.odds.trim()) newErrors.odds = 'Odds information is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate odds automatically
  const calculateOdds = () => {
    if (formData.totalTickets) {
      return `1 in ${formData.totalTickets}`;
    }
    return '1 in 1000';
  };

  // Handle form submission to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      navigate('/login', { 
        state: { from: 'create-raffle', returnTo: '/create-raffle' }
      });
      return;
    }
    
    if (!validateForm()) {
      alert('Please fix the errors before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate end date (same as draw date)
      const endDate = formData.drawDate || new Date().toISOString();
      
      // Prepare raffle data for Firebase
      const raffleData = {
        // Core fields from your HomePage
        title: formData.title,
        description: formData.description,
        value: `₦${parseInt(formData.value).toLocaleString()}`,
        ticketPrice: parseInt(formData.ticketPrice),
        ticketsSold: 0, // Start with 0 tickets sold
        totalTickets: parseInt(formData.totalTickets),
        category: formData.category,
        image: uploadedImages[0]?.url || '', // Use first image as main image
        endDate: endDate,
        emotionalTrigger: formData.emotionalTrigger,
        urgency: formData.urgency,
        odds: formData.odds || calculateOdds(),
        
        // Additional fields from form
        longDescription: formData.longDescription,
        location: formData.location,
        delivery: formData.delivery,
        status: formData.status,
        drawDate: formData.drawDate,
        organizer: formData.organizer,
        verified: formData.verified,
        featured: formData.featured,
        
        // Arrays and objects
        images: uploadedImages.map(img => img.url),
        features: formData.features.filter(f => f.trim() !== ''),
        specifications: formData.specifications,
        emotionalTriggers: formData.emotionalTriggers.filter(t => t.trim() !== ''),
        faq: formData.faq.filter(f => f.question.trim() !== '' && f.answer.trim() !== ''),
        
        // Metadata
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'raffles'), raffleData);
      
      console.log('Raffle created with ID:', docRef.id);
      
      setShowSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        navigate('/dashboard?tab=raffles');
      }, 3000);
      
    } catch (error) {
      console.error('Error creating raffle:', error);
      alert('Failed to create raffle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '₦0';
    return `₦${parseInt(value).toLocaleString()}`;
  };

  // Calculate progress
  const calculateProgress = () => {
    const totalFields = 28;
    const filledFields = Object.values(formData).filter(value => {
      if (Array.isArray(value)) return value.length > 0 && value[0] !== '';
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== '');
      }
      return value !== '' && value !== false;
    }).length;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  // Get category icon
  const getCategoryIcon = (categoryValue) => {
    const category = CATEGORIES.find(c => c.value === categoryValue);
    return category ? category.icon : ZapIcon;
  };

  // Get specification fields for current category
  const getSpecificationFields = () => {
    const template = SPECIFICATION_TEMPLATES[formData.category] || {};
    return Object.keys(template);
  };

  // Render specification field label
  const renderSpecFieldLabel = (field) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Auto-calculate odds when total tickets changes
  useEffect(() => {
    if (formData.totalTickets) {
      setFormData(prev => ({
        ...prev,
        odds: `1 in ${formData.totalTickets}`
      }));
    }
  }, [formData.totalTickets]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/80 hover:text-white"
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Create New Raffle
              </h1>
              <div className="text-xs text-white/60">Step {currentStep} of {steps.length}</div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-xs text-white/60">{calculateProgress()}% complete</div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="pt-16 px-4 py-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex overflow-x-auto scrollbar-hide">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            
            return (
              <button
                key={step.number}
                onClick={() => setCurrentStep(step.number)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-500/30' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500' : isActive ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-white/10'
                }`}>
                  {isCompleted ? (
                    <CheckCircle size={16} className="text-white" />
                  ) : (
                    <Icon size={16} className={isActive ? 'text-white' : 'text-white/70'} />
                  )}
                </div>
                <div className="text-left">
                  <div className="text-xs text-white/60">Step {step.number}</div>
                  <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                    {step.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <main className="p-4 pb-24">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Info size={20} />
                  Basic Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Raffle Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Toyota Corolla 2023"
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                    />
                    {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Short Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description that appears in listings"
                      rows="3"
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                    />
                    {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Detailed Description</label>
                    <textarea
                      name="longDescription"
                      value={formData.longDescription}
                      onChange={handleInputChange}
                      placeholder="Full detailed description with all features and benefits"
                      rows="5"
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                    >
                      {CATEGORIES.map(category => {
                        const Icon = category.icon;
                        return (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        );
                      })}
                    </select>
                    <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                      <div className="flex items-center gap-1">
                        {(() => {
                          const Icon = getCategoryIcon(formData.category);
                          const category = CATEGORIES.find(c => c.value === formData.category);
                          return (
                            <>
                              <Icon size={16} />
                              <span>Selected: {category?.label}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Prize Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Award size={20} />
                  Prize & Ticket Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prize Value (₦) *</label>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder="4500000"
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                    />
                    {errors.value && <p className="text-red-400 text-sm mt-1">{errors.value}</p>}
                    <div className="text-xs text-white/60 mt-1">
                      Displayed as: {formatCurrency(formData.value)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ticket Price (₦) *</label>
                      <input
                        type="number"
                        name="ticketPrice"
                        value={formData.ticketPrice}
                        onChange={handleInputChange}
                        placeholder="3500"
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                      />
                      {errors.ticketPrice && <p className="text-red-400 text-sm mt-1">{errors.ticketPrice}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Total Tickets *</label>
                      <input
                        type="number"
                        name="totalTickets"
                        value={formData.totalTickets}
                        onChange={handleInputChange}
                        placeholder="2000"
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                      />
                      {errors.totalTickets && <p className="text-red-400 text-sm mt-1">{errors.totalTickets}</p>}
                    </div>
                  </div>
                  
                  {/* Emotional Trigger */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Emotional Trigger *</label>
                    <input
                      type="text"
                      name="emotionalTrigger"
                      value={formData.emotionalTrigger}
                      onChange={handleInputChange}
                      placeholder="This ₦3,500 ticket could end your transportation worries forever"
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                    />
                    {errors.emotionalTrigger && <p className="text-red-400 text-sm mt-1">{errors.emotionalTrigger}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Urgency Message *</label>
                      <input
                        type="text"
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleInputChange}
                        placeholder="760 tickets left"
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                      />
                      {errors.urgency && <p className="text-red-400 text-sm mt-1">{errors.urgency}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Odds *</label>
                      <input
                        type="text"
                        name="odds"
                        value={formData.odds}
                        onChange={handleInputChange}
                        placeholder="1 in 2000"
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                      />
                      {errors.odds && <p className="text-red-400 text-sm mt-1">{errors.odds}</p>}
                      <div className="text-xs text-white/60 mt-1">
                        Auto-calculated: {calculateOdds()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Lagos, Nigeria"
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                      />
                      {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Delivery Info</label>
                      <input
                        type="text"
                        name="delivery"
                        value={formData.delivery}
                        onChange={handleInputChange}
                        placeholder="Free delivery nationwide"
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Draw Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="drawDate"
                      value={formData.drawDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                    />
                    {errors.drawDate && <p className="text-red-400 text-sm mt-1">{errors.drawDate}</p>}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="verified"
                        checked={formData.verified}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500/20"
                      />
                      <span className="text-sm">Verified Raffle</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500/20"
                      />
                      <span className="text-sm">Featured Raffle</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Images */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ImageIcon size={20} />
                  Prize Images
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Images *</label>
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-yellow-500/50 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <UploadIcon size={24} className="text-yellow-400" />
                        </div>
                        <div className="text-lg font-bold mb-2">Drop images here or click to upload</div>
                        <div className="text-sm text-white/60 mb-4">
                          Upload high-quality images of the prize (max 10 images)
                          <br />
                          Images will be uploaded to imgBB
                        </div>
                        
                        {/* Upload Progress */}
                        {uploadProgress > 0 && (
                          <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                            <div 
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}
                        
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg">
                          <Camera size={16} />
                          Select Images
                        </div>
                      </label>
                    </div>
                    {errors.images && <p className="text-red-400 text-sm mt-1">{errors.images}</p>}
                  </div>
                  
                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-3">
                        Uploaded Images ({uploadedImages.length})
                        <span className="text-green-400 ml-2">
                          ✓ Successfully uploaded to imgBB
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} className="text-white" />
                            </button>
                            <div className="absolute bottom-2 left-2 text-xs bg-black/70 px-2 py-1 rounded">
                              {index === 0 ? 'Main' : `Image ${index + 1}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Features & Specifications */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Category Info */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${CATEGORIES.find(c => c.value === formData.category)?.color} flex items-center justify-center`}>
                    {(() => {
                      const Icon = getCategoryIcon(formData.category);
                      return <Icon size={24} className="text-white" />;
                    })()}
                  </div>
                  <div>
                    <div className="text-sm text-white/60">Selected Category</div>
                    <div className="text-lg font-bold">{CATEGORIES.find(c => c.value === formData.category)?.label}</div>
                  </div>
                </div>
                <div className="text-sm text-white/60">
                  Specifications have been auto-adjusted for this category. You can modify them below.
                </div>
              </div>

              {/* Features */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Tag size={20} />
                  Key Features
                </h2>
                
                <div className="space-y-3">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="e.g., Automatic Transmission"
                        className="flex-1 px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addFeature}
                    className="w-full py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-yellow-500/30 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add Another Feature
                  </button>
                </div>
              </div>
              
              {/* Specifications */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Package size={20} />
                  Specifications ({CATEGORIES.find(c => c.value === formData.category)?.label})
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  {getSpecificationFields().map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-2">
                        {renderSpecFieldLabel(field)}
                      </label>
                      <input
                        type="text"
                        value={formData.specifications[field] || ''}
                        onChange={(e) => handleSpecificationChange(field, e.target.value)}
                        placeholder={`Enter ${renderSpecFieldLabel(field).toLowerCase()}`}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Marketing */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Emotional Triggers */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Zap size={20} />
                  Emotional Triggers
                </h2>
                
                <div className="space-y-3">
                  {formData.emotionalTriggers.map((trigger, index) => (
                    <div key={index} className="flex gap-2">
                      <textarea
                        value={trigger}
                        onChange={(e) => handleEmotionalTriggerChange(index, e.target.value)}
                        placeholder='e.g., "This ₦3,500 ticket could end your transportation worries forever"'
                        rows="2"
                        className="flex-1 px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                      />
                      {formData.emotionalTriggers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmotionalTrigger(index)}
                          className="px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addEmotionalTrigger}
                    className="w-full py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-yellow-500/30 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add Another Emotional Trigger
                  </button>
                </div>
              </div>
              
              {/* FAQ */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <HelpCircle size={20} />
                  Frequently Asked Questions
                </h2>
                
                <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="text-sm text-yellow-400 mb-1">
                    <span className="font-bold">Note:</span> General and category-specific FAQ are pre-filled. You can add additional questions below.
                  </div>
                  <div className="text-xs text-yellow-500/80">
                    Default questions cannot be removed but can be edited.
                  </div>
                </div>
                
                <div className="space-y-4">
                  {formData.faq.map((faqItem, index) => {
                    // Check if this is a default FAQ
                    const isDefaultFAQ = 
                      DEFAULT_FAQ.general.some(f => f.question === faqItem.question) ||
                      DEFAULT_FAQ[formData.category]?.some(f => f.question === faqItem.question);
                    
                    return (
                      <div key={index} className={`rounded-lg p-4 ${isDefaultFAQ ? 'bg-white/5 border border-white/10' : 'bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">FAQ #{index + 1}</span>
                            {isDefaultFAQ && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                Default
                              </span>
                            )}
                          </div>
                          {!isDefaultFAQ && (
                            <button
                              type="button"
                              onClick={() => removeFAQ(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-2">Question</label>
                            <input
                              type="text"
                              value={faqItem.question}
                              onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                              placeholder="How is the winner selected?"
                              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                              readOnly={isDefaultFAQ && index < 3}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Answer</label>
                            <textarea
                              value={faqItem.answer}
                              onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                              placeholder="Winners are selected via a transparent live draw..."
                              rows="3"
                              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <button
                    type="button"
                    onClick={addFAQ}
                    className="w-full py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-yellow-500/30 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add Custom FAQ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Eye size={20} />
                  Review Your Raffle
                </h2>
                
                <div className="space-y-6">
                  {/* Preview Card */}
                  <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                    <div className="flex items-start gap-4 mb-4">
                      {uploadedImages.length > 0 ? (
                        <div className="w-24 h-24 rounded-lg overflow-hidden">
                          <img
                            src={uploadedImages[0]?.url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center">
                          <ImageIcon size={32} className="text-white/30" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`px-2 py-1 rounded text-xs bg-gradient-to-r ${CATEGORIES.find(c => c.value === formData.category)?.color} flex items-center gap-1`}>
                                {(() => {
                                  const Icon = getCategoryIcon(formData.category);
                                  return <Icon size={12} />;
                                })()}
                                {CATEGORIES.find(c => c.value === formData.category)?.label}
                              </div>
                            </div>
                            <h3 className="text-lg font-bold">{formData.title || 'Untitled Raffle'}</h3>
                            <p className="text-sm text-white/60">{formData.description || 'No description'}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-yellow-400">
                              {formatCurrency(formData.value)}
                            </div>
                            <div className="text-sm text-white/60">
                              ₦{formData.ticketPrice || '0'}/ticket
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2 mb-3">
                          <div className="text-sm text-yellow-400/90 italic">
                            "{formData.emotionalTrigger}"
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {formData.featured && (
                            <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold rounded">
                              FEATURED
                            </span>
                          )}
                          {formData.verified && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded flex items-center gap-1">
                              <Shield size={10} />
                              VERIFIED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="bg-white/5 rounded p-2 text-center">
                        <div className="text-sm font-bold">{formData.totalTickets || '0'}</div>
                        <div className="text-xs text-white/60">Total Tickets</div>
                      </div>
                      <div className="bg-white/5 rounded p-2 text-center">
                        <div className="text-sm font-bold">{formData.category}</div>
                        <div className="text-xs text-white/60">Category</div>
                      </div>
                      <div className="bg-white/5 rounded p-2 text-center">
                        <div className="text-sm font-bold">{formData.location || 'Not set'}</div>
                        <div className="text-xs text-white/60">Location</div>
                      </div>
                      <div className="bg-white/5 rounded p-2 text-center">
                        <div className="text-sm font-bold">{formData.odds}</div>
                        <div className="text-xs text-white/60">Odds</div>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} className="text-white/60" />
                        <span>Draw Date: {formData.drawDate ? new Date(formData.drawDate).toLocaleString() : 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-white/60" />
                        <span>Delivery: {formData.delivery}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Specifications Preview */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <Package size={16} />
                      Specifications Preview
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(formData.specifications)
                        .filter(([_, value]) => value)
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-white/60">{renderSpecFieldLabel(key)}:</span>
                            <span className="ml-2">{value}</span>
                          </div>
                        ))}
                    </div>
                    {Object.values(formData.specifications).filter(v => v).length > 4 && (
                      <div className="text-xs text-white/60 mt-2">
                        +{Object.values(formData.specifications).filter(v => v).length - 4} more specifications
                      </div>
                    )}
                  </div>
                  
                  {/* FAQ Preview */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <HelpCircle size={16} />
                      FAQ ({formData.faq.length} questions)
                    </h3>
                    <div className="space-y-2">
                      {formData.faq.slice(0, 3).map((faqItem, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium">Q: {faqItem.question}</div>
                          <div className="text-white/60 ml-2">A: {faqItem.answer.substring(0, 60)}...</div>
                        </div>
                      ))}
                      {formData.faq.length > 3 && (
                        <div className="text-xs text-white/60 mt-2">
                          +{formData.faq.length - 3} more questions
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/60 mb-1">Total Fields</div>
                      <div className="text-lg font-bold">{calculateProgress()}%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/60 mb-1">Images</div>
                      <div className="text-lg font-bold">{uploadedImages.length}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/60 mb-1">Tickets</div>
                      <div className="text-lg font-bold">{formData.totalTickets || '0'}</div>
                    </div>
                  </div>
                  
                  {/* Firebase Notice */}
                  {isLoggedIn && (
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck size={16} className="text-blue-400" />
                        <span className="text-sm font-bold text-blue-400">Firebase Integration Active</span>
                      </div>
                      <p className="text-xs text-white/80">
                        This raffle will be saved to Firebase Firestore in the 'raffles' collection.
                        All images are securely uploaded to imgBB.
                      </p>
                    </div>
                  )}
                  
                  {/* Terms & Conditions */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        required
                        className="w-5 h-5 mt-1 text-yellow-500 rounded focus:ring-yellow-500/20"
                      />
                      <div className="text-sm">
                        <span className="font-medium">I agree to the terms and conditions</span>
                        <p className="text-white/60 mt-1">
                          By submitting this raffle, I confirm that all information provided is accurate
                          and I have the right to offer this prize. This raffle will be published immediately.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex-1 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-yellow-500/30 transition-all"
              >
                Continue to {steps.find(s => s.number === currentStep + 1)?.title}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !isLoggedIn}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Publishing to Firebase...
                  </span>
                ) : !isLoggedIn ? (
                  'Please Login First'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UploadIcon size={20} />
                    Publish to Firebase
                  </span>
                )}
              </button>
            )}
          </div>
        </form>
      </main>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 backdrop-blur-xl rounded-2xl max-w-sm w-full p-6 border border-white/20">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-white" />
              </div>
              <h3 className="font-black text-xl mb-2 text-white">🎉 Raffle Published!</h3>
              <p className="text-white/80 mb-4">
                Your raffle has been successfully published to Firebase and is now live on the platform.
              </p>
              
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 mb-6">
                <div className="text-sm font-bold text-green-400 mb-2">Firebase Collection Created</div>
                <div className="text-sm text-white/80">
                  Collection: raffles<br />
                  Images: Uploaded to imgBB<br />
                  Status: Published successfully
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => navigate(`/item/1`)}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  View Raffle Page
                </button>
                <button 
                  onClick={() => navigate('/dashboard?tab=raffles')}
                  className="w-full py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-lg hover:bg-white/20 transition-all"
                >
                  Manage My Raffles
                </button>
                <button 
                  onClick={() => {
                    setShowSuccess(false);
                    // Reset form
                    setFormData({
                      title: '',
                      description: '',
                      longDescription: '',
                      value: '',
                      ticketPrice: '',
                      totalTickets: '',
                      ticketsSold: 0,
                      category: 'featured',
                      location: '',
                      delivery: 'Free delivery nationwide',
                      status: 'Active',
                      drawDate: '',
                      endDate: '',
                      organizer: 'NextWinner Official',
                      verified: false,
                      featured: false,
                      emotionalTrigger: 'Imagine winning this incredible prize!',
                      urgency: 'Limited time offer!',
                      odds: '1 in 1000',
                      images: [],
                      features: ['Brand new condition', 'Full documentation', 'Warranty included'],
                      specifications: SPECIFICATION_TEMPLATES.featured,
                      emotionalTriggers: ['Imagine being called to collect your winnings!', 'Your chance to upgrade your lifestyle dramatically'],
                      faq: [...DEFAULT_FAQ.general]
                    });
                    setImagePreviews([]);
                    setUploadedImages([]);
                    setCurrentStep(1);
                  }}
                  className="w-full py-2 text-white/70 hover:text-white transition-colors text-sm"
                >
                  Create Another Raffle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaffleUploadForm;