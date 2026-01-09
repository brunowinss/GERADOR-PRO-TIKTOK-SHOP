import React, { useState } from 'react';
import { supabase, isConfigured } from '../lib/supabaseClient';
import { useToast } from './ui/Toast';
import { Zap, Loader2, Mail, Lock } from './Icons';
import { useAuth } from '../context/AuthContext';

export const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const { error, success } = useToast();
    const { signInWithMock } = useAuth();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Se não estiver configurado, usa login simulado em vez de falhar
            if (!isConfigured) {
                await new Promise(resolve => setTimeout(resolve, 800)); // Simula delay de rede
                signInWithMock(email);
                success('Modo Demonstração: Login realizado (Simulado)');
                return;
            }

            if (isSignUp) {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) throw signUpError;
                if (data.user && data.session) {
                    success('Conta criada com sucesso!');
                } else {
                    success('Verifique seu email para confirmar o cadastro!');
                }
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            
            // Tratamento de erros comuns do Supabase
            if (err.message === 'Failed to fetch') {
                error('Erro de conexão com Supabase. Verifique a URL do projeto.');
            } else if (err.message?.includes('JWT') || err.status === 401 || err.code === '401') {
                error('Chave do Supabase inválida. Verifique se a KEY está correta (Anon Key).');
            } else if (err.message?.includes('apikey')) {
                error('Configuração de API Key inválida.');
            } else {
                error(err.message || 'Erro na autenticação');
            }
        } finally {
            if (isConfigured) {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-6">
            <div className="w-full max-w-md animate-[fadeIn_0.5s_ease-out]">
                {/* Logo and Header */}
                <div className="text-center mb-8 sm:mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mb-6 ring-1 ring-primary/20 shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)] shadow-primary/10">
                        <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white font-display mb-3 tracking-tight">
                        ScriptGen
                    </h1>
                    <p className="text-[#888] text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
                        Sua plataforma de geração de scripts virais para TikTok Shop.
                    </p>
                    {!isConfigured && (
                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-xs text-yellow-500 font-medium">
                                ⚠️ Modo Demo: Login será simulado sem backend.
                            </p>
                        </div>
                    )}
                </div>

                {/* Auth Card */}
                <div className="bg-[#0f0f0f]/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#222] shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            {isSignUp ? 'Criar nova conta' : 'Acesse sua conta'}
                        </h2>

                        <form onSubmit={handleAuth} className="space-y-4 sm:space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-[#666] uppercase tracking-wider ml-1">Email</label>
                                <div className="relative group/input">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] group-focus-within/input:text-primary transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-[#222] rounded-xl text-white placeholder:text-[#444] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:bg-black/60 transition-all text-sm"
                                        placeholder="exemplo@email.com"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-[#666] uppercase tracking-wider ml-1">Senha</label>
                                <div className="relative group/input">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] group-focus-within/input:text-primary transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-[#222] rounded-xl text-white placeholder:text-[#444] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:bg-black/60 transition-all text-sm"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5" />
                                        <span>Processando...</span>
                                    </>
                                ) : (
                                    <span>{isSignUp ? 'Criar Conta' : 'Entrar'}</span>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-[#222] text-center">
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-sm text-[#666] hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto group/link"
                                type="button"
                            >
                                {isSignUp ? 'Já tem uma conta?' : 'Não tem conta?'}
                                <span className="text-primary group-hover/link:underline underline-offset-4 decoration-primary/50">
                                    {isSignUp ? 'Faça Login' : 'Cadastre-se'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <p className="text-center text-[#444] text-xs mt-8">
                    Protegido por autenticação segura Supabase.
                </p>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};