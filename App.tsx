import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Menu, Home as HomeIcon, Search as SearchIcon, Star, 
  MapPin, User, Info, X, Calendar, ArrowRight, Trash2,
  ChevronRight, Filter, Clock, Tag, ExternalLink, CalendarPlus,
  Share2, ArrowUp
} from 'lucide-react';
import { EVENTS } from './constants';
import { KakuregaEvent, UserLocation } from './types';

// --- Shared Components ---

const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-kakurega-green text-white shadow-xl hover:bg-kakurega-dark-green hover:-translate-y-1 transition-all duration-300 animate-fade-in border-2 border-[#f8f1e3]"
            aria-label="ページトップへ戻る"
        >
            <ArrowUp size={24} />
        </button>
    );
};

const AddToCalendarButton: React.FC<{ event: KakuregaEvent, className?: string, children?: React.ReactNode }> = ({ event, className, children }) => {
    const googleCalendarUrl = useMemo(() => {
        const title = encodeURIComponent(event.title);
        const location = encodeURIComponent(`${event.city} ${event.area}`);
        const details = encodeURIComponent(event.description || '');
        const dateStr = event.date.replace(/-/g, '');
        const start = event.startTime ? event.startTime.replace(':', '') : '1000';
        const end = event.endTime ? event.endTime.replace(':', '') : '1200';
        const dates = `${dateStr}T${start}00/${dateStr}T${end}00`;
        
        // ctz=Asia/Tokyo adds Timezone support ensuring events are added in JST
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&ctz=Asia/Tokyo`;
    }, [event]);

    return (
        <a 
            href={googleCalendarUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={className || "flex items-center gap-1.5 text-[10px] font-bold text-kakurega-muted bg-kakurega-paper hover:bg-kakurega-paper-light border border-black/10 px-3 py-1.5 rounded-full transition-colors"}
            onClick={(e) => e.stopPropagation()}
        >
            {children ? children : (
                <>
                    <CalendarPlus size={16} />
                    予定に追加
                </>
            )}
        </a>
    );
};

const EventDetailModal: React.FC<{ eventId: string, onClose: () => void }> = ({ eventId, onClose }) => {
    const event = useMemo(() => EVENTS.find(e => e.id === Number(eventId)), [eventId]);
    
    // Prevent background scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    // Load saved state
    const [isSaved, setIsSaved] = useState(false);
    useEffect(() => {
        try {
            const raw = localStorage.getItem("savedEventIds");
            const ids: number[] = raw ? JSON.parse(raw) : [];
            setIsSaved(ids.includes(Number(eventId)));
        } catch {}
    }, [eventId]);

    const toggleSave = () => {
        try {
            const raw = localStorage.getItem("savedEventIds");
            const ids: number[] = raw ? JSON.parse(raw) : [];
            let newIds;
            if (ids.includes(Number(eventId))) {
                newIds = ids.filter(i => i !== Number(eventId));
                setIsSaved(false);
            } else {
                newIds = [...ids, Number(eventId)];
                setIsSaved(true);
            }
            localStorage.setItem("savedEventIds", JSON.stringify(newIds));
        } catch {}
    };

    if (!event) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="bg-[#f8f1e3] w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-fade-in">
                {/* Image Header */}
                <div className="h-56 sm:h-72 relative shrink-0">
                    <img src={event.imageUrl || 'https://images.unsplash.com/photo-1528360983277-13d9b152c611?auto=format&fit=crop&q=80'} className="w-full h-full object-cover" alt={event.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-kakurega-ink/80 via-transparent to-transparent" />
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors z-10">
                        <X size={24} />
                    </button>
                    <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                         <div className="flex items-center gap-2 mb-2">
                             <span className="px-3 py-1 bg-kakurega-green text-xs font-bold rounded-full shadow-sm border border-white/20">
                                {event.category}
                             </span>
                             {event.distKm && (
                                 <span className="px-2 py-1 bg-black/40 backdrop-blur text-xs rounded-full flex items-center gap-1">
                                     <MapPin size={10} /> {event.distKm.toFixed(1)}km
                                 </span>
                             )}
                         </div>
                         <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight drop-shadow-md">
                            {event.title}
                         </h2>
                    </div>
                </div>
                
                {/* Content */}
                <div className="overflow-y-auto p-6 custom-scrollbar bg-[#f8f1e3]">
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        <div className="bg-white/60 p-3.5 rounded-2xl border border-black/5 flex items-start gap-3">
                             <div className="p-2 bg-kakurega-green/10 rounded-full text-kakurega-green mt-0.5"><Calendar size={18} /></div>
                             <div>
                                <p className="text-[10px] text-kakurega-muted font-bold tracking-wider">DATE</p>
                                <p className="font-bold text-kakurega-ink text-sm">{event.date.replace(/-/g, '.')}</p>
                                <p className="text-xs text-kakurega-muted mt-0.5">{event.startTime} - {event.endTime}</p>
                             </div>
                        </div>
                        <div className="bg-white/60 p-3.5 rounded-2xl border border-black/5 flex items-start gap-3">
                             <div className="p-2 bg-kakurega-green/10 rounded-full text-kakurega-green mt-0.5"><MapPin size={18} /></div>
                             <div>
                                <p className="text-[10px] text-kakurega-muted font-bold tracking-wider">AREA</p>
                                <p className="font-bold text-kakurega-ink text-sm">{event.city}</p>
                                <p className="text-xs text-kakurega-muted mt-0.5">{event.area}</p>
                             </div>
                        </div>
                         <div className="bg-white/60 p-3.5 rounded-2xl border border-black/5 flex items-start gap-3">
                             <div className="p-2 bg-kakurega-green/10 rounded-full text-kakurega-green mt-0.5"><User size={18} /></div>
                             <div>
                                <p className="text-[10px] text-kakurega-muted font-bold tracking-wider">ORGANIZER</p>
                                <p className="font-bold text-kakurega-ink text-sm">{event.organizer || '詳細なし'}</p>
                             </div>
                        </div>
                         <div className="bg-white/60 p-3.5 rounded-2xl border border-black/5 flex items-start gap-3">
                             <div className="p-2 bg-kakurega-green/10 rounded-full text-kakurega-green mt-0.5"><Tag size={18} /></div>
                             <div>
                                <p className="text-[10px] text-kakurega-muted font-bold tracking-wider">PRICE</p>
                                <p className="font-bold text-kakurega-green text-sm">{event.priceYen === 0 ? '無料' : `¥${event.priceYen.toLocaleString()}`}</p>
                             </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-5 bg-kakurega-green rounded-full"></div>
                            <h3 className="font-serif text-lg font-bold text-kakurega-ink">イベント詳細</h3>
                        </div>
                        <p className="leading-loose text-sm text-kakurega-ink/90 whitespace-pre-wrap font-medium">
                            {event.description || "詳細情報は現在確認中です。主催者へお問い合わせください。"}
                        </p>
                    </div>

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {event.tags.map(t => (
                                <span key={t} className="px-3 py-1.5 bg-white border border-black/5 rounded-lg text-xs font-medium text-kakurega-muted shadow-sm">
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}
                    
                    {/* Action Bar */}
                    <div className="flex flex-col gap-3 pt-6 border-t border-black/10">
                        <div className="flex gap-3">
                            <AddToCalendarButton event={event} className="flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 bg-white border-2 border-transparent hover:border-kakurega-green/30 shadow-sm text-kakurega-ink rounded-xl transition-all" />
                            <button 
                                onClick={toggleSave}
                                className={`flex-1 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 border-2
                                    ${isSaved 
                                        ? 'bg-white border-kakurega-green text-kakurega-green' 
                                        : 'bg-kakurega-green border-transparent text-white hover:bg-kakurega-dark-green'
                                    }`}
                            >
                                <Star size={18} fill={isSaved ? "currentColor" : "none"} /> 
                                {isSaved ? '保存済み' : '保存する'}
                            </button>
                        </div>
                        <div className="flex justify-center">
                            <Link to={`/search?id=${eventId}`} onClick={onClose} className="text-xs text-kakurega-muted flex items-center gap-1 hover:text-kakurega-green transition-colors py-2">
                                <MapPin size={12} />
                                地図で位置を確認する
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const detailId = searchParams.get('event_id');

  const closeDetail = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('event_id');
    setSearchParams(newParams);
  };

  const navItems = [
    { path: '/', icon: <HomeIcon size={22} />, label: 'ホーム' },
    { path: '/search', icon: <SearchIcon size={22} />, label: '検索' },
    { path: '/saved', icon: <Star size={22} />, label: '保存' },
    { path: '/about', icon: <Info size={22} />, label: '企業' },
  ];

  return (
    <div className="min-h-screen bg-kakurega-paper bg-wafu-pattern text-kakurega-ink relative flex flex-col">
      {/* Event Detail Modal (Global) */}
      {detailId && <EventDetailModal eventId={detailId} onClose={closeDetail} />}

      {/* Header */}
      <header className="h-[1.5cm] flex items-center justify-between px-4 bg-gradient-to-b from-kakurega-green to-kakurega-dark-green border-b border-black/10 fixed top-0 w-full z-50 shadow-md">
        <div className="flex items-center">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden flex flex-col items-center justify-center text-white space-y-[2px]"
            aria-label="メニュー"
          >
            <Menu size={24} />
            <span className="text-[10px] opacity-90">メニュー</span>
          </button>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="font-serif text-2xl font-bold text-[#fffdf6] tracking-widest drop-shadow-md hover:opacity-90 transition-opacity">
                隠れ家
            </Link>
        </div>

        <button className="flex flex-col items-center justify-center text-white space-y-[2px]" aria-label="ログイン">
          <div className="w-[26px] h-[26px] bg-white/20 rounded-full flex items-center justify-center border border-white/40">
            <User size={16} className="text-white" />
          </div>
          <span className="text-[10px] opacity-90">ログイン</span>
        </button>
      </header>

      {/* Sidebar (Desktop) */}
      <nav className="hidden md:flex flex-col fixed top-[1.5cm] left-0 w-[102px] h-[calc(100vh-1.5cm)] bg-[#f8f1e3]/95 border-r border-black/10 backdrop-blur-sm p-3 gap-3 z-40 shadow-lg">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all duration-200
              ${location.pathname === item.path 
                ? 'border-kakurega-green/50 bg-white shadow-[0_0_0_3px_rgba(14,107,42,0.12),0_8px_16px_rgba(0,0,0,0.08)] scale-105' 
                : 'border-black/10 bg-white/80 hover:border-kakurega-green/30 shadow-sm hover:shadow-md'
              }`}
          >
            <div className={`${location.pathname === item.path ? 'text-kakurega-green' : 'text-kakurega-ink'}`}>
              {item.icon}
            </div>
            <span className="text-[11px] font-medium opacity-80">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <nav className="absolute left-0 top-0 bottom-0 w-64 bg-[#f8f1e3] shadow-2xl p-6 flex flex-col gap-6 animate-slide-in">
            <div className="flex justify-between items-center border-b border-black/10 pb-4">
              <span className="font-serif text-xl font-bold text-kakurega-green">メニュー</span>
              <button onClick={() => setIsSidebarOpen(false)} className="text-kakurega-muted">
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-colors
                    ${location.pathname === item.path 
                      ? 'bg-kakurega-green text-white shadow-md' 
                      : 'hover:bg-black/5 text-kakurega-ink'
                    }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-[1.5cm] md:pl-[102px] p-4 md:p-6 overflow-x-hidden">
        <div className="max-w-5xl mx-auto w-full animate-fade-in">
          {children}
        </div>
      </main>
      
      {/* Global Scroll To Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white/90 border border-black/10 rounded-2xl p-4 shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''} ${className}`}
  >
    {children}
  </div>
);

const RichEventCard: React.FC<{ event: KakuregaEvent }> = ({ event }) => {
    const [, setSearchParams] = useSearchParams();
    
    const [month, day] = useMemo(() => {
        const d = new Date(event.date);
        return [d.getMonth() + 1, d.getDate()];
    }, [event.date]);

    const openDetail = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('event_id', String(event.id));
            return next;
        });
    };

    return (
        <div 
            onClick={openDetail}
            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-black/5 cursor-pointer flex flex-col h-full relative"
        >
            {/* Image Area */}
            <div className="relative h-48 overflow-hidden">
                <img 
                    src={event.imageUrl || 'https://images.unsplash.com/photo-1528360983277-13d9b152c611?auto=format&fit=crop&q=80'} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                
                {/* Date Badge */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-1.5 text-center min-w-[50px] font-serif border border-black/5">
                    <span className="block text-[10px] font-bold text-kakurega-muted leading-none mb-0.5">{month}月</span>
                    <span className="block text-xl font-bold text-kakurega-green leading-none">{day}</span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full bg-kakurega-green/90 backdrop-blur-sm text-white text-[10px] font-medium shadow-sm">
                        {event.category}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex-1 flex flex-col">
                {/* Tags */}
                {event.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {event.tags.map(tag => (
                            <span key={tag} className="text-[10px] text-kakurega-muted bg-kakurega-paper px-2 py-0.5 rounded-md">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <h3 className="font-serif text-lg font-bold text-kakurega-ink mb-2 leading-snug group-hover:text-kakurega-green transition-colors">
                    {event.title}
                </h3>

                <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-xs text-kakurega-muted">
                        <Clock size={12} className="text-kakurega-green" />
                        <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-kakurega-muted">
                        <MapPin size={12} className="text-kakurega-green" />
                        <span>{event.city} ({event.area})</span>
                    </div>
                    {event.organizer && (
                        <div className="flex items-center gap-2 text-xs text-kakurega-muted">
                            <User size={12} className="text-kakurega-green" />
                            <span className="truncate">主催: {event.organizer}</span>
                        </div>
                    )}
                </div>

                <p className="text-xs text-kakurega-muted/80 line-clamp-2 mb-4 flex-1 leading-relaxed">
                    {event.description}
                </p>

                {/* Footer */}
                <div className="pt-3 border-t border-black/5 flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-kakurega-muted">参加費</span>
                        <span className="font-bold text-kakurega-green text-sm">
                            {event.priceYen === 0 ? '無料' : `¥${event.priceYen.toLocaleString()}`}
                        </span>
                    </div>
                    <div className="flex gap-2">
                         <AddToCalendarButton event={event} />
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Pages ---

const HomePage: React.FC = () => {
  const [randomPicks, setRandomPicks] = useState<KakuregaEvent[]>([]);

  useEffect(() => {
    // Randomly select 3 events
    const shuffled = [...EVENTS].sort(() => 0.5 - Math.random());
    setRandomPicks(shuffled.slice(0, 3));
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-[24px] bg-[#f8f1e3] border border-black/10 shadow-lg p-6 md:p-10">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none bg-wafu-pattern"></div>
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs tracking-[0.2em] opacity-80 mb-3 font-medium text-kakurega-green uppercase">Local Discovery</p>
          <h1 className="font-serif text-3xl md:text-5xl text-kakurega-ink leading-tight mb-6 font-medium">
            まだ知られていない、<br/>すぐそばの<span className="text-kakurega-green">隠れ家</span>イベント。
          </h1>
          <p className="text-sm leading-relaxed opacity-90 bg-white/70 backdrop-blur-sm border border-black/5 rounded-2xl p-4 mb-8 inline-block shadow-sm">
            生活圏で輝く小さな催しを。<br className="md:hidden"/>
            タイプ・予算・距離で、あなたにぴったりの休日を見つけます。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Link to="/search" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-kakurega-green text-white shadow-lg hover:bg-kakurega-dark-green hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm font-bold tracking-wide">
              <SearchIcon size={18} />
              イベントを探す
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 opacity-80">
             {['#祭り', '#朝市', '#体験教室', '#路地裏展示'].map(tag => (
               <span key={tag} className="text-[10px] px-3 py-1 rounded-full bg-white/50 border border-black/5 text-kakurega-ink">
                 {tag}
               </span>
             ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: '探しやすさ', desc: 'キーワード入力不要。直感的な選択で、迷わず目的のイベントへ。' },
          { title: '生活圏ファースト', desc: '行政区切りではなく「行ける距離」で。隣町の魅力も発見できます。' },
          { title: '保存して計画', desc: '気になったらワンタップで保存。週末の予定作りをスムーズに。' },
        ].map((item, i) => (
          <Card key={i} className="hover:bg-white transition-colors">
            <h2 className="text-sm font-bold mb-2 text-kakurega-green font-serif">{item.title}</h2>
            <p className="text-xs leading-relaxed opacity-70">{item.desc}</p>
          </Card>
        ))}
      </div>

      <section>
        <div className="flex justify-between items-end mb-6 px-1">
          <div>
              <h2 className="font-serif text-2xl text-kakurega-ink font-bold mb-1">おすすめのイベント</h2>
              <p className="text-xs text-kakurega-muted">あなたの街の近くで見つかる、特別な体験</p>
          </div>
          <Link to="/search" className="text-xs font-bold text-kakurega-green hover:text-kakurega-dark-green flex items-center gap-1 group">
              すべて見る <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {randomPicks.map(e => (
            <RichEventCard key={e.id} event={e} />
          ))}
        </div>
        
        <div className="mt-10 text-center">
             <p className="text-xs text-kakurega-muted mb-4">条件を指定して、もっと探してみませんか？</p>
            <Link to="/search" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-kakurega-green border-2 border-kakurega-green rounded-xl text-sm font-bold shadow-sm hover:bg-kakurega-green hover:text-white transition-colors">
                <Filter size={16} />
                詳細検索ページへ
            </Link>
        </div>
      </section>
    </div>
  );
};

// --- Map Component Helper ---
const MapViewer: React.FC<{ 
  events: KakuregaEvent[], 
  userLocation: UserLocation | null, 
  onSave: (id: number) => void 
}> = ({ events, userLocation, onSave }) => {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!mapRef.current) {
      const L = window.L;
      if (!L) return;
      
      const map = L.map('leaflet-map').setView([34.6901, 135.1955], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      
      mapRef.current = map;
    }
    
    const map = mapRef.current;
    const L = window.L;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Add user location marker
    if (userLocation) {
        const userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
            radius: 8,
            color: '#0e6b2a',
            fillColor: '#0e6b2a',
            fillOpacity: 0.4
        }).bindPopup("現在地").addTo(map);
        markersRef.current.push(userMarker);
    }

    // Add event markers
    events.forEach(e => {
        const priceText = e.priceYen === 0 ? "無料" : `${e.priceYen}円`;
        const marker = L.marker([e.lat, e.lng]).addTo(map);
        
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
            <div style="font-family: sans-serif; min-width: 200px;">
                ${e.imageUrl ? `<div style="height:100px; width:100%; background-image:url('${e.imageUrl}'); background-size:cover; background-position:center; border-radius:4px; margin-bottom:8px;"></div>` : ''}
                <h3 style="font-weight:bold; margin-bottom:4px; color:#0e6b2a; font-size:14px;">${e.title}</h3>
                <p style="font-size:11px; margin:0; color:#555;">${e.date} ${e.startTime ? `/ ${e.startTime}~` : ''}</p>
                <p style="font-size:11px; margin:0; margin-bottom: 8px; color:#555;">${e.city} (${e.area}) - <b>${priceText}</b></p>
                <div style="display:flex; gap:4px;">
                    <button id="popup-detail-${e.id}" style="
                        background-color: #f3e6d2; 
                        border: 1px solid #ccc; 
                        padding: 6px 12px; 
                        border-radius: 4px; 
                        font-size: 11px; 
                        cursor: pointer;
                        flex: 1;
                    ">
                    詳細
                    </button>
                    <button id="popup-save-${e.id}" style="
                        background-color: #0e6b2a; 
                        color: white;
                        border: none; 
                        padding: 6px 12px; 
                        border-radius: 4px; 
                        font-size: 11px; 
                        cursor: pointer;
                        flex: 1;
                    ">
                    保存
                    </button>
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.on('popupopen', () => {
            const btnSave = document.getElementById(`popup-save-${e.id}`);
            const btnDetail = document.getElementById(`popup-detail-${e.id}`);
            if(btnSave) {
                btnSave.onclick = () => onSave(e.id);
            }
            if(btnDetail) {
                btnDetail.onclick = () => {
                    setSearchParams(prev => {
                        const next = new URLSearchParams(prev);
                        next.set('event_id', String(e.id));
                        return next;
                    });
                };
            }
        });

        markersRef.current.push(marker);
    });

    // Fit bounds if we have events
    if (events.length > 0) {
       const group = new L.featureGroup(markersRef.current);
       map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 14 });
    }

  }, [events, userLocation, onSave, setSearchParams]);

  return <div id="leaflet-map" className="h-full w-full bg-gray-100" />;
};


const SearchPage: React.FC = () => {
  const [filters, setFilters] = useState({
    type: '',
    budget: '',
    period: '',
    dateFrom: '',
    dateTo: '',
    distance: '',
    area: '',
    city: ''
  });
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locStatus, setLocStatus] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<KakuregaEvent[]>(EVENTS);
  const [, setSearchParams] = useSearchParams();

  // Load Saved IDs
  const getSavedIds = () => {
    try {
      const raw = localStorage.getItem("savedEventIds");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };

  const handleSave = (id: number) => {
    const ids = getSavedIds();
    if (!ids.includes(id)) {
      const newIds = [...ids, id];
      localStorage.setItem("savedEventIds", JSON.stringify(newIds));
      alert("保存しました");
    } else {
        alert("すでに保存されています");
    }
  };

  const openDetail = (id: number) => {
    setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('event_id', String(id));
        return next;
    });
  };

  const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const toRad = (d: number) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getPeriodRange = (p: string) => {
    const now = new Date();
    const toYmd = (d: Date) => d.toISOString().split('T')[0];
    let from = null, to = null;

    if (p === "today") {
        from = toYmd(now); to = toYmd(now);
    } else if (p === "week") {
        const start = new Date(now);
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        from = toYmd(start); to = toYmd(end);
    } else if (p === "month") {
        from = toYmd(new Date(now.getFullYear(), now.getMonth(), 1));
        to = toYmd(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    } else if (p === "year") {
        from = `${now.getFullYear()}-01-01`;
        to = `${now.getFullYear()}-12-31`;
    }
    return { from, to };
  };

  const applyFilters = () => {
    let result = [...EVENTS];

    if (filters.type) result = result.filter(e => e.category === filters.type);
    if (filters.budget) result = result.filter(e => e.priceYen <= Number(filters.budget));
    
    if (filters.period) {
        let from: string | null = null;
        let to: string | null = null;
        if (filters.period === "range") {
            from = filters.dateFrom;
            to = filters.dateTo;
        } else {
            const r = getPeriodRange(filters.period);
            from = r.from;
            to = r.to;
        }
        result = result.filter(e => {
            if (!e.date) return false;
            if (from && e.date < from) return false;
            if (to && e.date > to) return false;
            return true;
        });
    }

    if (filters.area) result = result.filter(e => e.area === filters.area);
    if (filters.city.trim()) result = result.filter(e => e.city.includes(filters.city.trim()));

    if (filters.distance && userLocation) {
        const maxDist = Number(filters.distance);
        result = result.map(e => ({
            ...e,
            distKm: haversineKm(userLocation.lat, userLocation.lng, e.lat, e.lng)
        })).filter(e => (e.distKm || 0) <= maxDist).sort((a, b) => (a.distKm || 0) - (b.distKm || 0));
    }

    setFilteredEvents(result);
  };

  useEffect(() => {
    if (filters.distance) {
        if (!navigator.geolocation) {
            setLocStatus("このブラウザは位置情報に対応していません。");
            return;
        }
        setLocStatus("位置情報を取得中...");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocStatus("現在地を取得しました。検索ボタンを押してください。");
            },
            () => {
                setLocStatus("位置情報を取得できませんでした。");
                setFilters(f => ({ ...f, distance: '' }));
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    } else {
        setUserLocation(null);
        setLocStatus("");
    }
  }, [filters.distance]);

  // Initial load
  useEffect(() => { applyFilters(); }, []); 

  const handleChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <section className="bg-white/80 backdrop-blur-md border border-black/10 rounded-[18px] p-5 shadow-md">
        <h1 className="font-serif text-2xl mb-2 text-kakurega-ink">条件で絞って、地図で見つける。</h1>
        <p className="text-xs opacity-80 mb-4 leading-relaxed">
            タイプ・予算・期間・距離・地区で整理して、近くの小さなイベントを見つけます。
        </p>
        
        <div className="flex flex-wrap items-end gap-3 mb-3">
            {[
                { label: 'タイプ', key: 'type', options: [{v:'', l:'全て'}, {v:'祭り', l:'祭り'}, {v:'朝市', l:'朝市'}, {v:'体験', l:'体験'}, {v:'展示', l:'展示'}] },
                { label: '予算', key: 'budget', options: [{v:'', l:'指定なし'}, {v:'0', l:'無料'}, {v:'1000', l:'~1000円'}, {v:'3000', l:'~3000円'}, {v:'5000', l:'~5000円'}] },
                { label: '期間', key: 'period', options: [{v:'', l:'指定なし'}, {v:'today', l:'今日'}, {v:'week', l:'今週'}, {v:'month', l:'今月'}, {v:'year', l:'今年'}, {v:'range', l:'日付指定'}] },
                { label: '距離', key: 'distance', options: [{v:'', l:'指定なし'}, {v:'10', l:'車で30分 (10km)'}, {v:'20', l:'車で60分 (20km)'}, {v:'40', l:'車で90分 (40km)'}] },
                { label: '地区', key: 'area', options: [{v:'', l:'指定なし'}, {v:'神戸', l:'神戸'}, {v:'阪神', l:'阪神'}, {v:'播磨', l:'播磨'}, {v:'丹波', l:'丹波'}, {v:'但馬', l:'但馬'}, {v:'淡路', l:'淡路'}] },
            ].map(f => (
                <label key={f.key} className="flex flex-col gap-1.5 min-w-[140px] flex-1">
                    <span className="text-[10px] text-kakurega-muted font-bold">{f.label}</span>
                    <select 
                        className="p-2.5 rounded-xl border border-black/20 bg-white text-xs focus:ring-2 focus:ring-kakurega-green/30 outline-none"
                        value={(filters as any)[f.key]}
                        onChange={e => handleChange(f.key, e.target.value)}
                    >
                        {f.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                </label>
            ))}

            <label className="flex flex-col gap-1.5 min-w-[140px] flex-1">
                 <span className="text-[10px] text-kakurega-muted font-bold">市</span>
                 <input 
                    type="text" 
                    placeholder="例: 明石 / 姫路"
                    className="p-2.5 rounded-xl border border-black/20 bg-white text-xs focus:ring-2 focus:ring-kakurega-green/30 outline-none"
                    value={filters.city}
                    onChange={e => handleChange('city', e.target.value)}
                 />
            </label>
        </div>

        {filters.period === 'range' && (
            <div className="flex items-end gap-2 mb-4 animate-fade-in bg-kakurega-paper/50 p-3 rounded-xl">
                 <label className="flex flex-col gap-1 flex-1">
                    <span className="text-[10px] text-kakurega-muted">開始</span>
                    <input type="date" className="p-2 rounded-lg border border-black/10 text-xs" value={filters.dateFrom} onChange={e => handleChange('dateFrom', e.target.value)} />
                 </label>
                 <span className="pb-2 text-xs opacity-50">〜</span>
                 <label className="flex flex-col gap-1 flex-1">
                    <span className="text-[10px] text-kakurega-muted">終了</span>
                    <input type="date" className="p-2 rounded-lg border border-black/10 text-xs" value={filters.dateTo} onChange={e => handleChange('dateTo', e.target.value)} />
                 </label>
            </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-black/5 pt-4">
             <p className="text-xs text-kakurega-green h-4">{locStatus}</p>
             <button 
                onClick={applyFilters}
                className="w-full md:w-auto px-6 py-3 bg-kakurega-green text-white rounded-xl text-xs font-bold shadow hover:bg-kakurega-dark-green transition-colors flex items-center justify-center gap-2"
             >
                <Filter size={14} /> 検索条件を適用
             </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
           <div className="bg-white rounded-[18px] border border-black/10 overflow-hidden shadow-lg h-[400px] md:h-[500px] relative z-0">
              <MapViewer events={filteredEvents} userLocation={userLocation} onSave={handleSave} />
           </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur border border-black/10 rounded-[18px] p-4 shadow-md flex flex-col h-[500px]">
           <div className="flex justify-between items-baseline mb-3 pb-2 border-b border-black/5">
              <h2 className="font-serif text-lg text-kakurega-ink">検索結果</h2>
              <span className="text-xs text-kakurega-muted font-bold">{filteredEvents.length}件</span>
           </div>
           
           <div className="overflow-y-auto flex-1 pr-1 space-y-3 custom-scrollbar">
              {filteredEvents.length === 0 ? (
                  <div className="text-center py-10 opacity-60 text-sm">条件に合うイベントが<br/>見つかりませんでした。</div>
              ) : (
                  filteredEvents.map(e => (
                    <div 
                        key={e.id} 
                        onClick={() => openDetail(e.id)}
                        className="bg-white border border-black/5 rounded-xl p-3 hover:border-kakurega-green/50 hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-sm text-kakurega-ink group-hover:text-kakurega-green transition-colors">{e.title}</h3>
                            <span className="text-[10px] bg-kakurega-paper px-1.5 py-0.5 rounded text-kakurega-dark-green whitespace-nowrap">{e.category}</span>
                        </div>
                        <p className="text-xs text-kakurega-muted mb-2">{e.date} / {e.city} <span className="text-kakurega-green font-bold ml-1">{e.priceYen === 0 ? '無料' : `¥${e.priceYen}`}</span> {e.distKm && <span className="text-[10px] ml-1 opacity-70">({e.distKm.toFixed(1)}km)</span>}</p>
                        
                        <div className="flex justify-end gap-2">
                            <AddToCalendarButton 
                                event={e} 
                                className="text-[10px] px-2 py-1 rounded border border-black/10 hover:bg-gray-50 flex items-center gap-1 text-kakurega-muted hover:text-kakurega-green transition-colors"
                            >
                                <CalendarPlus size={10} /> 追加
                            </AddToCalendarButton>
                            <button onClick={(ev) => {
                                ev.stopPropagation();
                                const map = (window as any).L?.map; 
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} className="text-[10px] px-2 py-1 rounded border border-black/10 hover:bg-gray-50 flex items-center gap-1 text-kakurega-muted">
                                <MapPin size={10} /> 地図
                            </button>
                            <button onClick={(ev) => {
                                ev.stopPropagation();
                                handleSave(e.id);
                            }} className="text-[10px] px-2 py-1 rounded bg-kakurega-paper hover:bg-kakurega-paper-light border border-black/5 flex items-center gap-1 text-kakurega-dark-green font-bold">
                                <Star size={10} /> 保存
                            </button>
                        </div>
                    </div>
                  ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const SavedPage: React.FC = () => {
    const [savedEvents, setSavedEvents] = useState<KakuregaEvent[]>([]);
    const [, setSearchParams] = useSearchParams();

    const loadSaved = () => {
        try {
            const raw = localStorage.getItem("savedEventIds");
            const ids: number[] = raw ? JSON.parse(raw) : [];
            const events = EVENTS.filter(e => ids.includes(e.id));
            setSavedEvents(events);
        } catch { setSavedEvents([]); }
    };

    useEffect(() => { loadSaved(); }, []);

    const removeSaved = (id: number) => {
        try {
            const raw = localStorage.getItem("savedEventIds");
            const ids: number[] = raw ? JSON.parse(raw) : [];
            const next = ids.filter(i => i !== id);
            localStorage.setItem("savedEventIds", JSON.stringify(next));
            loadSaved();
        } catch {}
    };

    const openDetail = (id: number) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('event_id', String(id));
            return next;
        });
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="font-serif text-2xl mb-1">保存したイベント</h1>
                <p className="text-xs text-kakurega-muted">この端末のブラウザに保存されています。</p>
            </div>

            {savedEvents.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-2xl border border-dashed border-black/20">
                    <Star size={48} className="mx-auto text-kakurega-muted/30 mb-4" />
                    <p className="text-sm text-kakurega-muted mb-4">まだ保存されたイベントはありません。</p>
                    <Link to="/search" className="inline-block px-6 py-2 bg-kakurega-green text-white rounded-xl text-xs font-bold hover:bg-kakurega-dark-green transition-colors">
                        イベントを探しに行く
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedEvents.map(e => (
                        <Card key={e.id} className="relative group p-0 overflow-hidden flex flex-col cursor-pointer" onClick={() => openDetail(e.id)}>
                            {e.imageUrl && (
                                <div className="h-32 w-full overflow-hidden relative">
                                    <img src={e.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={e.title} />
                                    <div className="absolute inset-0 bg-black/10"></div>
                                </div>
                            )}
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button onClick={(ev) => {
                                        ev.stopPropagation();
                                        removeSaved(e.id);
                                    }} className="p-2 bg-white/90 text-red-500 rounded-full hover:bg-white shadow-sm transition-all" title="削除">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <h3 className="font-serif font-bold text-lg mb-2 text-kakurega-ink pr-8">{e.title}</h3>
                                <div className="space-y-1 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-kakurega-muted">
                                        <Calendar size={12} />
                                        <span>{e.date}</span>
                                        <span className="w-px h-3 bg-black/20"></span>
                                        <span>{e.category}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-kakurega-muted">
                                        <MapPin size={12} />
                                        <span>{e.city}（{e.area}）</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-auto pt-3 border-t border-black/5">
                                    <span className="font-bold text-kakurega-green text-sm">{e.priceYen === 0 ? '無料' : `¥${e.priceYen.toLocaleString()}`}</span>
                                    <span className="text-[10px] text-kakurega-muted hover:text-kakurega-green flex items-center gap-1">
                                        詳細を見る <ArrowRight size={10} />
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

const AboutPage: React.FC = () => (
    <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center mb-8">
            <h1 className="font-serif text-2xl mb-2">企業について</h1>
            <p className="text-xs text-kakurega-muted">地域の小規模イベントの発見性向上を目指すプロトタイプです。</p>
        </div>

        {[
            { t: '目的', c: '市町村単位で分散しがちなイベント情報を、県内で横断的に探せる形に整え、生活圏ベースでの探索を可能にします。' },
            { t: 'UI方針', c: 'キーワード入力に頼らず、タイプ・予算・期間・距離・地区といった選択式で探せる構成にします。和風の落ち着いた色合い（深緑・生成り・墨色）で、視認性と雰囲気を両立します。' },
            { t: '注意', c: '本ページは研究・開発用のサンプルであり、掲載情報の正確性や開催可否を保証するものではありません。' }
        ].map((s, i) => (
            <Card key={i} className="p-6 md:p-8">
                <h2 className="font-serif text-xl mb-4 text-kakurega-green border-b border-kakurega-green/20 pb-2 inline-block">{s.t}</h2>
                <p className="text-sm leading-loose opacity-90 text-justify">{s.c}</p>
            </Card>
        ))}
    </div>
);

// --- App Router ---

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;