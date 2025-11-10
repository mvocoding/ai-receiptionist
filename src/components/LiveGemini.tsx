import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LiveConnectConfig,
  LiveServerContent,
  Modality,
  Part,
} from "@google/genai";
import { GenAILiveClient, LiveClientOptions } from "../lib/genai-live-client";

type Message = {
  id: string;
  role: "user" | "model";
  text: string;
};

type ConnectionState = "idle" | "connecting" | "connected" | "error";

const DEFAULT_MODEL = "models/gemini-2.0-flash-exp";

const createId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;

const extractText = (parts: Part[] = []): string => {
  return parts
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trimStart();
};

export default function LiveGemini() {
  const [apiKey, setApiKey] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionState>("idle");
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<GenAILiveClient | null>(null);
  const detachHandlersRef = useRef<(() => void) | null>(null);
  const activeModelMessageIndexRef = useRef<number | null>(null);

  const config: LiveConnectConfig = useMemo(
    () => ({
      systemInstruction: {
        parts: [{ text: "You are a helpful assistant." }],
      },
      responseModalities: [Modality.TEXT],
    }),
    []
  );

  const disconnect = useCallback(() => {
    detachHandlersRef.current?.();
    detachHandlersRef.current = null;
    activeModelMessageIndexRef.current = null;

    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const handleContent = useCallback((serverContent: LiveServerContent) => {
    if (!serverContent.modelTurn) {
      return;
    }
    const text = extractText(serverContent.modelTurn.parts);
    if (!text) {
      return;
    }

    setMessages((prev) => {
      const next = [...prev];
      const activeIndex = activeModelMessageIndexRef.current;

      if (
        activeIndex === null ||
        activeIndex < 0 ||
        activeIndex >= next.length ||
        next[activeIndex]?.role !== "model"
      ) {
        next.push({
          id: createId(),
          role: "model",
          text,
        });
        activeModelMessageIndexRef.current = next.length - 1;
      } else {
        const current = next[activeIndex];
        next[activeIndex] = {
          ...current,
          text: `${current.text}${text}`,
        };
      }

      return next;
    });
  }, []);

  const connect = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!apiKey.trim()) {
        setError("An API key is required.");
        return;
      }

      setError(null);
      setStatus("connecting");
      setMessages([]);
      activeModelMessageIndexRef.current = null;

      disconnect();

      const options: LiveClientOptions = { apiKey: apiKey.trim() };
      const client = new GenAILiveClient(options);
      clientRef.current = client;

      const handleOpen = () => {
        setStatus("connected");
      };

      const handleClose = (event: CloseEvent) => {
        const message =
          event.reason ||
          (event.code
            ? `Connection closed (code ${event.code}).`
            : "Connection closed by server.");
        setError(message);
        setStatus("idle");
        activeModelMessageIndexRef.current = null;
      };

      const handleErrorEvent = (errorEvent: ErrorEvent) => {
        setError(errorEvent.message || "Unknown error");
        setStatus("error");
      };

      const handleTurnComplete = () => {
        activeModelMessageIndexRef.current = null;
      };

      const handleInterrupted = () => {
        activeModelMessageIndexRef.current = null;
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "model",
            text: "[Response interrupted]",
          },
        ]);
      };

      client
        .on("open", handleOpen)
        .on("close", handleClose)
        .on("error", handleErrorEvent)
        .on("content", handleContent)
        .on("turncomplete", handleTurnComplete)
        .on("interrupted", handleInterrupted);

      detachHandlersRef.current = () => {
        client
          .off("open", handleOpen)
          .off("close", handleClose)
          .off("error", handleErrorEvent)
          .off("content", handleContent)
          .off("turncomplete", handleTurnComplete)
          .off("interrupted", handleInterrupted);
      };

      const connected = await client.connect(DEFAULT_MODEL, config);
      if (!connected) {
        setStatus("error");
        setError("Unable to connect to Gemini Live. Check your API key.");
      }
    },
    [apiKey, config, disconnect, handleContent]
  );

  const handleSend = useCallback(() => {
    const client = clientRef.current;
    if (!client || status !== "connected") {
      setError("Connect before sending a message.");
      return;
    }
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const contentPart: Part = { text: trimmed };

    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "user",
        text: trimmed,
      },
    ]);
    client.send([contentPart]);
    setInput("");
    activeModelMessageIndexRef.current = null;
  }, [input, status]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Gemini Live Chat
          </h1>
          <p className="text-sm text-slate-400">
            Enter your Gemini API key and start chatting in real-time.
          </p>
        </header>

        <form
          onSubmit={connect}
          className="flex flex-col gap-3 rounded-2xl bg-slate-950/40 p-4 sm:flex-row sm:items-center"
        >
          <label className="flex-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            <span className="mb-1 block text-slate-300">
              Gemini API key <span className="text-rose-400">*</span>
            </span>
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Enter your API key"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              autoComplete="off"
            />
          </label>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            {isConnected ? (
              <button
                type="button"
                onClick={() => {
                  disconnect();
                  setStatus("idle");
                }}
                className="inline-flex w-full items-center justify-center rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/50 sm:w-auto"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="submit"
                disabled={isConnecting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60 disabled:cursor-not-allowed disabled:bg-sky-500/60 sm:w-auto"
              >
                {isConnecting ? "Connecting..." : "Connect"}
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full">
            <span
              className={`block h-2 w-2 rounded-full ${
                isConnected
                  ? "bg-emerald-400 animate-pulse"
                  : isConnecting
                    ? "bg-amber-300 animate-ping"
                    : status === "error"
                      ? "bg-rose-400"
                      : "bg-slate-600"
              }`}
            />
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
            {status === "connected" && "Connected"}
            {status === "connecting" && "Connecting"}
            {status === "error" && "Connection error"}
            {status === "idle" && "Disconnected"}
          </span>
        </div>

        <section className="h-80 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
          <div className="flex h-full flex-col justify-between">
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-slate-500">
                  Connect and start chatting with Gemini.
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-lg shadow-slate-950/40 ${
                        message.role === "user"
                          ? "bg-sky-500 text-white"
                          : "bg-slate-800 text-slate-100"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder={
                    isConnected
                      ? "Type a message and press Enter"
                      : "Connect to start chatting"
                  }
                  disabled={!isConnected}
                  className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!isConnected || !input.trim()}
                  className="inline-flex h-11 min-w-[110px] items-center justify-center rounded-2xl bg-sky-500 px-5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 disabled:cursor-not-allowed disabled:bg-sky-500/50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

