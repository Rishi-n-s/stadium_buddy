import React from "react";
import Button from "../components/ui/Button";

export default function ArenaHome({
  currentUser,
  language,
  setLanguage,
  selectedStadium,
  onNavigateHome
}) {
  const dir = "ltr"; // Simplify for now
  
  const categories = [
    { title: "Team Store", icon: "checkroom", description: "Official jerseys and merch", color: "primary" },
    { title: "Stadium Eats", icon: "restaurant", description: "Order food to your seat", color: "secondary" },
    { title: "VIP Access", icon: "star", description: "Exclusive lounges and perks", color: "tertiary" },
    { title: "Match Highlights", icon: "play_circle", description: "Replays and analysis", color: "error" }
  ];

  return (
    <div dir={dir} className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-24 w-full min-h-screen">
      <header className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <Button onClick={onNavigateHome} className="material-symbols-outlined hover:bg-surface-bright transition-colors p-2 text-primary border border-primary/20 rounded-lg glass-overlay" title="Back to Hub">
            arrow_back
          </Button>
          <div>
            <h1 className="text-display-sm font-display-sm text-primary uppercase tracking-widest">Arena Hub</h1>
            <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest">
              {selectedStadium ? selectedStadium.stadium : "Global Sports Hub"}
            </p>
          </div>
        </div>
      </header>

      {/* Featured Banner */}
      <section className="relative h-64 md:h-80 rounded-2xl overflow-hidden mechanical-border group cursor-pointer">
        <img src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2000&auto=format&fit=crop" alt="Stadium Atmosphere" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
          <div className="bg-primary/20 text-primary border border-primary px-3 py-1 rounded-md mb-3 w-fit">
            <span className="text-label-caps font-label-caps">LIVE EVENT</span>
          </div>
          <h2 className="text-headline-lg font-headline-lg text-white mb-2 uppercase">Championship Finals</h2>
          <p className="text-body-lg text-white/80 max-w-xl">Experience the ultimate matchday with exclusive offers, real-time stats, and priority access to stadium amenities.</p>
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-headline-sm font-headline-sm uppercase tracking-widest text-primary flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            Explore Services
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="glass-overlay rounded-xl mechanical-border p-6 hover:border-primary transition-colors group cursor-pointer flex flex-col items-start gap-4">
               <div className={`w-12 h-12 rounded-lg bg-${cat.color}/10 border border-${cat.color}/30 flex items-center justify-center`}>
                 <span className={`material-symbols-outlined text-2xl text-${cat.color}`}>{cat.icon}</span>
               </div>
               <div>
                 <h4 className="text-headline-sm font-headline-sm uppercase mb-1">{cat.title}</h4>
                 <p className="text-body-sm text-on-surface-variant">{cat.description}</p>
               </div>
               <div className="mt-auto pt-4 flex items-center gap-2 text-primary text-label-caps font-label-caps opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                 ENTER <span className="material-symbols-outlined text-sm">arrow_forward</span>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="glass-overlay rounded-xl mechanical-border p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-primary via-transparent to-transparent pointer-events-none" />
        <h3 className="text-headline-sm font-headline-sm uppercase tracking-widest text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">campaign</span>
          Announcements
        </h3>
        
        <div className="space-y-4">
          {[
            { time: "10 MIN AGO", title: "New Merchandise Drop", text: "The limited edition Season 24 jerseys are now available at the East Stand store." },
            { time: "1 HR AGO", title: "Weather Update", text: "Clear skies expected for the remainder of the match. Enjoy the game!" },
            { time: "2 HRS AGO", title: "Gate Information", text: "Gate 4 is currently experiencing heavy traffic. Please consider using Gate 5 for faster entry." }
          ].map((announcement, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-lg bg-surface-container/50 border border-outline-variant/30 hover:bg-surface-container transition-colors">
              <div className="w-16 flex-shrink-0 text-[10px] font-mono text-primary font-bold mt-1">
                {announcement.time}
              </div>
              <div>
                <h5 className="font-bold text-on-surface mb-1">{announcement.title}</h5>
                <p className="text-sm text-on-surface-variant">{announcement.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
