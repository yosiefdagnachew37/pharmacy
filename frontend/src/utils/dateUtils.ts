/**
 * Formats a date string or Date object into MM-DD-YYYY format.
 * @param date The date to format
 * @returns Formatted date string (MM-DD-YYYY) or 'N/A' if invalid
 */
export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${month}-${day}-${year}`;
};

/**
 * Parses a date string in MM-DD-YYYY or MM/DD/YYYY format into a Date object.
 * Useful for validating user input if needed.
 */
export const parseCustomDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Support both - and / separators
    const parts = dateStr.split(/[-/]/);
    if (parts.length !== 3) return null;
    
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
    
    // Full year check
    const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
    
    const d = new Date(fullYear, month - 1, day);
    return isNaN(d.getTime()) ? null : d;
};
