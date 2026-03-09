"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogIn, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!isLogin && password !== confirmPassword) {
            setError("Las contraseñas no coinciden. Intenta de nuevo.");
            setIsLoading(false);
            return;
        }

        try {
            const endpoint = isLogin ? "/auth/login" : "/auth/register";
            const payload = isLogin ? { email, password } : { name, email, password };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Ocurrió un error en la autenticación");
            }

            if (isLogin) {
                // Save token and user info
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push("/"); // Redirect to dashboard
            } else {
                // Registration successful, log them in or show success
                setIsLogin(true);
                setError("Registro exitoso. Por favor inicia sesión.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black -z-10"></div>

            {/* Brand & Value Proposition Section */}
            <div className="hidden md:flex md:w-1/2 p-12 flex-col justify-between relative border-r border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Aura</span>
                </div>

                <div className="space-y-6 relative z-10 max-w-lg mb-20">
                    <h1 className="text-5xl font-light tracking-tight leading-tight">
                        Tus finanzas,<br />
                        <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            elegantemente simples.
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Consigue el control total de tu patrimonio con una herramienta diseñada para la claridad, velocidad y belleza. Únete a Aura hoy.
                    </p>

                    <div className="flex gap-4 pt-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <img
                                    key={i}
                                    src={`https://i.pravatar.cc/150?img=${i + 10}`}
                                    alt="User"
                                    className="w-10 h-10 rounded-full border-2 border-black z-10"
                                />
                            ))}
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex text-yellow-500 text-sm">★★★★★</div>
                            <span className="text-xs text-gray-400">Miles de usuarios felices</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Form Section */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center md:hidden">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                            <LayoutDashboard className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg">Aura</span>
                    </div>
                </div>

                <div className="w-full max-w-md space-y-8 bg-white/5 p-8 sm:p-10 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl relative z-10">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-semibold tracking-tight">
                            {isLogin ? "Bienvenido de vuelta" : "Crea tu cuenta"}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {isLogin
                                ? "Ingresa tus credenciales para acceder a tu panel."
                                : "Ingresa tus datos para comenzar tu viaje financiero."}
                        </p>
                    </div>

                    {error && (
                        <div className={`p-3 rounded-lg text-sm text-center ${error.includes("Registro exitoso") ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="space-y-2 group">
                                <Label htmlFor="name" className="text-gray-300 group-focus-within:text-indigo-400 transition-colors">Nombre completo</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="José Madrigal"
                                    className="bg-black/50 border-white/10 focus-visible:ring-indigo-500 h-12"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div className="space-y-2 group">
                            <Label htmlFor="email" className="text-gray-300 group-focus-within:text-indigo-400 transition-colors">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="jose@ejemplo.com"
                                className="bg-black/50 border-white/10 focus-visible:ring-indigo-500 h-12"
                                required
                            />
                        </div>

                        <div className="space-y-2 group">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-gray-300 group-focus-within:text-indigo-400 transition-colors">Contraseña</Label>
                                {isLogin && (
                                    <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">¿Olvidaste tu contraseña?</a>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-black/50 border-white/10 focus-visible:ring-indigo-500 h-12"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="space-y-2 group">
                                <Label htmlFor="confirmPassword" className="text-gray-300 group-focus-within:text-indigo-400 transition-colors">Confirmar contraseña</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-black/50 border-white/10 focus-visible:ring-indigo-500 h-12"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <Button disabled={isLoading} className="w-full h-12 bg-white text-black hover:bg-gray-200 text-sm font-semibold rounded-xl disabled:opacity-50">
                            {isLoading ? (
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            ) : isLogin ? (
                                <>Iniciar Sesión <LogIn className="ml-2 w-4 h-4" /></>
                            ) : (
                                <>Comenzar Ahora <ArrowRight className="ml-2 w-4 h-4" /></>
                            )}
                        </Button>
                    </form>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-xs text-gray-500">O continúa con</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white col-span-2 cursor-pointer"
                            onClick={() => {
                                const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
                                window.location.href = `${baseUrl}/auth/google`;
                            }}
                        >
                            <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </Button>
                    </div>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError("");
                            }}
                            className="ml-2 font-semibold text-white hover:text-indigo-300 transition-colors"
                        >
                            {isLogin ? "Regístrate" : "Inicia Sesión"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
