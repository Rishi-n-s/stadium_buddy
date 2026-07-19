import React, { useState, useEffect } from "react";
import { translate, getDir } from "../services/translationEngine";
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import WeatherWidget from '../components/ui/WeatherWidget';
import { DoorOpen, Users, ArrowRight, Home, Shirt, Utensils, ShoppingBag, X, QrCode } from 'lucide-react';

export default function FanHome({
  language,
  setLanguage,
  darkMode,
  setDarkMode,
  onNavigateToWayfinding,
  onNavigateToOffer,
  onNavigateToArena,
  onNavigateToStitch,
  zones,
  selectedStadium
} = {}) {
  const dir = getDir(language);
  const [homeScore, setHomeScore] = useState(2);
  const [awayScore, setAwayScore] = useState(1);
  const [showOffer, setShowOffer] = useState(null);

  // Score simulator ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        if (Math.random() > 0.5) {
          setHomeScore(s => s + 1);
        } else {
          setAwayScore(s => s + 1);
        }
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getZoneCrowdStatus = (zoneId) => {
    const zone = zones?.[zoneId];
    if (!zone) return { label: 'UNKNOWN', color: 'neutral' };
    const pct = zone.current / zone.capacity;
    if (pct > 0.9) return { label: 'CRITICAL', color: 'error', bg: 'bg-error', text: 'text-error' };
    if (pct > 0.75) return { label: 'MODERATE', color: 'info', bg: 'bg-primary', text: 'text-primary' };
    return { label: 'CLEAR', color: 'success', bg: 'bg-secondary-fixed', text: 'text-secondary-fixed' };
  };

  const gate4Status = getZoneCrowdStatus('gate_4');
  const concourseBStatus = getZoneCrowdStatus('concourse_b');

  return (
    <div dir={dir} className="max-w-[1200px] mx-auto px-4 md:px-gutter mt-8 space-y-12 pb-24 w-full min-h-screen bg-surface text-on-surface">
      
      {/* Live Score Hero */}
      <section className="relative">
        <Card className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group">
          <div className="absolute inset-0 opacity-10 pointer-events-none" />
          
          {/* Team 1 */}
          <div className="flex flex-col items-center md:items-start z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-surface border border-outline-variant p-4 flex items-center justify-center mb-4 flex-shrink-0">
              <img className="w-full h-full object-contain" alt="Home Team" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdhp-a2aYjMJ9HlFq-cgaPJQ2RYId7XLKYL8n1gMuUf_-_8yidAD03RDTdWGa2tIp82htJ7x0xwl0Vxrkt9MTmrMfos6J1BniCFqyJohGyUK-QUOf4fjEoUdlFuOhbqVZ1CkSfOJvtocehQEY-sGh9PXWWvDoqxVd0Njk_jFYfcpbcGb6pZniEra1snMAFZxINC6e3F7MLRtJHz-puBuVlUbcsAcwxYFk3SiYIF7igx4zZlJTH3x6evw"/>
            </div>
            <h2 className="text-display-xl font-display-xl uppercase text-on-surface tracking-widest break-words text-center md:text-left">
              {selectedStadium && selectedStadium.hometeams ? selectedStadium.hometeams.split(',')[0].trim() : "TITANS FC"}
            </h2>
          </div>

          {/* Center Column: Clock, Score, and Weather */}
          <div className="flex flex-col items-center z-10 gap-6">
            <div className="flex flex-col items-center">
              <Badge variant="error" className="mb-4">
                <span className="w-2 h-2 rounded-full bg-on-error animate-pulse mr-2"></span>
                {translate("LIVE / MATCH DAY 22", language)}
              </Badge>
              <div className="flex items-center gap-6 bg-surface-container-highest px-8 py-4 rounded-xl border border-outline-variant shadow-inner">
                <span className="text-display-xl font-display-xl text-on-surface">{homeScore}</span>
                <div className="flex flex-col items-center">
                  <span className="text-headline-sm font-headline-sm text-secondary-fixed mb-1">74:12</span>
                  <span className="text-[10px] font-label-caps text-on-surface-variant">
                    {translate("SECOND HALF", language)}
                  </span>
                </div>
                <span className="text-display-xl font-display-xl text-on-surface">{awayScore}</span>
              </div>
            </div>
            
            <WeatherWidget city={selectedStadium ? selectedStadium.city : 'London'} />
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center md:items-end z-10 text-right">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-surface border border-outline-variant p-4 flex items-center justify-center mb-4 flex-shrink-0">
              <img className="w-full h-full object-contain" alt="Away Team" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbt9g6I1dQInjqQ1c_UID-k2M5uYi27mVt5Q4hKt5tX3jMilprp2O3GSE1H7vFfWoyhxr86IujQnRSs22NNEcGIsj_kPJqOWUcfvqyFzU76tYUsoQlqnuDvLnwNcZoMdGDuegzkru0kdcp2dq7R-0qO1wwA-GO7Wy1pxdAhCkRj7PVxnK5wzeegUrj6rxpd4r47yj8zrzgqbkwY9PMHwjJlyUzWHllpJ7rZYsPsPr3nem04sUnkOpttg"/>
            </div>
            <h2 className="text-display-xl font-display-xl uppercase text-on-surface tracking-widest break-words text-center md:text-right">
              {selectedStadium && selectedStadium.hometeams && selectedStadium.hometeams.split(',')[1] ? selectedStadium.hometeams.split(',')[1].trim() : "APEX UTD"}
            </h2>
          </div>
        </Card>
      </section>

      {/* Smart Status Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gate Status */}
        <Card className="p-0 overflow-hidden">
          <div className={`${gate4Status.bg || 'bg-surface-variant'} ${gate4Status.bg ? 'bg-opacity-20' : ''} px-4 py-2 border-b border-outline-variant/30 flex items-center gap-2`}>
            <DoorOpen className={`h-4 w-4 ${gate4Status.text || 'text-on-surface'}`} />
            <span className={`text-label-caps font-label-caps ${gate4Status.text || 'text-on-surface'}`}>{translate("GATE 4 ACCESS", language)}</span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className={`text-headline-md font-headline-md ${gate4Status.text || 'text-on-surface'}`}>
                  {translate(gate4Status.label, language)}
                </p>
                <p className="text-on-surface-variant font-label-caps mt-1">
                  {translate("EST. WAIT: < 2 MIN", language)}
                </p>
              </div>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
              <div className={`w-1/4 ${gate4Status.bg || 'bg-surface-variant'} h-full`}></div>
              <div className="w-3/4 h-full"></div>
            </div>
          </div>
        </Card>

        {/* Concourse Status */}
        <Card className="p-0 overflow-hidden">
          <div className={`${concourseBStatus.bg || 'bg-surface-variant'} ${concourseBStatus.bg ? 'bg-opacity-20' : ''} px-4 py-2 border-b border-outline-variant/30 flex items-center gap-2`}>
            <Users className={`h-4 w-4 ${concourseBStatus.text || 'text-on-surface'}`} />
            <span className={`text-label-caps font-label-caps ${concourseBStatus.text || 'text-on-surface'}`}>{translate("CONCOURSE B", language)}</span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className={`text-headline-md font-headline-md ${concourseBStatus.text || 'text-on-surface'}`}>
                  {translate(concourseBStatus.label, language)}
                </p>
                <p className="text-on-surface-variant font-label-caps mt-1">
                  {translate("TRAFFIC INCREASING", language)}
                </p>
              </div>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
              <div className={`w-2/3 ${concourseBStatus.bg || 'bg-surface-variant'} h-full`}></div>
              <div className="w-1/3 h-full"></div>
            </div>
          </div>
        </Card>


      </section>

      {/* Match Day Offers */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-sm font-headline-sm uppercase tracking-widest text-primary flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            {translate("MATCH DAY OFFERS", language)}
          </h3>
          <button className="text-label-caps font-label-caps text-on-surface-variant hover:text-primary flex items-center gap-2 transition-colors">
            {translate("VIEW ALL", language)} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x scrollbar-hide">
          {/* Offer 1 */}
          <Card hoverable className="p-0 w-[85vw] sm:w-[300px] md:w-[400px] snap-start overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setShowOffer("burger")}>
            <div className="h-48 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Burger Offer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFN3VUV36J_PzfpWrX7DqOfeeASkz8bzI5toe7LzGy6TiKaLFZGF5H625p_owdz5cCmuV504Wzij6oOGm-GmQ3sQCGxzoowY53opRsYc_ePhXLoAYKOVDH4j3gVEhYmSmXOYKPlX6b_zm7MI89-D9YYQOsj-GHUDToRT2ZpTJFTeJWTaXHsTGI-d_6HotGGLgAn94o8RA2KvIz-W4vD8aqqVe4f0-PaCquzd4G1Oh2aPHQDj16B-h7HQ"/>
              <div className="absolute top-4 right-4">
                <Badge variant="success">30% OFF</Badge>
              </div>
            </div>
            <div className="p-4">
              <p className="text-label-caps font-label-caps text-secondary-fixed mb-1">FAN FAVORITE</p>
              <h4 className="text-headline-sm font-headline-sm uppercase text-on-surface">{translate("PRE-MATCH COMBO", language)}</h4>
              <p className="text-on-surface-variant text-body-md font-body-md">{translate("Valid until kickoff at all vendors.", language)}</p>
            </div>
          </Card>
          {/* Offer 2 */}
          <Card hoverable className="p-0 w-[85vw] sm:w-[300px] md:w-[400px] snap-start overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setShowOffer("jersey")}>
            <div className="h-48 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Jersey Drop" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYMWZUwaGKtSzU4i0EgGeLcoGurk_TTKP3qt9d8nlud0nYk3WgQOctSeR2shOfJr90SEpOJwv15aaRFt-BpaJ5YFJ74VPJ5P_cw3uxz0_owsHOfj8Kb2saWQ2O7XZq2cXtzMyaVkzcjob0t4wP9RRZZNMaHeUu1SYdbv10CtAigfsVwgvapyJy4w7k3VIUn-gTTcZovGTxGQ2TFFpPL2VcPhGHSVYjHKdxnz1h20vw2qHxrOu59zZy9A"/>
              <div className="absolute top-4 right-4">
                 <Badge variant="warning">NEW DROP</Badge>
              </div>
            </div>
            <div className="p-4">
              <p className="text-label-caps font-label-caps text-secondary-fixed mb-1">GEAR UP</p>
              <h4 className="text-headline-sm font-headline-sm uppercase text-on-surface">{translate("SEASON 24 JERSEY", language)}</h4>
              <p className="text-on-surface-variant text-body-md font-body-md">{translate("Exclusive drop for IQ members.", language)}</p>
            </div>
          </Card>
          {/* Offer 3 - New ID */}
          <Card hoverable className="p-0 w-[85vw] sm:w-[300px] md:w-[400px] snap-start overflow-hidden flex-shrink-0 cursor-pointer" onClick={onNavigateToOffer}>
            <div className="h-48 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="VIP Access" src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop"/>
              <div className="absolute top-4 right-4">
                 <Badge variant="info">VIP</Badge>
              </div>
            </div>
            <div className="p-4">
              <p className="text-label-caps font-label-caps text-secondary-fixed mb-1">EXCLUSIVE</p>
              <h4 className="text-headline-sm font-headline-sm uppercase text-on-surface">{translate("PITCH-SIDE LOUNGE", language)}</h4>
              <p className="text-on-surface-variant text-body-md font-body-md">{translate("ID: -8066615689536047946", language)}</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Stitch MCP Pages */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-sm font-headline-sm uppercase tracking-widest text-primary flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            {translate("GLOBAL SPORTS HUB", language)}
          </h3>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-8 snap-x scrollbar-hide">
          <Card hoverable onClick={onNavigateToArena} className="min-w-[160px] snap-start flex flex-col items-center justify-center text-center gap-3 cursor-pointer">
             <Home className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
             <span className="text-label-caps font-label-caps text-on-surface">Arena Home</span>
          </Card>
          <div onClick={() => onNavigateToStitch('/stitch/india-jersey.html')} className="snap-start cursor-pointer">
            <Card hoverable className="min-w-[160px] h-full flex flex-col items-center justify-center text-center gap-3">
               <Shirt className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
               <span className="text-label-caps font-label-caps text-on-surface">India Jersey</span>
            </Card>
          </div>
          <div onClick={() => onNavigateToStitch('/stitch/stadium-eats.html')} className="snap-start cursor-pointer">
            <Card hoverable className="min-w-[160px] h-full flex flex-col items-center justify-center text-center gap-3">
               <Utensils className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
               <span className="text-label-caps font-label-caps text-on-surface">Stadium Eats</span>
            </Card>
          </div>
          <div onClick={() => onNavigateToStitch('/stitch/football-jerseys.html')} className="snap-start cursor-pointer">
             <Card hoverable className="min-w-[160px] h-full flex flex-col items-center justify-center text-center gap-3">
               <Shirt className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
               <span className="text-label-caps font-label-caps text-on-surface">Football Jerseys</span>
             </Card>
          </div>
          <div onClick={() => onNavigateToStitch('/stitch/your-bag.html')} className="snap-start cursor-pointer">
             <Card hoverable className="min-w-[160px] h-full flex flex-col items-center justify-center text-center gap-3">
               <ShoppingBag className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
               <span className="text-label-caps font-label-caps text-on-surface">Your Bag</span>
             </Card>
          </div>
        </div>
      </section>

      {/* Offer Modal */}
      {showOffer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-sm relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOffer(null)}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="mb-4">
               <Badge variant="info">
                 {showOffer === "burger" ? "VOUCHER CODE" : "SHOP OFFER"}
               </Badge>
            </div>
            
            <p className="text-body-md font-body-md text-on-surface mb-6">
              {showOffer === "burger"
                ? "Present this QR code at Titan Snacks to redeem your 30% discount."
                : "Limited quantity available. Head to Store Section A now to purchase."}
            </p>
            <div className="flex flex-col items-center justify-center p-6 bg-surface-container-highest rounded-xl border border-outline-variant mb-6 shadow-inner">
              <div className="w-32 h-32 flex items-center justify-center bg-white rounded-lg">
                <QrCode className="text-surface-container h-24 w-24" />
              </div>
              <span className="text-on-surface font-label-caps font-bold tracking-widest mt-4 text-sm">IQ-742-COMBO</span>
            </div>
          </Card>
        </div>

      )}
    </div>
  );
}
