import { useState } from "react";

function App() {
  const [response, setResponse] = useState<string>("");

  async function handleTestApi() {
    const res = await fetch("/api/chat", { method: "POST" });
    const data = await res.json();
    setResponse(data.message);
  }

  return (
    <div>
      <h1>Claude Cope</h1>
      <button onClick={handleTestApi}>Test API</button>
      {response && <p>{response}</p>}
    </div>
  );
}

export default App;
