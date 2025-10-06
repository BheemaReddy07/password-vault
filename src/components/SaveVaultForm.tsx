import React from "react";
import { VaultItem } from "@/app/dashboard/page";

interface SaveVaultFormProps {
    title: string;
    username: string;
    password: string;
    url: string;
    notes: string;
    setTitle: (title: string) => void;
    setUsername: (username: string) => void;
    setPassword: (password: string) => void;
    setUrl: (url: string) => void;
    setNotes: (notes: string) => void;
    handleSave: (e: React.FormEvent) => void;
    editing: VaultItem | null;
    loading: boolean;
}

const SaveVaultForm: React.FC<SaveVaultFormProps> = ({
    title,
    username,
    password,
    url,
    notes,
    setTitle,
    setUsername,
    setPassword,
    setUrl,
    setNotes,
    handleSave,
    editing,
    loading,
}) => {
    return (
        <form onSubmit={handleSave} className="mt-8 bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">{editing ? "Edit Vault Entry" : "Save to Vault"}</h2>
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
                {editing ? "Update Entry" : "Save Entry"}
            </button>
        </form>
    );
};

export default SaveVaultForm;