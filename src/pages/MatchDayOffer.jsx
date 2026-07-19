import React, { useState, useEffect } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { ArrowLeft, Ticket, QrCode, TicketCheck } from 'lucide-react';

export default function MatchDayOffer({ onBack }) {
  const offerId = "-8066615689536047946";
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full bg-surface/80 backdrop-blur-sm border-b border-outline-variant/30 p-4 flex items-center justify-between sticky top-0 z-50">
        <Button 
          onClick={onBack} 
          variant="ghost"
          size="sm"
          className="text-on-surface hover:text-primary transition-colors p-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <span className="text-label-caps font-label-caps uppercase text-primary tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full"></span>
          EXCLUSIVE OFFER
        </span>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl p-4 md:p-8 space-y-8 animate-fade-in pb-24">
        
        {/* Hero Image Section */}
        <Card className="relative w-full h-64 md:h-96 p-0 overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop" 
            alt="Exclusive Match Day Event" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          
          <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-10 flex flex-col">
            <Badge variant="info" className="mb-2 backdrop-blur-sm">
              VIP UPGRADE
            </Badge>
            <h1 className="text-display-sm md:text-display-lg font-display-sm text-white uppercase drop-shadow-md">
              PITCH-SIDE LOUNGE
            </h1>
          </div>
        </Card>

        {/* Offer Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="col-span-2 p-6 space-y-4">
            <h2 className="text-headline-md font-headline-md uppercase text-secondary-fixed flex items-center gap-2">Offer Details</h2>
            <p className="text-body-lg font-body-lg text-on-surface leading-relaxed">
              Elevate your match day experience. Gain access to the exclusive pitch-side lounge for the second half of the game. Enjoy complimentary drinks, premium seating, and unparalleled views of the action.
            </p>
            <div className="flex items-center gap-2 text-on-surface-variant font-mono text-sm uppercase">
              <Ticket className="h-4 w-4" />
              Offer ID: {offerId}
            </div>
          </Card>

          <Card className="col-span-1 p-6 flex flex-col justify-center items-center text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-error/20 rounded-full blur-2xl animate-pulse"></div>
            <h3 className="text-label-caps font-label-caps text-on-surface-variant">EXPIRES IN</h3>
            <div className="text-display-md font-display-md text-error tracking-tighter">
              {formatTime(timeLeft)}
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div 
                className="h-full bg-error transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(255,84,73,0.8)]"
                style={{ width: `${(timeLeft / 3600) * 100}%` }}
              ></div>
            </div>
          </Card>

        </div>

        {/* Redemption Code Section */}
        <Card className="p-8 flex flex-col items-center justify-center text-center mt-8 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 text-primary/5 rotate-12 pointer-events-none transition-transform group-hover:scale-110">
            <TicketCheck className="h-64 w-64" />
          </div>
          
          <h2 className="text-headline-sm font-headline-sm uppercase text-primary mb-6">
            SCAN TO REDEEM
          </h2>
          
          <div className="bg-white p-4 md:p-6 rounded-xl border border-outline-variant shadow-inner hover:scale-105 transition-transform duration-300">
            <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center bg-surface-container rounded-lg">
              <QrCode className="text-on-surface h-32 w-32" />
            </div>
          </div>
          
          <p className="mt-8 text-on-surface font-mono uppercase tracking-widest text-sm bg-surface-container-highest/50 px-4 py-2 rounded-lg border border-outline-variant/50">
            Present this code at Entrance Gate A
          </p>
        </Card>

      </div>
    </div>
  );
}
