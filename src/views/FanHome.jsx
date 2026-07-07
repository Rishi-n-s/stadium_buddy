import React, { useState, useEffect } from "react";
import { translate, getDir } from "../services/translationEngine";

export default function FanHome({
  language,
  setLanguage,
  darkMode,
  setDarkMode,
  onNavigateToWayfinding,
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

  return (
    <div dir={dir} className="w-full max-w-md mx-auto md:max-w-4xl p-4 md:p-8">
      {/* Top Header inside view to replicate mockup */}
      <header className="flex justify-between items-center pb-6 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20 bg-surface-container-high">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2KKruU9IiMRlem6Oa8SlLVVE0OdlhI0BwtQZTTiwDG3-hy6jnhYjP2m95dLetFj6Lm8E_EWTcv5FiKFRppw5_Z0VjFUCJG30geksNNyRUkWJuKopHwrpHuCIivz1hsmbp4o7olOklpiJSznXcRnj2iEr88pJFbsSwOprp1_f9_6dkiCRjbsJCB_eMVPXs9-q61DPbDZzAMDB7D3_g1D_rPro46qJk2T1wQB8TlgtTDalfaU2NO8bsuQ"
              alt="User Headshot"
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-primary-light">StadiumIQ</h1>
            <p className="text-[10px] text-on-surface-variant font-mono uppercase">Fan Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-surface-container-highest border border-outline/30 text-on-surface text-xs rounded-lg px-2 py-1 focus:outline-none"
          >
            <option value="en">EN</option>
            <option value="ar">AR</option>
            <option value="ur">UR</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">contrast</span>
          </button>
        </div>
      </header>

      {/* AI Assistant Greeting */}
      <section className="mt-6 mb-6 relative overflow-hidden p-5 rounded-xl border border-secondary/20 bg-surface-container-low shadow-xl">
        {/* Shimmer background overlay */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-secondary/40 to-transparent animate-[pulse_3s_infinite]" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <span className="font-mono text-xs font-bold text-secondary uppercase tracking-wider">
              {translate("GenAI Personal Assistant", language)}
            </span>
            <span className="material-symbols-outlined text-secondary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <p className="text-lg font-bold text-on-surface leading-snug">
            "{translate("Gate 4 is currently clear. Head there now for a 2-minute entry.", language)}"
          </p>
          <div className="mt-4">
            <button
              onClick={onNavigateToWayfinding}
              className="bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary font-mono text-xs font-bold px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">chat_bubble</span>
              {translate("ASK IQ", language)}
            </button>
          </div>
        </div>
      </section>

      {/* Match Score Card */}
      <div className="mb-6 rounded-xl border border-primary/10 bg-surface-container overflow-hidden shadow-2xl relative">
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCNmAnai9-Q3AOLizNj22GlVITeXJRLfy-LqxLraC9EUYR5zd8YNXwv3Wqt969G336I_qPDSedUST6kB_sDKdcTemlAbg7_lHYH_yJ4suzSruT7ElYbiu87lrhtSc0LCpf-sV1_3C6MM5aXXo5YVSEIkLqtaWELAZHWguW1NRqa3e_sLhDlaoll6QUMbYxw6JevqcbYTbmgYrPogb5L1_kvk90aWhIuitDRfgv0ioiAfUghTthCqziKYg')" }}
        />
        <div className="relative p-6 bg-gradient-to-t from-surface via-surface/90 to-transparent">
          <div className="flex justify-between items-center mb-6">
            <span className="bg-error text-on-error-container text-[10px] px-2.5 py-0.5 rounded-full font-bold animate-pulse">
              LIVE • 2ND HALF 64'
            </span>
            <span className="font-mono text-xs text-primary-light uppercase tracking-wider">CHAMPIONS LEAGUE</span>
          </div>
          <div className="flex justify-between items-center px-2 sm:px-4 gap-2">
            <div className="flex flex-col items-center gap-2 text-center min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-on-surface">
                <span className="material-symbols-outlined text-2xl sm:text-3xl">shield</span>
              </div>
              <span className="font-mono text-[10px] sm:text-xs font-bold text-on-surface truncate w-full">
                {selectedStadium && selectedStadium.hometeams ? selectedStadium.hometeams.split(',')[0].trim().toUpperCase() : "TITANS FC"}
              </span>
            </div>
            
            <div className="flex flex-col items-center flex-shrink-0 px-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-wider tabular-nums">
                {homeScore} - {awayScore}
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono text-outline uppercase mt-1 text-center max-w-[120px] truncate">
                {selectedStadium ? selectedStadium.stadium.toUpperCase() : "STADIUMIQ ARENA"}
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 text-center min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-on-surface">
                <span className="material-symbols-outlined text-2xl sm:text-3xl">rocket_launch</span>
              </div>
              <span className="font-mono text-[10px] sm:text-xs font-bold text-on-surface truncate w-full">
                {selectedStadium && selectedStadium.hometeams && selectedStadium.hometeams.split(',')[1] ? selectedStadium.hometeams.split(',')[1].trim().toUpperCase() : "APEX UTD"}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Live Status Card */}
        <div className="p-5 rounded-xl border border-outline-variant bg-surface-container-low flex flex-col justify-between min-h-[170px]">
          <div>
            <h3 className="font-mono text-xs font-bold text-outline uppercase tracking-wider mb-4">
              {translate("VENUE LIVE STATUS", language)}
            </h3>
            
            <div className="space-y-4">
              {/* Gate 4 Status */}
              <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>{translate("Gate 4 (West)", language)}</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-secondary font-bold">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span>{translate("LOW CROWD", language)}</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full" style={{ width: "15%" }} />
                </div>
              </div>

              {/* Concourse B Status */}
              <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>{translate("Concourse B", language)}</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-tertiary font-bold">
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    <span>{translate("MODERATE", language)}</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full" style={{ width: "55%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Route Card */}
        <div 
          onClick={onNavigateToWayfinding}
          className="group relative overflow-hidden p-5 rounded-xl border border-primary/20 bg-primary-container/10 flex flex-col justify-between min-h-[170px] cursor-pointer hover:border-primary/50 active:scale-[0.98] transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined">assistant_navigation</span>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-primary-light group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </div>
          <div className="z-10">
            <h3 className="text-lg font-bold text-on-surface mb-1">
              {translate("Smart Wayfinding", language)}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {translate("Fastest route to Section 102, Seat 12A", language)}
            </p>
          </div>
          <div className="absolute bottom-[-15px] right-[-15px] opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-9xl">near_me</span>
          </div>
        </div>
      </div>

      {/* Recommended For You Carousel */}
      <section className="mb-8">
        <h2 className="font-mono text-xs font-bold text-outline uppercase tracking-wider mb-3">
          {translate("RECOMMENDED FOR YOU", language)}
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          
          {/* Card 1 */}
          <div className="flex-shrink-0 w-64 p-4 rounded-xl border border-outline-variant bg-surface-container-high">
            <div className="w-full h-32 rounded-lg mb-3 overflow-hidden bg-surface-container-lowest">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuALED6C-WHnsTubpq5inIW9DQKHNGh5FSV3769nJHCOvyzNnQNtCry-HhOtz_MnnuU75RM5Tiji34Du6mFRDAagI6JFW-heE6PYWeFwwJZrH5riYuvPEFs77bGoEqFpFhsqYwt-DIANhAbwrzL2AVGgR4s72d3ppQFDiYeXEOz91VsFMlOOVtxPP3B5YbUNJb6hqpp5fJp8dn2Be_02XB4eQyVSLWlNMt4PUoDDzolKjDcphpcGgNoErQ"
                alt="Burger Offer"
              />
            </div>
            <h4 className="text-sm font-bold text-on-surface">{translate("50% Off Match Day Combo", language)}</h4>
            <p className="text-xs text-on-surface-variant mb-3">{translate("Available at Titan Snacks (2 min away)", language)}</p>
            <button 
              onClick={() => setShowOffer("burger")}
              className="w-full py-1.5 bg-surface-container-highest text-primary-light font-mono text-xs font-bold rounded-lg hover:bg-primary-container hover:text-white transition-colors"
            >
              {translate("REDEEM", language)}
            </button>
          </div>

          {/* Card 2 */}
          <div className="flex-shrink-0 w-64 p-4 rounded-xl border border-outline-variant bg-surface-container-high">
            <div className="w-full h-32 rounded-lg mb-3 overflow-hidden bg-surface-container-lowest">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlJfXxPZ-uslRnheNZr8oey8F8W_Y74LxknnZY1-lqvN1K9PuzXVsJdOPSori9JMcTjtYybHzajaN9H6YiXVVLTPE0NP3TMv5A3ba2ksYwbdgGSjBhiJH3aLbBRVb8OFQfDFn10ceCMbVSPvlA3SsWDSylyziJKf6tFIaBraDwpSGvtcmK4A9zwmF9UiWKz76XPOQvRpx2FHAOYgCxsI_Fpvq4RGmeys6yzhdUmt3I4tnv_gtiI7d-dQ"
                alt="Jersey Drop"
              />
            </div>
            <h4 className="text-sm font-bold text-on-surface">{translate("Limited Edition Jersey", language)}</h4>
            <p className="text-xs text-on-surface-variant mb-3">{translate("Exclusive drop for StadiumIQ members", language)}</p>
            <button 
              onClick={() => setShowOffer("jersey")}
              className="w-full py-1.5 bg-surface-container-highest text-primary-light font-mono text-xs font-bold rounded-lg hover:bg-primary-container hover:text-white transition-colors"
            >
              {translate("SHOP NOW", language)}
            </button>
          </div>

        </div>
      </section>

      {/* Offer Modal */}
      {showOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-surface-container-high rounded-xl border border-primary/20 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-primary-light uppercase font-mono">
                {showOffer === "burger" ? "Voucher Code" : "Shop Offer"}
              </h3>
              <button 
                onClick={() => setShowOffer(null)}
                className="material-symbols-outlined text-on-surface-variant hover:text-on-surface"
              >
                close
              </button>
            </div>
            <p className="text-sm text-on-surface mb-6">
              {showOffer === "burger" 
                ? "Present this QR code at Titan Snacks to redeem your 50% discount." 
                : "Limited quantity available. Head to Store Section A now to purchase."}
            </p>
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg mb-6">
              {/* Mock QR / Barcode */}
              <div className="w-40 h-40 bg-zinc-800 flex items-center justify-center rounded">
                <span className="material-symbols-outlined text-white text-7xl font-light">qr_code_2</span>
              </div>
              <span className="text-black font-mono font-bold tracking-widest mt-2 text-sm">IQ-742-COMBO</span>
            </div>
            <button
              onClick={() => setShowOffer(null)}
              className="w-full py-2.5 bg-secondary text-on-secondary hover:brightness-110 rounded-lg font-mono text-xs font-bold transition-all"
            >
              {translate("You have arrived at your destination.", language) === "لقد وصلت إلى وجهتك." ? "تم الحفظ" : "DONE"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
