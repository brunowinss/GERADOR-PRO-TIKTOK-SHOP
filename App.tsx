import React, { useState } from 'react';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BrandTab } from './components/BrandTab';
import { Footer } from './components/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs';
import { BRANDS } from './constants';
import { Zap, Video, Sparkles, Music, Loader2 } from './components/Icons';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';

const BackgroundAmbience = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(145_100%_50%/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(145_100%_50%/0.05),transparent_50%)]" />
        
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div 
            className="absolute bottom-20 right-1/4 w-64 h-64 bg-primary/8 rounded-full blur-[120px] animate-pulse-slow" 
            style={{ animationDelay: '1.5s' }} 
        />
        <div 
            className="absolute top-1/2 right-1/3 w-48 h-48 bg-primary/5 rounded-full blur-[100px] animate-pulse-slow" 
            style={{ animationDelay: '0.8s' }} 
        />
    </div>
);

const TabSelector: React.FC<{ activeTab: string; onTabChange: (val: string) => void }> = ({ activeTab, onTabChange }) => {
    const getIcon = (iconName: string) => {
        switch(iconName) {
            case 'Video': return Video;
            case 'Sparkles': return Sparkles;
            case 'Zap': return Zap;
            case 'Music': return Music;
            default: return Video;
        }
    };

    return (
        <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden shadow-2xl">
            <Tabs value={activeTab} onValueChange={onTabChange}>
                <div className="p-2 sm:p-3 bg-[#111] border-b border-[#222]">
                    <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto p-0 bg-transparent gap-2">
                        {BRANDS.map((brand) => {
                            const IconComp = getIcon(brand.icon);
                            return (
                                <TabsTrigger
                                    key={brand.id}
                                    value={brand.id}
                                    className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-transparent border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:border-primary/50 text-left transition-all hover:bg-[#1a1a1a]"
                                >
                                    <div className={`p-2 sm:p-2.5 rounded-lg flex-shrink-0 transition-colors ${activeTab === brand.id ? 'bg-primary text-black' : 'bg-[#1a1a1a] text-[#666]'}`}>
                                        <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`text-xs sm:text-sm font-semibold truncate transition-colors ${activeTab === brand.id ? 'text-white' : 'text-[#888]'}`}>
                                            {brand.display}
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-[#555] truncate">
                                            {brand.model} • {brand.duration}
                                        </span>
                                    </div>
                                    {activeTab === brand.id && (
                                        <div className="ml-auto w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0 shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
                                    )}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </div>

                {BRANDS.map((brand) => {
                    const IconComp = getIcon(brand.icon);
                    return (
                        <TabsContent key={brand.id} value={brand.id} className="mt-0 p-4 sm:p-6 bg-[#0a0a0a]">
                            <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20">
                                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1.5 sm:mb-2 flex items-center gap-2">
                                    <IconComp className="w-5 h-5 text-primary" />
                                    {brand.hook}
                                </h3>
                                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                    {brand.description}
                                </p>
                            </div>
                            
                            <BrandTab 
                                brandName={brand.name} 
                                brandDisplay={brand.display} 
                                isVeo3={brand.id === 'wins-shop'} 
                            />
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
};

const MainContent: React.FC = () => {
    const { session, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('bruno-shopp');

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!session) {
        return <Auth />;
    }

    return (
        <div className="relative z-10 container max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
            <Navbar />
            <HeroSection />
            <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ToastProvider>
                <div className="min-h-screen bg-[#0a0a0a] relative selection:bg-primary/30 selection:text-white font-body">
                    <BackgroundAmbience />
                    <MainContent />
                </div>
            </ToastProvider>
        </AuthProvider>
    );
};

export default App;