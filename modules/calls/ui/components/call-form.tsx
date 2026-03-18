"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
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
import { BarChart2, Mic, Phone, Shield, Sparkles } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { voiceCategories, voiceOptions } from "@/constants";
import { cn } from "@/lib/utils";
import SiriOrb from "./ai-orb";

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
			persona: "",
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
		<div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
  <div className="flex w-full max-w-6xl overflow-hidden rounded-2xl border border-border/60 shadow-sm bg-background">

    {/* ── Left: Form ── */}
    <div className="w-full md:w-1/2 flex flex-col">
      <div className="px-7 pt-7 pb-5 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
            <Phone size={15} />
          </div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Set Up Your Sales Call
          </h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed pl-11">
          Configure your practice session. The AI will roleplay as a real prospect.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-6">
        <form id="call-setup-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-5">

            {/* Product Name */}
            <Controller
              name="productName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="productName" className="text-sm font-medium">Product Name</FieldLabel>
                  <Input
                    {...field}
                    id="productName"
                    placeholder="e.g. HireFlow, Notion, Stripe"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    className="mt-1.5 h-9 text-sm"
                  />
                  <FieldDescription className="mt-1 text-xs text-muted-foreground">
                    The product you will be pitching during the call.
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Your Role + Industry */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="yourRole"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="yourRole" className="text-sm font-medium">Your Role</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="yourRole" aria-invalid={fieldState.invalid} className="mt-1.5 h-9 text-sm">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(YOUR_ROLE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="text-sm">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription className="mt-1 text-xs text-muted-foreground">Personalizes feedback.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="industry"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="industry" className="text-sm font-medium">Industry</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="industry" aria-invalid={fieldState.invalid} className="mt-1.5 h-9 text-sm">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="text-sm">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription className="mt-1 text-xs text-muted-foreground">Prospect's sector.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            {/* Call Goal + Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="callGoal"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="callGoal" className="text-sm font-medium">Call Goal</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="callGoal" aria-invalid={fieldState.invalid} className="mt-1.5 h-9 text-sm">
                        <SelectValue placeholder="What to practice?" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CALL_GOAL_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="text-sm">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription className="mt-1 text-xs text-muted-foreground">AI reacts to goal.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="difficulty"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="difficulty" className="text-sm font-medium">Difficulty</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="difficulty" aria-invalid={fieldState.invalid} className="mt-1.5 h-9 text-sm">
                        <SelectValue placeholder="Choose level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="text-sm">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription className="mt-1 text-xs text-muted-foreground">Resistance level.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            {/* Persona / Voice */}
            <Controller
              name="persona"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-sm font-medium">AI Prospect Voice</FieldLabel>
                  <FieldDescription className="mt-0.5 text-xs text-muted-foreground">
                    Choose the voice your AI prospect will speak in.
                  </FieldDescription>
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Male</p>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-3 gap-2">
                        {voiceCategories.male.map((key) => {
                          const voice = voiceOptions[key as keyof typeof voiceOptions];
                          return (
                            <label
                              key={key}
                              htmlFor={`voice-${key}`}
                              className={cn(
                                "flex cursor-pointer flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-sm transition-all duration-150",
                                field.value === voice.id
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-border hover:border-muted-foreground/40 hover:bg-muted/40"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value={voice.id} id={`voice-${key}`} />
                                <span className="font-medium text-sm">{voice.name}</span>
                              </div>
                              <p className="pl-6 text-[11px] text-muted-foreground leading-snug">{voice.description}</p>
                            </label>
                          );
                        })}
                      </RadioGroup>
                    </div>
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Female</p>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-2 gap-2">
                        {voiceCategories.female.map((key) => {
                          const voice = voiceOptions[key as keyof typeof voiceOptions];
                          return (
                            <label
                              key={key}
                              htmlFor={`voice-${key}`}
                              className={cn(
                                "flex cursor-pointer flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-sm transition-all duration-150",
                                field.value === voice.id
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-border hover:border-muted-foreground/40 hover:bg-muted/40"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value={voice.id} id={`voice-${key}`} />
                                <span className="font-medium text-sm">{voice.name}</span>
                              </div>
                              <p className="pl-6 text-[11px] text-muted-foreground leading-snug">{voice.description}</p>
                            </label>
                          );
                        })}
                      </RadioGroup>
                    </div>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </div>

      <div className="px-7 py-4 border-t border-border/40 bg-muted/20 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => form.reset()}
        >
          Reset
        </Button>
        <Button
          type="submit"
          form="call-setup-form"
          size="sm"
          disabled={isPending}
          className="min-w-25 gap-1.5"
        >
          {isPending ? (
            <><Spinner className="w-3.5 h-3.5" /> Submitting…</>
          ) : (
            <><Sparkles size={13} /> Start Call</>
          )}
        </Button>
      </div>
    </div>

    {/* ── Right: Visual Panel ── */}
    <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center relative bg-linear-to-br from-primary/10 via-primary/5 to-muted/60 border-l border-border/40 p-10 gap-8 overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute -top-15 -right-15 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

      {/* Avatar / illustration placeholder */}
      <div className="relative flex flex-col items-center gap-5 z-10">
      <SiriOrb/>
      

        {/* Animated sound-wave bars */}
        <div className="flex items-end gap-1 h-8">
          {[3, 6, 10, 7, 4, 8, 5, 9, 4, 6, 3].map((h, i) => (
            <span
              key={i}
              className="w-1.5 rounded-full bg-primary/50 animate-pulse"
              style={{
                height: `${h * 3}px`,
                animationDelay: `${i * 80}ms`,
                animationDuration: "1.2s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Info cards */}
      <div className="z-10 w-full space-y-3">
        {[
          { icon: <Mic size={14} />, label: "Realistic Voice", desc: "AI speaks naturally, just like a real prospect." },
          { icon: <BarChart2 size={14} />, label: "Live Feedback", desc: "Get scored on objection handling & tone." },
          { icon: <Shield size={14} />, label: "Safe to Fail", desc: "Practice without real-world consequences." },
        ].map(({ icon, label, desc }) => (
          <div key={label} className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/60 backdrop-blur-sm px-4 py-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

  </div>
</div>
	);
}
