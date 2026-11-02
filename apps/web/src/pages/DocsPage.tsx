import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronRight, Copy, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

type Provider = "openai" | "gemini" | "anthropic";
type Language = "Go" | "Python" | "JavaScript / TypeScript" | "Java";

const providers: { id: Provider; label: string; route: string; header: string }[] = [
  { id: "openai", label: "OpenAI", route: "/v1/chat/completions", header: "Authorization: Bearer" },
  { id: "gemini", label: "Google Gemini", route: "/v1beta/models/*", header: "x-goog-api-key" },
  { id: "anthropic", label: "Anthropic", route: "/anthropic/v1/*", header: "x-api-key" },
];

const languages: Language[] = ["Go", "Python", "JavaScript / TypeScript", "Java"];
const SETU_BASE_URL =
  import.meta.env.VITE_SETU_BASE_URL || "http://localhost:8080";

const guideSections = [
  ["introduction", "Introduction"],
  ["quick-start", "Quick start"],
  ["how-it-works", "How integration works"],
  ["openai", "OpenAI"],
  ["gemini", "Google Gemini"],
  ["anthropic", "Anthropic"],
  ["auth", "Authentication & API keys"],
  ["tracking", "Usage & request logs"],
  ["troubleshooting", "Troubleshooting"],
] as const;

const snippets: Record<Provider, Record<Language, { install: string; before: string; after: string; note: string }>> = {
  openai: {
    Go: {
      install: "go get github.com/openai/openai-go/v2",
      before: `client := openai.NewClient(
  option.WithAPIKey(os.Getenv("OPENAI_API_KEY")),
)

completion, err := client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
  Model: openai.F("gpt-4o-mini"),
  Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
    openai.UserMessage("Hello"),
  }),
})`,
      after: `client := openai.NewClient(
  option.WithAPIKey(os.Getenv("SETU_API_KEY")),
  option.WithBaseURL("${SETU_BASE_URL}/v1"),
)

completion, err := client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
  Model: openai.F("gpt-4o-mini"),
  Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
    openai.UserMessage("Hello"),
  }),
})`,
      note: "The official Go SDK keeps the request code the same; change the API key and base URL.",
    },
    Python: {
      install: "pip install openai",
      before: `from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello"}],
)`,
      after: `from openai import OpenAI

client = OpenAI(
    api_key=os.environ["SETU_API_KEY"],
    base_url="${SETU_BASE_URL}/v1",
)
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello"}],
)`,
      note: "OpenAI's Python client supports base_url, so no request-body rewrite is needed.",
    },
    "JavaScript / TypeScript": {
      install: "npm install openai",
      before: `import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello" }],
});`,
      after: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.SETU_API_KEY,
  baseURL: "${SETU_BASE_URL}/v1",
});
const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello" }],
});`,
      note: "The official Node SDK uses baseURL for compatible gateways.",
    },
    Java: {
      install: "Add com.openai:openai-java to your build.",
      before: `OpenAIClient client = OpenAIOkHttpClient.builder()
    .apiKey(System.getenv("OPENAI_API_KEY"))
    .build();

ChatCompletion response = client.chat().completions().create(
    ChatCompletionCreateParams.builder()
        .model("gpt-4o-mini")
        .addUserMessage("Hello")
        .build()
);`,
      after: `OpenAIClient client = OpenAIOkHttpClient.builder()
    .apiKey(System.getenv("SETU_API_KEY"))
    .baseUrl("${SETU_BASE_URL}/v1")
    .build();

ChatCompletion response = client.chat().completions().create(
    ChatCompletionCreateParams.builder()
        .model("gpt-4o-mini")
        .addUserMessage("Hello")
        .build()
);`,
      note: "Use the base URL option provided by the version of the official Java SDK in your build.",
    },
  },
  gemini: {
    Go: {
      install: "go get google.golang.org/genai",
      before: `client, err := genai.NewClient(ctx, &genai.ClientConfig{
  APIKey: os.Getenv("GEMINI_API_KEY"),
})
response, err := client.Models.GenerateContent(
  ctx, "gemini-2.5-flash",
  genai.Text("Hello"), nil,
)`,
      after: `// Setu exposes Gemini's REST shape. Use net/http when your
