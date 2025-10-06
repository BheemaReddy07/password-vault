"use client";

import { useState, useEffect } from "react";
import { generatePassword } from "@/lib/generator";
import { encryptData, decryptData, importKey } from "@/lib/crypto";
import toast from "react-hot-toast";

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
    const [editing, setEditing] = useState<any | null>(null);

    const [options, setOptions] = useState({
        lower: true,
        upper: true,
        numbers: true,
        symbols: false,
    });
    const [saveBtn, setSaveBtn] = useState(false);
    const [saveFormShow, setSaveFormShow] = useState(false);
    const [showVault, setShowVault] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    // Form fields
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
    const handleSaveFormShown = () => setSaveFormShow((prev) => !prev);
    const handleShowVault = () => setShowVault((prev) => !prev);

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
            fetch(endpoint, {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            setEditing(null);
            setTitle("");
            setUsername("");
            setUrl("");
            setNotes("");
            setPassword("");
           // setSaveBtn(false);
            setSaveFormShow(false);
            await loadVault();
            toast.success("Saved to vault successfully!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save to vault");
            console.error("Save error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to save to vault");
        } finally {
            setLoading(false);
        }
    };

    async function handledelete(id: string) {
        if (!confirm) { return; }
        const res = await fetch("/api/vault/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
        if (!res.ok) {
            const errorData = await res.json();
            toast.error(errorData.error || "Failed to delete vault item");
        } else {
            loadVault();
        }
    }

    function handleEdit(item: any) {
        setEditing(item);
        setTitle(item.title);
        setUsername(item.username);
        setPassword(item.password);
        setUrl(item.url);
        setNotes(item.notes);
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

                {/* Length Slider */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Length: {length}
                    </label>
                    <input
                        type="range"
                        min="6"
                        max="32"
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        disabled={loading}
                    />
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={options.lower}
                            onChange={() => setOptions({ ...options, lower: !options.lower })}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                            disabled={loading}
                        />
                        <span className="text-sm text-gray-600">Lowercase</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={options.upper}
                            onChange={() => setOptions({ ...options, upper: !options.upper })}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                            disabled={loading}
                        />
                        <span className="text-sm text-gray-600">Uppercase</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={options.numbers}
                            onChange={() => setOptions({ ...options, numbers: !options.numbers })}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                            disabled={loading}
                        />
                        <span className="text-sm text-gray-600">Numbers</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={options.symbols}
                            onChange={() => setOptions({ ...options, symbols: !options.symbols })}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                            disabled={loading}
                        />
                        <span className="text-sm text-gray-600">Symbols</span>
                    </label>
                </div>

                {/* Generate Button */}
                <div className="mb-6">
                    <button
                        onClick={handleGenerate}
                        className="w-full bg-blue-500 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
                        disabled={loading}
                    >
                        Generate
                    </button>
                </div>

                {/* Password Output */}
                {password && (
                    <div className="flex items-center space-x-2 mb-5">
                        <input
                            type="text"
                            value={password}
                            readOnly
                            className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                        />
                        <button
                            onClick={handleCopy}
                            className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200 disabled:bg-gray-100"
                            disabled={loading}
                        >
                            Copy
                        </button>
                    </div>
                )}

                {/* Save to Vault Button */}
                {saveBtn && (
                    <div className="mb-6">
                        <button
                            onClick={handleSaveFormShown}
                            className="w-full bg-blue-500 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
                            disabled={loading}
                        >
                            Save to Vault
                        </button>
                    </div>
                )}

                {/* Save to Vault Form */}
                {saveFormShow && (
                    <form
                        onSubmit={handleSave}
                        className="mt-8 bg-white rounded-lg shadow-md p-6 space-y-4"
                    >
                        <h2 className="text-xl font-bold text-gray-800">Save to Vault</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg mt-1 text-black"
                                placeholder="e.g. Gmail"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg mt-1 text-black"
                                placeholder="e.g. myemail@gmail.com"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg mt-1 text-black"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">URL (optional)</label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg mt-1 text-black"
                                placeholder="e.g. https://gmail.com"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg mt-1 text-black"
                                placeholder="Any extra notes..."
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200 disabled:bg-green-300"
                            disabled={loading}
                        >
                            Save Entry
                        </button>
                    </form>
                )}

                {/* Show Vault Button */}
                <div className="mb-6">
                    <button
                        onClick={handleShowVault}
                        className="w-full bg-blue-500 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
                        disabled={loading}
                    >
                        {showVault ? "Hide Vault" : "Show Vault"}
                    </button>
                </div>

                {/* Vault Section */}
                {showVault && (
                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔐 My Vault</h2>
                        {vault.length === 0 ? (
                            <p className="text-gray-500 text-center">No entries in vault</p>
                        ) : (
                            <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
                                {vault.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white border border-gray-200 rounded-xl shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-800 mb-2">{item.title}</h3>
                                            <p className="text-sm text-gray-600 mb-1">
                                                <span className="font-medium">Username:</span> {item.username}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                                                <span className="font-medium">Password:</span>
                                                <span className="font-mono tracking-wider">
                                                    {visiblePasswords[item.id] ? item.password : "••••••••"}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setVisiblePasswords((prev) => ({
                                                            ...prev,
                                                            [item.id]: !prev[item.id],
                                                        }))
                                                    }
                                                    className="text-blue-500 text-xs hover:underline"
                                                    disabled={loading || !item.password}
                                                >
                                                    {visiblePasswords[item.id] ? "Hide" : "Show"}
                                                </button>
                                            </p>
                                            {item.url && (
                                                <p className="text-sm mb-1">
                                                    <a href={item.url} target="_blank" className="text-blue-500 hover:underline">
                                                        {item.url}
                                                    </a>
                                                </p>
                                            )}
                                            {item.notes && (
                                                <p className="text-sm text-gray-500 italic">💡 {item.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            <button
                                                onClick={() => handleCopyVaultPassword(item.password)}
                                                className="flex-1 cursor-pointer bg-gray-200 text-gray-800 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100"
                                                disabled={loading || !item.password}
                                            >
                                                Copy
                                            </button>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="flex-1 cursor-pointer bg-yellow-400 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-yellow-500 transition disabled:bg-yellow-200"
                                                disabled={loading}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handledelete(item.id)}
                                                className="flex-1 cursor-pointer bg-red-500 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-red-600 transition disabled:bg-red-300"
                                                disabled={loading}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}