"use client";

import { useState, useEffect } from "react";
import { generatePassword } from "@/lib/generator";
import { encryptData, decryptData, importKey } from "@/lib/crypto";
import toast from "react-hot-toast";
import PasswordGenerator from "@/components/PasswordGenerator";
import SaveVaultForm from "@/components/SaveVaultForm";
import VaultList from "@/components/VaultList";
import PasswordDisplay from "@/components/PasswordDisplay";

interface VaultItem {
    id: string;
    title: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
}

export default function Dashboard() {
    const [password, setPassword] = useState("");
    const [vault, setVault] = useState<VaultItem[]>([]);
    const [key, setKey] = useState<CryptoKey | null>(null);
    const [length, setLength] = useState(12);
    const [searchQuery, setSearchQuery] = useState("");

    const [options, setOptions] = useState({
        lower: true,
        upper: true,
        numbers: true,
        symbols: false,
        excludeLookAlikes: false,
    });
    const [saveBtn, setSaveBtn] = useState(false);
    const [saveFormShow, setSaveFormShow] = useState(false);
    const [showVault, setShowVault] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState<any | null>(null);


    const [title, setTitle] = useState("");
    const [username, setUsername] = useState("");
    const [url, setUrl] = useState("");
    const [notes, setNotes] = useState("");
    const userId = "68e21d7adcfc6c77781049e2"; // Replace with auth-based user ID

    // On first load, create/import key
    useEffect(() => {
        async function setupKey() {
            try {
                let rawkeyStr = localStorage.getItem("vault_key");
                let keyArray: Uint8Array;
                if (!rawkeyStr) {
                    const raw = crypto.getRandomValues(new Uint8Array(32));
                    keyArray = raw;
                    localStorage.setItem("vault_key", Array.from(raw).join(","));
                } else {
                    keyArray = new Uint8Array(rawkeyStr.split(",").map(Number));
                }
                const cryptoKey = await importKey(keyArray);
                setKey(cryptoKey);
                console.log("Encryption key loaded");
            } catch (err) {
                setError("Failed to initialize encryption key");
                console.error("Key setup error:", err);
                toast.error("Failed to initialize encryption key");
            }
        }
        setupKey();
    }, []);

    // Load vault when key is ready
    useEffect(() => {
        if (key) loadVault();
    }, [key]);

    // Password generator
    const handleGenerate = () => {
        if (!options.lower && !options.upper && !options.numbers && !options.symbols) {
            setError("Select at least one character type");
            toast.error("Select at least one character type");
            setPassword("");
            return;
        }
        setError("");
        const pass = generatePassword(length, options);
        setSaveBtn(true);
        setPassword(pass);
    };

    // Toggle save form and vault visibility

    // const handleSaveFormShown = () => setSaveFormShow((prev) => !prev);
    // const handleShowVault = () => setShowVault((prev) => !prev);

    // Handle copy for generated password
    const handleCopy = async () => {
        if (!password) {
            setError("No password to copy");
            toast.error("No password to copy");
            return;
        }
        setLoading(true);
        try {
            await navigator.clipboard.writeText(password);
            toast.success("Password copied! Will clear in 15s...");
            setTimeout(async () => {
                try {
                    await navigator.clipboard.writeText("");
                    console.log("Clipboard cleared for generated password");
                } catch (err) {
                    console.warn("Failed to clear clipboard for generated password:", err);
                    toast.error("Failed to clear clipboard. Please clear it manually.");
                }
            }, 15000);
        } catch (err) {
            setError("Failed to copy password");
            console.error("Copy error:", err);
            toast.error("Failed to copy password");
        } finally {
            setLoading(false);
        }
    };

    // Handle copy for vault password
    const handleCopyVaultPassword = async (pass: string) => {
        if (!pass) {
            setError("No password to copy");
            toast.error("No password to copy");
            return;
        }
        setLoading(true);
        try {
            await navigator.clipboard.writeText(pass);
            // toast.success("Vault password copied! Will clear in 15s...");
            setTimeout(async () => {
                try {
                    await navigator.clipboard.writeText("");
                    console.log("Clipboard cleared for vault password");
                } catch (err) {
                    console.warn("Failed to clear clipboard for vault password:", err);
                    toast.error("Failed to clear clipboard. Please clear it manually.");
                }
            }, 15000);
        } catch (err) {
            setError("Failed to copy vault password");
            console.error("Copy vault password error:", err);
            toast.error("Failed to copy vault password");
        } finally {
            setLoading(false);
        }
    };

    // Save to vault (encrypted)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!key) {
            setError("Encryption key not ready");
            toast.error("Encryption key not ready");
            return;
        }
        if (!title || !username || !password) {
            setError("Title, username, and password are required");
            toast.error("Title, username, and password are required");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const data = { title, username, password, url, notes };
            const encrypted = await encryptData(key, data);
            const endpoint = editing ? "/api/vault/update" : "/api/vault/add";
            const payload = editing ? { id: editing.id, userId, data: encrypted.data, iv: encrypted.iv } : { userId, data: encrypted.data, iv: encrypted.iv };
            const res = await fetch(endpoint, {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Failed to save to vault: ${res.statusText}`);
            }
            setEditing(null);
            setTitle("");
            setUsername("");
            setUrl("");
            setNotes("");
            setPassword("");
            setSaveBtn(false);
            setSaveFormShow(false);
            await loadVault();
            toast.success(editing ? "Vault entry updated successfully!" : "Saved to vault successfully!");

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save to vault");
            console.error("Save error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to save to vault");
        } finally {
            setLoading(false);
        }
    };

    const handledelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this vault item?")) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/vault/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete vault item");
            }
            await loadVault();
            toast.success("Vault item deleted successfully!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete vault item");
            console.error("Delete error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to delete vault item");
        } finally {
            setLoading(false);
        }
    };

    function handleEdit(item: VaultItem) {
        setEditing(item);
        setTitle(item.title);
        setUsername(item.username);
        setPassword(item.password);
        setUrl(item.url || "");
        setNotes(item.notes || "");
        setSaveBtn(true);
        setSaveFormShow(true);
    }

    // Load vault
    const loadVault = async () => {
        if (!key) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/vault/list", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Failed to fetch vault: ${res.statusText}`);
            }
            const { items } = await res.json();
            console.log("Vault API Response:", items);
            const decrypted: VaultItem[] = [];
            for (const item of items) {
                try {
                    const plain = await decryptData(key, item.data, item.iv);
                    decrypted.push({ id: item._id, ...plain });
                } catch (err) {
                    console.error(`Failed to decrypt vault item ${item._id}:`, err);
                    decrypted.push({ id: item._id, title: "[Could not decrypt]", username: "", password: "" });
                }
            }
            console.log("Decrypted vault items:", decrypted);
            setVault(decrypted);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load vault");
            console.error("Load vault error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to load vault");
        } finally {
            setLoading(false);
        }
    };

    const filteredVault = vault.filter(item =>
        (item.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (item.username?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (item.url?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

 
    




    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Password Generator
                </h1>

                {/* Error Message */}
                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <p className="text-blue-500 text-sm mb-4 text-center">Loading...</p>
                )}
                <PasswordGenerator
                    length={length}
                    options={options}
                    setLength={setLength}
                    setOptions={setOptions}
                    handleGenerate={handleGenerate}
                    loading={loading}
                    error={error}

                />
                <PasswordDisplay
                    password={password}
                    handleCopy={handleCopy}
                    loading={loading}
                />



                {/* Save to Vault Button */}
                {saveBtn && (
                    <div className="mb-6">
                        <button
                            onClick={() => setSaveFormShow((prev) => !prev)}
                            className="w-full bg-blue-500 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
                            disabled={loading}
                        >
                            Save to Vault
                        </button>
                    </div>
                )}

                {/* Save to Vault Form */}
                {saveFormShow && (
                    <SaveVaultForm
                        title={title}
                        username={username}
                        password={password}
                        url={url}
                        notes={notes}
                        setTitle={setTitle}
                        setUsername={setUsername}
                        setPassword={setPassword}
                        setUrl={setUrl}
                        setNotes={setNotes}
                        handleSave={handleSave}
                        editing={editing}
                        loading={loading}
                    />
                )}

                {/* Show Vault Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowVault((prev) => !prev)}
                        className="w-full bg-blue-500 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
                        disabled={loading}
                    >
                        {showVault ? "Hide Vault" : "Show Vault"}
                    </button>
                </div>

                {/* Vault Section */}

                {showVault && (
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">🔐 My Vault</h2>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search vault..."
                            className="w-full p-2 border border-gray-300 rounded-lg text-black"
                            disabled={loading}
                        />
                    </div>
                )}

                {showVault && (

                    <VaultList
                        vault={filteredVault}
                        visiblePasswords={visiblePasswords}
                        setVisiblePasswords={setVisiblePasswords}
                        handleCopyVaultPassword={handleCopyVaultPassword}
                        handleEdit={handleEdit}
                        handleDelete={handledelete}
                        loading={loading}
                        searchQuery={searchQuery}
                    />
                )}

               
                 
            </div>
        </div>
    );
}