// genai SDK version cannot override its base URL.
req, _ := http.NewRequest("POST",
  "${SETU_BASE_URL}/v1beta/models/gemini-2.5-flash:generateContent",
  strings.NewReader(\`{"contents":[{"parts":[{"text":"Hello"}]}]}\`))
req.Header.Set("x-goog-api-key", os.Getenv("SETU_API_KEY"))
req.Header.Set("Content-Type", "application/json")
response, err := http.DefaultClient.Do(req)`,
      note: "The Gemini SDK's custom endpoint option varies by SDK release. This HTTP example is the stable integration path for Setu.",
    },
    Python: {
      install: "pip install google-genai",
      before: `from google import genai

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
response = client.models.generate_content(
    model="gemini-2.5-flash", contents="Hello"
)`,
      after: `import requests

response = requests.post(
    "${SETU_BASE_URL}/v1beta/models/gemini-2.5-flash:generateContent",
    headers={"x-goog-api-key": os.environ["SETU_API_KEY"]},
    json={"contents": [{"parts": [{"text": "Hello"}]}]},
)`,
      note: "Use HTTP for Setu unless your installed google-genai release exposes and preserves a custom base URL.",
    },
    "JavaScript / TypeScript": {
      install: "npm install @google/genai",
      before: `import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash", contents: "Hello",
});`,
      after: `const response = await fetch(
  "${SETU_BASE_URL}/v1beta/models/gemini-2.5-flash:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.SETU_API_KEY!,
    },
    body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] }),
  },
);`,
      note: "The REST fallback avoids relying on version-specific @google/genai endpoint options.",
    },
    Java: {
      install: "Use the current com.google.genai library for direct Gemini calls.",
      before: `Client client = new Client.Builder()
    .apiKey(System.getenv("GEMINI_API_KEY"))
    .build();
GenerateContentResponse response = client.models
    .generateContent("gemini-2.5-flash", "Hello", null);`,
      after: `HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${SETU_BASE_URL}/v1beta/models/"
        + "gemini-2.5-flash:generateContent"))
    .header("x-goog-api-key", System.getenv("SETU_API_KEY"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(
        "{\\"contents\\":[{\\"parts\\":[{\\"text\\":\\"Hello\\"}]}]}"))
    .build();
HttpResponse<String> response = HttpClient.newHttpClient()
    .send(request, HttpResponse.BodyHandlers.ofString());`,
      note: "Use Java's HTTP client for the Setu route when your GenAI SDK version cannot configure a custom endpoint.",
    },
  },
  anthropic: {
    Go: {
      install: "go get github.com/anthropics/anthropic-sdk-go",
      before: `client := anthropic.NewClient(
  option.WithAPIKey(os.Getenv("ANTHROPIC_API_KEY")),
)
message, err := client.Messages.New(ctx, anthropic.MessageNewParams{
  Model: anthropic.F("claude-3-5-sonnet-20241022"),
  MaxTokens: anthropic.F(int64(1024)),
  Messages: anthropic.F([]anthropic.MessageParam{
    anthropic.NewUserMessage(anthropic.NewTextBlock("Hello")),
  }),
})`,
      after: `client := anthropic.NewClient(
  option.WithAPIKey(os.Getenv("SETU_API_KEY")),
  option.WithBaseURL("${SETU_BASE_URL}/anthropic"),
)
message, err := client.Messages.New(ctx, anthropic.MessageNewParams{
  Model: anthropic.F("claude-3-5-sonnet-20241022"),
  MaxTokens: anthropic.F(int64(1024)),
  Messages: anthropic.F([]anthropic.MessageParam{
    anthropic.NewUserMessage(anthropic.NewTextBlock("Hello")),
  }),
})`,
      note: "The Anthropic SDK's Messages path is preserved below Setu's /anthropic prefix.",
    },
    Python: {
      install: "pip install anthropic",
      before: `import anthropic

client = anthropic.Anthropic(
    api_key=os.environ["ANTHROPIC_API_KEY"]
)
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
)`,
      after: `import anthropic

client = anthropic.Anthropic(
    api_key=os.environ["SETU_API_KEY"],
    base_url="${SETU_BASE_URL}/anthropic",
)
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
)`,
      note: "Anthropic's Python client supports base_url and continues to send the Messages request shape.",
    },
    "JavaScript / TypeScript": {
      install: "npm install @anthropic-ai/sdk",
      before: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
const message = await client.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello" }],
});`,
      after: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.SETU_API_KEY,
  baseURL: "${SETU_BASE_URL}/anthropic",
});
const message = await client.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello" }],
});`,
      note: "The official TypeScript SDK supports baseURL for compatible endpoints.",
    },
    Java: {
      install: "Add the official Anthropic Java SDK to your build.",
      before: `AnthropicClient client = AnthropicOkHttpClient.builder()
    .apiKey(System.getenv("ANTHROPIC_API_KEY"))
    .build();
Message message = client.messages().create(
    MessageCreateParams.builder()
        .model("claude-3-5-sonnet-20241022")
        .maxTokens(1024)
        .addUserMessage("Hello")
        .build()
);`,
      after: `AnthropicClient client = AnthropicOkHttpClient.builder()
    .apiKey(System.getenv("SETU_API_KEY"))
    .baseUrl("${SETU_BASE_URL}/anthropic")
    .build();
Message message = client.messages().create(
    MessageCreateParams.builder()
        .model("claude-3-5-sonnet-20241022")
        .maxTokens(1024)
        .addUserMessage("Hello")
        .build()
);`,
      note: "Use the base URL option available in the version of the official Anthropic Java SDK you install.",
    },
  },
};

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="docs-code">
      <div className="docs-code-top">
        <span>{label}</span>
        <button type="button" onClick={copy}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre><code>{highlightCode(code)}</code></pre>
    </div>
  );
}

