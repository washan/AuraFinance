"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Plus, Trash2, Edit2, Box } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Toast, ToastType } from "@/components/ui/toast";
import { assetService } from "@/services/assetService";
import { Asset, CreateAssetDto, UpdateAssetDto } from "@/types/asset";
import { AssetModal } from "./components/AssetModal";

export default function AssetsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.push("/auth");
        } else {
            setUser(JSON.parse(storedUser));
            fetchAssets();
        }
    }, [router]);

    const fetchAssets = async () => {
        setIsLoading(true);
        try {
            const data = await assetService.getAll();
            setAssets(data);
        } catch (error) {
            console.error(error);
            setToast({ message: "Error al cargar los bienes", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAsset = async (assetData: CreateAssetDto | UpdateAssetDto) => {
        try {
            if (assetToEdit) {
                await assetService.update(assetToEdit.id, assetData as UpdateAssetDto);
                setToast({ message: "Activo actualizado", type: "success" });
            } else {
                await assetService.create(assetData as CreateAssetDto);
                setToast({ message: "Activo registrado", type: "success" });
            }
            setIsModalOpen(false);
            fetchAssets();
        } catch (error) {
            console.error(error);
            setToast({ message: "Error al guardar el activo", type: "error" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Seguro que deseas eliminar este bien?")) return;
        try {
            await assetService.remove(id);
            setToast({ message: "Activo eliminado", type: "success" });
            fetchAssets();
        } catch (error) {
            console.error(error);
            setToast({ message: "Error al eliminar el activo", type: "error" });
        }
    };

    const openEditModal = (asset: Asset) => {
        setAssetToEdit(asset);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setAssetToEdit(null);
        setIsModalOpen(true);
    };

    const totalValueCRC = assets
        .filter(a => a.currency === 'CRC')
        .reduce((sum, a) => sum + (Number(a.quantity) * Number(a.unitPrice)), 0);

    const totalValueUSD = assets
        .filter(a => a.currency === 'USD')
        .reduce((sum, a) => sum + (Number(a.quantity) * Number(a.unitPrice)), 0);

    if (isLoading && assets.length === 0) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black overflow-hidden relative">
                {/* Header Navbar */}
                <header className="h-20 border-b border-white/10 flex items-center justify-between px-4 pl-16 md:px-8 shrink-0 bg-black/20 backdrop-blur-md relative z-10 w-full">
                    <h1 className="text-2xl font-light tracking-tight flex items-center gap-3">
                        <Box className="w-6 h-6 text-indigo-400" /> Patrimonio y Bienes
                    </h1>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors hidden sm:block">
                            <Search className="w-5 h-5 text-gray-300" />
                        </button>
                        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                            <Bell className="w-5 h-5 text-gray-300" />
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-sm border-l border-white/20 pl-6 text-gray-400 hidden sm:block">{user?.name}</span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative z-0">
                    <div className="max-w-6xl mx-auto space-y-8 pb-24">
                        
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-3xl -z-10 rounded-full"></div>
                            
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                                <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Total Patrimonio (CRC)</h3>
                                <p className="text-4xl font-light tracking-tight text-white mb-2">
                                    ₡ {totalValueCRC.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/20">
                                    Colones
                                </span>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                                <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Total Patrimonio (USD)</h3>
                                <p className="text-4xl font-light tracking-tight text-white mb-2">
                                    $ {totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/20">
                                    Dólares
                                </span>
                            </div>
                        </div>

                        {/* Actions and Assets List */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Inventario de Bienes</h2>
                                    <p className="text-sm text-gray-400">Registra aves, vehículos, propiedades y otros activos de valor.</p>
                                </div>
                                <button 
                                    onClick={openCreateModal}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] shrink-0"
                                >
                                    <Plus size={18} /> Registrar Bien
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-black/40 text-xs uppercase tracking-wider text-gray-500">
                                            <th className="p-4 font-medium">Descripción</th>
                                            <th className="p-4 font-medium">Categoría</th>
                                            <th className="p-4 font-medium text-right">Cantidad</th>
                                            <th className="p-4 font-medium text-right">Precio Unitario</th>
                                            <th className="p-4 font-medium text-right">Valor Total</th>
                                            <th className="p-4 font-medium text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {assets.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">
                                                    <Box size={40} className="mx-auto text-gray-700 mb-3" />
                                                    No tienes ningún bien registrado aún.
                                                </td>
                                            </tr>
                                        ) : (
                                            assets.map((asset) => (
                                                <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="p-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-200">{asset.name}</span>
                                                            {asset.notes && <span className="text-xs text-gray-500 truncate max-w-[200px]" title={asset.notes}>{asset.notes}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="px-2.5 py-1 bg-white/10 text-gray-300 rounded-lg text-xs font-medium">
                                                            {asset.category || 'General'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right whitespace-nowrap">
                                                        {Number(asset.quantity).toLocaleString('en-US')}
                                                    </td>
                                                    <td className="p-4 text-right whitespace-nowrap text-gray-400">
                                                        {asset.currency === 'USD' ? '$' : '₡'} {Number(asset.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-4 text-right whitespace-nowrap font-bold text-indigo-300">
                                                        {asset.currency === 'USD' ? '$' : '₡'} {(Number(asset.quantity) * Number(asset.unitPrice)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openEditModal(asset)} className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors">
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button onClick={() => handleDelete(asset.id)} className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {isModalOpen && (
                <AssetModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveAsset}
                    assetToEdit={assetToEdit}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
