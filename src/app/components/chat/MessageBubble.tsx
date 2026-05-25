import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy, Bot, User } from "lucide-react";
import { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
  agent?: string;
}

export function MessageBubble({ message, agent }: MessageBubbleProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isUser = message.role === "user";

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border backdrop-blur-md ${
          isUser
            ? "bg-white/10 border-white/20 text-white"
            : message.agent === "gemma"
            ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400"
            : "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400"
        }`}
      >
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>

      {/* Message Content */}
      <div
        className={`group relative max-w-[85%] rounded-3xl p-5 shadow-lg border backdrop-blur-md ${
          isUser
            ? "bg-white/10 border-white/10 text-white rounded-tr-sm"
            : "bg-[#1a1a2e]/60 border-white/5 text-slate-200 rounded-tl-sm"
        }`}
      >
        <div className="prose prose-invert max-w-none text-slate-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");
                const id = Math.random().toString(36).substring(7);

                if (!inline && match) {
                  return (
                    <div className="relative rounded-lg overflow-hidden my-4 border border-white/10">
                      <div className="flex items-center justify-between px-4 py-2 bg-black/40 text-xs text-slate-400">
                        <span>{match[1]}</span>
                        <button
                          onClick={() => copyToClipboard(codeString, id)}
                          className="hover:text-white transition-colors flex items-center gap-1"
                        >
                          {copiedCode === id ? <Check size={14} /> : <Copy size={14} />}
                          {copiedCode === id ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        {...props}
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, borderRadius: 0, background: "#0d0d12" }}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                return (
                  <code {...props} className={`${className} bg-black/30 text-emerald-400 px-1.5 py-0.5 rounded-md text-sm font-mono`}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