function highlightCode(code: string): ReactNode[] {
  const tokenPattern =
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|#[^\n]*|\b(?:const|let|var|import|from|return|new|function|class|if|else|for|async|await|func|package|type|public|private|void|String|int|true|false|null|None)\b)/g;
  const tokens: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(code))) {
    if (match.index > cursor) tokens.push(code.slice(cursor, match.index));
    const token = match[0];
    const className =
      token.startsWith("//") || token.startsWith("#")
        ? "docs-token-comment"
        : token.startsWith('"') || token.startsWith("'") || token.startsWith("`")
          ? "docs-token-string"
          : /^(true|false|null|None)$/.test(token)
            ? "docs-token-constant"
            : "docs-token-keyword";
    tokens.push(<span className={className} key={`${match.index}-${token}`}>{token}</span>);
    cursor = match.index + token.length;
  }

  if (cursor < code.length) tokens.push(code.slice(cursor));
  return tokens;
}

function MethodPill({ method }: { method: string }) {
  return <span className={`docs-method docs-method-${method.toLowerCase()}`}>{method}</span>;
}

export default function DocsPage() {
  const [provider, setProvider] = useState<Provider>("openai");
  const [language, setLanguage] = useState<Language>("Python");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("introduction");

  useEffect(() => {
    const observers = guideSections.map(([id]) => {
      const element = document.getElementById(id);
      if (!element) return null;
      const observer = new IntersectionObserver(
        ([entry]) => entry.isIntersecting && setActive(id),
        { rootMargin: "-90px 0px -65% 0px" },
      );
      observer.observe(element);
      return observer;
    });
    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  const activeLabel = useMemo(
    () => guideSections.find(([id]) => id === active)?.[1] ?? "Docs",
    [active],
  );

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <main className="docs-page">
      <header className="docs-header">
        <Link to="/" className="docs-brand"><img src="/Setu_Icon.svg" alt="" /><span>Setu</span></Link>
        <div className="docs-header-actions">
          <span>INTEGRATION DOCS / 001</span>
          <Link to="/dashboard">Dashboard <ChevronRight size={13} /></Link>
          <button type="button" className="docs-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <div className="docs-shell">
        <aside className={`docs-sidebar${mobileOpen ? " is-open" : ""}`}>
          <p className="docs-sidebar-label"><i /> SETU / DEVELOPER GUIDE</p>
          {(["Getting started", "Provider integrations", "Additional guides"] as const).map((group) => (
            <div className="docs-nav-group" key={group}>
              <p>{group}</p>
              {guideSections.filter(([id]) =>
                group === "Getting started" ? ["introduction", "quick-start", "how-it-works"].includes(id)
                  : group === "Provider integrations" ? ["openai", "gemini", "anthropic"].includes(id)
                    : ["auth", "tracking", "troubleshooting"].includes(id),
              ).map(([id, label]) => (
                <button type="button" key={id} className={active === id ? "is-active" : ""} onClick={() => jump(id)}>
                  {label}{active === id && <ChevronRight size={13} />}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <article className="docs-content">
          <div className="docs-breadcrumb">Docs <ChevronRight size={12} /> {activeLabel}</div>
          <section id="introduction" className="docs-section docs-intro">
            <p className="docs-eyebrow">SETU / DEVELOPER INTEGRATION</p>
            <h1>Keep your SDK.<br /><em>Change the route.</em></h1>
            <p className="docs-lede">Setu sits between your application and your LLM provider. Replace the provider endpoint and key, keep your request logic, and get project-level usage, cost tracking, and budget controls.</p>
            <div className="docs-provider-strip">{providers.map((item) => <button key={item.id} type="button" className={provider === item.id ? "is-active" : ""} onClick={() => { setProvider(item.id); jump(item.id); }}>{item.label}</button>)}</div>
          </section>

          <section id="quick-start" className="docs-section">
            <Heading index="01" title="Quick start" />
            <p>Create a project in the Setu dashboard, configure its provider credential and monthly budget, then copy the generated project API key. Point your existing SDK at your local or deployed Setu URL.</p>
            <CodeBlock label="first request / OpenAI-compatible" code={`curl -X POST ${SETU_BASE_URL}/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_SETU_OPENAI_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'`} />
            <p className="docs-small">Use the same Setu API key in your application, never the upstream provider key. Keep it server-side.</p>
          </section>

          <section id="how-it-works" className="docs-section">
            <Heading index="02" title="How integration works" />
            <div className="docs-steps"><span>01 <b>Provider SDK</b></span><ChevronRight size={15} /><span>02 <b>Setu URL + key</b></span><ChevronRight size={15} /><span>03 <b>Provider-native request</b></span></div>
            <p>Setu preserves each provider's request format. The only required migration changes are the base URL and credential header. The provider model and request body stay in the provider's native format.</p>
          </section>

          {(["openai", "gemini", "anthropic"] as Provider[]).map((id, index) => {
            const info = providers.find((item) => item.id === id)!;
            return (
              <section id={id} className="docs-section provider-section" key={id}>
                <Heading index={`0${index + 3}`} title={`${info.label} integration`} />
                <p>Route {info.label} requests through <code>{info.route}</code>. Select your language, compare the direct provider setup, then apply the smallest Setu configuration change.</p>
                <div className="docs-language-tabs">{languages.map((item) => <button type="button" key={item} className={provider === id && language === item ? "is-active" : ""} onClick={() => { setProvider(id); setLanguage(item); }}>{item}</button>)}</div>
                <div className="docs-guide-meta"><MethodPill method="POST" /><code>{info.route}</code><span>header: {info.header}</span></div>
                <p className="docs-install"><span>Install</span> <code>{snippets[id][language].install}</code></p>
                <div className="docs-before-after">
                  <div><h3>Before Setu <small>direct provider</small></h3><CodeBlock label={`${language} / provider`} code={snippets[id][language].before} /></div>
                  <div><h3>After Setu <small>same SDK or HTTP fallback</small></h3><CodeBlock label={`${language} / setu`} code={snippets[id][language].after} /></div>
                </div>
                <div className="docs-note"><strong>What changed</strong><span>{snippets[id][language].note}</span></div>
                <Comparison provider={id} />
              </section>
            );
          })}

          <section id="auth" className="docs-section">
            <Heading index="06" title="Authentication & API keys" />
            <p>Project keys authenticate gateway traffic and are provider-specific at the route boundary. Use the header shown in the integration guide. Dashboard routes use the JWT returned by Google sign-in and are separate from gateway keys.</p>
            <div className="docs-key-table"><span>Provider</span><span>Setu gateway header</span>{providers.map((item) => <><b key={`${item.id}-name`}>{item.label}</b><code key={`${item.id}-header`}>{item.header}</code></>)}</div>
          </section>

          <section id="tracking" className="docs-section">
            <Heading index="07" title="Usage & request logs" />
            <p>After a successful request, Setu parses provider usage metadata, calculates model cost, updates project spend, and stores the request for the dashboard.</p>
            <div className="docs-endpoints"><div><MethodPill method="GET" /><code>/api/v1/projects/{`{id}`}/logs</code></div><div><MethodPill method="GET" /><code>/api/v1/projects/{`{id}`}/overview</code></div></div>
          </section>

          <section id="troubleshooting" className="docs-section">
            <Heading index="08" title="Troubleshooting" />
            <ul className="docs-troubleshoot"><li><b>401 or invalid key:</b> use the project key and the provider-specific header; do not send the upstream key.</li><li><b>Requests do not appear in logs:</b> confirm the request reached the Setu URL and that the provider returned usage metadata.</li><li><b>Request blocked:</b> check the project's monthly budget and spend in the dashboard.</li><li><b>Gemini SDK cannot set an endpoint:</b> use the HTTP example in the Gemini guide; it matches Setu's implemented REST route.</li></ul>
          </section>
        </article>

        <aside className="docs-toc"><p>ON THIS PAGE</p><button type="button" onClick={() => jump(active)}>{activeLabel}</button><i /><small>Scroll to explore</small></aside>
      </div>
      <style>{styles}</style>
      <style>{readabilityStyles}</style>
    </main>
  );
}

function Heading({ index, title }: { index: string; title: string }) {
  return <div className="docs-heading"><span>{index}</span><h2>{title}</h2></div>;
}

function Comparison({ provider }: { provider: Provider }) {
  const keyName = provider === "gemini" ? "x-goog-api-key" : provider === "anthropic" ? "x-api-key" : "Authorization: Bearer";
  return <div className="docs-comparison"><div><b>Configuration</b><b>Direct provider</b><b>Through Setu</b></div><div><span>Endpoint</span><code>Provider endpoint</code><code>{SETU_BASE_URL}{providers.find((item) => item.id === provider)?.route.replace("*", "…")}</code></div><div><span>Credential</span><code>Provider key</code><code>Setu project key ({keyName})</code></div><div><span>Application logic</span><code>Provider SDK</code><code>Same SDK or HTTP fallback</code></div></div>;
}

const styles = `
.docs-page{min-height:100vh;background:#070707;color:#e8e8ea;font-family:"Geist",sans-serif}.docs-header{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;height:68px;padding:0 clamp(20px,4vw,56px);border-bottom:1px solid #1c1c20;background:rgba(7,7,7,.95);backdrop-filter:blur(14px)}.docs-brand{display:flex;align-items:center;gap:9px;color:#f7f7f7;font-size:17px;font-weight:600;letter-spacing:-.04em;text-decoration:none}.docs-brand img{width:28px;height:28px}.docs-header-actions{display:flex;align-items:center;gap:22px;color:#656872;font:9px "JetBrains Mono",monospace;letter-spacing:.13em}.docs-header-actions a{display:flex;align-items:center;gap:4px;color:#9da0aa;font:10px "JetBrains Mono",monospace;text-decoration:none}.docs-header-actions a:hover{color:#e879f9}.docs-menu{display:none;border:0;background:transparent;color:#ddd;cursor:pointer}.docs-shell{display:grid;grid-template-columns:220px minmax(0,760px) 140px;gap:clamp(35px,5vw,82px);width:min(1260px,calc(100% - 48px));margin:auto}.docs-sidebar{position:sticky;top:68px;align-self:start;height:calc(100vh - 68px);padding-top:40px}.docs-sidebar-label,.docs-eyebrow,.docs-nav-group>p,.docs-toc,.docs-code-top,.docs-method{font-family:"JetBrains Mono",monospace}.docs-sidebar-label{display:flex;align-items:center;gap:8px;margin:0 0 34px;color:#777984;font-size:9px;letter-spacing:.12em;white-space:nowrap}.docs-sidebar-label i{width:5px;height:5px;background:#67e8f9;box-shadow:0 0 0 4px #67e8f914}.docs-nav-group{margin-bottom:26px}.docs-nav-group>p{margin:0 0 9px;color:#555862;font-size:9px;letter-spacing:.12em;text-transform:uppercase}.docs-nav-group button{display:flex;align-items:center;justify-content:space-between;width:100%;padding:7px 9px;border:0;border-left:1px solid transparent;background:transparent;color:#858791;font-size:12px;text-align:left;cursor:pointer}.docs-nav-group button:hover{color:#fff}.docs-nav-group button.is-active{border-left-color:#e879f9;background:#e879f914;color:#f5d6fa}.docs-content{min-width:0;padding:42px 0 100px}.docs-breadcrumb{display:flex;align-items:center;gap:7px;margin-bottom:58px;color:#656872;font:9px "JetBrains Mono",monospace;letter-spacing:.1em;text-transform:uppercase}.docs-section{scroll-margin-top:96px;padding:24px 0 72px;border-bottom:1px solid #1b1b1f}.docs-intro{padding-top:0}.docs-eyebrow{margin:0 0 22px;color:#67e8f9;font-size:10px;letter-spacing:.14em}.docs-intro h1{margin:0;color:#f7f7f8;font-size:clamp(45px,6vw,72px);font-weight:600;letter-spacing:-.075em;line-height:.95}.docs-intro h1 em{color:#e879f9;font-style:normal}.docs-lede{max-width:620px;margin:27px 0 28px;color:#9b9da7;font-size:16px;line-height:1.75}.docs-provider-strip{display:flex;flex-wrap:wrap;gap:8px}.docs-provider-strip button,.docs-language-tabs button{border:1px solid #27282c;background:#0d0e10;color:#888b95;font:10px "JetBrains Mono",monospace;cursor:pointer}.docs-provider-strip button{padding:9px 13px}.docs-provider-strip button.is-active,.docs-language-tabs button.is-active{border-color:#e879f9;color:#f3c9f8;background:#e879f912}.docs-heading{display:flex;align-items:baseline;gap:14px;margin-bottom:20px}.docs-heading>span{color:#e879f9;font:10px "JetBrains Mono",monospace}.docs-heading h2{margin:0;color:#f3f3f4;font-size:28px;letter-spacing:-.04em}.docs-section p{color:#a0a1aa;font-size:14px;line-height:1.75}.docs-section code,.docs-note,.docs-comparison code,.docs-key-table code{font-family:"JetBrains Mono",monospace;font-size:.88em}.docs-section p code{color:#d7a4df}.docs-steps{display:flex;align-items:center;gap:13px;margin:25px 0;color:#666a74;font:10px "JetBrains Mono",monospace}.docs-steps span{display:flex;gap:8px;align-items:center}.docs-steps b{color:#e0e0e2;font-weight:500}.docs-steps svg{color:#e879f9}.docs-code{margin:17px 0;overflow:hidden;border:1px solid #27282c;background:#0d0e10}.docs-code-top{display:flex;justify-content:space-between;padding:9px 13px;border-bottom:1px solid #242529;color:#666a74;font-size:9px;letter-spacing:.1em;text-transform:uppercase}.docs-code-top button{display:flex;align-items:center;gap:6px;border:0;background:transparent;color:#858994;font:inherit;cursor:pointer}.docs-code-top button:hover{color:#e879f9}.docs-code pre{overflow:auto;margin:0;padding:16px;color:#d0d2d7;font:11px/1.75 "JetBrains Mono",monospace}.docs-small{color:#70737d!important;font-size:12px!important}.provider-section>p code{color:#d7a4df}.docs-language-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:25px 0 17px}.docs-language-tabs button{padding:8px 10px}.docs-guide-meta{display:flex;align-items:center;gap:10px;color:#777b84;font:10px "JetBrains Mono",monospace}.docs-guide-meta code{color:#d7a4df}.docs-method{display:inline-flex;align-items:center;justify-content:center;min-width:42px;color:#67e8f9;font-size:9px}.docs-method-post{color:#e879f9}.docs-install{margin:18px 0!important;color:#777b84!important;font:11px "JetBrains Mono",monospace!important}.docs-install span{margin-right:12px;color:#555862;text-transform:uppercase}.docs-install code{color:#d4a9dc}.docs-before-after{display:grid;grid-template-columns:1fr 1fr;gap:15px}.docs-before-after h3{margin:12px 0 0;color:#e6e6e8;font-size:13px;font-weight:500}.docs-before-after h3 small{margin-left:7px;color:#62656e;font:9px "JetBrains Mono",monospace}.docs-note{display:flex;gap:14px;margin:22px 0;padding:13px 15px;border-left:2px solid #67e8f9;background:#0c1416;color:#9ca4a7;line-height:1.6}.docs-note strong{flex:0 0 auto;color:#67e8f9;font-weight:500}.docs-comparison{margin-top:24px;border:1px solid #26272b;font-size:12px}.docs-comparison>div{display:grid;grid-template-columns:1.1fr 1fr 1fr;border-bottom:1px solid #222328}.docs-comparison>div:last-child{border:0}.docs-comparison>div>*{padding:10px 12px;border-right:1px solid #222328}.docs-comparison>div>*:last-child{border:0}.docs-comparison b{color:#777b84;font:9px "JetBrains Mono",monospace;text-transform:uppercase}.docs-comparison span{color:#9a9ca5}.docs-comparison code{color:#c6a5ca}.docs-key-table{display:grid;grid-template-columns:1fr 2fr;margin-top:24px;border:1px solid #26272b;font-size:12px}.docs-key-table>*{padding:12px;border-bottom:1px solid #222328}.docs-key-table span{color:#777b84;font:9px "JetBrains Mono",monospace;text-transform:uppercase}.docs-key-table b{font-weight:500}.docs-key-table code{color:#d7a4df}.docs-endpoints{display:grid;gap:8px;margin-top:22px}.docs-endpoints>div{display:flex;align-items:center;gap:13px;padding:12px;border:1px solid #242529;background:#0d0e10}.docs-endpoints code{color:#c6c8ce}.docs-troubleshoot{display:grid;gap:14px;margin:0;padding-left:18px;color:#a0a1aa;font-size:14px;line-height:1.7}.docs-troubleshoot b{color:#e4e4e6;font-weight:500}.docs-toc{position:sticky;top:108px;align-self:start;padding-top:48px;color:#646771;font-size:9px;letter-spacing:.12em}.docs-toc p{margin:0 0 12px}.docs-toc button{padding:0;border:0;background:transparent;color:#d0a2d8;font:10px "JetBrains Mono",monospace;text-align:left;cursor:pointer}.docs-toc i{display:block;width:1px;height:65px;margin:18px 0 14px 2px;background:linear-gradient(#e879f9,transparent)}.docs-toc small{color:#484b54;font-size:8px}@media(max-width:1050px){.docs-shell{grid-template-columns:200px minmax(0,1fr);gap:38px}.docs-toc{display:none}}@media(max-width:720px){.docs-header{height:62px}.docs-header-actions>span,.docs-header-actions>a{display:none}.docs-menu{display:block}.docs-shell{display:block;width:calc(100% - 32px)}.docs-sidebar{position:fixed;inset:62px 0 auto;z-index:15;display:none;height:auto;max-height:calc(100vh - 62px);overflow:auto;padding:24px 20px 30px;border-bottom:1px solid #27272b;background:#0b0b0c}.docs-sidebar.is-open{display:block}.docs-content{padding-top:28px}.docs-breadcrumb{margin-bottom:42px}.docs-intro h1{font-size:clamp(43px,13vw,64px)}.docs-lede{font-size:14px}.docs-before-after{grid-template-columns:1fr}.docs-comparison{overflow-x:auto}.docs-comparison>div{min-width:610px}.docs-steps{flex-wrap:wrap}.docs-section{padding-bottom:54px}.docs-key-table{font-size:11px}}
`;

const readabilityStyles = `
  .docs-page {
    background: #0b0b0c;
    color: #e4e4e7;
  }
  .docs-header {
    height: 64px;
    border-bottom-color: #242428;
    background: #0b0b0c;
    backdrop-filter: none;
  }
  .docs-header-actions {
    font-size: 11px;
    letter-spacing: .04em;
  }
  .docs-header-actions a {
    font-size: 12px;
    letter-spacing: 0;
  }
  .docs-shell {
    grid-template-columns: 248px minmax(0, 900px) 160px;
    gap: 48px;
    width: min(1420px, calc(100% - 64px));
  }
  .docs-sidebar {
    top: 64px;
    height: calc(100vh - 64px);
    padding-top: 32px;
  }
  .docs-sidebar-label {
    margin-bottom: 30px;
    font-size: 11px;
    letter-spacing: .05em;
  }
  .docs-nav-group {
    margin-bottom: 28px;
  }
  .docs-nav-group > p {
    margin-bottom: 10px;
    font-size: 12px;
    letter-spacing: .02em;
  }
  .docs-nav-group button {
    padding: 8px 10px;
    font-size: 14px;
    line-height: 1.4;
  }
  .docs-content {
    padding: 40px 0 96px;
  }
  .docs-breadcrumb {
    margin-bottom: 42px;
    font-size: 11px;
    letter-spacing: .03em;
  }
  .docs-section {
    padding: 28px 0 64px;
  }
  .docs-intro h1 {
    font-size: clamp(36px, 4vw, 48px);
    letter-spacing: -.055em;
    line-height: 1.08;
  }
  .docs-eyebrow {
    margin-bottom: 18px;
    color: #a7a7ad;
    font-size: 11px;
    letter-spacing: .05em;
  }
  .docs-lede {
    max-width: 700px;
    margin: 22px 0 28px;
    color: #b7b7bd;
    font-size: 17px;
    line-height: 1.7;
  }
  .docs-section p {
    max-width: 780px;
    color: #b8b8bf;
    font-size: 16px;
    line-height: 1.75;
  }
  .docs-heading {
    gap: 12px;
    margin-bottom: 18px;
  }
  .docs-heading > span {
    font-size: 12px;
  }
  .docs-heading h2 {
    font-size: 26px;
    letter-spacing: -.025em;
  }
  .docs-provider-strip button,
  .docs-language-tabs button {
    font-family: "Geist", sans-serif;
    font-size: 14px;
    letter-spacing: 0;
  }
  .docs-provider-strip button {
    padding: 9px 14px;
  }
  .docs-language-tabs {
    margin: 24px 0 20px;
  }
  .docs-language-tabs button {
    padding: 9px 12px;
  }
  .docs-steps {
    gap: 16px;
    font-size: 12px;
  }
  .docs-code {
    margin: 20px 0;
    border-color: #303037;
    border-radius: 4px;
    background: #111216;
  }
  .docs-code-top {
    padding: 10px 14px;
    background: #17181d;
    color: #a1a1aa;
    font-size: 11px;
    letter-spacing: .03em;
    text-transform: none;
  }
  .docs-code-top button {
    color: #b2b2ba;
    font-family: "Geist", sans-serif;
    font-size: 12px;
    letter-spacing: 0;
  }
  .docs-code pre {
    min-height: 92px;
    padding: 20px;
    color: #d4d4d8;
    font-size: 14px;
    line-height: 1.8;
  }
  .docs-token-keyword { color: #c586c0; }
  .docs-token-string { color: #ce9178; }
  .docs-token-comment { color: #6a9955; }
  .docs-token-constant { color: #569cd6; }
  .docs-guide-meta,
  .docs-install {
    font-size: 12px !important;
  }
  .docs-install code,
  .docs-section code,
  .docs-comparison code,
  .docs-key-table code {
    font-size: 13px;
  }
  .docs-before-after {
    grid-template-columns: 1fr;
    gap: 26px;
  }
  .docs-before-after h3 {
    margin-bottom: 4px;
    font-size: 18px;
  }
  .docs-before-after h3 small {
    margin-left: 8px;
    font-size: 11px;
  }
  .docs-note {
    max-width: 780px;
    padding: 14px 16px;
    border-left-color: #555862;
    background: #151519;
    font-family: "Geist", sans-serif;
    font-size: 14px;
  }
  .docs-note strong {
    color: #e879f9;
  }
  .docs-comparison {
    max-width: 780px;
    font-size: 14px;
  }
  .docs-comparison b {
    font-size: 11px;
  }
  .docs-comparison > div > * {
    padding: 13px 14px;
  }
  .docs-key-table {
    max-width: 780px;
    font-size: 14px;
  }
  .docs-key-table span {
    font-size: 11px;
  }
  .docs-endpoints > div {
    max-width: 780px;
    padding: 14px;
  }
  .docs-troubleshoot {
    max-width: 780px;
    font-size: 16px;
    line-height: 1.75;
  }
  .docs-toc {
    top: 96px;
    padding-top: 40px;
    font-size: 11px;
    letter-spacing: .03em;
  }
  .docs-toc p {
    font-size: 11px;
    letter-spacing: .03em;
  }
  .docs-toc button {
    font-size: 12px;
    letter-spacing: 0;
  }
  @media (max-width: 1050px) {
    .docs-shell {
      grid-template-columns: 220px minmax(0, 1fr);
      width: min(100% - 48px, 900px);
    }
  }
  @media (max-width: 720px) {
    .docs-header {
      height: 60px;
    }
    .docs-shell {
      width: calc(100% - 32px);
    }
    .docs-sidebar {
      top: 60px;
    }
    .docs-content {
      padding-top: 28px;
    }
    .docs-section p,
    .docs-lede {
      font-size: 16px;
    }
    .docs-code pre {
      font-size: 13px;
    }
  }
`;
