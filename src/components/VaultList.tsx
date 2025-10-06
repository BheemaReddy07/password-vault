import React from "react";
import { VaultItem } from "@/app/dashboard/page";

function highlightMatch(text: string, query: string) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
        regex.test(part) ? (
            <span key={i} className="bg-yellow-200">{part}</span>
        ) : (
            part
        )
    );
}

interface VaultListProps {
    vault: VaultItem[];
    visiblePasswords: { [key: string]: boolean };
    setVisiblePasswords: (visible: { [key: string]: boolean }) => void;
    handleCopyVaultPassword: (pass: string) => void;
    handleEdit: (item: VaultItem) => void;
    handleDelete: (id: string) => void;
    loading: boolean;
    searchQuery: string;
}

const VaultList: React.FC<VaultListProps> = ({
    vault,
    visiblePasswords,
    setVisiblePasswords,
    handleCopyVaultPassword,
    handleEdit,
    handleDelete,
    loading,
    searchQuery,
}) => {
    return (
        <div className="mt-10">
            
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
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">{highlightMatch(item.title,searchQuery)}</h3>
                                <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Username:</span> {highlightMatch(item.username, searchQuery)}
                                </p>
                                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                                    <span className="font-medium">Password:</span>
                                    <span className="font-mono tracking-wider">
                                        {visiblePasswords[item.id] ? item.password : "••••••••"}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setVisiblePasswords({ ...visiblePasswords, [item.id]: !visiblePasswords[item.id] })
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
                                    <p className="text-sm text-gray-500 italic">💡 {highlightMatch(item.notes, searchQuery)}</p>
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
                                    onClick={() => handleDelete(item.id)}
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
    );
};

export default VaultList;