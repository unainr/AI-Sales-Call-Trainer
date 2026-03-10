"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	CALL_GOAL_LABELS,
	DIFFICULTY_LABELS,
	INDUSTRY_LABELS,
	YOUR_ROLE_LABELS,
} from "@/drizzle/schema";
import { formSchema } from "../../server/schema";
import { CreateCall } from "../../server/create-call";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Sparkles } from "lucide-react";

export function CallForm() {
	const router = useRouter();
	const [isPending, setIsPending] = React.useState(false);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			productName: "",
			industry: "",
			difficulty: "",
			yourRole: "",
			callGoal: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			setIsPending(true);
			const result = await CreateCall(data);
			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("form submitted successfully");
				form.reset();
				router.push(`/calls/${result.data?.id}`);
			}
		} catch (error: any) {
			toast.error("Something went wrong", error);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Card className="w-full sm:max-w-md">
			<CardHeader>
				<CardTitle>Set Up Your Sales Call</CardTitle>
				<CardDescription>
					Configure your practice session. The AI will roleplay as a real
					prospect.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form id="call-setup-form" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						{/* Product Name */}
						<Controller
							name="productName"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="productName">Product Name</FieldLabel>
									<Input
										{...field}
										id="productName"
										placeholder="e.g. HireFlow, Notion, Stripe"
										autoComplete="off"
										aria-invalid={fieldState.invalid}
									/>
									<FieldDescription>
										The product you will be pitching during the call.
									</FieldDescription>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* Your Role */}
						<Controller
							name="yourRole"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="yourRole">Your Role</FieldLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger
											id="yourRole"
											aria-invalid={fieldState.invalid}>
											<SelectValue placeholder="Select your role" />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(YOUR_ROLE_LABELS).map(
												([value, label]) => (
													<SelectItem key={value} value={value}>
														{label}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
									<FieldDescription>
										Used to personalize your feedback after the call.
									</FieldDescription>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* Industry */}
						<Controller
							name="industry"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="industry">Industry</FieldLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger
											id="industry"
											aria-invalid={fieldState.invalid}>
											<SelectValue placeholder="Select an industry" />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
												<SelectItem key={value} value={value}>
													{label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldDescription>
										The industry your prospect operates in.
									</FieldDescription>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* Call Goal */}
						<Controller
							name="callGoal"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="callGoal">Call Goal</FieldLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger
											id="callGoal"
											aria-invalid={fieldState.invalid}>
											<SelectValue placeholder="What are you practicing?" />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(CALL_GOAL_LABELS).map(
												([value, label]) => (
													<SelectItem key={value} value={value}>
														{label}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
									<FieldDescription>
										The AI will react based on what you are trying to achieve.
									</FieldDescription>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* Difficulty */}
						<Controller
							name="difficulty"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="difficulty">Difficulty</FieldLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger
											id="difficulty"
											aria-invalid={fieldState.invalid}>
											<SelectValue placeholder="Choose difficulty level" />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(DIFFICULTY_LABELS).map(
												([value, label]) => (
													<SelectItem key={value} value={value}>
														{label}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
									<FieldDescription>
										How tough the AI prospect will be during the call.
									</FieldDescription>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</FieldGroup>
				</form>
			</CardContent>

			<CardFooter>
				<Field orientation="horizontal">
					<Button type="button" variant="outline" onClick={() => form.reset()}>
						Reset
					</Button>
					<Button type="submit" form="call-setup-form" disabled={isPending}>
						{isPending ? (
							<>
								<Spinner />Submit
							</>
						) : (
							<>
								<Sparkles size={15} /> Submit
							</>
						)}
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
}
