"use client";
import { Button } from "../ui/button";
import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export const SignInButtonClerk = () => {
	return (
		<>
			<Show when="signed-out">
				<SignInButton >
					<Button
						asChild
						className="rounded-lg bg-[#845fff] hover:bg-[#845fff]/90  text-white">
						<Link href="/sign-in">Get Started</Link>
					</Button>
				</SignInButton>
			</Show>

			<Show when="signed-in">
				<UserButton />
				<Button
					asChild
					className="rounded-lg bg-[#845fff] hover:bg-[#845fff]/90  text-white">
					<Link href="/dashboard">Dashboard</Link>
				</Button>
			</Show>
		</>
	);
};
