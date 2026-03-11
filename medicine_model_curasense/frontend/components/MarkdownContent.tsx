import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders markdown text with clean, compact styling.
 * Works on both white and coloured backgrounds — uses relative colours.
 */
export default function MarkdownContent({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={`text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold mt-3 mb-1.5 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold mt-2.5 mb-1 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mt-2 mb-0.5 first:mt-0">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 space-y-0.5 pl-4 list-disc">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 space-y-0.5 pl-4 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic opacity-90">{children}</em>
          ),
          pre: ({ children }) => (
            <pre className="bg-black/10 p-3 rounded-lg overflow-x-auto my-2 text-xs font-mono whitespace-pre-wrap">
              {children}
            </pre>
          ),
          code: ({ children }) => (
            <code className="bg-black/10 px-1 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-current/30 pl-3 opacity-80 my-2 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-current/20 my-3" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="w-full text-xs border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-200 px-2 py-1">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
