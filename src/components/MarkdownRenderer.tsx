import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownRendererProps {
  markdown: string;
}

export default function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
      {markdown}
    </ReactMarkdown>
  );
}
