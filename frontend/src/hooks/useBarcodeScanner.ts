import { useEffect, useState } from 'react';

/**
 * useBarcodeScanner - Global hook to detect barcode scanner inputs
 * Scanners typically emit characters rapidly (sub-50ms) followed by an 'Enter'.
 * This hook differentiates between human typing and hardware scanners.
 */
export const useBarcodeScanner = (onScan: (barcode: string) => void) => {
    useEffect(() => {
        let buffer = '';
        let lastKeyTime = Date.now();
        let timeout: any;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if focus is in an input/textarea
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable ||
                (target as any).type === 'text'
            ) {
                return;
            }

            const currentTime = Date.now();
            const diff = currentTime - lastKeyTime;

            // Handle scan completion
            if (e.key === 'Enter') {
                if (buffer.length > 3 && diff < 100) { // Threshold for scanner speed
                    onScan(buffer);
                    e.preventDefault();
                }
                buffer = '';
                return;
            }

            // Collect alphanumeric characters
            if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                // If keys are coming in too slow, it's a human. Reset buffer.
                if (diff > 50) {
                    buffer = '';
                }

                buffer += e.key;
                lastKeyTime = currentTime;

                // Auto-clear buffer if no Enter key for a while
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    buffer = '';
                }, 100);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timeout);
        };
    }, [onScan]);
};
