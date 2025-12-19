/*
QuickServe - Single-file React App (Tailwind + lucide-react + Firebase)

Features included in this file:
- Full landing page with Hero, Categories, Services Grid, Features, Footer
- Smooth UI animations via Tailwind utility classes and simple CSS transitions
- Booking system + cart (local state) + WhatsApp order button
- Admin panel (simple password-protected toggle) to add / edit / delete services
- "Add New Service" popup that adds service locally and (optional) pushes to Firebase
- Firebase v9 (modular) placeholder integration for saving services and bookings
- Deploy instructions below (Vercel / Netlify) in comments

How to use:
1) Install dependencies: react, react-dom, lucide-react, firebase, tailwindcss (and set Tailwind config)
   npm i lucide-react firebase
2) Replace FIREBASE_CONFIG placeholder with your Firebase project's config if you want persistence
3) Drop this file into your React project and import into index.js

IMPORTANT: This single-file is designed for quick prototyping. For production split components into files.
*/

import React, { useEffect, useState, useMemo } from 'react';
import {
  Home, Flame, Droplets, Wrench, Car, Sparkles, Package, Zap, Heart, AlertTriangle, Trash2, Leaf, Sun,
  Search, Menu, X, Phone, MapPin, Clock, Star
} from 'lucide-react';

// --------- FIREBASE SETUP (optional) ---------
// To enable persistence, replace with your project's config and enable Firestore.
const FIREBASE_ENABLED = false; // set to true to enable Firebase calls
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MSG_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let db = null;
if (FIREBASE_ENABLED) {
  // Lazy import to avoid errors if firebase not installed
  try {
    // eslint-disable-next-line no-unused-vars
    const { initializeApp } = require('firebase/app');
    const { getFirestore } = require('firebase/firestore');
    const app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
  } catch (e) {
    console.warn('Enable Firebase and install firebase package to use persistence', e);
  }
}

