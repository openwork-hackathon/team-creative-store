import { createFileRoute } from "@tanstack/react-router";
import { CreativeStudioPage } from "@/pages/creative-studio-page";

export const Route = createFileRoute("/_authenticated/creative-studio")({
  component: CreativeStudioPage
});
