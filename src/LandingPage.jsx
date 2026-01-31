import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Bell,
  ClipboardList,
  Droplets,
  LayoutGrid,
  Lock,
  Microscope,
  Search,
  Smartphone,
  Zap,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const MobileFeature = ({ icon, label, color }) => {
  const colors = {
    indigo: 'text-[#FF4F41] bg-[#FF4F41]/10',
    sky: 'text-sky-600 bg-sky-50',
    violet: 'text-[#FF4F41] bg-[#FF4F41]/10',
    slate: 'text-slate-600 bg-slate-50'
  };
  return (
    <div className="p-4 rounded-card bg-white border border-slate-100 flex flex-col items-center gap-2 shadow-soft active:bg-slate-50 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </div>
  );
};

const NavIcon = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 p-2">
    <div className={`transition-colors ${active ? 'text-[#FF4F41]' : 'text-slate-400'}`}>
      {React.cloneElement(icon, { size: 22 })}
    </div>
    <span
      className={`text-[10px] font-bold tracking-tight transition-colors ${active ? 'text-[#FF4F41]' : 'text-slate-400'}`}
    >
      {label}
    </span>
  </button>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const avatarBg = useMemo(() => ['bg-slate-200', 'bg-slate-300', 'bg-slate-400'], []);
  
  const handleEnterApp = () => {
    navigate('/app');
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      setShowScrollUp(scrollTop > 300);
      setShowScrollDown(scrollTop + windowHeight < documentHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-slate-900 font-sans selection:bg-[#FF4F41]/20 pb-24 md:pb-0">
      {/* Top Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF4F41] rounded-lg flex items-center justify-center shadow-lg shadow-[#FF4F41]/20">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-extrabold tracking-tight text-lg italic">bodyOS</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden md:inline-flex px-4 py-2 bg-slate-900 text-white rounded-button-pill font-bold text-sm shadow-soft-lg active:scale-[0.98] transition-transform" onClick={handleEnterApp}>
            Open App
          </button>
          <button className="p-2 bg-slate-50 rounded-full text-slate-600">
            <Bell size={20} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] right-[-20%] w-[300px] h-[300px] bg-[#FF4F41]/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-[-20%] w-[300px] h-[300px] bg-[#FF4F41]/5 rounded-full blur-[80px]"></div>
        </div>

        <div className="max-w-md mx-auto md:max-w-5xl md:grid md:grid-cols-2 md:gap-10 md:items-center space-y-10 md:space-y-0">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-100 text-[#FF4F41] text-[10px] font-bold uppercase tracking-widest shadow-sm">
              <Smartphone size={12} /> The Lab in Your Pocket
            </div>
            <h1 className="text-4xl md:text-5xl font-[900] text-slate-900 leading-[1.1] tracking-tight">
              Biohacking, <span className="text-[#FF4F41]">Simplified.</span>
            </h1>
            <p className="text-base text-slate-600 font-medium leading-relaxed">
              Manage peptides, track nutrient floors, and optimize your biology with clinical precision.
            </p>

            <div className="space-y-3">
              <button className="w-full md:w-auto md:px-8 py-4 bg-slate-900 text-white rounded-button-pill font-bold text-base shadow-soft-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                Download on iOS <ArrowUpRight size={18} />
              </button>
              <button
                className="w-full md:w-auto md:px-8 py-4 bg-[#FF4F41] text-white rounded-button-pill font-bold text-base shadow-soft-lg shadow-[#FF4F41]/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform hover:bg-gradient-nuraform"
                onClick={handleEnterApp}
              >
                Preview Web App <ArrowUpRight size={18} />
              </button>
              <p className="text-[11px] text-slate-400 font-bold uppercase text-center md:text-left tracking-widest">
                Available on Android & iOS
              </p>
            </div>
          </div>

          {/* App Preview */}
          <div className="px-0 md:px-4">
            <div className="bg-white rounded-[32px] p-6 shadow-soft-lg border border-slate-50 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900">Today's Protocol</h3>
                <span className="text-xs font-bold text-[#FF4F41] bg-[#FF4F41]/10 px-3 py-1 rounded-full">
                  85% Complete
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                  <div className="w-10 h-10 bg-[#FF4F41] rounded-xl flex items-center justify-center text-white">
                    <Zap size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">BPC-157 / TB-500</p>
                    <p className="text-[11px] text-slate-500 font-medium">0.25ml • 10:00 AM</p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-[#FF4F41]/30"></div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-sky-400 rounded-xl flex items-center justify-center text-white">
                    <Droplets size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">Electrolyte Floor</p>
                    <p className="text-[11px] text-slate-500 font-medium">1.2L / 2.5L</p>
                  </div>
                  <div className="w-1/4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-sky-400"></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-white ${avatarBg[i - 1]} flex items-center justify-center text-[10px] font-bold`}
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 font-bold">Protocol shared with 4 researchers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pills */}
      <section className="py-12 px-6">
        <h2 className="text-xl font-black mb-6 text-center">Engineered for Complexity</h2>
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <MobileFeature icon={<ClipboardList size={20} />} label="Recon Wizard" color="indigo" />
          <MobileFeature icon={<Activity size={20} />} label="HRV Sync" color="sky" />
          <MobileFeature icon={<Lock size={20} />} label="Local Vault" color="violet" />
          <MobileFeature icon={<Search size={20} />} label="Scan Fuel" color="slate" />
        </div>
      </section>

      {/* Privacy Message */}
      <section className="px-6 py-10">
        <div className="bg-[#0F172A] rounded-[32px] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4F41]/10 blur-3xl"></div>
          <Smartphone size={48} className="text-[#FF4F41] mx-auto mb-6" />
          <h3 className="text-white text-xl font-bold mb-3">Privacy First. Always.</h3>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Your biological data never leaves your device. We use zero-knowledge architecture to protect your sovereignty.
          </p>
        </div>
      </section>

      {/* Mobile Bottom Navigation (Native Style) */}
      <div className="fixed bottom-0 w-full z-50 px-6 pb-6 md:hidden">
        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/60 rounded-[24px] h-18 flex justify-around items-center px-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]">
          <NavIcon icon={<LayoutGrid />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavIcon icon={<Activity />} label="Health" active={activeTab === 'health'} onClick={() => setActiveTab('health')} />
          <div className="relative -top-6">
            <button
              onClick={handleEnterApp}
              className="w-14 h-14 bg-[#FF4F41] rounded-2xl shadow-soft-lg shadow-[#FF4F41]/20 flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-gradient-nuraform"
            >
              <Zap fill="currentColor" size={24} />
            </button>
          </div>
          <NavIcon icon={<Microscope />} label="Science" active={activeTab === 'science'} onClick={() => setActiveTab('science')} />
          <NavIcon icon={<Smartphone />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>
      </div>

      {showScrollUp && (
        <button
          onClick={scrollToTop}
          className="fixed right-6 bottom-32 z-50 p-3 bg-[#FF4F41] text-white rounded-full shadow-soft-lg hover:bg-gradient-nuraform transition-all hover:scale-110 active:scale-95"
          title="Scroll to top"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {showScrollDown && (
        <button
          onClick={scrollToBottom}
          className="fixed right-6 bottom-40 z-50 p-3 bg-[#FF4F41] text-white rounded-full shadow-soft-lg hover:bg-gradient-nuraform transition-all hover:scale-110 active:scale-95"
          title="Scroll to bottom"
        >
          <ChevronDown size={20} />
        </button>
      )}
    </div>
  );
}

