'use client';

import React, { useState } from 'react';
import { 
  Smartphone, Check, ShoppingBag, Search,
  Headphones, Cable, Shield, Speaker,
  Watch, Plug, Package
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { saveShowroomInquiry, generateShowroomInquiryId } from '@/lib/store';

// ─── Product Catalog Types ───────────────────────────────────────────────────

type ProductCategory = {
  id: string;
  name: string;
  icon: React.ElementType;
  gradient: string;
};

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  specs: string[];
  colors?: string[];
  badge?: string;
  emoji: string;
};

// ─── Product Categories ──────────────────────────────────────────────────────

const CATEGORIES: ProductCategory[] = [
  { id: 'all', name: 'All Products', icon: Package, gradient: 'from-blue-500 to-indigo-500' },
  { id: 'smartphones', name: 'Smartphones', icon: Smartphone, gradient: 'from-violet-500 to-purple-500' },
  { id: 'screen-protectors', name: 'Screen Guards', icon: Shield, gradient: 'from-emerald-500 to-teal-500' },
  { id: 'headphones', name: 'Headphones', icon: Headphones, gradient: 'from-amber-500 to-orange-500' },
  { id: 'bluetooth', name: 'Bluetooth', icon: Speaker, gradient: 'from-cyan-500 to-blue-500' },
  { id: 'cables', name: 'Cables & Hubs', icon: Cable, gradient: 'from-rose-500 to-pink-500' },
  { id: 'chargers', name: 'Chargers', icon: Plug, gradient: 'from-lime-500 to-green-500' },
  { id: 'accessories', name: 'Accessories', icon: Watch, gradient: 'from-fuchsia-500 to-purple-500' },
];