// ---------- Sample Data (same as your list, trimmed) ----------
const initialCategories = [
  { id: 'gas', name: 'Gas & Cooking', icon: Flame, color: 'from-orange-500 to-red-500' },
  { id: 'water', name: 'Water Services', icon: Droplets, color: 'from-blue-500 to-cyan-500' },
  { id: 'repair', name: 'Home Repair', icon: Wrench, color: 'from-gray-600 to-gray-800' },
  { id: 'vehicle', name: 'Vehicle Help', icon: Car, color: 'from-green-600 to-emerald-700' },
  { id: 'cleaning', name: 'Cleaning', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
  { id: 'delivery', name: 'Delivery', icon: Package, color: 'from-yellow-500 to-orange-500' },
  { id: 'appliance', name: 'Appliances', icon: Zap, color: 'from-indigo-500 to-blue-600' },
  { id: 'family', name: 'Family Support', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 'emergency', name: 'Emergency', icon: AlertTriangle, color: 'from-red-600 to-red-800' },
  { id: 'waste', name: 'Waste Management', icon: Trash2, color: 'from-green-700 to-teal-700' },
  { id: 'outdoor', name: 'Outdoor', icon: Leaf, color: 'from-lime-600 to-green-600' },
  { id: 'seasonal', name: 'Seasonal', icon: Sun, color: 'from-amber-500 to-yellow-600' },
];

const initialServices = [
  { id: 1, category: 'gas', name: 'Gas Cylinder Delivery', desc: '24/7 Emergency Service', price: '₹50', time: '30-60 min', rating: 4.8 },
  { id: 6, category: 'water', name: 'Drinking Water Jar Delivery', desc: 'Fresh & sealed', price: '₹40', time: '30 min', rating: 4.8 },
  { id: 11, category: 'repair', name: 'Electrician Service', desc: 'Fan, Light, Switch, Wiring', price: '₹250', time: '1 hour', rating: 4.8 },
  { id: 16, category: 'vehicle', name: 'Mobile Bike Mechanic', desc: 'At your doorstep', price: '₹200', time: '45 min', rating: 4.7 },
  { id: 21, category: 'cleaning', name: 'Washroom Deep Cleaning', desc: 'Sanitized & spotless', price: '₹400', time: '2 hours', rating: 4.8 },
  { id: 26, category: 'delivery', name: 'Grocery Micro Delivery', desc: 'Daily essentials', price: '₹30', time: '20 min', rating: 4.8 },
  { id: 30, category: 'appliance', name: 'Fridge Repair', desc: 'All brands', price: '₹500', time: '2 hours', rating: 4.7 },
  { id: 35, category: 'family', name: '1 Hour Cooking Helper', desc: 'Meal preparation', price: '₹200', time: '1 hour', rating: 4.9 },
  { id: 40, category: 'emergency', name: 'Flood/Heavy Rain Support', desc: '24/7 available', price: '₹1000', time: 'Immediate', rating: 4.8 },
  { id: 45, category: 'waste', name: 'Garbage Pickup Service', desc: 'Daily/Weekly', price: '₹150', time: 'Scheduled', rating: 4.7 },
];

// Utility: parse price string '₹50' -> number 50
const parsePrice = (p) => Number(String(p).replace(/[^0-9.]/g, '') || 0);

export default function QuickServeApp() {
  const [categories, setCategories] = useState(initialCategories);
  const [services, setServices] = useState(initialServices);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [cart, setCart] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAddPopup, setShowAddPopup] = useState(false);

  // Booking form state
  const [bookingDetails, setBookingDetails] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    // Example: load from Firebase if enabled (not implemented fully)
    if (FIREBASE_ENABLED && db) {
      // load services from Firestore and replace state
    }
  }, []);

  const filteredServices = useMemo(() => services.filter(s => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  }), [services, activeCategory, searchQuery]);

  // Cart functions
  function addToCart(service) {
    setCart(prev => {
      const found = prev.find(i => i.id === service.id);
      if (found) return prev.map(i => i.id === service.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...service, qty: 1 }];
    });
  }
  function removeFromCart(id) { setCart(prev => prev.filter(i => i.id !== id)); }
  function updateQty(id, qty) { setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i)); }

  const cartTotal = cart.reduce((s, it) => s + parsePrice(it.price) * it.qty, 0);

  // Booking flow: open booking modal with cart items
  function openBooking() { setShowBookingModal(true); }
  function confirmBooking() {
    // For demo: create WhatsApp message or save to Firebase
    const itemsText = cart.map(i => `${i.name} x${i.qty}`).join(', ');
    const msg = `QuickServe Booking:\nName: ${bookingDetails.name}\nPhone: ${bookingDetails.phone}\nAddress: ${bookingDetails.address}\nItems: ${itemsText}\nTotal: ₹${cartTotal}`;

    // Open WhatsApp with prefilled message
    const phoneForOrders = '+918167636911'; // Replace with your business number
    const waLink = `https://wa.me/${phoneForOrders.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, '_blank');

    // Optionally: push booking to Firebase
    if (FIREBASE_ENABLED && db) {
      // addDoc(collection(db, 'bookings'), { ...bookingDetails, cart, total: cartTotal, createdAt: new Date() })
    }

    // Reset
    setShowBookingModal(false);
    setCart([]);
    setBookingDetails({ name: '', phone: '', address: '' });
  }

  // Admin functions (simple password check)
  function toggleAdmin() {
    const PASSWORD = 'quickadmin2025'; // change in production / move to env
    if (!adminMode) {
      if (adminPasswordInput === PASSWORD) {
        setAdminMode(true);
        setAdminPasswordInput('');
      } else {
        alert('Incorrect admin password');
      }
    } else {
      setAdminMode(false);
    }
  }

  function addService(newService) {
    // assign new id
    const nextId = Math.max(0, ...services.map(s => s.id)) + 1;
    const srv = { id: nextId, ...newService };
    setServices(prev => [srv, ...prev]);

    // Optionally push to Firebase
    if (FIREBASE_ENABLED && db) {
      // addDoc(collection(db, 'services'), srv)
    }
  }

  function updateService(id, patch) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    // Optionally update firestore doc
  }

  function deleteService(id) {
    if (!confirm('Delete this service?')) return;
    setServices(prev => prev.filter(s => s.id !== id));
  }

  // WhatsApp quick order for single service
  function orderViaWhatsAppSingle(service) {
    const msg = `QuickServe Order - ${service.name} - ${service.price} - Please contact me.`;
    const phoneForOrders = '+918167636911';
    const waLink = `https://wa.me/${phoneForOrders.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, '_blank');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  QuickServe
                </h1>
                <p className="text-xs text-gray-600">Your Home Service Partner</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">+91 8167636911</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Jessore</span>
              </div>

              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Download App
              </button>

              {/* Cart preview */}
              <div className="relative">
                <button onClick={() => setShowBookingModal(true)} className="px-3 py-2 rounded-lg border">
                  Cart ({cart.length})
                </button>
                {cart.length > 0 && (
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-1">
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.qty} × {item.price}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))} className="px-2">-</button>
                          <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2">+</button>
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 text-right">
                      <div className="font-bold">Total: ₹{cartTotal}</div>
                      <button onClick={() => openBooking()} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg">Checkout</button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            <button className="md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">+91 8167636911</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Jessore</span>
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold">
                  Download App
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">All Home Services at Your Doorstep</h2>
          <p className="text-xl mb-8 text-blue-100">50+ Services • 24/7 Support • Trusted Professionals</p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-2xl" placeholder="Search for services..." />
          </div>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-full ${activeCategory==='all' ? 'bg-white text-blue-600' : 'bg-white/30'}`}>All</button>
            {categories.slice(0,6).map(c => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-4 py-2 rounded-full bg-white/30`}>{c.name}</button>
            ))}
          </div>

        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white shadow-md py-6 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setActiveCategory('all')} className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeCategory === 'all' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All Services</button>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex-shrink-0 flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${ activeCategory === cat.id ? `bg-gradient-to-r ${cat.color} text-white shadow-lg transform scale-105` : 'bg-gray-100 text-gray-700 hover:bg-gray-200' }`}>
                  <Icon className="w-5 h-5" />
                  <span className="whitespace-nowrap">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      

      {/* Services Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => {
              const category = categories.find(c => c.id === service.category) || categories[0];
              const Icon = category.icon;
              return (
                <div key={service.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden" onClick={() => setSelectedService(service)}>
                  <div className={`h-40 bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                  
                    <Icon className="w-20 h-20 text-white opacity-90" />
                    <p className="text-xs text-gray-500 mb-2">ID: {service.id}</p>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-gray-800">{service.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{service.desc}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">{service.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{service.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{service.price}</span>
                      <div className="flex items-center space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); addToCart(service); }} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold">Add</button>
                        <button onClick={(e) => { e.stopPropagation(); orderViaWhatsAppSingle(service); }} className="px-3 py-2 border rounded-lg">WhatsApp</button>
                      </div>
                    </div>

                    {adminMode && (
                      <div className="mt-3 flex items-center justify-between">
                        <button onClick={(e) => { e.stopPropagation(); setShowAddPopup(true); setSelectedService(service); }} className="text-sm text-blue-600 underline">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); deleteService(service.id); }} className="text-sm text-red-600 underline">Delete</button>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <Search className="w-20 h-20 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No services found</h3>
              <p className="text-gray-600">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose QuickServe?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[{ icon: Clock, title: '24/7 Available', desc: 'Round the clock service for emergencies' }, { icon: Star, title: 'Verified Professionals', desc: 'Background checked & trained experts' }, { icon: Phone, title: 'Quick Response', desc: 'Average response time: 30 minutes' }, { icon: Heart, title: 'Best Prices', desc: 'Transparent pricing, no hidden charges' }].map((feature, idx) => {
              const FeatureIcon = feature.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FeatureIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">QuickServe</h3>
              <p className="text-gray-400">Your trusted partner for all home services in Jessore.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400"><li>About Us</li><li>How It Works</li><li>Pricing</li><li>FAQ</li></ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400"><li>Contact Us</li><li>Terms & Conditions</li><li>Privacy Policy</li><li>Cancellation Policy</li></ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400"><li>+91 8167636911</li><li>support@quickserve.com</li><li>Jessore, Bangladesh</li></ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"><p>© 2025 QuickServe. All rights reserved.</p></div>
        </div>
      </footer>

      {/* Selected Service Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedService(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">{selectedService.name}</h3>
              <button onClick={() => setSelectedService(null)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
            </div>
            <p className="text-gray-600 mb-4">{selectedService.desc}</p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between"><span className="text-gray-700">Price:</span><span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{selectedService.price}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-700">Duration:</span><span className="font-semibold text-gray-800">{selectedService.time}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-700">Rating:</span><div className="flex items-center space-x-1"><Star className="w-5 h-5 text-yellow-500" /><span className="font-semibold text-gray-800">{selectedService.rating}</span></div></div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => { addToCart(selectedService); setSelectedService(null); }} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">Add to Cart</button>
              <button onClick={() => orderViaWhatsAppSingle(selectedService)} className="flex-1 border py-3 rounded-xl">Order via WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowBookingModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-2xl font-bold">Confirm Booking</h3><button onClick={() => setShowBookingModal(false)} className="text-gray-500"><X className="w-6 h-6" /></button></div>
            <div className="mb-4">
              {cart.length === 0 ? <div className="text-center text-gray-500">Cart is empty</div> : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.qty} × {item.price}</div>
                      </div>
                      <div className="text-sm">₹{parsePrice(item.price) * item.qty}</div>
                    </div>
                  ))}
                  <div className="text-right font-bold">Total: ₹{cartTotal}</div>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <input value={bookingDetails.name} onChange={(e) => setBookingDetails({...bookingDetails, name: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="Full name" />
              <input value={bookingDetails.phone} onChange={(e) => setBookingDetails({...bookingDetails, phone: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="Phone number" />
              <input value={bookingDetails.address} onChange={(e) => setBookingDetails({...bookingDetails, address: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="Address" />
            </div>

            <div className="flex space-x-2">
              <button onClick={() => confirmBooking()} disabled={cart.length===0 || !bookingDetails.name || !bookingDetails.phone} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">Confirm & WhatsApp</button>
              <button onClick={() => setShowBookingModal(false)} className="flex-1 border py-3 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

{/* Admin Panel Toggle */}
<div className="fixed bottom-6 right-6 z-50">
  {!adminMode ? (
    <div className="bg-white p-3 rounded-xl shadow-lg w-72">
      <input
        value={adminPasswordInput}
        onChange={(e) => setAdminPasswordInput(e.target.value)}
        className="w-full p-2 border rounded-md mb-2"
        placeholder="Admin password"
      />
      <button
        onClick={toggleAdmin}
        className="w-full bg-green-600 text-white p-2 rounded-md"
      >
        Enter Admin
      </button>
    </div>
  ) : (
    <div className="bg-white p-3 rounded-xl shadow-lg w-72 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Admin Mode</div>
        <button onClick={toggleAdmin} className="text-sm text-red-600">Logout</button>
      </div>
      <div className="text-sm text-gray-600 mb-2">Services: {services.length}</div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowAddPopup(true)}
          className="bg-blue-600 text-white p-2 rounded-md"
        >
          Add New Service
        </button>
        <button
          onClick={() => {
            const serviceId = prompt("Enter the ID of the service to edit:");
            const svc = services.find(s => s.id === Number(serviceId));
            if (svc) {
              setSelectedService(svc);
              setShowAddPopup(true);
            } else {
              alert("Service not found!");
            }
          }}
          className="bg-yellow-500 text-white p-2 rounded-md"
        >
          Edit Service
        </button>
        <button
          onClick={() => { setServices(initialServices); alert('Reset sample services'); }}
          className="border p-2 rounded-md"
        >
          Reset Services
        </button>
      </div>
    </div>
  )}
</div>



      {/* Add / Edit Popup */}
      {showAddPopup && (
        <AddEditPopup onClose={() => { setShowAddPopup(false); setSelectedService(null); }} onSave={(data) => {
          if (selectedService) {
            updateService(selectedService.id, data);
            setSelectedService(null);
          } else addService(data);
          setShowAddPopup(false);
        }} service={selectedService} categories={categories} />
      )}

    </div>
  );
}

