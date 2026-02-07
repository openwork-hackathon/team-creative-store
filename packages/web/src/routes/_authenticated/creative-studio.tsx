import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CreativeStudioPage } from "@/pages/creative-studio-page";

const searchSchema = z.object({
  projectId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/creative-studio")({
  validateSearch: searchSchema,
  component: CreativeStudioPage,
});
