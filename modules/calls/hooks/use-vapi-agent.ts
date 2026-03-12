"use client";

import { createSalesAssistant, SalesTrainerConfig } from "@/lib/assistant";
import { getVapi } from "@/lib/vapi";
import { useEffect, useRef, useState } from "react";
// CHANGE 1: import updateCallVapiId so we can save the Vapi call ID to DB
import { updateCallVapiId } from "../server/create-call";

type Status = "idle" | "connecting" | "speaking" | "listening" | "thinking";
type Message = { role: "user" | "assistant"; content: string };

// CHANGE 2: accept `id` (your DB row id) as second argument
// The webhook finds the call row using vapiCallId — we must save it here
export function useVapiAgent(config: SalesTrainerConfig, id: string) {
	const vapi = getVapi();
	const [status, setStatus] = useState<Status>("idle");
	const [messages, setMessages] = useState<Message[]>([]);
	const [liveAssistantText, setLiveAssistantText] = useState("");
	const [liveUserText, setLiveUserText] = useState("");
	const stoppingRef = useRef(false);

	useEffect(() => {
		const onCallStart = () => {
			stoppingRef.current = false;
			setStatus("listening");
		};

		const onCallEnd = () => {
			setStatus("idle");
			setLiveAssistantText("");
			setLiveUserText("");
		};

		const onSpeechStart = () => {
			if (!stoppingRef.current) setStatus("speaking");
		};

		const onSpeechEnd = () => {
			if (!stoppingRef.current) setStatus("listening");
		};

		const onMessage = (msg: any) => {
			if (msg.type !== "transcript") return;

			if (msg.role === "user" && msg.transcriptType === "partial") {
				setLiveUserText(msg.transcript);
				return;
			}
			if (msg.role === "assistant" && msg.transcriptType === "partial") {
				setLiveAssistantText(msg.transcript);
				return;
			}
			if (msg.transcriptType === "final") {
				setLiveAssistantText("");
				setLiveUserText("");
				setMessages((prev) => [
					...prev,
					{ role: msg.role, content: msg.transcript },
				]);
				if (msg.role === "user") setStatus("thinking");
			}
		};

		const onError = (err: any) => {
			console.error("❌ Vapi error:", err);
			setStatus("idle");
		};

		vapi.on("call-start", onCallStart);
		vapi.on("call-end", onCallEnd);
		vapi.on("speech-start", onSpeechStart);
		vapi.on("speech-end", onSpeechEnd);
		vapi.on("message", onMessage);
		vapi.on("error", onError);

		return () => {
			vapi.off("call-start", onCallStart);
			vapi.off("call-end", onCallEnd);
			vapi.off("speech-start", onSpeechStart);
			vapi.off("speech-end", onSpeechEnd);
			vapi.off("message", onMessage);
			vapi.off("error", onError);
		};
	}, [vapi]);

	const start = async () => {
		setStatus("connecting");
		setMessages([]);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			stream.getTracks().forEach((t) => t.stop());
		} catch {
			console.error("❌ Mic permission denied");
			setStatus("idle");
			return;
		}

		const assistantOverrides = {
			variableValues: {
				productName: config.productName,
				industry: config.industry,
				difficulty: config.difficulty,
				yourRole: config.yourRole,
				callGoal: config.callGoal,
			},
			clientMessages: ["transcript"],
			serverMessages: [],
		};

		try {
			  // ADD THIS — check what webhook URL is being sent to Vapi
  const assistant = createSalesAssistant(config)
  console.log("🔗 Webhook URL:", assistant.serverUrl)
			// CHANGE 3: capture the return value from vapi.start()
			// vapi.start() returns a call object with `.id` = the Vapi call ID
			// @ts-expect-error
			const call = await vapi.start(createSalesAssistant(config), assistantOverrides);

			// CHANGE 4: save vapiCallId to DB — webhook NEEDS this to find the row
			// updateCallVapiId(dbRowId, vapiCallId)
			if (call?.id) {
				await updateCallVapiId(id, call.id);
			}
		} catch (err) {
			console.error("❌ Vapi start error:", err);
			setStatus("idle");
		}
	};

	const stop = () => {
		stoppingRef.current = true;
		vapi.stop();
	};

	return {
		status,
		messages,
		liveAssistantText,
		liveUserText,
		start,
		stop,
		isActive: status !== "idle",
	};
}