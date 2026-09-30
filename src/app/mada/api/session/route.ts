import { handleMadaRequest } from "@/mada/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleMadaRequest(request, "session");
}

export async function DELETE(request: Request) {
  return handleMadaRequest(request, "session");
}
