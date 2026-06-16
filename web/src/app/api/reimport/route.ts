import { NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";

export async function POST() {
  try {
    const cwd = path.join(process.cwd());
    execSync("npm run import:sheet", { cwd, stdio: "pipe" });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Import failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
