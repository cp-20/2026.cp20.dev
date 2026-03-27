import "./terminal-client.css";

import { term } from "./lib/xterm";
import { runCommand } from "./commands";
import { isMobile } from "./lib/util";
import { appOrigin } from "./lib/const";

const prompt = "\u001b[32m$ \u001b[0m";
let input = "";
let cursorPosition = 0;
let isBusy = false;

const history: string[] = [];
let historyIndex = 0;

const printPrompt = (): void => {
  term.write(`\r\n${prompt}`);
};

const printWelcome = (): void => {
  term.writeln("Hello, cp20.dev!");
  term.writeln("Type help for available commands.");
  if (isMobile) {
    term.writeln("Tap the buttons below the terminal to run commands.");
    term.writeln("See also https://2025.cp20.dev if you find it hard to see.");
  } else {
    term.writeln("You can also use your own terminal to access here.");
    term.writeln("Try running: curl https://cp20.dev");
  }
  term.write(`\r\n${prompt}`);
};

const shouldAutoRunPath = (pathname: string): boolean => {
  return pathname === "/" || pathname === "/articles" ||
    pathname === "/works" || pathname.startsWith("/works/") ||
    pathname === "/featured-series" || pathname === "/featured-tracks";
};

const renderLine = (): void => {
  let sequence = "\r\x1b[K";
  sequence += prompt + input;

  if (cursorPosition < input.length) {
    sequence += `\x1b[${input.length - cursorPosition}D`;
  }
  term.write(sequence);
};

export const runCommandForcibly = async (command: string): Promise<void> => {
  input = command;
  cursorPosition = input.length;
  renderLine();
  term.write("\r\n");
  isBusy = true;
  await runCommand(command, term);
  history.push(command);
  historyIndex = history.length;
  isBusy = false;
  input = "";
  cursorPosition = 0;
  printPrompt();
};

const helpButton = document.getElementById("help-button");
if (!helpButton) throw new Error("Help button not found");
helpButton.addEventListener("click", () => {
  if (isBusy) return;
  runCommandForcibly("help");
});

const clearButton = document.getElementById("clear-button");
if (!clearButton) throw new Error("Clear button not found");
clearButton.addEventListener("click", () => {
  if (isBusy) return;
  runCommandForcibly("clear");
});

term.onKey(async ({ key, domEvent }) => {
  if (isBusy) return;

  const ev = domEvent;
  const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "v") {
    ev.preventDefault();
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      const cleanText = text.replace(/[\r\n]+/g, "");

      if (cursorPosition === input.length) {
        input += cleanText;
        cursorPosition += cleanText.length;
        term.write(cleanText);
      } else {
        input = input.slice(0, cursorPosition) + cleanText +
          input.slice(cursorPosition);
        cursorPosition += cleanText.length;
        renderLine();
      }
    } catch (err) {
      console.warn("Denied access to clipboard:", err);
    }
    return;
  }

  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "c") {
    ev.preventDefault();
    if (term.hasSelection()) {
      navigator.clipboard.writeText(term.getSelection());
    }
    return;
  }

  if (ev.key === "Enter") {
    term.write("\r\n");
    const command = input.trim();
    if (command) {
      history.push(command);
    }
    historyIndex = history.length;
    input = "";
    cursorPosition = 0;

    isBusy = true;
    await runCommand(command, term);
    isBusy = false;
    printPrompt();
    return;
  }

  if (ev.key === "Backspace") {
    if (ev.ctrlKey || ev.metaKey) {
      if (cursorPosition > 0) {
        const beforeCursor = input.slice(0, cursorPosition);
        const afterCursor = input.slice(cursorPosition);
        const match = beforeCursor.match(/[^ ]+ *$/);
        const removeLength = match ? match[0].length : 1;
        input = beforeCursor.slice(0, -removeLength) + afterCursor;
        cursorPosition -= removeLength;
        renderLine();
      }
    } else {
      if (cursorPosition > 0) {
        input = input.slice(0, cursorPosition - 1) +
          input.slice(cursorPosition);
        cursorPosition--;
        renderLine();
      }
    }
    return;
  }

  if (ev.key === "Delete") {
    if (ev.ctrlKey || ev.metaKey) {
      if (cursorPosition < input.length) {
        const beforeCursor = input.slice(0, cursorPosition);
        const afterCursor = input.slice(cursorPosition);
        const match = afterCursor.match(/^ *[^ ]+/);
        const removeLength = match ? match[0].length : 1;
        input = beforeCursor + afterCursor.slice(removeLength);
        renderLine();
      }
    } else {
      if (cursorPosition < input.length) {
        input = input.slice(0, cursorPosition) +
          input.slice(cursorPosition + 1);
        renderLine();
      }
    }
    return;
  }

  if (ev.key === "ArrowLeft") {
    if (cursorPosition > 0) {
      cursorPosition--;
      term.write("\x1b[D");
    }
    return;
  }

  if (ev.key === "ArrowRight") {
    if (cursorPosition < input.length) {
      cursorPosition++;
      term.write("\x1b[C");
    }
    return;
  }

  if (ev.key === "ArrowUp") {
    if (historyIndex > 0) {
      historyIndex--;
      input = history[historyIndex];
      cursorPosition = input.length;
      renderLine();
    }
    return;
  }

  if (ev.key === "ArrowDown") {
    if (historyIndex == history.length) {
      // do nothing
      return;
    }
    historyIndex++;
    input = history[historyIndex];
    cursorPosition = input.length;
    renderLine();
    return;
  }

  if (ev.key === "Home") {
    cursorPosition = 0;
    renderLine();
    return;
  }
  if (ev.key === "End") {
    cursorPosition = input.length;
    renderLine();
    return;
  }

  if (printable && key.length === 1) {
    input = input.slice(0, cursorPosition) + key + input.slice(cursorPosition);
    cursorPosition++;
    renderLine();
  }
});

term.onData((data) => {
  if (isBusy || data.length <= 1 || data.includes("\x1b")) return;
  const text = data.replace(/[\r\n]+/g, "");
  input = input.slice(0, cursorPosition) + text + input.slice(cursorPosition);
  cursorPosition += text.length;
  renderLine();
});

printWelcome();

const currentPath = window.location.pathname;
if (shouldAutoRunPath(currentPath)) {
  void runCommandForcibly(`curl ${appOrigin}${currentPath}`);
}
