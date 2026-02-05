type AiCreativePreviewProps = {
  html: string;
  title?: string;
  className?: string;
};

export function AiCreativePreview({ html, title, className }: AiCreativePreviewProps) {
  return (
    <iframe
      title={title ?? "AI creative preview"}
      className={className ?? "h-64 w-full rounded-lg border border-border bg-white"}
      sandbox="allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="no-referrer"
      srcDoc={html}
    />
  );
}
