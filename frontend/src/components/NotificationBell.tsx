import { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, ShoppingCart, Package, Info, X } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'LOW_STOCK' | 'EXPIRING' | 'SALE' | 'SYSTEM' | 'INFO';
    is_read: boolean;
    created_at: string;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
    LOW_STOCK: { icon: Package, color: 'text-red-500', bg: 'bg-red-50' },
    EXPIRING: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
    SALE: { icon: ShoppingCart, color: 'text-green-500', bg: 'bg-green-50' },
    SYSTEM: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
    INFO: { icon: Info, color: 'text-indigo-500', bg: 'bg-indigo-50' },
};

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const fetchUnreadCount = async () => {
        try {
            const res = await client.get('/notifications/unread-count');
            setUnreadCount(res.data.count);
        } catch {
            // silently fail
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await client.get('/notifications');
            setNotifications(res.data);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 90000); // Poll every 90s — was 10s which caused excessive DB load
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOpen = () => {
        if (!isOpen) fetchNotifications();
        setIsOpen(!isOpen);
    };

    const handleMarkRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await client.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            // silently fail
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await client.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch {
            // silently fail
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await client.delete(`/notifications/${id}`);
            const removed = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (removed && !removed.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch {
            // silently fail
        }
    };

    return (
        <div className="relative" ref={ref}>
            {/* Bell Button */}
            <button
                onClick={handleOpen}
                className="relative p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Notifications"
            >
                <Bell className={`w-4.5 h-4.5 ${isOpen ? 'text-indigo-600' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="fixed sm:absolute top-[80px] sm:top-full right-4 sm:right-0 left-auto w-[calc(100vw-32px)] xs:w-[320px] sm:w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[100] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                        <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-tight">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-black rounded-md">
                                    {unreadCount} NEW
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-1.5 py-1 bg-indigo-50 rounded-lg transition-colors whitespace-nowrap uppercase tracking-tighter"
                                >
                                    <CheckCheck className="w-3 h-3" />
                                    <span className="hidden xs:inline">ALL READ</span>
                                    <span className="xs:hidden">READ</span>
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[calc(100vh-200px)] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="py-12 text-center text-gray-400 text-sm italic">Loading notifications...</div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                                <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
                                <p className="text-xs text-gray-300 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const config = typeConfig[n.type] || typeConfig.INFO;
                                const Icon = config.icon;
                                return (
                                    <div
                                        key={n.id}
                                        className={`flex items-start gap-3 px-3 sm:px-4 py-2.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group ${!n.is_read ? 'bg-indigo-50/30' : ''
                                            }`}
                                    >
                                        <div className={`p-1.5 rounded-lg ${config.bg} ${config.color} flex-shrink-0 mt-0.5`}>
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-1">
                                                <p className={`text-[11px] ${!n.is_read ? 'font-black text-gray-900 uppercase tracking-tight' : 'font-bold text-gray-700 uppercase tracking-tight'} line-clamp-1`}>
                                                    {n.title}
                                                </p>
                                                {!n.is_read && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                                            <p className="text-[9px] text-gray-400 mt-1 font-black uppercase tracking-widest">{formatDate(n.created_at)}</p>
                                        </div>
                                        <div className="flex flex-col gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            {!n.is_read && (
                                                <button
                                                    onClick={(e) => handleMarkRead(n.id, e)}
                                                    className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-3 h-3" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(n.id, e)}
                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
