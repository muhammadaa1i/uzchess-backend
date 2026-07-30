import { exec } from "child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { SWAGGER_DOC_GROUPS } from "@/core/configs/swagger/swagger-doc-groups";

const BROWSER =
  process.env.SWAGGER_BROWSER ??
  (process.platform === "win32"
    ? "chrome"
    : process.platform === "darwin"
      ? "Google Chrome"
      : "google-chrome");

function lockFilePath(port: number): string {
  return join(tmpdir(), `uzchess-swagger-windows-${port}.lock`);
}

function openWindow(url: string) {
  const command =
    process.platform === "win32"
      ? `start "" ${BROWSER} --new-window "${url}"`
      : process.platform === "darwin"
        ? `open -na "${BROWSER}" --args --new-window "${url}"`
        : `${BROWSER} --new-window "${url}" &`;

  exec(command, (err) => {
    if (err) console.error(`Failed to open ${url}:`, err.message);
  });
}

export function openSwaggerWindowsOnce(host: string, port: number) {
  if (process.env.NODE_ENV === "production") return;

  const lockFile = lockFilePath(port);
  if (existsSync(lockFile)) return;

  mkdirSync(tmpdir(), { recursive: true });
  writeFileSync(lockFile, String(process.pid));

  const clearLock = () => {
    rmSync(lockFile, { force: true });
    process.exit(0);
  };
  process.on("SIGINT", clearLock);
  process.on("SIGTERM", clearLock);

  SWAGGER_DOC_GROUPS.forEach((group, i) => {
    setTimeout(() => openWindow(`${host}/${group.path}`), i * 400);
  });
}
