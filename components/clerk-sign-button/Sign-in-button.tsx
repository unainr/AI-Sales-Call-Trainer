"use client";
import { Button } from "../ui/button";
import Link from "next/link";
import { Video } from "lucide-react";
import { useState } from "react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export const SignInButtonClerk = () => {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Show  when="signed-out">
				
				<SignInButton mode="modal" >
					<Button variant="ghost" className="rounded-full">
						Get Started
					</Button>
				</SignInButton>
				{/* <SignUpButton mode="modal">
									<Button>Sign UP</Button>
								</SignUpButton> */}
			</Show>

			<Show when="signed-in">
				<UserButton />
				<Button
					asChild
					className="rounded-full gap-2 px-4 h-9 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 border border-orange-500/20 hover:border-orange-500/35 shadow-none transition-all duration-200"
					variant="ghost">
					
				</Button>
				
			</Show>
		</>
	);
};
