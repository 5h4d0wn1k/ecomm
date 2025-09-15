import { NextResponse } from "next/server";
import { setCSRFToken } from "@/lib/csrf";

export async function GET() {
  const response = NextResponse.json({ message: "CSRF token set" });
  setCSRFToken(response);
  return response;
}