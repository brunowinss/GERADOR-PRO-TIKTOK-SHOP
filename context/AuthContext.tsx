import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isConfigured } from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signInWithMock: (email: string) => void;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => {},
    signInWithMock: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Se não estiver configurado, apenas finaliza o carregamento.
        // O estado session continuará null, forçando a tela de Auth a aparecer.
        if (!isConfigured) {
            console.log('Supabase credentials missing. Auth disabled.');
            setLoading(false);
            return;
        }

        // Obter sessão inicial real
        const initSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                     console.warn("Auth session check failed:", error.message);
                }
                setSession(data?.session ?? null);
                setUser(data?.session?.user ?? null);
            } catch (err) {
                console.error("Unexpected error initializing auth session:", err);
            } finally {
                setLoading(false);
            }
        };

        initSession();

        // Ouvir mudanças na autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        setSession(null);
        setUser(null);

        if (!isConfigured) return;
        
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const signInWithMock = (email: string) => {
        const mockUser = {
            id: 'demo-user',
            email: email || 'demo@scriptgen.ai',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            role: 'authenticated'
        } as User;

        const mockSession = {
            access_token: 'mock-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh',
            user: mockUser
        } as Session;

        setSession(mockSession);
        setUser(mockUser);
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut, signInWithMock }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};