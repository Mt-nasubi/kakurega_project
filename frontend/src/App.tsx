import React, { useState, useEffect, useMemo, useRef } from 'react';
<<<<<<< HEAD
import { HashRouter, Routes, Route, Link, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Menu, Home as HomeIcon, Search as SearchIcon, Star, 
  MapPin, User, Info, X, Calendar, ArrowRight, Trash2,
  ChevronRight, Filter, Clock, Tag, ExternalLink, CalendarPlus,
  Share2, ArrowUp, Link as LinkIcon, Check, LogOut,
  Utensils, Landmark, Palette, Trees as TreePine, Music, Baby, ChevronDown, ChevronUp
=======
import type { KakuregaEvent, UserLocation } from './types/types';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    Menu, Home as HomeIcon, Search as SearchIcon, Star,
    MapPin, User, Info, X, Calendar, ArrowRight, Trash2,
    Filter, Clock, Tag, CalendarPlus,
    ArrowUp, Link as LinkIcon, Check
>>>>>>> 1871aafded48367a6c5e2fef9fe2e675e1673d3e
} from 'lucide-react';
import { supabase } from "./lib/supabase";
import {
    fetchPublicEvents,
    fetchMyFavoriteIds,
    addFavorite,
    removeFavorite,
    fetchMyFavoriteEvents,
} from './lib/apiClient';


// --- Auth Context & Provider ---

interface UserData {
  name: string;
  email: string;
}

