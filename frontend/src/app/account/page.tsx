"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Plus, Trash2, Edit2, Check, X, Users, Zap, Mail, DownloadCloud, UploadCloud, Database } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Toast, ToastType } from "@/components/ui/toast";
import { format } from "date-fns";

export default function AccountPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("members");

    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Household Members states
    const [members, setMembers] = useState<any[]>([]);
    
    // Connections states
    const [connections, setConnections] = useState<any[]>([]);
    const [geminiApiKey, setGeminiApiKey] = useState("");
    const [hasGeminiKey, setHasGeminiKey] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.push("/auth");
        } else {
            setUser(JSON.parse(storedUser));
            fetchData(token);
        }
    }, [router]);

    const fetchData = async (token: string) => {
        try {
            const hdrs = { Authorization: `Bearer ${token}` };
            const [membersRes, connRes, geminiRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/household/members`, { headers: hdrs }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/inbox/connections`, { headers: hdrs }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/parameters/GEMINI_API_KEY`, { headers: hdrs }),
            ]);
            
            if (membersRes.ok) setMembers(await membersRes.json());
            if (connRes.ok) setConnections(await connRes.json());
            if (geminiRes.ok) {
                const data = await geminiRes.json();
                if (data && data.value) {
                    setHasGeminiKey(true);
                    setGeminiApiKey(data.value);
                }
            }
            
            setIsLoading(false);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get("email") as string;
        const name = formData.get("name") as string;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/household/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ email, name })
        });
        
        if (res.ok) {
            fetchData(token!);
            (e.target as HTMLFormElement).reset();
            setToast({ message: "Miembro añadido al hogar exitosamente.", type: "success" });
        } else {
            const err = await res.json();
            setToast({ message: `Error: ${err.message || 'No se pudo añadir el miembro'}`, type: "error" });
        }
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/backup/export`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `aura-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                setToast({ message: "Respaldo descargado exitosamente.", type: "success" });
            } else {
                setToast({ message: "No se pudo generar el respaldo.", type: "error" });
            }
        } catch (e) {
            setToast({ message: "Error de red al intentar respaldar.", type: "error" });
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm("¡ATENCIÓN! La restauración BORRARÁ irrecuperablemente tus datos actuales y los reemplazará con los del archivo. ¿Deseas proceder?")) {
            e.target.value = '';
            return;
        }

        try {
            setToast({ message: "Restaurando datos, por favor espera...", type: "info" });
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/backup/import`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                setToast({ message: "Datos restaurados con éxito. Recargando...", type: "success" });
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                const data = await res.json();
                setToast({ message: data.message || "No se pudieron restaurar los datos.", type: "error" });
            }
        } catch (e) {
            setToast({ message: "Error de conexión al restaurar.", type: "error" });
        } finally {
            e.target.value = '';
        }
    };

    // Bank Connections CRUD
    const handleCreateConnection = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const formData = new FormData(e.target as HTMLFormElement);
        const provider = formData.get("provider") as string;
        const emailAddress = formData.get("emailAddress") as string;
        const appPassword = formData.get("appPassword") as string;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inbox/connections`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ provider, emailAddress, appPassword })
        });
        if (res.ok) {
            fetchData(token!);
            (e.target as HTMLFormElement).reset();
            setToast({ message: "Integración de correo configurada exitosamente.", type: "success" });
        } else {
            setToast({ message: "Error al configurar la integración.", type: "error" });
        }
    };

    const handleSaveGeminiKey = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parameters/GEMINI_API_KEY`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ value: geminiApiKey, description: "Clave API de Google Gemini para Asesor de Inversiones IA" })
        });
        if (res.ok) {
            setToast({ message: "Clave de Gemini guardada exitosamente.", type: "success" });
            fetchData(token!);
        } else {
            setToast({ message: "Error al guardar la clave.", type: "error" });
        }
    };

    const handleDeleteConnection = async (id: string) => {
        if (!window.confirm("¿Estás seguro de eliminar esta integración de correo? Se borrarán las transacciones del buzón asociadas pero no las transacciones confirmadas.")) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inbox/connections/${id}/delete`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchData(token!);
            setToast({ message: "Integración eliminada.", type: "success" });
        } else {
            setToast({ message: "No se pudo eliminar la integración.", type: "error" });
        }
    };


    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black overflow-y-auto">
                {/* Header */}
                <header className="h-20 border-b border-white/10 flex items-center justify-between px-4 pl-16 md:px-8 shrink-0 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-2xl font-light tracking-tight">Cuenta de Usuario</h1>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                            <Bell className="w-5 h-5 text-gray-300" />
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400 hidden sm:block">{user?.email}</span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 pb-20">
                    
                    {/* User Profile Summary */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex flex-shrink-0 items-center justify-center text-4xl font-bold font-serif shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-white mb-1">{user?.name || user?.email?.split('@')[0] || "Usuario"}</h2>
                            <p className="text-gray-400 mb-4">{user?.email}</p>
                            <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-500/20">
                                {user?.role === 'ADMIN' ? 'Administrador del Hogar' : 'Miembro del Hogar'}
                            </span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
                        <button
                            className={`px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "members" ? "bg-indigo-500/20 text-indigo-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            onClick={() => setActiveTab("members")}
                        >
                            <Users size={18} /> Familia / Hogar
                        </button>
                        <button
                            className={`px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "connections" ? "bg-indigo-500/20 text-indigo-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            onClick={() => setActiveTab("connections")}
                        >
                            <Zap size={18} /> Integraciones / IA
                        </button>
                        <button
                            className={`px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "backup" ? "bg-indigo-500/20 text-indigo-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            onClick={() => setActiveTab("backup")}
                        >
                            <Database size={18} /> Respaldo de Datos
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                        
                        {/* Members Tab */}
                        {activeTab === "members" && (
                            <div className="space-y-6">
                                <div className="border-b border-white/10 pb-4">
                                    <h3 className="text-lg font-medium">Miembros del Hogar</h3>
                                    <p className="text-sm text-gray-400 mt-1">Comparte tus finanzas con familiares o pareja. Los miembros verán las mismas cuentas y transacciones.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {members.map(member => (
                                        <div key={member.id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                                                {member.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white flex items-center gap-2">
                                                    {member.name || member.email?.split('@')[0]}
                                                    {member.id === user?.id && <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">Tú</span>}
                                                </h4>
                                                <p className="text-xs text-gray-400">{member.email}</p>
                                            </div>
                                            <div className="ml-auto">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${member.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                    {member.role === 'ADMIN' ? 'Admin' : 'Miembro'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {user?.role === 'ADMIN' && (
                                    <div className="pt-6 mt-6 border-t border-white/10 bg-indigo-900/10 p-4 md:p-6 rounded-xl">
                                        <h4 className="text-md font-medium mb-4 text-indigo-300">Invitar Nuevo Miembro</h4>
                                        <p className="text-xs text-gray-400 mb-6 w-full max-w-2xl">
                                            Invita a un familiar ingresando su correo electrónico de Google y su nombre. La persona podrá iniciar sesión con Google usando ese mismo correo y verá tus mismas cuentas y transacciones.
                                        </p>
                                        <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                                            <div className="lg:col-span-2">
                                                <label className="block text-xs text-gray-400 mb-1">Correo Electrónico (Google)</label>
                                                <input type="email" name="email" required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="familiar@gmail.com" />
                                            </div>
                                            <div className="lg:col-span-2">
                                                <label className="block text-xs text-gray-400 mb-1">Nombre del Miembro</label>
                                                <input type="text" name="name" required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej. María" />
                                            </div>
                                            <div className="flex flex-col justify-end lg:col-span-1">
                                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 h-[38px] shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                                    <Plus size={16} /> Añadir
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Connections Tab */}
                        {activeTab === "connections" && (
                            <div className="space-y-6">
                                <div className="border-b border-white/10 pb-4">
                                    <h3 className="text-lg font-medium">Buzón de Integraciones</h3>
                                    <p className="text-sm text-gray-400 mt-1">Configura integraciones (Ej. IMAP de Gmail) para que el buzón lea automáticamente correos bancarios y los convierta en notificaciones a procesar.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {connections.map(conn => (
                                        <div key={conn.id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-3 group/conn">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg text-white flex items-center gap-2">📧 {conn.provider}</h4>
                                                    <p className="text-sm text-indigo-300 mt-1">{conn.emailAddress}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${conn.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
                                                            {conn.isActive ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">Última sincronización: {conn.lastSyncAt ? format(new Date(conn.lastSyncAt), 'dd/MM/yyyy HH:mm') : 'Nunca'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover/conn:opacity-100 transition-opacity">
                                                    <button onClick={() => handleDeleteConnection(conn.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-md text-gray-400 hover:text-red-400 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 mt-6 border-t border-white/10 bg-indigo-900/10 p-4 rounded-xl">
                                    <h4 className="text-md font-medium mb-4 text-indigo-300">Añadir Integración Gmail (IMAP)</h4>
                                    <form onSubmit={handleCreateConnection} className="flex flex-col gap-4">
                                        <div className="bg-black/50 p-4 rounded-lg border border-indigo-500/20 text-sm text-gray-300 space-y-2">
                                            <p><strong>Paso 1:</strong> Entra a los ajustes de seguridad de tu cuenta de Google.</p>
                                            <p><strong>Paso 2:</strong> Activa "Verificación en 2 pasos".</p>
                                            <p><strong>Paso 3:</strong> Busca "Contraseñas de aplicaciones" y crea una nueva con el nombre "App Finanzas".</p>
                                            <p className="text-amber-400">Pega esa contraseña de 16 letras (sin espacios) a continuación. Tu contraseña se guardará sólo en esta base de datos local conectada a tu app.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <input type="hidden" name="provider" value="GMAIL" />
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Correo Electrónico a Enlazar</label>
                                                <input type="email" name="emailAddress" required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="ejemplo@gmail.com" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">App Password (Contraseña generada)</label>
                                                <input type="password" name="appPassword" required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••••••••••" />
                                            </div>
                                            <div className="flex flex-col justify-end">
                                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 h-[38px] shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                                    <Plus size={16} /> Conectar
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* Gemini API Key Editor */}
                                <div className="pt-6 mt-6 border-t border-white/10 bg-indigo-900/10 p-4 rounded-xl">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-md font-medium text-indigo-300">Inteligencia Artificial (Google Gemini)</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${hasGeminiKey ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
                                            {hasGeminiKey ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <form onSubmit={handleSaveGeminiKey} className="flex flex-col gap-4">
                                        <div className="bg-black/50 p-4 rounded-lg border border-indigo-500/20 text-sm text-gray-300 space-y-2">
                                            <p>Configura tu propia clave del API de Google Gemini para habilitar el Asesor Financiero con Inteligencia Artificial.</p>
                                            <p>Consigue tu clave gratuita en <a href="https://aistudio.google.com" target="_blank" className="text-indigo-400 underline">Google AI Studio</a>.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-3">
                                                <label className="block text-xs text-gray-400 mb-1">GEMINI_API_KEY</label>
                                                <input type="password" value={geminiApiKey} onChange={e => setGeminiApiKey(e.target.value)} required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="AIzaSy..." />
                                            </div>
                                            <div className="flex flex-col justify-end">
                                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 h-[38px] shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                                    <Check size={16} /> Guardar Clave
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Backup Tab */}
                        {activeTab === "backup" && (
                            <div className="space-y-6">
                                <div className="border-b border-white/10 pb-4">
                                    <h3 className="text-lg font-medium">Respaldo y Restauración</h3>
                                    <p className="text-sm text-gray-400 mt-1">Exporta todos tus datos a un archivo JSON o restaura desde un respaldo previo.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Export Card */}
                                    <div className="p-6 bg-black/40 border border-white/5 rounded-xl flex flex-col items-center text-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <DownloadCloud size={28} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg mb-1">Respaldar Datos</h4>
                                            <p className="text-xs text-gray-400">Descarga un archivo JSON con todas tus cuentas, categorías, transacciones, metas y configuración.</p>
                                        </div>
                                        <button
                                            onClick={handleExport}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                        >
                                            <DownloadCloud size={16} /> Descargar Respaldo
                                        </button>
                                    </div>

                                    {/* Import Card */}
                                    <div className="p-6 bg-black/40 border border-white/5 rounded-xl flex flex-col items-center text-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                            <UploadCloud size={28} className="text-amber-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg mb-1">Restaurar Datos</h4>
                                            <p className="text-xs text-gray-400">Sube un archivo JSON de respaldo previo. <span className="text-red-400 font-medium">¡Esto reemplazará todos tus datos actuales!</span></p>
                                        </div>
                                        <label className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                            <UploadCloud size={16} /> Seleccionar Archivo
                                            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                                        </label>
                                    </div>
                                </div>

                                <div className="bg-indigo-900/10 border border-indigo-500/10 rounded-xl p-4">
                                    <p className="text-xs text-gray-400">💡 <strong className="text-gray-300">Consejo:</strong> Realiza respaldos periódicos para proteger tu información financiera. El archivo incluye todos los datos de tu hogar compartido.</p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
