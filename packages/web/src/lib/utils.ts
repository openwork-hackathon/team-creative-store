import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<unknown>) {
  return twMerge(clsx(inputs));
}

export async function downloadImage(url: string, filename?: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || url.split("/").pop() || "download.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback: open in new tab if fetch fails (e.g. CORS)
    window.open(url, "_blank");
  }
}
