import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from '../Icons';

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastMessage {
    id: number;
    title: string;
    description?: string;
    variant?: ToastVariant;
}

interface ToastContextType {
    toast: (props: Omit<ToastMessage, 'id'>) => void;
    success: (msg: string) => void;
    error: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((props: Omit<ToastMessage, 'id'>) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, ...props }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const success = (msg: string) => addToast({ title: msg, variant: 'success' });
    const error = (msg: string) => addToast({ title: msg, variant: 'destructive' });

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast: addToast, success, error }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div 
                        key={t.id} 
                        className={`
                            pointer-events-auto p-4 rounded-xl shadow-lg border text-sm font-medium 
                            animate-in slide-in-from-right-full fade-in duration-300 flex items-start gap-3 min-w-[300px]
                            ${t.variant === 'destructive' 
                                ? "bg-red-900/90 border-red-800 text-white" 
                                : t.variant === 'success'
                                    ? "bg-emerald-900/90 border-emerald-800 text-white"
                                    : "bg-zinc-900/90 border-zinc-800 text-white"
                            }
                        `}
                    >
                        <div className="flex-1">
                            <div>{t.title}</div>
                            {t.description && <div className="text-xs opacity-70 mt-1">{t.description}</div>}
                        </div>
                        <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};