interface AuthContextType {
  user: UserData | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("kakurega_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to load user", e);
    }
  }, []);

  const login = (email: string, name: string) => {
    const userData = { email, name };
    setUser(userData);
    localStorage.setItem("kakurega_user", JSON.stringify(userData));
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("kakurega_user");
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoginModalOpen,
      openLoginModal: () => setIsLoginModalOpen(true),
      closeLoginModal: () => setIsLoginModalOpen(false)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Shared Components ---

type ToastType = "success" | "info" | "error";

type ToastItem = {
    id: string;
    message: string;
    type: ToastType;
    actionLabel?: string;
    onAction?: () => void;
};

const ToastHost: React.FC<{ toast: ToastItem | null; onClose: () => void }> = ({ toast, onClose }) => {
    if (!toast) return null;

    const borderClass =
        toast.type === "success"
            ? "border-kakurega-green/30"
            : toast.type === "error"
                ? "border-red-300"
                : "border-black/10";

    const icon =
        toast.type === "success" ? "✓" : toast.type === "error" ? "!" : "i";

    return (
        <div className="fixed top-[1.2cm] left-1/2 -translate-x-1/2 z-[120]">
            <div
                className={[
                    "w-[min(520px,92vw)]",
                    "rounded-2xl px-4 py-3 shadow-xl border",
                    "bg-white/70 backdrop-blur-md",
                    "animate-fade-in",
                borderClass,
                ].join(" ")}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center text-xs font-bold">
                            {icon}
                        </div>
                        <p className="text-sm font-bold text-kakurega-ink leading-relaxed">
                            {toast.message}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {toast.actionLabel && toast.onAction && (
                            <button
                                onClick={() => {
                                    toast.onAction?.();
                                    onClose();
                                }}
                                className="px-3 py-1.5 rounded-full text-xs font-bold bg-kakurega-green text-white hover:bg-kakurega-dark-green transition-colors"
                            >
                                {toast.actionLabel}
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="text-kakurega-muted hover:text-kakurega-ink transition-colors"
                            aria-label="閉じる"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KakuregaLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Kakurega Logo">
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" className="opacity-90" />
        <path d="M22 46 Q 50 18 78 46" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M36 46 V 74 H 64 V 46" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
        <path d="M50 46 V 74" stroke="currentColor" strokeWidth="2.5" />
        <path d="M36 60 H 64" stroke="currentColor" strokeWidth="2.5" />
    </svg>
);

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

    if (!isVisible) return null;

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

const CopyLinkButton: React.FC<{ eventId: string, className?: string, children?: React.ReactNode | ((copied: boolean) => React.ReactNode) }> = ({ eventId, className, children }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const url = `${window.location.origin}${window.location.pathname}#/search?event_id=${encodeURIComponent(eventId)}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3500);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className={className || "bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors z-10"}
            title="リンクをコピー"
        >
            {typeof children === "function"
                ? children(copied)
                : children
                    ? children
                    : (className
                        ? (
                            <span className="flex items-center gap-1.5">
                                {copied ? <Check size={14} /> : <LinkIcon size={14} />}
                                {copied ? "コピー完了" : "リンク"}
                            </span>
                        )
                        : (copied ? <Check size={24} className="text-kakurega-green" /> : <LinkIcon size={24} />)
                    )
            }
        </button>
    );
};

<<<<<<< HEAD
const LoginModal: React.FC = () => {
    const { isLoginModalOpen, closeLoginModal, login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
  
    if (!isLoginModalOpen) return null;
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
          // Mock login logic: take the part before @ as the name
          const name = email.split('@')[0] || 'ゲスト';
          login(email, name);
          setLoading(false);
          setEmail("");
          setPassword("");
      }, 1000);
    };
  
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeLoginModal} />
          <div className="bg-[#f8f1e3] w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-fade-in p-6 sm:p-8">
              <button onClick={closeLoginModal} className="absolute top-4 right-4 text-kakurega-muted hover:text-kakurega-ink">
                  <X size={24} />
              </button>
              <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-kakurega-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User size={24} className="text-kakurega-green"/>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-kakurega-ink mb-2">ログイン</h2>
                  <p className="text-xs text-kakurega-muted">隠れ家のアカウントでログインして、<br/>より便利にイベントを探しましょう。</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-kakurega-muted mb-1.5 ml-1">メールアドレス</label>
                      <input 
                          type="email" 
                          required 
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full p-3 rounded-xl border border-black/10 bg-white focus:ring-2 focus:ring-kakurega-green/30 outline-none text-sm"
                          placeholder="example@email.com"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-kakurega-muted mb-1.5 ml-1">パスワード</label>
                      <input 
                          type="password" 
                          required 
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full p-3 rounded-xl border border-black/10 bg-white focus:ring-2 focus:ring-kakurega-green/30 outline-none text-sm"
                          placeholder="••••••••"
                      />
                  </div>
                  <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-3.5 bg-kakurega-green text-white rounded-xl font-bold shadow-lg hover:bg-kakurega-dark-green transition-all mt-6 disabled:opacity-70 flex justify-center items-center text-sm"
                  >
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'ログイン'}
                  </button>
              </form>
              <div className="mt-6 text-center border-t border-black/5 pt-4">
                  <p className="text-xs text-kakurega-muted mb-2">アカウントをお持ちでない方</p>
                  <button type="button" className="text-kakurega-green font-bold text-sm hover:underline">新規登録（無料）</button>
              </div>
          </div>
      </div>
    );
  }
=======
const EventDetailModal: React.FC<{
    eventId: string;
    onClose: () => void;
    events: any[];
    favIds: Set<string>;
    setFavIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}> = ({ eventId, onClose, events, favIds, setFavIds }) => {
    const event = useMemo(
        () => events.find(e => String(e.id) === String(eventId)),
        [events, eventId]
    );
>>>>>>> 1871aafded48367a6c5e2fef9fe2e675e1673d3e

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const isSaved = favIds.has(String(eventId));
    const { pushToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const toggleSave = async () => {
        const id = String(eventId);
        const isFav = favIds.has(id);

        try {
            if (isFav) {
                const ok = await removeFavorite(id);
                if (!ok) {
                    pushToast?.(
                        "お気に入りにはログインが必要です",
                        "info",
                        {
                            label: "ログインする",
                            onClick: () => {
                                const next = `${location.pathname}${location.search}`;
                                navigate(`/login?next=${encodeURIComponent(next)}`);
                            }
                        }
                    );
                    return
                }

                setFavIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                pushToast?.("お気に入りから削除しました", "info");
            } else {
                const ok = await addFavorite(id);
                if (!ok) {
                    pushToast?.(
                        "お気に入りにはログインが必要です",
                        "info",
                        {
                            label: "ログインする",
                            onClick: () => {
                                const next = `${location.pathname}${location.search}`;
                                navigate(`/login?next=${encodeURIComponent(next)}`);
                            }
                        }
                    );
                    return;
                }

                setFavIds(prev => {
                    const next = new Set(prev);
                    next.add(id);
                    return next;
                });
                pushToast?.("保存しました", "success");
            }
        } catch {
            pushToast?.("保存に失敗しました", "error");
        }
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
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <CopyLinkButton 
                            eventId={event.id} 
                            className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors flex items-center justify-center"
                        >
                            {(copied: boolean) => copied ? <Check size={24} /> : <LinkIcon size={24} />}
                        </CopyLinkButton>
                        <button onClick={onClose} className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors flex items-center justify-center">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-kakurega-green text-xs font-bold rounded-full shadow-sm border border-white/20">
                                {event.category}
                            </span>
                            {event.distKm !== undefined && event.distKm !== null && (
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
                            <Link to={`/search?event_id=${encodeURIComponent(eventId)}`} onClick={onClose} className="text-xs text-kakurega-muted flex items-center gap-1 hover:text-kakurega-green transition-colors py-2">
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

<<<<<<< HEAD
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const detailId = searchParams.get('event_id');
  const { user, openLoginModal, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
=======
type ToastContextType = {
    pushToast: (
        message: string,
        type?: ToastType,
        action?: { label: string; onClick: () => void }
    ) => void;
};
>>>>>>> 1871aafded48367a6c5e2fef9fe2e675e1673d3e

const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = () => {
    const ctx = React.useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastContext");
    return ctx;
};


<<<<<<< HEAD
      {/* Login Modal */}
      <LoginModal />

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
=======
const Layout: React.FC<{
    children: React.ReactNode;
    events: any[];
    favIds: Set<string>;
    setFavIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    eventsLoading: boolean;
}> = ({ children, events, favIds, setFavIds, eventsLoading }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const detailId = searchParams.get('event_id');
>>>>>>> 1871aafded48367a6c5e2fef9fe2e675e1673d3e

    const [toast, setToast] = useState<ToastItem | null>(null);
    const toastTimerRef = useRef<number | null>(null);

<<<<<<< HEAD
        {user ? (
            <div className="relative">
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex flex-col items-center justify-center text-white space-y-[2px]"
                >
                    <div className="w-[26px] h-[26px] bg-[#f8f1e3] text-kakurega-green rounded-full flex items-center justify-center border-2 border-white/40 font-bold text-xs shadow-inner">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[10px] opacity-90 max-w-[60px] truncate">{user.name}</span>
                </button>
                {isDropdownOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-black/5 z-50 overflow-hidden animate-fade-in">
                            <div className="p-3 border-b border-black/5 bg-gray-50">
                                <p className="text-[10px] text-kakurega-muted font-bold">ログイン中</p>
                                <p className="text-sm font-bold truncate text-kakurega-ink">{user.email}</p>
                            </div>
                            <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="w-full text-left p-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium">
                                 <LogOut size={16} /> ログアウト
                            </button>
                        </div>
                    </>
                )}
            </div>
        ) : (
            <button 
                onClick={openLoginModal}
                className="flex flex-col items-center justify-center text-white space-y-[2px]" 
                aria-label="ログイン"
            >
                <div className="w-[26px] h-[26px] bg-white/20 rounded-full flex items-center justify-center border border-white/40 transition-colors hover:bg-white/30">
                    <User size={16} className="text-white" />
                </div>
                <span className="text-[10px] opacity-90">ログイン</span>
            </button>
        )}
      </header>
=======
    const pushToast = (
        message: string,
        type: ToastType = "info",
        action?: { label: string; onClick: () => void }
    ) => {
        if (toastTimerRef.current !== null) {
            window.clearTimeout(toastTimerRef.current);
            toastTimerRef.current = null;
        }
>>>>>>> 1871aafded48367a6c5e2fef9fe2e675e1673d3e

        setToast(prev => {
            // 同じメッセージ&type なら上書きしない（タイマー延長だけ）
            if (prev && prev.message === message && prev.type === type) {
                return {
                    ...prev,
                    actionLabel: action?.label,
                    onAction: action?.onClick,
                };
            }

            const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
            return {
                id,
                message,
                type,
                actionLabel: action?.label,
                onAction: action?.onClick,
            };
        });

        toastTimerRef.current = window.setTimeout(() => {
            setToast(null);
            toastTimerRef.current = null;
        }, 4000);
    };

    const closeToast = () => {
        if (toastTimerRef.current !== null) {
            window.clearTimeout(toastTimerRef.current);
            toastTimerRef.current = null;
        }
        setToast(null);
    };
    
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
        <ToastContext.Provider value={{ pushToast }}>
            <div className="min-h-screen bg-kakurega-paper bg-wafu-pattern text-kakurega-ink relative flex flex-col">
                {detailId && (
                    <EventDetailModal
                        eventId={detailId}
                        onClose={closeDetail}
                        events={events}
                        favIds={favIds}
                        setFavIds={setFavIds}
                    />
                )}

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
                        <Link to="/" className="flex items-center gap-3 group">
                            <KakuregaLogo className="w-9 h-9 text-[#fffdf6] drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
                            <span className="font-serif text-2xl font-bold text-[#fffdf6] tracking-widest drop-shadow-md group-hover:opacity-90 transition-opacity">
                                隠れ家
                            </span>
                        </Link>
                    </div>

                    <button
                        onClick={() => {
                            const next = `${location.pathname}${location.search}`;
                            navigate(`/login?next=${encodeURIComponent(next)}`);
                        }}
                        className="flex flex-col items-center justify-center text-white space-y-[2px]"
                        aria-label="ログイン"
                    >
                        <div className="w-[26px] h-[26px] bg-white/20 rounded-full flex items-center justify-center border border-white/40">
                            <User size={16} className="text-white" />
                        </div>
                        <span className="text-[10px] opacity-90">ログイン</span>
                    </button>

                </header>

                {/* Toast (Global) */}
                <ToastHost toast={toast} onClose={closeToast} />

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
                <main className="flex-1 pt-[1.5cm] md:pl-[102px] overflow-x-hidden">
                    <div className="w-full animate-fade-in">
                        {children}
                    </div>
                </main>
                        
                {/* Global Scroll To Top Button */}
                <ScrollToTopButton />
            </div>
        </ToastContext.Provider>
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
            next.set('event_id', event.id);
            return next;
        });
    };

    return (
        <div 
            onClick={openDetail}
            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-black/5 cursor-pointer flex flex-col h-full relative"
        >
            <div className="relative h-48 overflow-hidden">
                <img 
                    src={event.imageUrl || 'https://images.unsplash.com/photo-1528360983277-13d9b152c611?auto=format&fit=crop&q=80'} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-1.5 text-center min-w-[50px] font-serif border border-black/5">
                    <span className="block text-[10px] font-bold text-kakurega-muted leading-none mb-0.5">{month}月</span>
                    <span className="block text-xl font-bold text-kakurega-green leading-none">{day}</span>
                </div>

                <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full bg-kakurega-green/90 backdrop-blur-sm text-white text-[10px] font-medium shadow-sm">
                        {event.category}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                {event.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {event.tags.map(tag => (
                            <span key={tag} className="text-[10px] text-kakurega-muted bg-kakurega-paper px-2 py-0.5 rounded-md">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <h3 className="font-serif text-lg font-bold text-kakurega-ink mb-3 leading-snug group-hover:text-kakurega-green transition-colors">
                    {event.title}
                </h3>

                <div className="space-y-2 mb-4">
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

                <p className="text-xs text-kakurega-muted/80 line-clamp-2 mb-5 flex-1 leading-relaxed">
                    {event.description}
                </p>

                <div className="pt-4 border-t border-black/5 flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-kakurega-muted mb-0.5">参加費</span>
                        <span className="font-bold text-kakurega-green text-sm">
                            {event.priceYen === 0 ? '無料' : `¥${event.priceYen.toLocaleString()}`}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <CopyLinkButton eventId={event.id} className="flex items-center gap-1.5 text-[10px] font-bold text-kakurega-muted bg-kakurega-paper hover:bg-kakurega-paper-light border border-black/10 px-3 py-1.5 rounded-full transition-colors" />
                        <AddToCalendarButton event={event} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const HeroSection: React.FC<{ events: any[] }> = ({ events }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const images = useMemo(() => {
        const unique = Array.from(new Set(events.map(e => coverImageUrl(e)))) as string[];
        return unique.slice(0, 5);
    }, [events]);

    useEffect(() => {
        setIsLoaded(true);
        if (images.length === 0) return;

        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % images.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <section className="relative w-full h-[500px] md:h-[600px] rounded-b-[40px] overflow-hidden shadow-xl mb-10 group">
            {images.map((img, index) => (
                <div
                    key={img}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <img
                        src={img}
                        alt="Hero background"
                        className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${index === currentImageIndex ? 'scale-110' : 'scale-100'}`}
                    />
                </div>
            ))}

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent z-20" />

            <div className={`relative z-30 h-full flex flex-col justify-center px-6 md:px-16 max-w-4xl transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="mb-6 flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] tracking-widest uppercase font-bold">
                        Welcome to Kakurega
                    </span>
                    <div className="h-px w-12 bg-white/40"></div>
                </div>

                <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.2] mb-6 drop-shadow-lg tracking-wide">
                    見つかる、<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-kakurega-green to-[#a3d9a5]">
                        まだ見ぬ日常
                    </span>
                    の<br />
                    とっておき。
                </h1>

                <p className="text-white/80 text-sm md:text-lg leading-relaxed max-w-xl mb-10 font-medium tracking-wide border-l-2 border-kakurega-green pl-6">
                    観光地ではない、あなたの生活圏にある「隠れ家」のようなイベントたち。<br className="hidden md:block" />
                    週末は少し足を延ばして、新しいお気に入りを探しに行きませんか？
                </p>

                <div className="flex flex-wrap gap-4">
                    <Link
                        to="/search"
                        className="group relative px-8 py-4 bg-kakurega-green text-white rounded-full font-bold shadow-[0_0_20px_rgba(14,107,42,0.4)] hover:shadow-[0_0_30px_rgba(14,107,42,0.6)] hover:bg-kakurega-dark-green transition-all duration-300 flex items-center gap-3 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <SearchIcon size={20} />
                            今すぐ探す
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </Link>

                    <Link
                        to="/about"
                        className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                    >
                        <Info size={20} />
                        Kakuregaとは
                    </Link>
                </div>
            </div>

            {images.length > 0 && (
                <div className="absolute bottom-8 right-8 md:right-16 z-30 flex gap-3">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentImageIndex ? 'w-12 bg-kakurega-green' : 'w-3 bg-white/30 hover:bg-white/50'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

// --- Map Component Helper ---

const MapViewer: React.FC<{ events: KakuregaEvent[], userLocation: UserLocation | null, onSave: (id: string) => void }> = ({ events, userLocation, onSave }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [isMapReady, setIsMapReady] = useState(false);

    useEffect(() => {
        if ((window as any).L) {
            setIsMapReady(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setIsMapReady(true);
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }, []);

    useEffect(() => {
        if (!isMapReady || !mapRef.current) return;
        if (!mapInstance.current) {
            const L = (window as any).L;
            mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([34.6937, 135.1955], 11);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(mapInstance.current);
            L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
        }
    }, [isMapReady]);

    useEffect(() => {
        if (!isMapReady || !mapInstance.current) return;
        const L = (window as any).L;
        const map = mapInstance.current;

        markersRef.current.forEach(m => map.removeLayer(m));
        markersRef.current = [];

        if (userLocation) {
            const userIcon = L.divIcon({
                className: 'user-marker',
                html: `<div style="background-color:#3b82f6;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 5px rgba(0,0,0,0.3);"></div>`,
                iconSize: [14, 14]
            });
            markersRef.current.push(L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map));
        }

        events.forEach(e => {
            const icon = L.divIcon({
                className: 'event-marker',
                html: `<div style="background-color:#0e6b2a;color:white;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 3px 5px rgba(0,0,0,0.2);"><span style="transform:rotate(45deg);font-size:12px;font-weight:bold;">${String(e.id).slice(0, 3)}</span></div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            });

            const m = L.marker([e.lat, e.lng], { icon }).addTo(map);

            const content = document.createElement('div');
            content.innerHTML = `
                <div style="width:200px;">
                    <div style="height:100px;background:url('${coverImageUrl(e)}') center/cover;border-radius:8px 8px 0 0;"></div>
                    <div style="padding:8px;">
                        <div style="font-size:10px;color:#0e6b2a;font-weight:bold;">${e.category}</div>
                        <div style="font-weight:bold;font-size:13px;margin:2px 0;">${e.title}</div>
                        <div style="font-size:10px;color:#666;margin-bottom:6px;">${e.date}</div>
                        <button id="btn-detail-${CSS.escape(String(e.id))}" style="width:100%;background:#0e6b2a;color:white;border:none;padding:4px;border-radius:4px;cursor:pointer;">詳細</button>
                    </div>
                </div>
            `;
            m.bindPopup(content);

            m.on('popupopen', () => {
                const b = document.getElementById(`btn-detail-${String(e.id)}`);
                if (b) (b as HTMLButtonElement).onclick = () => {
                    window.location.hash = `#/search?event_id=${encodeURIComponent(e.id)}`;
                };
            });

            markersRef.current.push(m);
        });

        if (markersRef.current.length > 0) {
            map.fitBounds(L.featureGroup(markersRef.current).getBounds(), { padding: [50, 50] });
        }
    }, [isMapReady, events, userLocation, onSave]);

    return <div ref={mapRef} className="w-full h-full" />;
};

