"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SignInButton } from "@clerk/nextjs";

export default function CheckSignIn() {
	const searchParams = useSearchParams();
	const shouldOpen = searchParams.get("signIn");

	useEffect(() => {
		if (shouldOpen) {
			document.getElementById("auto-signin")?.click();
		}
	}, [shouldOpen]);

	return (
		<>
			<SignInButton mode="modal">
				<button id="auto-signin" style={{ display: "none" }}>
					Sign In
				</button>
			</SignInButton>

			{/* rest of homepage */}
		</>
	);
}