"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [errorMSG, setErrorMSG] = useState<string | null>(null);

    useEffect(() => {
        // 1. Obtener parámetros de la URL
        const token = searchParams.get("token");
        const userParam = searchParams.get("user");
        const errorParam = searchParams.get("error");

        if (errorParam) {
            setErrorMSG("Error al autenticar con Google: " + errorParam);
            setTimeout(() => router.push("/auth"), 3000);
            return;
        }

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));

                // 2. Guardar sesión
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));

                // 3. Redirigir al inicio
                router.push("/");
            } catch (err) {
                setErrorMSG("Ocurrió un error procesando los datos de la sesión.");
                setTimeout(() => router.push("/auth"), 3000);
            }
        } else {
            setErrorMSG("Faltan parámetros de sesión");
            setTimeout(() => router.push("/auth"), 3000);
        }
    }, [router, searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            {errorMSG ? (
                <div className="text-red-400 p-4 border border-red-500/30 bg-red-500/20 rounded-xl">
                    {errorMSG}
                    <p className="text-sm mt-2">Redirigiendo de vuelta...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <h2 className="text-xl font-medium tracking-tight">Completando inicio de sesión...</h2>
                    <p className="text-gray-400 text-sm mt-2">Estamos asegurando tu cuenta de Aura.</p>
                </div>
            )}
        </div>
    );
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <CallbackHandler />
        </Suspense>
    );
}
