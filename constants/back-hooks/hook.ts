"use client";

import { createSalesAssistant, SalesTrainerConfig } from "@/lib/assistant";
import { getVapi } from "@/lib/vapi";
import { useEffect, useRef, useState } from "react";

type Status = "idle" | "connecting" | "speaking" | "listening" | "thinking";
type Message = { role: "user" | "assistant"; content: string };

export function useVapiAgent(config: SalesTrainerConfig) {
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

        // 1. Check mic permission — stop the stream immediately after
        // Vapi will open its own stream; we don't want to hold a duplicate
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((t) => t.stop()); // release immediately
        } catch {
            console.error("❌ Mic permission denied");
            setStatus("idle");
            return;
        }

        // 2. Start Vapi call
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
            // @ts-expect-error
            await vapi.start(createSalesAssistant(config), assistantOverrides);
        } catch (err) {
            console.error("❌ Vapi start error:", err);
            setStatus("idle");
        }
    };

    const stop = () => {
        stoppingRef.current = true;
        // 1. Kill mic tracks immediately — don't wait for Vapi's call-end event
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
