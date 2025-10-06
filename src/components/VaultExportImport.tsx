"use client";

import React from "react";
import toast from "react-hot-toast";
import { VaultItem } from "@/app/dashboard/page";
import { encryptData, decryptData, importKey } from "@/lib/crypto";

interface VaultExportImportProps {
    vault: VaultItem[];
    cryptoKey: CryptoKey | null;
    userId: string;
    setVault: React.Dispatch<React.SetStateAction<VaultItem[]>>;
    loadVault: () => Promise<void>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const VaultExportImport: React.FC<VaultExportImportProps> = ({
    vault,
     cryptoKey,
    userId,
    setVault,
    loadVault,
    loading,
    setLoading,
}) => {

    const handleExportVault = async () => {
        if (!vault.length || ! cryptoKey) return;
        setLoading(true);
        try {
            const encryptedItems = await Promise.all(
                vault.map(async (item) => {
                    const encrypted = await encryptData( cryptoKey, {
                        title: item.title,
                        username: item.username,
                        password: item.password,
                        url: item.url || "",
                        notes: item.notes || "",
                    });
                    return { data: encrypted.data, iv: encrypted.iv };
                })
            );
            const blob = new Blob([JSON.stringify(encryptedItems, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "vault_backup.json";
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Vault exported successfully!");
        } catch (err) {
            console.error("Export error:", err);
            toast.error("Failed to export vault");
        } finally {
            setLoading(false);
        }
    };

    const handleImportVault = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (! cryptoKey) return;
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const text = await file.text();
            const importedItems: { data: string; iv: string }[] = JSON.parse(text);

            const decryptedItems: VaultItem[] = [];
            for (const item of importedItems) {
                try {
                    const plain = await decryptData( cryptoKey, item.data, item.iv);
                    decryptedItems.push({ id: crypto.randomUUID(), ...plain });
                } catch (err) {
                    console.warn("Failed to decrypt imported item:", err);
                }
            }

            // Merge with existing vault and remove duplicates
            const mergedVault = [...vault];
            for (const imp of decryptedItems) {
                const duplicate = mergedVault.find(
                    (v) =>
                        v.title === imp.title &&
                        v.username === imp.username &&
                        v.password === imp.password
                );
                if (!duplicate) mergedVault.push(imp);
            }

            setVault(mergedVault);

            // Save imported items to DB
            for (const item of decryptedItems) {
                const duplicate = vault.find(
                    (v) =>
                        v.title === item.title &&
                        v.username === item.username &&
                        v.password === item.password
                );
                if (duplicate) continue;

                const encrypted = await encryptData( cryptoKey, {
                    title: item.title,
                    username: item.username,
                    password: item.password,
                    url: item.url || "",
                    notes: item.notes || "",
                });

                await fetch("/api/vault/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        data: encrypted.data,
                        iv: encrypted.iv,
                    }),
                });
            }

            toast.success("Vault imported successfully!");
        } catch (err) {
            console.error("Import error:", err);
            toast.error("Failed to import vault");
        } finally {
            e.target.value = ""; // reset file input
            setLoading(false);
            await loadVault(); // refresh vault list
        }
    };

    return (
        <div className="flex gap-2 m-6">
            <button
                onClick={handleExportVault}
                className="flex-1 bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600 transition disabled:bg-purple-300"
                disabled={loading || !vault.length}
            >
                Export Vault
            </button>

            <label className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer text-center hover:bg-green-600 transition disabled:bg-green-300">
                Import Vault
                <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportVault}
                    disabled={loading}
                />
            </label>
        </div>
    );
};

export default VaultExportImport;
