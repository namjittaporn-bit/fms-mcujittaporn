import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;
    if (!slug || slug.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const safeRelative = path.normalize(slug.join(path.sep));
    // Guard against path traversal
    if (safeRelative.startsWith("..") || path.isAbsolute(safeRelative)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const uploadsBase = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadsBase, safeRelative);

    // Verify filePath stays inside uploadsBase
    if (!filePath.startsWith(uploadsBase)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
