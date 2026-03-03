import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

interface ColumnFilterProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onFilterChange: (values: string[]) => void;
}

const ColumnFilter = ({ label, options, selectedValues, onFilterChange }: ColumnFilterProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    const toggleOption = (value: string) => {
        if (selectedValues.includes(value)) {
            onFilterChange(selectedValues.filter(v => v !== value));
        } else {
            onFilterChange([...selectedValues, value]);
        }
    };

    const clearFilter = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFilterChange([]);
    };

    const isActive = selectedValues.length > 0;

    return (
        <th className="px-6 py-3 relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors w-full text-left ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                    }`}
            >
                <span className="truncate">{label}</span>
                {isActive && (
                    <span className="flex-shrink-0 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                        {selectedValues.length}
                    </span>
                )}
                <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                {isActive && (
                    <button
                        onClick={clearFilter}
                        className="flex-shrink-0 w-4 h-4 bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-full flex items-center justify-center transition-colors"
                    >
                        <X className="w-2.5 h-2.5" />
                    </button>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 min-w-[200px] max-w-[280px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Search */}
                    {options.length > 6 && (
                        <div className="p-2 border-b border-gray-100">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}

                    {/* Select All / Clear */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <button
                            onClick={() => onFilterChange(options)}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wide"
                        >
                            Select All
                        </button>
                        <button
                            onClick={() => onFilterChange([])}
                            className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-wide"
                        >
                            Clear
                        </button>
                    </div>

                    {/* Options */}
                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-gray-400 italic">No matching options</div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = selectedValues.includes(option);
                                return (
                                    <button
                                        key={option}
                                        onClick={() => toggleOption(option)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-indigo-50 transition-colors ${isSelected ? 'bg-indigo-50/50 text-indigo-700 font-semibold' : 'text-gray-700'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-indigo-600 border-indigo-600'
                                                : 'border-gray-300 bg-white'
                                            }`}>
                                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                        </div>
                                        <span className="truncate">{option}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </th>
    );
};

export default ColumnFilter;
