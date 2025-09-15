'use client';

import { useEffect } from 'react';

export default function HydrationLogger() {
    useEffect(() => {
        // Log client-side html style attributes
        const htmlElement = document.documentElement;
        console.log('Client-side html style:', htmlElement.getAttribute('style'));
        console.log('Client-side html attributes:', htmlElement.attributes);

        // Fix: Remove injected style attributes that cause hydration mismatch
        const style = htmlElement.getAttribute('style');
        if (style && style.includes('--vsc-domain')) {
            // Remove the specific injected style
            const cleanedStyle = style.replace(/--vsc-domain:[^;]+;?/g, '').trim();
            if (cleanedStyle) {
                htmlElement.setAttribute('style', cleanedStyle);
            } else {
                htmlElement.removeAttribute('style');
            }
            console.log('Removed injected --vsc-domain style to fix hydration error');
        }
    }, []);

    return null; // This component doesn't render anything
}