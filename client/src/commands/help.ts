import type { Terminal } from "@xterm/xterm";
import { appOrigin } from "../lib/const";
import { isMobileDevice } from "../lib/util";
import { ansi } from "../../../shared/ansi";

export function helpCommand(term: Terminal) {
  const helps = [
    "help                 利用可能なコマンド一覧を表示 (この画面)",
    "clear                ターミナルをクリア",
    "curl <url>           指定したURLの内容を取得して表示",
    `  - ${appOrigin}/`,
    `  - ${appOrigin}/articles`,
    `  - ${appOrigin}/works`,
    `  - ${appOrigin}/featured-series`,
    `  - ${appOrigin}/featured-tracks`,
    "    ^^^ リンクをクリックすることで curl コマンドを実行できます",
  ];
  helps.forEach((line) => term.writeln(line));

  if (isMobileDevice) {
    term.writeln("");
    term.writeln(
      `${
        ansi.yellow(ansi.bold("[WARN]"))
      } モバイルデバイスでは使いづらいことが想定されるので ${
        ansi.blue("https://2025.cp20.dev")
      } も併せてご覧ください`,
    );
  }
}
