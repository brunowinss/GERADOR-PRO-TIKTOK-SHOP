import React from 'react';
import { Zap } from './Icons';

export const Navbar: React.FC = () => {
    return (
        <nav className="flex items-center justify-between py-4 mb-8">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/20 rounded-lg">
                    <Zap className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg font-bold text-white font-display">ScriptGen</span>
            </div>
        </nav>
    );
};