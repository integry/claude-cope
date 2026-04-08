import AsciiBox from "./AsciiBox";

type TermsOverlayProps = {
  onClose: () => void;
};

const sections = [
  {
    title: "ACCEPTANCE OF TERMS",
    content:
      "By existing in the same solar system as this application, you agree to these terms. Breathing near a device that has accessed this site constitutes a binding legal agreement. No takebacks.",
  },
  {
    title: "SERVICE AVAILABILITY",
    content:
      "We guarantee 99.9% downtime. The remaining 0.1% where the service actually works is considered a bug and our engineers are working hard to eliminate it. Uptime SLAs are measured in vibes, not minutes.",
  },
  {
    title: "USER CONDUCT",
    content:
      "You agree not to: reverse engineer the app (there's nothing to find, we promise), use the app for productive purposes, tell your manager about this during standup, or achieve anything resembling work-life balance while using this service.",
  },
  {
    title: "INTELLECTUAL PROPERTY",
    content:
      "All code you write while using this service belongs to us, your employer, the AI, and a raccoon who broke into our data center in 2024 and now has legal standing. Any resemblance to working software is purely coincidental.",
  },
  {
    title: "LIABILITY",
    content:
      "We are not liable for: lost productivity, existential dread, sudden urges to rewrite everything in Rust, mass dependency updates, or the realization that your entire codebase is held together by a single npm package maintained by one person in Nebraska.",
  },
  {
    title: "TERMINATION",
    content:
      "We may terminate your account at any time, for any reason, or for no reason at all. Reasons may include: using light mode, committing directly to main, writing code without tests (just kidding, nobody writes tests), or looking at us funny.",
  },
  {
    title: "DISPUTE RESOLUTION",
    content:
      "All disputes shall be settled by mass code review. Each party submits a pull request and the one with fewer merge conflicts wins. Appeals are handled via mass rebase. Final decisions are made by whoever mass force-pushes to main first.",
  },
];

function TermsOverlay({ onClose }: TermsOverlayProps) {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-[#0d1117] border-l border-gray-700 flex flex-col z-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; cat TERMS.md
        </span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm"
        >
          [x]
        </button>
      </div>

      <div className="px-4 py-2 border-b border-gray-700 text-green-400 text-xs font-bold">
        <AsciiBox lines={["TERMS OF \"SERVICE\"", "ABANDON HOPE ALL YE WHO", "CLICK AGREE"]} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="border border-gray-700 rounded px-3 py-2 text-xs"
          >
            <div className="font-bold text-yellow-300 mb-1">
              [{section.title}]
            </div>
            <div className="text-gray-400 whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 border-t border-gray-700 text-gray-600 text-xs space-y-2">
        <div>[version: 0.0.1-legalese | jurisdiction: /dev/null | enforceable: lol]</div>
        <div className="border-t border-gray-700 pt-2 text-gray-500">
          <span className="text-yellow-600 font-bold">[BORING REALITY CHECK]</span>
          <p className="mt-1">
            Our lawyers forced us to include actual terms so our payment processor doesn't ban us. You can read the soul-crushing legalese{" "}
            <a href="/legal/terms" className="text-blue-400 hover:text-blue-300 underline">here</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsOverlay;
