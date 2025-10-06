import React from "react";

interface PasswordDisplayProps {
    password: string;
    handleCopy: () => void;
    loading: boolean;
}

const PasswordDisplay: React.FC<PasswordDisplayProps> = ({ password, handleCopy, loading }) => {
    if (!password) return null;
    return (
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
    );
};

export default PasswordDisplay;