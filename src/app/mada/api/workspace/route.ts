import { handleMadaRequest } from "@/mada/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleMadaRequest(request, "workspace");
}
