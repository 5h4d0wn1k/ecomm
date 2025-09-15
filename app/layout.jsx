import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import AppWrapper from "@/components/AppWrapper";
import HydrationLogger from "@/components/HydrationLogger";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "DavCreations - Shop smarter",
    description: "DavCreations - Shop smarter",
};

export default function RootLayout({ children }) {
    // Server-side logging
    console.log('Server-side render: html attributes check');

    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning={true}>
                <body className={`${outfit.className} antialiased`}>
                    <HydrationLogger />
                    <StoreProvider>
                        <AppWrapper>
                            <Toaster />
                            {children}
                        </AppWrapper>
                    </StoreProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