// ─── Product Catalog ─────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  // Smartphones
  { id: 's1', name: 'Samsung Galaxy S24 Ultra', category: 'smartphones', price: 129999, originalPrice: 139999, description: '200MP Camera, Snapdragon 8 Gen 3, S Pen Built-In', specs: ['6.8" Dynamic AMOLED 2X', 'Snapdragon 8 Gen 3', '200MP + 50MP + 12MP + 10MP', '5000mAh, 45W Fast Charge'], colors: ['#1a1a2e', '#f5f0e8', '#4a0e8f', '#c4a35a'], badge: 'Flagship', emoji: '📱' },
  { id: 's2', name: 'iPhone 15 Pro Max', category: 'smartphones', price: 159900, originalPrice: 169900, description: 'A17 Pro Chip, Titanium Design, 5x Optical Zoom', specs: ['6.7" Super Retina XDR', 'A17 Pro Chip', '48MP Triple Camera System', '4441mAh, USB-C'], colors: ['#4a4a4f', '#f5f5f0', '#1f1f2e', '#a08e6d'], badge: 'Premium', emoji: '🍎' },
  { id: 's3', name: 'OnePlus 12', category: 'smartphones', price: 64999, originalPrice: 69999, description: 'Hasselblad Camera, 100W SUPERVOOC', specs: ['6.82" LTPO AMOLED', 'Snapdragon 8 Gen 3', '50MP Hasselblad Triple', '5400mAh, 100W Charge'], colors: ['#1a1a1a', '#2d5a27'], badge: 'Value King', emoji: '⚡' },
  { id: 's4', name: 'Redmi Note 13 Pro+', category: 'smartphones', price: 29999, originalPrice: 32999, description: '200MP Camera, 120W HyperCharge', specs: ['6.67" AMOLED 120Hz', 'Dimensity 7200 Ultra', '200MP OIS Main Camera', '5000mAh, 120W Charge'], colors: ['#1a1a2e', '#0ea5e9', '#6b21a8'], badge: 'Best Seller', emoji: '🔥' },
  { id: 's5', name: 'Realme GT 5 Pro', category: 'smartphones', price: 35999, description: 'Periscope Camera, Snapdragon 8 Gen 3', specs: ['6.78" AMOLED 144Hz', 'Snapdragon 8 Gen 3', '50MP Sony IMX890', '5400mAh, 100W Charge'], colors: ['#1a1a1a', '#1e3a5f'], emoji: '🎯' },
  { id: 's6', name: 'Samsung Galaxy A55 5G', category: 'smartphones', price: 24999, description: 'Awesome Nightography, Super AMOLED', specs: ['6.6" Super AMOLED 120Hz', 'Exynos 1480', '50MP Triple Camera', '5000mAh, 25W Charge'], colors: ['#1a1a2e', '#4169e1', '#8fce00'], emoji: '✨' },

  // Screen Protectors / Tempered Glass
  { id: 'sp1', name: 'D+ Full Cover Tempered Glass', category: 'screen-protectors', price: 499, originalPrice: 999, description: '11D Full Edge Coverage, 9H Hardness Rating', specs: ['Anti-Scratch 9H', 'Oleophobic Coating', 'Bubble-Free Install', 'Available for all models'], badge: 'Popular', emoji: '🛡️' },
  { id: 'sp2', name: 'Privacy Tempered Glass', category: 'screen-protectors', price: 699, description: 'Anti-Spy Filter, 28° Viewing Angle', specs: ['Privacy Filter Tech', '9H Hardness', 'Anti-Fingerprint', 'Edge-to-Edge Fit'], emoji: '🔒' },
  { id: 'sp3', name: 'UV Liquid Tempered Glass', category: 'screen-protectors', price: 899, originalPrice: 1299, description: 'UV Glue Bond, Curved Screen Support', specs: ['UV Light Cure Bond', 'Works on Curved Screens', 'Crystal HD Clarity', 'Scratch Proof'], badge: 'Premium', emoji: '💎' },
  { id: 'sp4', name: 'Matte Anti-Glare Protector', category: 'screen-protectors', price: 399, description: 'Smooth Gaming Touch, No Glare', specs: ['Anti-Glare Coating', 'Smooth Touch Gaming', '0.33mm Thickness', 'Easy Installation'], emoji: '🎮' },

  // Headphones
  { id: 'h1', name: 'boAt Rockerz 450 Pro', category: 'headphones', price: 1499, originalPrice: 2999, description: '40mm Drivers, 70H Playback, ANC', specs: ['40mm Dynamic Drivers', '70 Hours Battery', 'Active Noise Cancel', 'Bluetooth 5.3'], badge: 'Best Seller', emoji: '🎧' },
  { id: 'h2', name: 'JBL Tune 770NC', category: 'headphones', price: 4999, originalPrice: 6999, description: 'JBL Pure Bass, Adaptive ANC', specs: ['JBL Pure Bass Sound', 'Adaptive Noise Cancel', '44 Hours Battery', 'Multi-Point Connect'], badge: 'Premium', emoji: '🎵' },
  { id: 'h3', name: 'Realme Buds Air 5 Pro', category: 'headphones', price: 3299, description: 'LDAC Hi-Res, 50dB ANC', specs: ['LDAC Hi-Res Audio', '50dB Active ANC', '38 Hours Total', 'IP55 Water Resistant'], emoji: '🎶' },
  { id: 'h4', name: 'boAt Airdopes 141 TWS', category: 'headphones', price: 999, originalPrice: 1799, description: 'IWP Technology, ENx AI Mic', specs: ['8mm Drivers', '42 Hours Playback', 'ENx AI Noise Cancel', 'IPX4 Sweat Proof'], badge: 'Hot Deal', emoji: '🔊' },

  // Bluetooth Devices
  { id: 'bt1', name: 'JBL Go 3 Portable Speaker', category: 'bluetooth', price: 2999, originalPrice: 3999, description: 'Pro Sound, IP67 Waterproof, Ultra Portable', specs: ['JBL Pro Sound', 'IP67 Waterproof', '5 Hours Playtime', 'USB-C Charging'], badge: 'Trending', emoji: '📻' },
  { id: 'bt2', name: 'boAt Stone 350 Speaker', category: 'bluetooth', price: 1299, originalPrice: 2490, description: '10W Output, RGB LEDs, TWS Connect', specs: ['10W Stereo Output', 'RGB LED Lights', '12 Hours Battery', 'TWS Pairing'], emoji: '🔈' },
  { id: 'bt3', name: 'Zebronics Music Bomb X', category: 'bluetooth', price: 799, description: 'Portable BT Speaker with FM Radio', specs: ['Bluetooth 5.0', 'FM Radio Built-in', 'MicroSD Support', 'Call Function'], emoji: '🎤' },

  // Cables & USB Hubs
  { id: 'c1', name: 'Anker USB-C to USB-C 60W', category: 'cables', price: 599, description: 'Braided Nylon, 60W PD Fast Charge', specs: ['60W Power Delivery', 'Braided Nylon Build', '480Mbps Data Transfer', '1.8m Length'], badge: 'Recommended', emoji: '🔌' },
  { id: 'c2', name: 'USB-C Multi-Port Hub 7-in-1', category: 'cables', price: 1999, originalPrice: 2999, description: 'HDMI 4K + USB 3.0 + SD Card + PD', specs: ['HDMI 4K@60Hz', '3x USB 3.0 Ports', 'SD/TF Card Reader', '100W PD Pass-Through'], badge: 'Premium', emoji: '🔗' },
  { id: 'c3', name: 'Lightning to USB-C Cable', category: 'cables', price: 399, description: 'MFi Certified, Fast Charge Compatible', specs: ['MFi Certified', '20W Fast Charge', 'Data Sync Support', '1m Durable Cable'], emoji: '📲' },
  { id: 'c4', name: 'Micro USB Data Cable', category: 'cables', price: 149, description: 'Universal Micro-USB, 2.4A Fast Charge', specs: ['2.4A Fast Charge', 'Data Sync Support', 'Universal Compat', '1.5m Length'], emoji: '🔋' },
  { id: 'c5', name: '3-in-1 Multi Charging Cable', category: 'cables', price: 349, originalPrice: 599, description: 'USB-C + Lightning + Micro USB', specs: ['3 Connectors in 1', 'Braided Cable', '2.4A Charge Speed', '1.2m Length'], badge: 'Popular', emoji: '⚡' },

  // Chargers & Power Banks
  { id: 'ch1', name: '20W USB-C PD Fast Charger', category: 'chargers', price: 799, description: 'BIS Certified, iPhone/Android Compatible', specs: ['20W Power Delivery', 'BIS Certified Safe', 'Universal Compat', 'Compact Design'], emoji: '⚡' },
  { id: 'ch2', name: '65W GaN Charger Dual Port', category: 'chargers', price: 1899, originalPrice: 2499, description: 'GaN Tech, Dual USB-C, Laptop Compatible', specs: ['65W GaN Technology', 'Dual USB-C Ports', 'Laptop Compatible', 'Ultra Compact'], badge: 'Premium', emoji: '🔋' },
  { id: 'ch3', name: '10000mAh Power Bank Slim', category: 'chargers', price: 999, originalPrice: 1499, description: '22.5W Fast Charge, Dual Output', specs: ['10000mAh Capacity', '22.5W Fast Output', 'Dual Port Output', 'LED Display'], badge: 'Best Seller', emoji: '🏦' },
  { id: 'ch4', name: '20000mAh Power Bank', category: 'chargers', price: 1599, description: '65W PD Laptop Charge, Triple Output', specs: ['20000mAh Capacity', '65W PD Output', 'Triple Output Ports', 'Airline Safe'], emoji: '🔌' },
  { id: 'ch5', name: 'Wireless Charging Pad 15W', category: 'chargers', price: 699, description: 'Qi Certified, LED Indicator', specs: ['15W Fast Wireless', 'Qi Certified', 'Anti-Slip Surface', 'LED Indicator'], emoji: '📡' },

  // Accessories (Cases, Stands, etc.)
  { id: 'a1', name: 'Premium Silicone Phone Case', category: 'accessories', price: 499, description: 'Soft-Touch Matte, Camera Protection Ring', specs: ['Soft-Touch Matte', 'Camera Bump Guard', 'Wireless Charge OK', 'All Popular Models'], badge: 'Popular', emoji: '🧊' },
  { id: 'a2', name: 'Magnetic Car Phone Mount', category: 'accessories', price: 599, description: 'N52 Neodymium Magnets, 360° Rotation', specs: ['N52 Strong Magnets', '360° Rotation', 'One-Hand Operation', 'Dashboard + Vent'], emoji: '🚗' },
  { id: 'a3', name: 'Ring Light + Tripod 10"', category: 'accessories', price: 899, originalPrice: 1499, description: '3 Color Modes, Adjustable Stand', specs: ['10" Ring Light', '3 Color Modes + 10 Levels', 'Phone + Camera Mount', '50cm-160cm Tripod'], badge: 'Content Creator', emoji: '💡' },
  { id: 'a4', name: 'Smartwatch Band Universal', category: 'accessories', price: 299, description: 'Silicone Strap, Quick Release, 20mm/22mm', specs: ['Premium Silicone', 'Quick Release Pins', '20mm & 22mm Width', '10+ Colors Available'], emoji: '⌚' },
  { id: 'a5', name: 'OTG Adapter USB-C', category: 'accessories', price: 149, description: 'Connect USB Devices to Phone Directly', specs: ['USB-C to USB-A', 'OTG Support', 'Plug & Play', 'Metal Body'], emoji: '🔄' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function ShowroomSector() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !selectedProduct) return;

    const phoneNumber = "918420919571";
    const text = encodeURIComponent(
      `*PKG Shop - Express Order*\n\n` +
      `👤 *Customer Name:* ${customerName}\n` +
      `📦 *Item:* ${selectedProduct.name}\n` +
      `${selectedVariant ? `🎨 *Variant:* ${selectedVariant}\n` : ''}` +
      `🔢 *Quantity:* ${quantity} unit(s)\n` +
      `💰 *Price:* ₹${(selectedProduct.price * quantity).toLocaleString('en-IN')}\n` +
      `💼 *Status:* Awaiting Counter Pick-up\n\n` +
      `Thank you for shopping at PKG Shop!`
    );

    // Save to localStorage for admin dashboard
    saveShowroomInquiry({
      id: generateShowroomInquiryId(),
      timestamp: Date.now(),
      customerName,
      productName: selectedProduct.name,
      productCategory: selectedProduct.category,
      variant: selectedVariant || 'Default',
      quantity,
      status: 'pending',
      whatsappSent: true,
    });
    
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
    setIsOrdered(true);
    
    // Reset after 4 seconds
    setTimeout(() => {
      setIsOrdered(false);
      setSelectedProduct(null);
      setCustomerName('');
      setQuantity(1);
      setSelectedVariant('');
    }, 4000);
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <section id="showroom" className="py-24 bg-black/20 border-t border-white/5 relative">
      {/* Decorative grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-blue-500 font-mono text-xs uppercase tracking-widest border border-blue-500/20 px-3 py-1 rounded-full bg-blue-500/5">
            Sector A: Device Showroom
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            PKG Shop Product Gallery
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Browse our complete collection of smartphones, accessories, cables, chargers, and more. Order instantly via WhatsApp for express counter pickup.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 border ${
                  isActive
                    ? `bg-gradient-to-r ${cat.gradient} text-white border-transparent shadow-lg shadow-blue-500/20`
                    : 'bg-white/[0.03] text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  setSelectedProduct(product);
                  setSelectedVariant(product.colors?.[0] ? '' : '');
                }}
                className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-blue-500/30 hover:bg-white/[0.04] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 relative overflow-hidden"
              >
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[9px] rounded-full font-semibold uppercase tracking-wider">
                    {product.badge}
                  </div>
                )}

                {/* Product Visual */}
                <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.04] flex items-center justify-center mb-4 group-hover:border-blue-500/20 transition-colors">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{product.emoji}</span>
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-blue-300 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-1">{product.description}</p>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-base font-bold text-white">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                    {product.originalPrice && (
                      <span className="text-[10px] text-green-400 font-semibold">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                      </span>
                    )}
                  </div>

                  {/* Color swatches */}
                  {product.colors && (
                    <div className="flex gap-1.5 pt-1">
                      {product.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: color }}
                          title={`Color ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Quick Order Button */}
                  <Button
                    size="sm"
                    className="w-full mt-2 text-xs glow-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                  >
                    <ShoppingBag className="size-3.5 mr-1.5" />
                    Order via WhatsApp
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <Search className="size-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No products found matching your search.</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="text-blue-400 text-xs mt-2 hover:underline">
              Clear filters
            </button>
          </div>
        )}

        {/* Product Count */}
        <div className="text-center mt-8">
          <span className="text-xs text-gray-500 font-mono">
            Showing {filteredProducts.length} of {PRODUCTS.length} products
          </span>
        </div>
      </div>

      {/* ─── Order Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => !isOrdered && setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <Card className="border border-white/10 bg-[#0a0a0a]/95 shadow-2xl backdrop-blur-2xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-3xl">
                        {selectedProduct.emoji}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">{selectedProduct.name}</CardTitle>
                        <CardDescription className="mt-0.5">{selectedProduct.description}</CardDescription>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="text-gray-500 hover:text-white text-xl leading-none p-1"
                    >
                      ×
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price display */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-white">{formatPrice(selectedProduct.price)}</span>
                    {selectedProduct.originalPrice && (
                      <>
                        <span className="text-sm text-gray-500 line-through">{formatPrice(selectedProduct.originalPrice)}</span>
                        <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-full font-semibold">
                          Save {formatPrice(selectedProduct.originalPrice - selectedProduct.price)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-2 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                    {selectedProduct.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-gray-300">
                        <Check className="size-3 text-blue-400 shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>

                  {/* Color Selection */}
                  {selectedProduct.colors && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">Color:</span>
                      <div className="flex gap-2">
                        {selectedProduct.colors.map((color, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedVariant(color)}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${
                              selectedVariant === color
                                ? 'border-blue-400 scale-110 shadow-lg'
                                : 'border-white/20 hover:border-white/40'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Form */}
                  <form onSubmit={handleWhatsAppOrder} className="space-y-3 pt-2 border-t border-white/5">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400">Customer Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter name for counter pick-up"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    
                    <div className="flex items-end gap-4">
                      <div className="flex flex-col gap-1 w-28">
                        <label className="text-xs text-gray-400">Quantity</label>
                        <select
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                          {[1, 2, 3, 4, 5].map(q => (
                            <option key={q} value={q} className="bg-slate-950">{q}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex-1">
                        <Button type="submit" className="w-full flex items-center justify-center gap-2 glow-btn" disabled={isOrdered}>
                          <ShoppingBag className="size-4" />
                          <span>Reserve via WhatsApp — {formatPrice(selectedProduct.price * quantity)}</span>
                        </Button>
                      </div>
                    </div>
                  </form>

                  <AnimatePresence>
                    {isOrdered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-2.5 text-green-400"
                      >
                        <Check className="size-4 shrink-0 mt-0.5" />
                        <p className="text-xs">
                          Order sent to PKG Shop via WhatsApp! Your reservation is being processed. Please complete the checkout on WhatsApp.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>

                <CardFooter className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 mt-2 pt-4">
                  <span>Express Counter Pickup Available</span>
                  <span>Pay at Counter</span>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
