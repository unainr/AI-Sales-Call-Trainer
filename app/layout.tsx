import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme/theme-provider";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "VoxCloser",
		template: "%s | VoxCloser",
	},
	description:
		"VoxCloser is a modern voice-powered communication platform that helps you capture, process, and respond intelligently in real-time.",

	keywords: [
		"VoxCloser",
		"voice AI",
		"speech recognition",
		"AI communication",
		"voice assistant",
		"real-time voice processing",
	],

	authors: [{ name: "VoxCloser Team" }],

	creator: "VoxCloser",

	openGraph: {
		title: "VoxCloser",
		description:
			"Smarter voice communication powered by AI. Fast, secure, and intelligent.",
		siteName: "VoxCloser",
		type: "website",
	},

	twitter: {
		card: "summary_large_image",
		title: "VoxCloser",
		description: "Experience next-gen voice communication with VoxCloser.",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider
			appearance={{
				variables: {
					colorPrimary: "#d82b2b",
					colorTextOnPrimaryBackground: "#ffffff",
				},
			}}>
			<html lang="en" suppressHydrationWarning>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						disableTransitionOnChange>
						<NextTopLoader
							color="#d82b2b"
							height={2}
							crawlSpeed={50}
							speed={1000}
							showSpinner={false}
						/>
						{children}
					</ThemeProvider>
					<Toaster />
				</body>
			</html>
		</ClerkProvider>
	);
}