<<<<<<< HEAD
// --- Pages ---

const HomePage: React.FC = () => {
  const [randomPicks, setRandomPicks] = useState<KakuregaEvent[]>([]);

  useEffect(() => {
    // Randomly select 6 events for a better grid display
    const shuffled = [...EVENTS].sort(() => 0.5 - Math.random());
    setRandomPicks(shuffled.slice(0, 6));
  }, []);

  return (
    <div className="pb-20">
      <HeroSection />

      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-16">
        
        {/* Recommended Events Section */}
        <section className="relative animate-fade-in">
            {/* Decorative Header */}
            <div className="text-center mb-12">
                <div className="inline-block px-4 py-1.5 rounded-full bg-kakurega-green/10 text-kakurega-green text-xs font-bold tracking-widest mb-4 border border-kakurega-green/20">
                    PICK UP
                </div>
                <h2 className="font-serif text-3xl md:text-4xl text-kakurega-ink font-bold mb-4 tracking-wide">
                    今週のおすすめ
                </h2>
                <p className="text-sm text-kakurega-muted font-medium max-w-xl mx-auto leading-relaxed">
                    あなたの街の近くで見つかる、特別な体験をピックアップしました。<br className="hidden sm:block"/>
                    いつもとは違う週末を過ごしてみませんか？
                </p>
                <div className="w-16 h-1 bg-gradient-to-r from-kakurega-green/30 via-kakurega-green to-kakurega-green/30 rounded-full mx-auto mt-8"></div>
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {randomPicks.map((e, index) => (
                    <div key={e.id} className="h-full">
                        <RichEventCard event={e} />
                    </div>
                ))}
            </div>
            
            {/* View All Link */}
            <div className="mt-12 text-center">
                 <Link to="/search" className="inline-flex items-center gap-2 text-kakurega-green font-bold text-sm border-b-2 border-kakurega-green/20 hover:border-kakurega-green transition-all pb-1 group tracking-wide">
                    すべてのイベントを見る
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform"/>
                 </Link>
            </div>
        </section>

        {/* Categories / Search Prompt Section */}
        <section className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 md:p-12 border border-white shadow-xl text-center relative overflow-hidden group">
             {/* Decorative background elements */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-kakurega-green/30 to-transparent"></div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-kakurega-green/5 rounded-full blur-3xl pointer-events-none group-hover:bg-kakurega-green/10 transition-colors"></div>
             <div className="absolute top-10 left-10 w-20 h-20 bg-orange-100/50 rounded-full blur-2xl pointer-events-none"></div>

             <div className="relative z-10">
                <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4 text-kakurega-ink">週末の予定はもう決まりましたか？</h2>
                <p className="text-kakurega-muted text-sm mb-8 leading-loose max-w-lg mx-auto">
                    「今週末、どこ行こう？」<br/>
                    隠れ家なら、日付や気分、予算から、<br className="sm:hidden"/>あなたにぴったりのイベントが見つかります。
                </p>

                <Link 
                    to="/search" 
                    className="inline-flex items-center gap-3 px-10 py-4 bg-kakurega-green text-white rounded-full font-bold shadow-[0_8px_20px_rgba(14,107,42,0.25)] hover:shadow-[0_10px_25px_rgba(14,107,42,0.35)] hover:bg-kakurega-dark-green transition-all transform hover:scale-105 active:scale-95"
                >
                    <SearchIcon size={20} />
                    イベントを探しに行く
                </Link>
             </div>
        </section>
      </div>
    </div>
  );
};

const INTEREST_FIELDS = [
    { id: 'food', label: 'グルメ・酒', icon: Utensils, keywords: ['グルメ', 'パン', '酒', '甘酒', '野菜', 'ランチ', '海鮮'] },
    { id: 'culture', label: '歴史・文化', icon: Landmark, keywords: ['歴史', '伝統', '骨董', 'レトロ', '建築', '寺', '縁日'] },
    { id: 'art', label: 'アート・創作', icon: Palette, keywords: ['アート', 'ハンドメイド', '雑貨', '工芸', '写真', '展示'] },
    { id: 'nature', label: '自然・風景', icon: TreePine, keywords: ['自然', '海', '公園', '絶景', '花', '夜景', '散歩'] },
    { id: 'music', label: '音楽・舞台', icon: Music, keywords: ['音楽', '和太鼓', '演奏', '朗読'] },
    { id: 'family', label: '家族・子供', icon: Baby, keywords: ['子供', '家族', '親子', '食育'] },
];

const SearchPage: React.FC = () => {
  const [filters, setFilters] = useState({
    interest: '',
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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [, setSearchParams] = useSearchParams();
=======
const toJstDate = (ts: string | null) => {
    if (!ts) return '';
    const d = new Date(ts);
    // JST に補正
    d.setHours(d.getHours() + 9);
    return d.toISOString().slice(0, 10);
};

const toJstTime = (ts: string | null) => {
    if (!ts) return '';
    const d = new Date(ts);
    d.setHours(d.getHours() + 9);
    return d.toISOString().slice(11, 16);
};
>>>>>>> 1871aafded48367a6c5e2fef9fe2e675e1673d3e

const publicImageUrl = (path: string) => {
    const { data } = supabase.storage.from("event-images").getPublicUrl(path);
    return data.publicUrl;
};

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1528360983277-13d9b152c611?auto=format&fit=crop&q=80";

const coverImageUrl = (e: { image_paths?: string[] | null }) => {
    const p = e.image_paths?.[0];
    return p ? publicImageUrl(p) : FALLBACK_IMAGE;
};

const dbToUiEvent = (d: any) => {
    const toHHMM = (t: string | null | undefined) => (t ? String(t).slice(0, 5) : "");

    const image_paths =
        Array.isArray(d.image_paths) ? d.image_paths.map((p: any) => String(p)) : undefined;

    return {
        id: String(d.id),
        title: d.title ?? "",
        description: d.description ?? "",
        category: d.category ?? "",
        city: d.city ?? "",
        area: d.prefecture ?? "",

        date: d.start_date ?? "",
        startTime: toHHMM(d.start_time),
        endTime: toHHMM(d.end_time),

        lat: (d.latitude ?? null) !== null ? Number(d.latitude) : 34.6937,
        lng: (d.longitude ?? null) !== null ? Number(d.longitude) : 135.1955,

        priceYen: 0,
        organizer: d.organizer_name ?? "",
        tags: d.tags ?? [],

        image_paths,

        // ✅ 追加
        imageUrl: coverImageUrl({ image_paths }),
    };
};




// --- Pages ---
const HomePage: React.FC<{ events: any[]; eventsLoading: boolean }> = ({ events, eventsLoading }) => {
    const [randomPicks, setRandomPicks] = useState<KakuregaEvent[]>([]);

    useEffect(() => {
        const shuffled = [...events].sort(() => 0.5 - Math.random());
        setRandomPicks(shuffled.slice(0, 3));
        console.log("events state updated", events.length, events);
    }, [events]);

    return (
        <div className="pb-10">
            <HeroSection events={events} />

            <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-8">
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
        </div>
    );
};

const SearchPage: React.FC<{
    events: any[];
    eventsLoading: boolean;
    favIds: Set<string>;
    setFavIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}> = ({ events, eventsLoading, favIds, setFavIds }) => {
    const { pushToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

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
    const [filteredEvents, setFilteredEvents] = useState<KakuregaEvent[]>([]);
    const [, setSearchParams] = useSearchParams();

    const getSavedIds = (): string[] => {
        try {
            const raw = localStorage.getItem("savedEventIds");
            const parsed = raw ? JSON.parse(raw) : [];

            // 配列じゃなければ空
            if (!Array.isArray(parsed)) return [];

<<<<<<< HEAD
  const applyFilters = () => {
    let result = [...EVENTS];

    // Interest/Field Filter logic
    if (filters.interest) {
        const field = INTEREST_FIELDS.find(f => f.id === filters.interest);
        if (field) {
            result = result.filter(e => {
                const searchTarget = (e.tags?.join(' ') || '') + ' ' + (e.description || '') + ' ' + e.title + ' ' + e.category;
                return field.keywords.some(kw => searchTarget.includes(kw));
            });
        }
    }

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
=======
            // ネストや変な型を排除して「文字列の配列」に正規化
            return parsed
                .flat(Infinity)              // [[],["1"]] みたいなのを潰す
                .map((v: any) => String(v))
                .filter((s: string) => s.length > 0 && s !== "undefined" && s !== "null");
        } catch {
            return [];
>>>>>>> 1871aafded48367a6c5e2fef9fe2e675e1673d3e
        }
    };

    const handleSave = async (id: string) => {
        const sid = String(id);

        if (favIds.has(sid)) {
            pushToast?.("すでに保存されています", "info");
            return;
        }

        try {
            const ok = await addFavorite(sid);
            if (!ok) {
                pushToast?.(
                    "お気に入りにはログインが必要です",
                    "info",
                    {
                        label: "ログインする",
                        onClick: () => {
                            const next = `${location.pathname}${location.search}`;
                            navigate(`/login?next=${encodeURIComponent(next)}`);
                        }
                    }
                );
                return;
            }

            setFavIds(prev => {
                const next = new Set(prev);
                next.add(sid);
                return next;
            });
            pushToast?.("保存しました", "success");
        } catch {
            pushToast?.("保存に失敗しました", "error");
        }
    };

<<<<<<< HEAD
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-4">
      <section className="bg-white/90 backdrop-blur-md border border-black/10 rounded-[24px] p-6 shadow-xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-kakurega-green/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10">
            <h1 className="font-serif text-2xl mb-4 text-kakurega-ink font-bold flex items-center gap-2">
                <SearchIcon size={24} className="text-kakurega-green"/>
                条件で探す
            </h1>

            {/* 1. Interest Field Selection (Chips) */}
            <div className="mb-6">
                <p className="text-[11px] font-bold text-kakurega-muted mb-2 tracking-wide">興味のある分野（タップして選択）</p>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleChange('interest', '')}
                        className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border
                            ${!filters.interest 
                                ? 'bg-kakurega-green text-white border-transparent shadow-md' 
                                : 'bg-white text-kakurega-muted border-black/10 hover:bg-kakurega-paper'}`}
                    >
                        すべて
                    </button>
                    {INTEREST_FIELDS.map(field => {
                        const Icon = field.icon;
                        const isSelected = filters.interest === field.id;
                        return (
                            <button
                                key={field.id}
                                onClick={() => handleChange('interest', isSelected ? '' : field.id)}
                                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2
                                    ${isSelected
                                        ? 'bg-kakurega-green text-white border-transparent shadow-md transform scale-105' 
                                        : 'bg-white text-kakurega-muted border-black/10 hover:bg-kakurega-paper'}`}
                            >
                                <Icon size={14} />
                                {field.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Basic Filters (Area & Time) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div className="bg-kakurega-paper/30 p-4 rounded-xl border border-black/5">
                     <p className="text-[11px] font-bold text-kakurega-muted mb-2 flex items-center gap-1"><MapPin size={12}/> 地域・場所</p>
                     <div className="flex gap-2">
                         <select 
                            className="flex-1 p-2.5 rounded-lg border border-black/10 bg-white text-sm focus:ring-2 focus:ring-kakurega-green/30 outline-none"
                            value={filters.area}
                            onChange={e => handleChange('area', e.target.value)}
                        >
                            <option value="">全地域</option>
                            <option value="神戸">神戸</option>
                            <option value="阪神">阪神</option>
                            <option value="播磨">播磨</option>
                            <option value="丹波">丹波</option>
                            <option value="但馬">但馬</option>
                            <option value="淡路">淡路</option>
                        </select>
                        <input 
                            type="text" 
                            placeholder="市町村名 (例: 明石)"
                            className="flex-1 p-2.5 rounded-lg border border-black/10 bg-white text-sm focus:ring-2 focus:ring-kakurega-green/30 outline-none placeholder:text-gray-400"
                            value={filters.city}
                            onChange={e => handleChange('city', e.target.value)}
                         />
                     </div>
                 </div>

                 <div className="bg-kakurega-paper/30 p-4 rounded-xl border border-black/5">
                     <p className="text-[11px] font-bold text-kakurega-muted mb-2 flex items-center gap-1"><Calendar size={12}/> 開催時期</p>
                     <select 
                        className="w-full p-2.5 rounded-lg border border-black/10 bg-white text-sm focus:ring-2 focus:ring-kakurega-green/30 outline-none"
                        value={filters.period}
                        onChange={e => handleChange('period', e.target.value)}
                    >
                        <option value="">指定なし</option>
                        <option value="today">今日開催</option>
                        <option value="week">今週開催</option>
                        <option value="month">今月開催</option>
                        <option value="range">日付を指定</option>
                    </select>
                 </div>
            </div>

            {filters.period === 'range' && (
                <div className="flex items-center gap-2 mb-4 bg-white p-3 rounded-xl border border-black/10 animate-fade-in mx-1">
                     <input type="date" className="flex-1 p-2 rounded border border-gray-200 text-xs" value={filters.dateFrom} onChange={e => handleChange('dateFrom', e.target.value)} />
                     <span className="text-gray-400">~</span>
                     <input type="date" className="flex-1 p-2 rounded border border-gray-200 text-xs" value={filters.dateTo} onChange={e => handleChange('dateTo', e.target.value)} />
                </div>
            )}

            {/* 3. Advanced Filters Toggle */}
            <div className="border-t border-dashed border-black/10 pt-4">
                <button 
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    className="flex items-center gap-1 text-xs font-bold text-kakurega-green hover:underline mb-3 ml-1"
                >
                    {isAdvancedOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    その他の条件（予算・距離・形式など）
                </button>

                {isAdvancedOpen && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in bg-gray-50/50 p-4 rounded-xl mb-4">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[10px] text-kakurega-muted font-bold">予算上限</span>
                            <select className="p-2 rounded border border-gray-200 text-xs" value={filters.budget} onChange={e => handleChange('budget', e.target.value)}>
                                <option value="">指定なし</option>
                                <option value="0">無料のみ</option>
                                <option value="1000">1,000円以内</option>
                                <option value="3000">3,000円以内</option>
                                <option value="5000">5,000円以内</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[10px] text-kakurega-muted font-bold">形式</span>
                            <select className="p-2 rounded border border-gray-200 text-xs" value={filters.type} onChange={e => handleChange('type', e.target.value)}>
                                <option value="">指定なし</option>
                                <option value="祭り">祭り</option>
                                <option value="朝市">朝市</option>
                                <option value="体験">体験</option>
                                <option value="展示">展示</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-1.5 col-span-2 md:col-span-2">
                             <span className="text-[10px] text-kakurega-muted font-bold">現在地からの距離</span>
                             <div className="flex gap-2">
                                <select className="flex-1 p-2 rounded border border-gray-200 text-xs" value={filters.distance} onChange={e => handleChange('distance', e.target.value)}>
                                    <option value="">指定なし</option>
                                    <option value="5">ご近所 (5km)</option>
                                    <option value="10">車で30分 (10km)</option>
                                    <option value="30">車で1時間 (30km)</option>
                                </select>
                             </div>
                             {locStatus && <p className="text-[10px] text-kakurega-green">{locStatus}</p>}
                        </label>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="mt-2 flex justify-center md:justify-end">
                <button 
                    onClick={applyFilters}
                    className="w-full md:w-auto px-10 py-3 bg-kakurega-green text-white rounded-xl text-sm font-bold shadow-lg hover:bg-kakurega-dark-green hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                    <SearchIcon size={16} /> この条件で検索
                </button>
            </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
           <div className="bg-white rounded-[24px] border border-black/10 overflow-hidden shadow-lg h-[450px] md:h-[600px] relative z-0">
              <MapViewer events={filteredEvents} userLocation={userLocation} onSave={handleSave} />
           </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur border border-black/10 rounded-[24px] p-5 shadow-md flex flex-col h-[600px]">
           <div className="flex justify-between items-baseline mb-4 pb-2 border-b border-black/5">
              <h2 className="font-serif text-lg text-kakurega-ink">検索結果</h2>
              <span className="text-xs text-kakurega-muted font-bold">{filteredEvents.length}件</span>
           </div>
           
           <div className="overflow-y-auto flex-1 pr-1 space-y-3 custom-scrollbar">
              {filteredEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                      <SearchIcon size={32} className="mb-2 text-kakurega-muted/50"/>
                      <p className="text-sm font-bold">条件に合うイベントが<br/>見つかりませんでした。</p>
                      <p className="text-xs mt-2">条件を少し広げてみてください。</p>
                  </div>
              ) : (
                  filteredEvents.map(e => (
                    <div 
                        key={e.id} 
                        onClick={() => openDetail(e.id)}
                        className="bg-white border border-black/5 rounded-xl p-3 hover:border-kakurega-green/50 hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex gap-3">
                            {/* Thumbnail for list item */}
                            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                {e.imageUrl ? (
                                    <img src={e.imageUrl} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Info size={20}/></div>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-sm text-kakurega-ink group-hover:text-kakurega-green transition-colors truncate pr-2">{e.title}</h3>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-1">
                                     <span className="text-[9px] bg-kakurega-paper px-1.5 py-0.5 rounded text-kakurega-dark-green whitespace-nowrap">{e.category}</span>
                                     <span className="text-[9px] border border-black/10 px-1.5 py-0.5 rounded text-kakurega-muted whitespace-nowrap">{e.city}</span>
                                </div>
                                <p className="text-xs text-kakurega-muted mb-2 flex items-center gap-2">
                                    <span>{e.date}</span>
                                    <span className="text-kakurega-green font-bold">{e.priceYen === 0 ? '無料' : `¥${e.priceYen}`}</span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-black/5 border-dashed">
                            <AddToCalendarButton 
                                event={e} 
                                className="text-[10px] px-2 py-1 rounded border border-black/10 hover:bg-gray-50 flex items-center gap-1 text-kakurega-muted hover:text-kakurega-green transition-colors"
=======

    const openDetail = (id: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('event_id', id);
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
        let from: string | null = null;
        let to: string | null = null;

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
        let result = [...events];
        console.log("filtered before", result);

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

    useEffect(() => { applyFilters(); }, [events]);

    const handleChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-4">
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
>>>>>>> 1871aafded48367a6c5e2fef9fe2e675e1673d3e
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
                            <div className="text-center py-10 opacity-60 text-sm">条件に合うイベントが<br />見つかりませんでした。</div>
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
                                    <p className="text-xs text-kakurega-muted mb-2">
                                        {e.date} / {e.city}
                                        <span className="text-kakurega-green font-bold ml-1">{e.priceYen === 0 ? '無料' : `¥${e.priceYen}`}</span>
                                        {e.distKm !== undefined && e.distKm !== null && <span className="text-[10px] ml-1 opacity-70">({e.distKm.toFixed(1)}km)</span>}
                                    </p>

                                    <div className="flex justify-end gap-2">
                                        <AddToCalendarButton
                                            event={e}
                                            className="text-[10px] px-2 py-1 rounded border border-black/10 hover:bg-gray-50 flex items-center gap-1 text-kakurega-muted hover:text-kakurega-green transition-colors"
                                        >
                                            <CalendarPlus size={10} /> 追加
                                        </AddToCalendarButton>

                                        <button
                                            onClick={(ev) => {
                                                ev.stopPropagation();
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="text-[10px] px-2 py-1 rounded border border-black/10 hover:bg-gray-50 flex items-center gap-1 text-kakurega-muted"
                                        >
                                            <MapPin size={10} /> 地図
                                        </button>

                                        <button
                                            onClick={(ev) => {
                                                ev.stopPropagation();
                                                handleSave(e.id);
                                            }}
                                            className="text-[10px] px-2 py-1 rounded bg-kakurega-paper hover:bg-kakurega-paper-light border border-black/5 flex items-center gap-1 text-kakurega-dark-green font-bold"
                                        >
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
const SavedPage: React.FC<{
    favIds: Set<string>;
    setFavIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}> = ({ favIds, setFavIds }) => { const { pushToast } = useToast();
    const [savedEvents, setSavedEvents] = useState<KakuregaEvent[]>([]);
    const [, setSearchParams] = useSearchParams();

    useEffect(() => {
        const run = async () => {
            try {
                const favEvents = await fetchMyFavoriteEvents();
                // DbEvent -> KakuregaEvent 変換（Appと同じ変換ルールに合わせる）
                const mapped = (favEvents ?? []).map(dbToUiEvent);
                setSavedEvents(mapped);

            } catch {
                setSavedEvents([]);
            }
        };
        run();
    }, []);

    const removeSaved = async (id: string) => {
        const sid = String(id);
        // 楽観的にUIから消す
        setSavedEvents(prev => prev.filter(e => String(e.id) !== sid));
        setFavIds(prev => {
            const next = new Set(prev);
            next.delete(sid);
            return next;
        });
        try {
            await removeFavorite(sid);
            pushToast?.("お気に入りから削除しました", "info");
        } catch {
            pushToast?.("削除に失敗しました", "error");
        }
    };



    const openDetail = (id: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('event_id', id);
            return next;
        });
    };

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
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
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
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

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "/";

    return (
        <div className="max-w-xl mx-auto px-4 md:px-6 py-10 space-y-4">
            <h1 className="font-serif text-2xl font-bold text-kakurega-ink">ログイン</h1>
            <p className="text-sm text-kakurega-muted leading-relaxed">
                ここにログイン機能を実装予定です（今は未実装）。
            </p>

            <div className="bg-white/80 border border-black/10 rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-kakurega-muted mb-4">
                    ログイン後は、元のページへ戻るようにします。
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(next)}
                        className="px-5 py-3 bg-kakurega-green text-white rounded-xl text-xs font-bold shadow hover:bg-kakurega-dark-green transition-colors"
                    >
                        戻る
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="px-5 py-3 bg-white border border-black/10 rounded-xl text-xs font-bold text-kakurega-ink hover:bg-black/5 transition-colors"
                    >
                        ホームへ
                    </button>
                </div>
            </div>
        </div>
    );
};



// --- App Router ---

const App: React.FC = () => {
<<<<<<< HEAD
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
=======
    const [events, setEvents] = useState<any[]>([]);
    const [favIds, setFavIds] = useState<Set<string>>(new Set());
    const [eventsLoading, setEventsLoading] = useState(true);
    useEffect(() => {
        const run = async () => {
            setEventsLoading(true);

            try {
                const evs = await fetchPublicEvents();
                console.log("public events raw", evs);
                console.log("public events count", evs?.length ?? 0);

                const mapped = (evs ?? []).map(dbToUiEvent);
                console.log("public events mapped", mapped);
                console.log("public events mapped count", mapped.length);
                setEvents(mapped);
            } catch (e) {
                console.error("fetchPublicEvents failed", e);
                setEvents([]);
            }

            try {
                const fav = await fetchMyFavoriteIds();
                setFavIds(fav);
            } catch (e) {
                console.error("fetchMyFavoriteIds failed", e);
                setFavIds(new Set());
            }

            setEventsLoading(false);
        };

        run();
    }, []);



    return (
        <HashRouter>
            <Layout events={events} favIds={favIds} setFavIds={setFavIds} eventsLoading={eventsLoading}>
                <Routes>
                    <Route path="/" element={<HomePage events={events} eventsLoading={eventsLoading} />} />
                    <Route path="/search" element={<SearchPage events={events} eventsLoading={eventsLoading} favIds={favIds} setFavIds={setFavIds} />} />
                    <Route path="/saved" element={<SavedPage favIds={favIds} setFavIds={setFavIds} />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </Layout>
        </HashRouter>
    );
>>>>>>> 1871aafded48367a6c5e2fef9fe2e675e1673d3e
};

export default App;
