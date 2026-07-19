import React from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { ArrowLeft, PlayCircle, Star, Utensils, Shirt, Megaphone, ArrowRight } from "lucide-react";

export default function ArenaHome({
  currentUser,
  language,
  setLanguage,
  selectedStadium,
  onNavigateHome
}) {
  const dir = "ltr"; // Simplify for now
  
  const categories = [
    { title: "Team Store", icon: Shirt, description: "Official jerseys and merch", color: "primary" },
    { title: "Stadium Eats", icon: Utensils, description: "Order food to your seat", color: "secondary" },
    { title: "VIP Access", icon: Star, description: "Exclusive lounges and perks", color: "tertiary" },
    { title: "Match Highlights", icon: PlayCircle, description: "Replays and analysis", color: "error" }
  ];

  return (
    <div dir={dir} className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-8 pb-24 w-full min-h-screen bg-surface text-on-surface">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onNavigateHome} className="p-2" title="Back to Hub">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-headline-md font-headline-md text-primary uppercase tracking-widest">Arena Hub</h1>
            <p className="text-label-caps text-on-surface-variant font-label-caps uppercase tracking-widest">
              {selectedStadium ? selectedStadium.stadium : "Global Sports Hub"}
            </p>
          </div>
        </div>
      </header>

      {/* Featured Banner */}
      <Card className="relative h-64 md:h-80 overflow-hidden group cursor-pointer p-0 border-0">
        <img src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2000&auto=format&fit=crop" alt="Stadium Atmosphere" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
          <div className="mb-3 w-fit">
            <Badge variant="error">LIVE EVENT</Badge>
          </div>
          <h2 className="text-display-lg font-display-lg text-white mb-2 uppercase">Championship Finals</h2>
          <p className="text-body-lg font-body-lg text-white/80 max-w-xl">Experience the ultimate matchday with exclusive offers, real-time stats, and priority access to stadium amenities.</p>
        </div>
      </Card>

      {/* Categories Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-headline-sm font-headline-sm uppercase tracking-widest text-primary flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            Explore Services
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Card hoverable key={idx} className="group cursor-pointer flex flex-col items-start gap-4">
                 <div className={`w-12 h-12 rounded-lg bg-${cat.color}/10 border border-${cat.color}/30 flex items-center justify-center`}>
                   <Icon className={`h-6 w-6 text-${cat.color}`} />
                 </div>
                 <div>
                   <h4 className="text-headline-sm font-headline-sm uppercase mb-1">{cat.title}</h4>
                   <p className="text-body-sm font-body-md text-on-surface-variant">{cat.description}</p>
                 </div>
                 <div className="mt-auto pt-4 flex items-center gap-2 text-primary text-label-caps font-label-caps opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                   ENTER <ArrowRight className="h-4 w-4" />
                 </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Latest Announcements */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-primary via-transparent to-transparent pointer-events-none" />
        <h3 className="text-headline-sm font-headline-sm uppercase tracking-widest text-on-surface mb-6 flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          Announcements
        </h3>
        
        <div className="space-y-4">
          {[
            { time: "10 MIN AGO", title: "New Merchandise Drop", text: "The limited edition Season 24 jerseys are now available at the East Stand store." },
            { time: "1 HR AGO", title: "Weather Update", text: "Clear skies expected for the remainder of the match. Enjoy the game!" },
            { time: "2 HRS AGO", title: "Gate Information", text: "Gate 4 is currently experiencing heavy traffic. Please consider using Gate 5 for faster entry." }
          ].map((announcement, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-xl bg-surface-container-high/50 border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
              <div className="w-16 flex-shrink-0 text-[10px] font-label-caps tracking-wider text-primary mt-1">
                {announcement.time}
              </div>
              <div>
                <h5 className="font-bold text-on-surface mb-1">{announcement.title}</h5>
                <p className="text-sm font-body-md text-on-surface-variant">{announcement.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
