import { Github, Twitter, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
	return (
		<footer className="relative border-t border-border/60">
			{/* Top accent line */}
			<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-500/30 to-transparent" />

			<div className="container mx-auto px-4 py-10">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6">
					{/* Logo + tagline */}
					<div className="flex flex-col items-center md:items-start gap-2">
						<Link href="/" className="flex items-center gap-2.5">
							<Image
								src="/logo1.svg" // ← replace with your logo path
								alt="Clipsterra"
								height={50}
								width={50}
								className="z-10 hidden h-7 w-full object-contain dark:block"
							/>

							<Image
								src="/logo.svg"
								alt="Design Logo"
								height={50}
								width={50}
								className="z-10 block h-7 w-full object-contain dark:hidden"
							/>
						</Link>
						<p className="text-xs text-muted-foreground">
							Record, clip and share — instantly.
						</p>
					</div>

					{/* Bottom row */}
					<div className="flex flex-col md:flex-row items-center gap-5">
						<p className="text-xs text-muted-foreground">
							© {new Date().getFullYear()} Clipsterra. All rights reserved.
						</p>

						{/* Social icons */}
						<div className="flex items-center gap-3">
							{[
								{ icon: Twitter, href: "#" },
								{ icon: Linkedin, href: "#" },
								{ icon: Github, href: "#" },
							].map(({ icon: Icon, href }, i) => (
								<a
									key={i}
									href={href}
									className="w-7 h-7 rounded-lg border border-border/60 bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/8 transition-all duration-200">
									<Icon className="w-3.5 h-3.5" />
								</a>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
