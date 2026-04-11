import AsciiBox from "./AsciiBox";

type ContactOverlayProps = {
  onClose: () => void;
};

const sections = [
  {
    title: "SUPPORT EMAIL",
    content:
      "Send all support requests to /dev/null. Response time: between now and never. Our support team consists of a chatbot trained exclusively on passive-aggressive Stack Overflow answers and a pile of unread Jira tickets.",
  },
  {
    title: "BUG REPORTS",
    content:
      "To report a bug, simply scream into the void. Alternatively, open a GitHub issue — it will be automatically labeled 'wontfix', assigned to nobody, and closed by a bot 90 days later with the message 'stale: closing due to inactivity.'",
  },
  {
    title: "FEATURE REQUESTS",
    content:
      "We accept feature requests via carrier pigeon, smoke signal, or interpretive dance. All requests are carefully reviewed and then added to a backlog that hasn't been groomed since 2019. Current backlog size: yes.",
  },
  {
    title: "BUSINESS INQUIRIES",
    content:
      "For partnership opportunities, please prepare a 47-slide deck about 'synergies' and 'paradigm shifts.' Our business development team will review it right after they finish their current task of staring blankly at a Gantt chart.",
  },
  {
    title: "OFFICE HOURS",
    content:
      "Our office hours are Monday through Friday, 3:00 AM to 3:05 AM (timezone: whichever one makes it most inconvenient for you). We are closed on all days that end in 'y' and during any sprint retrospective that could have been an email.",
  },
  {
    title: "EMERGENCY CONTACT",
    content:
      "In case of production outage: have you tried turning it off and on again? If the problem persists, check if someone deployed on a Friday. They did, didn't they. They always do.",
  },
];

function ContactOverlay({ onClose }: ContactOverlayProps) {
  return (
    <div className="fixed right-0 top-0 h-full w-80 border-l border-gray-700 flex flex-col z-20" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; cat CONTACT.md
        </span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm"
        >
          [x]
        </button>
      </div>

      <div className="px-4 py-2 border-b border-gray-700 text-green-400 text-xs font-bold">
        <AsciiBox lines={["CONTACT \"US\"", "MESSAGES GO TO /dev/null"]} />
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
        <div>[response time: never | satisfaction: not guaranteed | staff: 0]</div>
        <div className="border-t border-gray-700 pt-2 text-gray-500">
          <span className="text-yellow-600 font-bold">[LEGAL COMPLIANCE OVERRIDE]</span>
          <p className="mt-1">
            If you are a payment processor or someone who actually needs a refund because your boss didn't appreciate the joke, <em>sigh</em>... fine. Email us at{" "}
            <a href="mailto:support@claudecope.com" className="text-blue-400 hover:text-blue-300 underline">support@claudecope.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ContactOverlay;
