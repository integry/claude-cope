/** Renders a centered ASCII box header used in overlay panels. */
export default function AsciiBox({ lines }: { lines: string[] }) {
  const maxLen = Math.max(...lines.map((l) => l.length));
  const innerWidth = maxLen + 4; // 2 padding each side
  const border = "=".repeat(innerWidth);

  const pad = (text: string) => {
    const padding = innerWidth - text.length;
    const left = Math.floor(padding / 2);
    const right = padding - left;
    return " ".repeat(left) + text + " ".repeat(right);
  };

  const box = [
    `+${border}+`,
    ...lines.map((l) => `|${pad(l)}|`),
    `+${border}+`,
  ].join("\n");

  return <pre className="text-green-400 text-xs font-bold">{box}</pre>;
}
