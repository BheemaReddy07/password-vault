import React from "react";

interface PasswordGeneratorProps {
  length: number;
  options: { lower: boolean; upper: boolean; numbers: boolean; symbols: boolean };
  setLength: (length: number) => void;
  setOptions: (options: {
    lower: boolean;
    upper: boolean;
    numbers: boolean;
    symbols: boolean;
  }) => void;
  handleGenerate: () => void;
  loading: boolean;
  error: string;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({
  length,
  options,
  setLength,
  setOptions,
  handleGenerate,
  loading,
  error,
}) => {
  return (
    <>
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
      {loading && <p className="text-blue-500 text-sm mb-4 text-center">Loading...</p>}

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

      <div className="mb-6">
        <button
          onClick={handleGenerate}
          className="w-full bg-blue-500 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
          disabled={loading}
        >
          Generate
        </button>
      </div>
    </>
  );
};

export default PasswordGenerator;