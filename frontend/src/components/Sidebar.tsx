"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Wallet,
    ArrowRightLeft,
    PieChart,
    Target,
    Settings,
    Bell,
    Menu,
    X,
    Box,
    TrendingUp
} from "lucide-react";
import { Toast, ToastType } from "./ui/toast";

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const NavItem = ({ icon, label, path, onClick }: { icon: React.ReactNode; label: string; path?: string; onClick?: () => void }) => {
        const active = path ? pathname === path : false;

        if (onClick) {
            return (
                <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 text-gray-400 hover:bg-white/5 hover:text-gray-200`}>
                    {icon}
                    <span className="font-medium text-sm">{label}</span>
                </button>
            )
        }

        return (
            <Link href={path || '#'} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${active ? 'bg-indigo-500/20 text-indigo-300 shadow-[inset_2px_0_0_rgba(99,102,241,1)]' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                {icon}
                <span className="font-medium text-sm">{label}</span>
            </Link>
        );
    };


    return (
        <>
            {/* Mobile Toggle Button */}
            <button 
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden fixed top-5 left-5 z-40 p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white shadow-lg"
            >
                <Menu size={20} />
            </button>

            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside className={`w-64 border-r border-white/10 bg-zinc-950/95 backdrop-blur-xl flex flex-col justify-between fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
                {/* Close Button Mobile */}
                <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden absolute top-6 right-4 p-2 text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <div>
                    <div className="h-20 flex items-center px-8 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                            <LayoutDashboard className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Aura</span>
                    </div>
                </div>

                <nav className="p-4 space-y-2 mt-4">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Panel" path="/" />
                    <NavItem icon={<ArrowRightLeft size={20} />} label="Transacciones" path="/transactions" />
                    <NavItem icon={<Box size={20} />} label="Patrimonio" path="/assets" />
                    <NavItem icon={<TrendingUp size={20} />} label="Inversiones" path="/investments" />
                    <NavItem icon={<Bell size={20} />} label="Buzón" path="/inbox" />
                </nav>
            </div>

            <div className="p-4">
                    <NavItem icon={<Settings size={20} />} label="Ajustes" path="/settings" />

                <Link href="/account" className="mt-6 flex items-center gap-3 px-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold border border-white/20">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{user?.name || "Usuario"}</p>
                        <p className="text-xs text-gray-400">Miembro Pro</p>
                    </div>
                </Link>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </aside>
        </>
    );
}
