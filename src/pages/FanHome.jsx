import React, { useState, useEffect } from "react";
import { translate, getDir } from "../services/translationEngine";
import Button from '../components/ui/Button';
import WeatherWidget from '../components/ui/WeatherWidget';

export default function FanHome({
  language,
  setLanguage,
  darkMode,
  setDarkMode,
  onNavigateToWayfinding,
  onNavigateToOffer,
  onNavigateToArena,
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
    if (!zone) return { label: 'UNKNOWN', color: 'bg-surface-variant' };
    const pct = zone.current / zone.capacity;
    if (pct > 0.9) return { label: 'CRITICAL', color: 'bg-error', icon: 'warning' };
    if (pct > 0.75) return { label: 'MODERATE', color: 'bg-primary', icon: 'trending_up' };
    return { label: 'CLEAR', color: 'bg-secondary-fixed', icon: 'check_circle' };
  };

  const gate4Status = getZoneCrowdStatus('gate_4');
  const concourseBStatus = getZoneCrowdStatus('concourse_b');

  return (
    <div dir={dir} className="max-w-7xl mx-auto px-4 md:px-gutter mt-8 space-y-12 pb-24 w-full min-h-screen">
      
      {/* Live Score Hero */}
      <section className="relative">
        <div className="carbon-texture rounded-xl mechanical-border p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group">
          <div className="absolute inset-0 opacity-10 pointer-events-none" />
          
          {/* Team 1 */}
          <div className="flex flex-col items-center md:items-start z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-surface-container-high mechanical-border p-4 glass-overlay flex items-center justify-center mb-4 flex-shrink-0">
              <img className="w-full h-full object-contain" alt="Home Team" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdhp-a2aYjMJ9HlFq-cgaPJQ2RYId7XLKYL8n1gMuUf_-_8yidAD03RDTdWGa2tIp82htJ7x0xwl0Vxrkt9MTmrMfos6J1BniCFqyJohGyUK-QUOf4fjEoUdlFuOhbqVZ1CkSfOJvtocehQEY-sGh9PXWWvDoqxVd0Njk_jFYfcpbcGb6pZniEra1snMAFZxINC6e3F7MLRtJHz-puBuVlUbcsAcwxYFk3SiYIF7igx4zZlJTH3x6evw"/>
            </div>
            <h2 className="text-display-xl font-display-xl uppercase text-white tracking-widest break-words text-center md:text-left">
              {selectedStadium && selectedStadium.hometeams ? selectedStadium.hometeams.split(',')[0].trim() : "TITANS FC"}
            </h2>
          </div>

          {/* Center Column: Clock, Score, and Weather */}
          <div className="flex flex-col items-center z-10 gap-6">
            <div className="flex flex-col items-center">
              <div className="bg-error/20 border border-error px-4 py-1 rounded-md mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                <span className="text-label-caps font-label-caps text-error">
                  {translate("LIVE / MATCH DAY 22", language)}
                </span>
              </div>
              <div className="flex items-center gap-6 bg-black/60 px-8 py-4 rounded-lg border-2 border-outline-variant shadow-[inset_0_2px_10px_rgba(0,0,0,1)]">
                <span className="text-display-xl font-display-xl text-white">{homeScore}</span>
                <div className="flex flex-col items-center">
                  <span className="text-headline-sm font-headline-sm text-secondary-fixed mb-1">74:12</span>
                  <span className="text-[10px] font-mono text-on-surface-variant">
                    {translate("SECOND HALF", language)}
                  </span>
                </div>
                <span className="text-display-xl font-display-xl text-white">{awayScore}</span>
              </div>
            </div>
            
            <WeatherWidget city={selectedStadium ? selectedStadium.city : 'London'} />
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center md:items-end z-10 text-right">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-surface-container-high mechanical-border p-4 glass-overlay flex items-center justify-center mb-4 flex-shrink-0">
              <img className="w-full h-full object-contain" alt="Away Team" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbt9g6I1dQInjqQ1c_UID-k2M5uYi27mVt5Q4hKt5tX3jMilprp2O3GSE1H7vFfWoyhxr86IujQnRSs22NNEcGIsj_kPJqOWUcfvqyFzU76tYUsoQlqnuDvLnwNcZoMdGDuegzkru0kdcp2dq7R-0qO1wwA-GO7Wy1pxdAhCkRj7PVxnK5wzeegUrj6rxpd4r47yj8zrzgqbkwY9PMHwjJlyUzWHllpJ7rZYsPsPr3nem04sUnkOpttg"/>
            </div>
            <h2 className="text-display-xl font-display-xl uppercase text-white tracking-widest break-words text-center md:text-right">
              {selectedStadium && selectedStadium.hometeams && selectedStadium.hometeams.split(',')[1] ? selectedStadium.hometeams.split(',')[1].trim() : "APEX UTD"}
            </h2>
          </div>
        </div>
      </section>

      {/* Smart Status Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gate Status */}
        <div className="glass-overlay rounded-xl mechanical-border group overflow-hidden">
          <div className={`${gate4Status.color} px-4 py-2 border-b border-outline-variant/30 flex items-center gap-2`}>
            <span className="material-symbols-outlined text-sm text-black">door_front</span>
            <span className="text-label-caps font-label-caps text-black">{translate("GATE 4 ACCESS", language)}</span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className={`text-headline-md font-headline-md ${gate4Status.color.replace('bg-', 'text-')}`}>
                  {translate(gate4Status.label, language)}
                </p>
                <p className="text-on-surface-variant font-label-caps">
                  {translate("EST. WAIT: < 2 MIN", language)}
                </p>
              </div>
              <div className="text-right">
                <span className={`material-symbols-outlined text-4xl ${gate4Status.color.replace('bg-', 'text-')}`}>
                  {gate4Status.icon}
                </span>
              </div>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
              <div className={`w-1/4 ${gate4Status.color} h-full`}></div>
              <div className="w-3/4 h-full"></div>
            </div>
          </div>
        </div>

        {/* Concourse Status */}
        <div className="glass-overlay rounded-xl mechanical-border group overflow-hidden">
          <div className={`${concourseBStatus.color} px-4 py-2 border-b border-outline-variant/30 flex items-center gap-2`}>
            <span className="material-symbols-outlined text-sm text-black">groups</span>
            <span className="text-label-caps font-label-caps text-black">{translate("CONCOURSE B", language)}</span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className={`text-headline-md font-headline-md ${concourseBStatus.color.replace('bg-', 'text-')}`}>
                  {translate(concourseBStatus.label, language)}
                </p>
                <p className="text-on-surface-variant font-label-caps">
                  {translate("TRAFFIC INCREASING", language)}
                </p>
              </div>
              <div className="text-right">
                <span className={`material-symbols-outlined text-4xl ${concourseBStatus.color.replace('bg-', 'text-')}`}>
                  {concourseBStatus.icon}
                </span>
              </div>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
              <div className={`w-2/3 ${concourseBStatus.color} h-full`}></div>
              <div className="w-1/3 h-full"></div>
            </div>
          </div>
        </div>


      </section>

      {/* Match Day Offers */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-sm font-headline-sm uppercase tracking-widest text-primary flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            {translate("MATCH DAY OFFERS", language)}
          </h3>
          <button className="text-label-caps font-label-caps text-on-surface-variant hover:text-primary flex items-center gap-2 transition-colors">
            {translate("VIEW ALL", language)} <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x scrollbar-hide">
          {/* Offer 1 */}
          <div className="w-[85vw] sm:w-[300px] md:w-[400px] snap-start glass-overlay rounded-xl mechanical-border overflow-hidden flex-shrink-0 group hover:border-primary transition-colors cursor-pointer" onClick={() => setShowOffer("burger")}>
            <div className="h-48 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Burger Offer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFN3VUV36J_PzfpWrX7DqOfeeASkz8bzI5toe7LzGy6TiKaLFZGF5H625p_owdz5cCmuV504Wzij6oOGm-GmQ3sQCGxzoowY53opRsYc_ePhXLoAYKOVDH4j3gVEhYmSmXOYKPlX6b_zm7MI89-D9YYQOsj-GHUDToRT2ZpTJFTeJWTaXHsTGI-d_6HotGGLgAn94o8RA2KvIz-W4vD8aqqVe4f0-PaCquzd4G1Oh2aPHQDj16B-h7HQ"/>
              <div className="absolute top-4 right-4 bg-secondary-fixed text-black font-bold px-3 py-1 rounded-full text-[10px]">30% OFF</div>
            </div>
            <div className="p-4">
              <p className="text-label-caps font-label-caps text-secondary-fixed mb-1">FAN FAVORITE</p>
              <h4 className="text-headline-sm font-headline-sm uppercase">{translate("PRE-MATCH COMBO", language)}</h4>
              <p className="text-on-surface-variant text-body-md">{translate("Valid until kickoff at all vendors.", language)}</p>
            </div>
          </div>
          {/* Offer 2 */}
          <div className="w-[85vw] sm:w-[300px] md:w-[400px] snap-start bg-surface-container border-2 border-outline-variant hard-shadow flex-shrink-0 group hover:border-secondary-fixed transition-colors cursor-pointer" onClick={() => setShowOffer("jersey")}>
            <div className="h-48 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Jersey Drop" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYMWZUwaGKtSzU4i0EgGeLcoGurk_TTKP3qt9d8nlud0nYk3WgQOctSeR2shOfJr90SEpOJwv15aaRFt-BpaJ5YFJ74VPJ5P_cw3uxz0_owsHOfj8Kb2saWQ2O7XZq2cXtzMyaVkzcjob0t4wP9RRZZNMaHeUu1SYdbv10CtAigfsVwgvapyJy4w7k3VIUn-gTTcZovGTxGQ2TFFpPL2VcPhGHSVYjHKdxnz1h20vw2qHxrOu59zZy9A"/>
              <div className="absolute top-4 right-4 bg-secondary-fixed text-black font-bold skew-x-negative-12 px-3 py-1 border-2 border-black">NEW DROP</div>
            </div>
            <div className="p-4">
              <p className="text-label-caps font-label-caps text-secondary-fixed mb-1">GEAR UP</p>
              <h4 className="text-headline-sm font-headline-sm uppercase">{translate("SEASON 24 JERSEY", language)}</h4>
              <p className="text-on-surface-variant text-body-md">{translate("Exclusive drop for IQ members.", language)}</p>
            </div>
          </div>
          {/* Offer 3 - New ID */}
          <div className="w-[85vw] sm:w-[300px] md:w-[400px] snap-start bg-surface-container border-2 border-outline-variant hard-shadow flex-shrink-0 group hover:border-secondary-fixed transition-colors cursor-pointer" onClick={onNavigateToOffer}>
            <div className="h-48 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="VIP Access" src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop"/>
              <div className="absolute top-4 right-4 bg-secondary-fixed text-black font-bold skew-x-negative-12 px-3 py-1 border-2 border-black">VIP</div>
            </div>
            <div className="p-4">
              <p className="text-label-caps font-label-caps text-secondary-fixed mb-1">EXCLUSIVE</p>
              <h4 className="text-headline-sm font-headline-sm uppercase">{translate("PITCH-SIDE LOUNGE", language)}</h4>
              <p className="text-on-surface-variant text-body-md">{translate("ID: -8066615689536047946", language)}</p>
            </div>
          </div>
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
          <Button onClick={onNavigateToArena} className="min-w-[160px] snap-start glass-overlay rounded-xl mechanical-border p-6 hover:border-primary transition-colors flex flex-col items-center justify-center text-center gap-3 group">
             <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">home</span>
             <span className="text-label-caps font-label-caps">Arena Home</span>
          </Button>
          <a href="/stitch/india-jersey.html" className="min-w-[160px] snap-start glass-overlay rounded-xl mechanical-border p-6 hover:border-primary transition-colors flex flex-col items-center justify-center text-center gap-3 group">
             <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">checkroom</span>
             <span className="text-label-caps font-label-caps">India Jersey</span>
          </a>
          <a href="/stitch/stadium-eats.html" className="min-w-[160px] snap-start glass-overlay rounded-xl mechanical-border p-6 hover:border-primary transition-colors flex flex-col items-center justify-center text-center gap-3 group">
             <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">restaurant</span>
             <span className="text-label-caps font-label-caps">Stadium Eats</span>
          </a>
          <a href="/stitch/football-jerseys.html" className="min-w-[160px] snap-start glass-overlay rounded-xl mechanical-border p-6 hover:border-primary transition-colors flex flex-col items-center justify-center text-center gap-3 group">
             <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">sports_soccer</span>
             <span className="text-label-caps font-label-caps">Football Jerseys</span>
          </a>
          <a href="/stitch/your-bag.html" className="min-w-[160px] snap-start glass-overlay rounded-xl mechanical-border p-6 hover:border-primary transition-colors flex flex-col items-center justify-center text-center gap-3 group">
             <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">shopping_bag</span>
             <span className="text-label-caps font-label-caps">Your Bag</span>
          </a>
        </div>
      </section>

      {/* Offer Modal */}
      {showOffer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-surface-container-high rounded-2xl mechanical-border shadow-2xl relative">
            <Button
              onClick={() => setShowOffer(null)}
              className="absolute top-4 right-4 material-symbols-outlined text-on-surface-variant hover:text-white"
            >
              close
            </Button>
            <div className="bg-primary/20 text-primary border border-primary px-4 py-1 rounded-md mb-4 w-fit">
               <span className="text-label-caps font-label-caps">
                 {showOffer === "burger" ? "VOUCHER CODE" : "SHOP OFFER"}
               </span>
            </div>
            
            <p className="text-body-md text-on-surface mb-6">
              {showOffer === "burger"
                ? "Present this QR code at Titan Snacks to redeem your 30% discount."
                : "Limited quantity available. Head to Store Section A now to purchase."}
            </p>
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-outline-variant mb-6 shadow-inner">
              <div className="w-32 h-32 flex items-center justify-center bg-black rounded-lg">
                <span className="material-symbols-outlined text-white text-7xl font-light">qr_code_2</span>
              </div>
              <span className="text-black font-label-caps font-bold tracking-widest mt-4 text-sm">IQ-742-COMBO</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
