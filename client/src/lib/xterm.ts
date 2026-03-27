import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/600.css";

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { ImageAddon } from "@xterm/addon-image";
import { ClipboardAddon } from "@xterm/addon-clipboard";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { appOrigin } from "./const";
import { runCommandForcibly } from "../terminal-client";
import { isMobile, isMobileDevice } from "./util";

const terminalElement = document.getElementById("terminal");
if (!terminalElement) {
  throw new Error("Terminal element was not found.");
}

export const term = new Terminal({
  allowProposedApi: true,
  convertEol: true,
  cursorBlink: true,
  cursorStyle: "underline",
  cursorInactiveStyle: "outline",
  fontFamily: '"IBM Plex Mono", "Cascadia Mono", "Menlo", monospace',
  fontSize: isMobile ? 13 : 15,
  lineHeight: 1.2,
  letterSpacing: 0,
  scrollback: 1500,
  // モバイルでは入力用のソフトウェアキーボードが邪魔になるので、ReadOnly にする
  disableStdin: isMobile,
  theme: {
    background: "#081017",
    foreground: "#d8f5f2",
    cursor: "#f7d06b",
    cursorAccent: "#081017",
    selectionBackground: "#2f5b7a",
    black: "#0f1b26",
    red: "#ff6d6d",
    green: "#7be495",
    yellow: "#ffd166",
    blue: "#78b8ff",
    magenta: "#ff8cf5",
    cyan: "#72f1f5",
    white: "#d8f5f2",
    brightBlack: "#446176",
    brightRed: "#ff8d8d",
    brightGreen: "#99f0af",
    brightYellow: "#ffe18a",
    brightBlue: "#94ccff",
    brightMagenta: "#ffadf9",
    brightCyan: "#96fbff",
    brightWhite: "#f2fffe",
  },
});

const fitAddon = new FitAddon();
const imageAddon = new ImageAddon();
const clipboardAddon = new ClipboardAddon();
const webLinksAddon = new WebLinksAddon((event, uri) => {
  const url = new URL(uri);
  if (url.origin === appOrigin) {
    event.preventDefault();
    runCommandForcibly(`curl ${url}`);
    return;
  }
  window.open(uri, "_blank", "noopener");
});

term.loadAddon(fitAddon);
if (!isMobileDevice) {
  // 画像はモバイルでは表示しない
  term.loadAddon(imageAddon);
}
term.loadAddon(clipboardAddon);
term.loadAddon(webLinksAddon);

term.open(terminalElement);
fitAddon.fit();
term.focus();

const fitTerminal = (): void => {
  window.requestAnimationFrame(() => {
    fitAddon.fit();
  });
};

window.addEventListener("resize", fitTerminal);

if (typeof ResizeObserver !== "undefined") {
  const resizeObserver = new ResizeObserver(() => {
    fitTerminal();
  });
  resizeObserver.observe(terminalElement);
}

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", fitTerminal);
}