// -------- Add/Edit popup component --------
function AddEditPopup({ onClose, onSave, service, categories }) {
  const [form, setForm] = useState(service ? { ...service } : { category: 'gas', name: '', desc: '', price: '₹0', time: '30 min', rating: 4.5 });

  useEffect(() => { if (service) setForm({ ...service }); }, [service]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-60 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{service ? 'Edit Service' : 'Add New Service'}</h3><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        <div className="space-y-3">
          <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full p-2 border rounded-md">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full p-2 border rounded-md" placeholder="Service name" />
          <input value={form.desc} onChange={(e) => setForm({...form, desc: e.target.value})} className="w-full p-2 border rounded-md" placeholder="Short description" />
          <input value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="w-full p-2 border rounded-md" placeholder="Price (e.g., ₹200)" />
          <input value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} className="w-full p-2 border rounded-md" placeholder="Time (e.g., 1 hour)" />
          <input value={form.rating} type="number" min="0" max="5" step="0.1" onChange={(e) => setForm({...form, rating: Number(e.target.value)})} className="w-full p-2 border rounded-md" placeholder="Rating" />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => onSave(form)} className="flex-1 bg-blue-600 text-white p-2 rounded-md">Save</button>
          <button onClick={onClose} className="flex-1 border p-2 rounded-md">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/*
------ DEPLOY INSTRUCTIONS (Vercel / Netlify) ------

1) Build prep
- Ensure your project is a standard React app (create-react-app or Vite). Tailwind must be configured if you use it.
- Add this file into src/QuickServeApp.jsx and import it in src/main.jsx / src/index.js.

2) Install packages
- npm i lucide-react
- If using firebase: npm i firebase

3) Tailwind
- Install tailwindcss and configure (https://tailwindcss.com/docs/guides/create-react-app)

4) Vercel
- Login to vercel.com, connect your GitHub repo, choose the project root. Vercel auto-detects React apps.
- Set environment vars for Firebase (if used) in dashboard.
- Deploy.

5) Netlify
- Connect repo to Netlify, set build command (npm run build) and publish directory (build or dist).
- Add environment variables for Firebase if required.

6) Notes
- Replace admin password before production and move it to server-side or environment variables.
- For real admin and booking persistence implement proper auth (Firebase Auth) and Firestore security rules.

*/
