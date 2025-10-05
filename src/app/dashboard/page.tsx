"use client";

import { useState, useEffect } from "react";
import { generatePassword } from "@/lib/generator";
import { encryptData, decryptData, importKey } from "@/lib/crypto";
import { set } from "mongoose";

export default function Dashboard() {
    const [password, setPassword] = useState("");
    const [vault, setVault] = useState<any[]>([]);
    const [key, setKey] = useState<CryptoKey | null>(null);
    const [length, setLength] = useState(12);
    const [options, setOptions] = useState({
        lower: true,
        upper: true,
        numbers: true,
        symbols: false,
    });
    const [savebtn, setSavebtn] = useState(false);
    const [saveformshow, setSaveformshow] = useState(false);
    const [showvault, setShowvault] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});

    // form fields
    const [title, setTitle] = useState("");
    const [username, setUsername] = useState("");
    const [url, setUrl] = useState("");
    const [notes, setNotes] = useState("");
    const userId = "68e21d7adcfc6c77781049e2"; // later replace with actual logged-in user id

    // On first load, create/import key
    useEffect(() => {
        async function setupKey() {
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
        }
        setupKey();
    }, []);

    // Password generator
    function handleGenerate() {
        const pass = generatePassword(length, options);
        setSavebtn(true);
        setPassword(pass);
    }

    function handlesaveformshown() {
        setSaveformshow(!saveformshow);
    }

    function handleshowvault() {
        setShowvault(!showvault);
    }

    // handle copy
    async function handleCopy() {
        if (!password) return;
        await navigator.clipboard.writeText(password);
        alert("Copied to clipboard! Will clear in 15s...");
        setTimeout(() => navigator.clipboard.writeText(""), 15000);
    }
    // Save to vault (encrypted)
    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!key) return;
        const data = { title, username, password, url, notes };

        const encrypted = await encryptData(key, data);

        await fetch("/api/vault/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, data: encrypted.data, iv: encrypted.iv })
        });
        setTitle("");
        setUsername("");
        setUrl("");
        setNotes("");
        setPassword("");
        loadVault();
    }

    // Load vault
    async function loadVault() {
        if (!key) return;
        try {
            const res = await fetch("/api/vault/list", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });
            const { items } = await res.json();
            console.log("Vault API Response:", items);

            const decrypted: any[] = [];
            for (const item of items) {
                try {
                    const plain = await decryptData(key, item.data, item.iv);
                    decrypted.push({ id: item._id, ...plain });
                } catch (err) {
                    console.error(`Failed to decrypt vault item ${item._id}:`, err);
                    // Optionally, push a placeholder so user knows this item exists
                    decrypted.push({ id: item._id, title: "[Could not decrypt]", username: "", password: "" });
                }
            }

            console.log("Decrypted vault items:", decrypted);
            setVault(decrypted);

        } catch (err) {
            console.error("Failed to load vault:", err);
        }
    }


    useEffect(() => {
        if (key) loadVault();
    }, [key]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Password Generator
                </h1>

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
                        />
                        <span className="text-sm text-gray-600">Lowercase</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={options.upper}
                            onChange={() => setOptions({ ...options, upper: !options.upper })}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-600">Uppercase</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={options.numbers}
                            onChange={() => setOptions({ ...options, numbers: !options.numbers })}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-600">Numbers</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={options.symbols}
                            onChange={() => setOptions({ ...options, symbols: !options.symbols })}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-600">Symbols</span>
                    </label>
                </div>

                {/* Generate Button */}
                <div className="mb-6">
                    <button
                        onClick={handleGenerate}
                        className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
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
                            className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
                        >
                            Copy
                        </button>
                    </div>
                )}
                {
                    savebtn && <div className="mb-6">
                        <button
                            onClick={handlesaveformshown}
                            className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                        >
                            save to vault
                        </button>
                    </div>
                }
                {/* Save to Vault Form */}
                {saveformshow && (
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
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg mt-1 text-black"
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
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg mt-1 text-black"
                                placeholder="Any extra notes..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200"
                        >
                            Save Entry
                        </button>
                    </form>
                )}

                {
                    <div className="mb-6">
                        <button
                            onClick={handleshowvault}
                            className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                        >
                            show vault
                        </button>
                    </div>
                }

                {
                    showvault && <div>

                        {/* Vault Section */}
                        {vault.length >= 0 && (
                            <div className="mt-10">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                    🔐 My Vault
                                </h2>

                                <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
                                    {vault.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-white border border-gray-200 rounded-xl shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition"
                                        >
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                                                    {item.title}
                                                </h3>

                                                <p className="text-sm text-gray-600 mb-1">
                                                    <span className="font-medium">Username:</span> {item.username}
                                                </p>

                                                {/* Password */}
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
                                                    >
                                                        {visiblePasswords[item.id] ? "Hide" : "Show"}
                                                    </button>
                                                </p>

                                                {item.url && (
                                                    <p className="text-sm mb-1">
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            {item.url}
                                                        </a>
                                                    </p>
                                                )}

                                                {item.notes && (
                                                    <p className="text-sm text-gray-500 italic">💡 {item.notes}</p>
                                                )}
                                            </div>

                                            {/* Buttons */}
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(item.password)}
                                                    className="flex-1 bg-gray-200 text-gray-800 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-300 transition"
                                                >
                                                    Copy
                                                </button>
                                                <button className="flex-1 bg-yellow-400 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-yellow-500 transition">
                                                    Edit
                                                </button>
                                                <button className="flex-1 bg-red-500 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-red-600 transition">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        )}
                        {/* {vault.length === 0 && <p className="text-center text-gray-500">Vault is empty.</p>} */}



                    </div>
                }
            </div>
        </div>
    );
}
