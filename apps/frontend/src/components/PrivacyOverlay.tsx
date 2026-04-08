import AsciiBox from "./AsciiBox";

type PrivacyOverlayProps = {
  onClose: () => void;
};

const sections = [
  {
    title: "DATA COLLECTION",
    content:
      "We collect everything. Your keystrokes, your mouse movements, your frustrated sighs, and especially the mass of tabs you have open. We know about the 47 Stack Overflow tabs. We always know.",
  },
  {
    title: "DATA USAGE",
    content:
      "Your data is used to train our AI models, sold to the highest bidder, printed on t-shirts, and occasionally read aloud at company all-hands for entertainment. We also feed it to a neural network that generates passive-aggressive code review comments.",
  },
  {
    title: "COOKIES",
    content:
      "We use cookies. Not the fun kind. The kind that follow you around the internet like a needy ex. We also use super-cookies, mega-cookies, and one ultra-cookie that has achieved sentience and refuses to be deleted.",
  },
  {
    title: "THIRD PARTY SHARING",
    content:
      "We share your data with third parties, fourth parties, and a mysterious fifth party that none of us have ever met but who keeps showing up in the analytics dashboard. They seem nice.",
  },
  {
    title: "YOUR RIGHTS",
    content:
      "You have the right to request deletion of your data. We have the right to laugh at that request. Under GDPR, you can file a complaint. We will process it using the same queue as our tech debt backlog (estimated completion: heat death of the universe).",
  },
  {
    title: "SECURITY",
    content:
      "Your data is protected by state-of-the-art security measures including a password that is definitely not 'admin123', a firewall we found on GitHub, and Steve from IT who promises he 'knows what he's doing.'",
  },
];

function PrivacyOverlay({ onClose }: PrivacyOverlayProps) {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-[#0d1117] border-l border-gray-700 flex flex-col z-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; cat PRIVACY.md
        </span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm"
        >
          [x]
        </button>
      </div>

      <div className="px-4 py-2 border-b border-gray-700 text-green-400 text-xs font-bold">
        <AsciiBox lines={["PRIVACY \"POLICY\"", "YOUR DATA IS OUR DATA"]} />
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
        <div>[last updated: five minutes ago | effective: whenever we feel like it]</div>
        <div className="border-t border-gray-700 pt-2 text-gray-500">
          <span className="text-yellow-600 font-bold">[BORING REALITY CHECK]</span>
          <p className="mt-1">
            Our lawyers forced us to include an actual privacy policy so our payment processor doesn't ban us. You can read the soul-crushing legalese{" "}
            <a href="/legal/privacy" className="text-blue-400 hover:text-blue-300 underline">here</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyOverlay;
