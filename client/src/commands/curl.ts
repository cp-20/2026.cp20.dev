import type { Terminal } from "@xterm/xterm";
import { appOrigin } from "../lib/const";
import { isMobileDevice } from "../lib/util";

function normalizePath(value: string): string {
  const trimmed = value.trim();
  try {
    const url = (() => {
      if (trimmed.startsWith("/")) {
        return new URL(trimmed, appOrigin);
      }
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return new URL(trimmed);
      }
      return new URL(`https://${trimmed}`);
    })();
    if (url.origin !== appOrigin) {
      throw new Error("Cannot request to different origin");
    }
    if (isMobileDevice) {
      url.searchParams.set("no-image", "true");
    }
    return url.pathname + url.search;
  } catch {
    return `/${trimmed}`;
  }
}

export async function curlCommand(term: Terminal, endpoint: string) {
  const requestPath = normalizePath(endpoint);
  try {
    const response = await fetch(requestPath, {
      headers: { accept: "text/plain" },
    });
    if (!response.ok) {
      term.writeln(`Request failed: ${response.status} ${response.statusText}`);
      return;
    }
    const body = await response.text();
    term.write(body.replace(/\n/g, "\r\n"));
    term.writeln("");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    term.writeln(`Request error: ${message}`);
  }
}
