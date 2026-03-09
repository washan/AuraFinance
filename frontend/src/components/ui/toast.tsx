import { useEffect, useState } from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Small delay for entry animation
        requestAnimationFrame(() => setIsVisible(true));

        const exitTimer = setTimeout(() => setIsVisible(false), 2700);
        const removeTimer = setTimeout(onClose, 3000);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [onClose]);

    const bgStyles = {
        success: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
        error: "bg-red-500/20 border-red-500/30 text-red-500",
        info: "bg-blue-500/20 border-blue-500/30 text-blue-400",
    };

    const icons = {
        success: <CheckCircle2 size={18} className="text-emerald-500" />,
        error: <AlertCircle size={18} className="text-red-500" />,
        info: <AlertCircle size={18} className="text-blue-500" />,
    };

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 flexitems-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 ease-in-out font-sans ${bgStyles[type]} ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
        >
            <div className="flex items-center justify-center p-1 bg-black/40 rounded-full shadow-inner">
                {icons[type]}
            </div>
            <p className="font-medium text-sm">{message}</p>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="ml-2 hover:bg-white/10 p-1 rounded-md transition-colors text-white/50 hover:text-white"
            >
                <X size={14} />
            </button>
        </div>
    );
}
