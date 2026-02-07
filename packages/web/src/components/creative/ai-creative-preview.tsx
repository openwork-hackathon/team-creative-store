type AiCreativePreviewProps = {
  imageUrl: string;
  aspectRatio: string;
  title?: string;
  className?: string;
};

export function AiCreativePreview({ imageUrl, aspectRatio, title, className }: AiCreativePreviewProps) {
  return (
    <div className={className ?? "relative w-full overflow-hidden rounded-lg border border-border bg-muted"}>
      <img
        src={imageUrl}
        alt={title ?? "AI generated creative"}
        className="h-auto w-full object-contain"
        style={{ aspectRatio: aspectRatio.replace(":", "/") }}
      />
    </div>
  );
}
