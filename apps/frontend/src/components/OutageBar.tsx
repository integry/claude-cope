const DAMAGE_COMMANDS = ["kubectl restart pods", "ssh prod-01", "git revert HEAD"];

export function OutageBar({ outageHp }: { outageHp: number }) {
  return (
    <div className="mb-2 border border-red-500 rounded p-2 bg-red-950">
      <div className="flex items-center justify-between text-red-400 text-xs mb-1">
        <span className="font-bold">[PROD OUTAGE] AWS us-east-1</span>
        <span>{outageHp}% HP</span>
      </div>
      <div className="h-3 bg-red-900 rounded overflow-hidden">
        <div
          className="h-full bg-red-500 transition-all duration-300 rounded"
          style={{ width: `${outageHp}%` }}
        />
      </div>
      <div className="mt-2 text-red-300 text-xs">
        <span className="font-bold">Type to deal damage:</span>{" "}
        {DAMAGE_COMMANDS.map((cmd, i) => (
          <span key={cmd}>
            <code className="bg-red-900 px-1 rounded text-red-200">{cmd}</code>
            {i < DAMAGE_COMMANDS.length - 1 && ", "}
          </span>
        ))}
      </div>
    </div>
  );
}

export { DAMAGE_COMMANDS };
