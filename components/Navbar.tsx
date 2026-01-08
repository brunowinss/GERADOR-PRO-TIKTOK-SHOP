import React from 'react';
import { Zap, LogOut, User } from './Icons';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
    const { signOut, user } = useAuth();

    return (
        <nav className="flex items-center justify-between py-4 mb-8">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/20 rounded-lg">
                    <Zap className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg font-bold text-white font-display">ScriptGen</span>
            </div>
            
            <div className="flex items-center gap-4">
                {user && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] rounded-full border border-[#333]">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground max-w-[150px] truncate">
                            {user.email}
                        </span>
                    </div>
                )}
                
                <button 
                    onClick={signOut}
                    className="flex items-center gap-2 text-sm text-[#888] hover:text-white transition-colors hover:bg-white/5 px-3 py-2 rounded-lg"
                    title="Sair"
                >
                    <span className="hidden sm:inline">Sair</span>
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </nav>
    );
};