import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { CreateAssetDto, UpdateAssetDto, Asset } from "../../../types/asset";

interface AssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (assetData: CreateAssetDto | UpdateAssetDto) => void;
    assetToEdit?: Asset | null;
}

export function AssetModal({ isOpen, onClose, onSave, assetToEdit }: AssetModalProps) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("Aves");
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0);
    const [currency, setCurrency] = useState("CRC");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (assetToEdit) {
            setName(assetToEdit.name);
            setCategory(assetToEdit.category || "");
            setQuantity(assetToEdit.quantity);
            setUnitPrice(assetToEdit.unitPrice);
            setCurrency(assetToEdit.currency);
            setNotes(assetToEdit.notes || "");
        } else {
            // Reset fields
            setName("");
            setCategory("Aves");
            setQuantity(1);
            setUnitPrice(0);
            setCurrency("CRC");
            setNotes("");
        }
    }, [assetToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            category,
            quantity,
            unitPrice,
            currency,
            notes,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">
                        {assetToEdit ? "Editar Bien / Patrimonio" : "Añadir Bien / Patrimonio"}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Descripción / Nombre</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Ej. Gallinas Ponedoras, Vehículo..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Ej. Aves, Vehículos..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Moneda</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="CRC">CRC (Colones)</option>
                                <option value="USD">USD (Dólares)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Cantidad</label>
                            <input
                                type="number"
                                step="any"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Precio Unitario</label>
                            <input
                                type="number"
                                step="any"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(Number(e.target.value))}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Valor Total</label>
                        <div className="w-full bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-4 py-3 text-indigo-300 font-bold text-lg text-right">
                            {currency} {Number(quantity * unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Notas Adicionales</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                            placeholder="Ej. Raza Rhode Island Red, 3 meses de edad..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                            <Save size={18} />
                            Guardar Activo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
