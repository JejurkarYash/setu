import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------
   Quick Start
   - Every example is generated from one request spec per provider, so the
     URL, headers and body can never drift apart between languages.
   - Language tabs are text only. Provider marks load from /public/logos/
     (openai.svg, anthropic.svg, gemini.svg) and fall back to a neutral
     monogram; nothing is hand-drawn.
   - The route strip above the code shows the same idea as the rest of the
     page: your app, Setu, then the selected provider.
   - Endpoints and response bodies are illustrative: confirm the host,
     paths and header names against your real API before shipping.
------------------------------------------------------------------- */

const ease = [0.16, 1, 0.3, 1] as const;
const css = (o: Record<string, string | number>) => o as CSSProperties;

type LangId =
  | "go"
  | "python"
  | "typescript"
  | "javascript"
  | "curl"
  | "java"
  | "php"
  | "ruby";
type ProviderId = "openai" | "anthropic" | "gemini";

const LANGUAGES: { id: LangId; label: string }[] = [
  { id: "go", label: "Go" },
  { id: "python", label: "Python" },
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "curl", label: "cURL" },
  { id: "java", label: "Java" },
  { id: "php", label: "PHP" },
  { id: "ruby", label: "Ruby" },
];

const PROMPT = "Hello through Setu gateway!";
const HOST =
  import.meta.env.VITE_SETU_BASE_URL || "http://localhost:8080";

type Provider = {
  id: ProviderId;
  label: string;
  logo: string;
  endpoint: string;
  headers: [string, string][];
  body: unknown;
  response: string;
};

const PROVIDERS: Provider[] = [
  {
    id: "openai",
    label: "OpenAI",
    logo: "/logos/openai.svg",
    endpoint: "/v1/chat/completions",
    headers: [
      ["Content-Type", "application/json"],
      ["Authorization", "Bearer {KEY}"],
    ],
    body: { model: "gpt-4o", messages: [{ role: "user", content: PROMPT }] },
    response: `{
  "id": "chatcmpl-example",
  "object": "chat.completion",
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! Routed through Setu."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 16,
    "completion_tokens": 25,
    "total_tokens": 41
  }
}`,
  },
  {
    id: "anthropic",
    label: "Anthropic",
    logo: "/logos/anthropic.svg",
    endpoint: "/anthropic/v1/messages",
    headers: [
      ["Content-Type", "application/json"],
      ["x-api-key", "{KEY}"],
      ["anthropic-version", "2023-06-01"],
    ],
    body: {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: PROMPT }],
    },
    response: `{
  "id": "msg_example",
  "type": "message",
  "role": "assistant",
  "model": "claude-3-5-sonnet-20241022",
  "content": [
    {
      "type": "text",
      "text": "Hello! Routed through Setu."
    }
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 16,
    "output_tokens": 25
  }
}`,
  },
  {
    id: "gemini",
    label: "Google Gemini",
    logo: "/logos/gemini.svg",
    endpoint: "/v1beta/models/gemini-1.5-pro:generateContent",
    headers: [
      ["Content-Type", "application/json"],
      ["x-goog-api-key", "{KEY}"],
    ],
    body: { contents: [{ parts: [{ text: PROMPT }] }] },
    response: `{
  "candidates": [
    {
      "content": {
        "parts": [{ "text": "Hello! Routed through Setu." }],
        "role": "model"
      },
      "finishReason": "STOP"
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 16,
    "candidatesTokenCount": 25,
    "totalTokenCount": 41
  }
}`,
  },
];

/* ---------------- code generation ---------------- */

const indent = (text: string, spaces: number) =>
  text.replace(/\n/g, "\n" + " ".repeat(spaces));

// Turns a header value into a language expression. `fn` receives the literal
// text before {KEY}; values without {KEY} become plain quoted strings.
const hv = (value: string, fn: (pre: string) => string) =>
  value.includes("{KEY}") ? fn(value.split("{KEY}")[0]) : JSON.stringify(value);

function generate(lang: LangId, p: Provider): string {
  const url = HOST + p.endpoint;
  const compact = JSON.stringify(p.body);
  const pretty = JSON.stringify(p.body, null, 2);

  switch (lang) {
    case "go":
      return [
        "package main",
        "",
        "import (",
        '\t"bytes"',
        '\t"fmt"',
        '\t"io"',
        '\t"net/http"',
        '\t"os"',
        ")",
        "",
        "func main() {",
        `\tbody := []byte(\`${compact}\`)`,
        "",
        `\treq, err := http.NewRequest("POST", "${url}", bytes.NewReader(body))`,
        "\tif err != nil {",
        "\t\tpanic(err)",
        "\t}",
        ...p.headers.map(
          ([k, v]) =>
            `\treq.Header.Set("${k}", ${hv(v, (pre) =>
              pre
                ? `"${pre}" + os.Getenv("SETU_API_KEY")`
                : 'os.Getenv("SETU_API_KEY")',
            )})`,
        ),
        "",
        "\tresp, err := http.DefaultClient.Do(req)",
        "\tif err != nil {",
        "\t\tpanic(err)",
        "\t}",
        "\tdefer resp.Body.Close()",
        "",
        "\tout, _ := io.ReadAll(resp.Body)",
        "\tfmt.Println(resp.Status, string(out))",
        "}",
      ].join("\n");

    case "python":
      return [
        "import os",
        "import requests",
        "",
        'setu_api_key = os.environ["SETU_API_KEY"]',
        "",
        `payload = ${pretty}`,
        "",
        "response = requests.post(",
        `    "${url}",`,
        "    headers={",
        ...p.headers.map(
          ([k, v]) =>
            `        "${k}": ${hv(v, (pre) => (pre ? `f"${pre}{setu_api_key}"` : "setu_api_key"))},`,
        ),
        "    },",
        "    json=payload,",
        "    timeout=30,",
        ")",
        "",
        "print(response.status_code)",
        "print(response.json())",
      ].join("\n");

    case "typescript":
    case "javascript":
      return [
        'const apiKey = process.env.SETU_API_KEY ?? "";',
        "",
        `const response = await fetch("${url}", {`,
        '  method: "POST",',
        "  headers: {",
        ...p.headers.map(
          ([k, v]) =>
            `    "${k}": ${hv(v, (pre) => (pre ? "`" + pre + "${apiKey}" + "`" : "apiKey"))},`,
        ),
        "  },",
        `  body: JSON.stringify(${indent(pretty, 2)}),`,
        "});",
        "",
        lang === "typescript"
          ? "const data: unknown = await response.json();"
          : "const data = await response.json();",
        "console.log(response.status, data);",
      ].join("\n");

    case "curl":
      return [
        `curl -X POST "${url}" \\`,
        ...p.headers.map(
          ([k, v]) => `  -H "${k}: ${v.replace("{KEY}", "$SETU_API_KEY")}" \\`,
        ),
        `  -d '${compact}'`,
      ].join("\n");

    case "java":
      return [
        "import java.net.URI;",
        "import java.net.http.HttpClient;",
        "import java.net.http.HttpRequest;",
        "import java.net.http.HttpResponse;",
        "",
        "public class SetuClient {",
        "  public static void main(String[] args) throws Exception {",
        '    String apiKey = System.getenv("SETU_API_KEY");',
        `    String json = ${JSON.stringify(compact)};`,
        "",
        "    HttpRequest request = HttpRequest.newBuilder()",
        `        .uri(URI.create("${url}"))`,
        ...p.headers.map(
          ([k, v]) =>
            `        .header("${k}", ${hv(v, (pre) => (pre ? `"${pre}" + apiKey` : "apiKey"))})`,
        ),
        "        .POST(HttpRequest.BodyPublishers.ofString(json))",
        "        .build();",
        "",
        "    HttpResponse<String> response = HttpClient.newHttpClient()",
        "        .send(request, HttpResponse.BodyHandlers.ofString());",
        '    System.out.println(response.statusCode() + " " + response.body());',
        "  }",
        "}",
      ].join("\n");

    case "php":
      return [
        "<?php",
        "$apiKey = getenv('SETU_API_KEY');",
        `$payload = '${compact}';`,
        "",
        `$ch = curl_init('${url}');`,
        "curl_setopt_array($ch, [",
        "    CURLOPT_POST => true,",
        "    CURLOPT_RETURNTRANSFER => true,",
        "    CURLOPT_HTTPHEADER => [",
        ...p.headers.map(([k, v]) =>
          v.includes("{KEY}")
            ? `        '${k}: ${v.split("{KEY}")[0]}' . $apiKey,`
            : `        '${k}: ${v}',`,
        ),
        "    ],",
        "    CURLOPT_POSTFIELDS => $payload,",
        "]);",
        "",
        "$response = curl_exec($ch);",
        "curl_close($ch);",
        "",
        "echo $response;",
      ].join("\n");

    case "ruby":
      return [
        "require 'net/http'",
        "require 'uri'",
        "",
        `uri = URI('${url}')`,
        "request = Net::HTTP::Post.new(uri)",
        ...p.headers.map(
          ([k, v]) =>
            `request['${k}'] = ${hv(v, (pre) =>
              pre
                ? `"${pre}#{ENV.fetch('SETU_API_KEY')}"`
                : "ENV.fetch('SETU_API_KEY')",
            )}`,
        ),
        `request.body = '${compact}'`,
        "",
        "response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|",
        "  http.request(request)",
        "end",
        "",
        "puts response.code, response.body",
      ].join("\n");
  }
}

/* ---------------- syntax highlighting ---------------- */

type Syntax = LangId | "json";

const KEYWORDS = new Set([
  "import",
  "package",
  "func",
  "return",
  "var",
  "const",
  "let",
  "if",
  "else",
  "defer",
  "for",
  "range",
  "from",
  "await",
  "async",
  "def",
  "class",
  "public",
  "static",
  "void",
  "throws",
  "new",
  "try",
  "require",
  "do",
  "end",
  "echo",
  "nil",
  "None",
  "true",
  "false",
  "null",
  "string",
  "String",
  "unknown",
  "main",
  "puts",
  "print",
  "true",
  "false",
]);

const STRING_SRC = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`/.source;
const NUMBER_SRC = /\b\d+(?:\.\d+)?\b/.source;
const WORD_SRC = /[A-Za-z_$][\w$]*/.source;

const commentSource = (syntax: Syntax) => {
  if (syntax === "json") return /(?!)/.source;
  if (["python", "curl", "ruby"].includes(syntax)) return /#.*/.source;
  return /\/\/.*/.source;
};

const tokenRegex = (syntax: Syntax) =>
  new RegExp(
    `(${commentSource(syntax)})|(${STRING_SRC})|(${NUMBER_SRC})|(${WORD_SRC})|(\\s+)|([\\s\\S])`,
    "g",
  );

function tokenize(line: string, syntax: Syntax, re: RegExp): ReactNode[] {
  const out: ReactNode[] = [];
  for (const m of line.matchAll(re)) {
    const text = m[0];
    const key = out.length;
    const after = line.slice((m.index ?? 0) + text.length);

    if (m[1])
      out.push(
        <span key={key} className="t-comment">
          {text}
        </span>,
      );
    else if (m[2]) {
      const isKey = syntax === "json" && after.trimStart().startsWith(":");
      out.push(
        <span key={key} className={isKey ? "t-key" : "t-string"}>
          {text}
        </span>,
      );
    } else if (m[3])
      out.push(
        <span key={key} className="t-number">
          {text}
        </span>,
      );
    else if (m[4]) {
      let cls = "t-var";
      if (syntax === "json" && /^(true|false|null)$/.test(text))
        cls = "t-number";
      else if (KEYWORDS.has(text) && syntax !== "json") cls = "t-keyword";
      else if (after.startsWith("(")) cls = "t-fn";
      else if (/^[A-Z][A-Za-z0-9]*$/.test(text) && syntax !== "json")
        cls = "t-type";
      out.push(
        <span key={key} className={cls}>
          {text}
        </span>,
      );
    } else if (m[5]) out.push(text);
    else
      out.push(
        <span key={key} className="t-punct">
          {text}
        </span>,
      );
  }
  return out;
}

function Code({ code, syntax }: { code: string; syntax: Syntax }) {
  const lines = useMemo(() => {
    const re = tokenRegex(syntax);
    return code.split("\n").map((line) => tokenize(line, syntax, re));
  }, [code, syntax]);

  return (
    <pre className="qs-pre">
      <code>
        {lines.map((tokens, i) => (
          <span
            className="qs-line"
            key={i}
            style={css({ "--n": Math.min(i, 28) })}
          >
            {tokens.length ? tokens : " "}
          </span>
        ))}
      </code>
    </pre>
  );
}

/* ---------------- small parts ---------------- */

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable: leave the label unchanged */
    }
  };

  return [copied, copy] as const;
}

function Logo({ src, name }: { src: string; name: string }) {
  const [ok, setOk] = useState(true);
  return (
    <span className="qs-logo">
      {ok ? (
        <img src={src} alt="" draggable={false} onError={() => setOk(false)} />
      ) : (
        <b aria-hidden="true">{name[0]}</b>
      )}
    </span>
  );
}

function cycle<T extends { id: string }>(
  items: T[],
  current: string,
  event: KeyboardEvent,
): string | null {
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
  if (!keys.includes(event.key)) return null;
  event.preventDefault();
  const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
  const index = items.findIndex((item) => item.id === current);
  return items[(index + step + items.length) % items.length].id;
}

/* ---------------- section ---------------- */

export default function QuickStartSection() {
  const reduceMotion = Boolean(useReducedMotion());
  const windowRef = useRef<HTMLDivElement>(null);
  const visible = useInView(windowRef, { amount: 0.05 });

  const [lang, setLang] = useState<LangId>("go");
  const [providerId, setProviderId] = useState<ProviderId>("openai");

  const provider = PROVIDERS.find((p) => p.id === providerId) ?? PROVIDERS[0];
  const code = useMemo(() => generate(lang, provider), [lang, provider]);
  const syntax: Syntax = lang === "curl" ? "curl" : lang;

  const [copiedCode, copyCode] = useCopy(code);
  const [copiedJson, copyJson] = useCopy(provider.response);

  return (
    <section
      className="qs-section"
      id="quickstart"
      data-chapter="05 / QUICK START"
    >
      <div className="qs-inner">
        <motion.div
          className="qs-copy"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease }}
        >
          <p className="qs-eyebrow">GET STARTED</p>
          <h2>Your first request. Through Setu.</h2>
          <p className="qs-lede">
            Connect your application to Setu and route requests through one
            unified gateway.
          </p>
        </motion.div>

        <motion.div
          ref={windowRef}
          className={`qs-window${visible ? "" : " is-paused"}`}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.9, ease }}
        >
          <div className="qs-controls">
            <div className="qs-row">
              <span className="qs-label" id="qs-lang-label">
                Language
              </span>
              <div
                className="qs-scroll"
                role="tablist"
                aria-labelledby="qs-lang-label"
                onKeyDown={(e) => {
                  const next = cycle(LANGUAGES, lang, e);
                  if (next) setLang(next as LangId);
                }}
              >
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    role="tab"
                    aria-selected={lang === l.id}
                    tabIndex={lang === l.id ? 0 : -1}
                    className={lang === l.id ? "is-active" : ""}
                    onClick={() => setLang(l.id)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="qs-row">
              <span className="qs-label" id="qs-provider-label">
                Provider
              </span>
              <div
                className="qs-scroll"
                role="radiogroup"
                aria-labelledby="qs-provider-label"
                onKeyDown={(e) => {
                  const next = cycle(PROVIDERS, providerId, e);
                  if (next) setProviderId(next as ProviderId);
                }}
              >
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={providerId === p.id}
                    tabIndex={providerId === p.id ? 0 : -1}
                    className={providerId === p.id ? "is-active" : ""}
                    onClick={() => setProviderId(p.id)}
                  >
                    <Logo src={p.logo} name={p.label} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* the route, in miniature: your app, Setu, the chosen provider */}
          <div
            className="qs-route"
            aria-label={`Your app to Setu to ${provider.label}`}
          >
            <span className="qs-node">Your app</span>
            <span className="qs-link">
              <i />
            </span>
            <span className="qs-node qs-node-setu">
              <img src="/Setu_Icon.svg" alt="" />
              Setu
              <b aria-hidden="true" />
            </span>
            <span className="qs-link qs-link-2">
              <i />
            </span>
            <span className="qs-node" key={provider.id}>
              <Logo src={provider.logo} name={provider.label} />
              {provider.label}
            </span>
            <span className="qs-endpoint">POST {provider.endpoint}</span>
          </div>

          <div className="qs-grid">
            <div className="qs-panel">
              <div className="qs-head">
                <span className="qs-title">
                  REQUEST{" "}
                  <em>
                    {LANGUAGES.find((l) => l.id === lang)?.label} →{" "}
                    {provider.label}
                  </em>
                </span>
                <button
                  type="button"
                  className={`qs-copy-btn${copiedCode ? " is-copied" : ""}`}
                  onClick={copyCode}
                >
                  {copiedCode ? "Copied" : "Copy code"}
                </button>
              </div>
              <div
                className="qs-code"
                tabIndex={0}
                role="region"
                aria-label="Request example"
              >
                <Code
                  key={`${lang}-${provider.id}`}
                  code={code}
                  syntax={syntax}
                />
              </div>
            </div>

            <div className="qs-panel">
              <div className="qs-head">
                <span className="qs-title">
                  RESPONSE{" "}
                  <span className="qs-status">
                    <i aria-hidden="true" />
                    200 OK
                  </span>
                </span>
                <button
                  type="button"
                  className={`qs-copy-btn${copiedJson ? " is-copied" : ""}`}
                  onClick={copyJson}
                >
                  {copiedJson ? "Copied" : "Copy JSON"}
                </button>
              </div>
              <div
                className="qs-code"
                tabIndex={0}
                role="region"
                aria-label="Response example"
              >
                <Code
                  key={provider.id}
                  code={provider.response}
                  syntax="json"
                />
              </div>
            </div>
          </div>

          <p className="qs-footer" aria-live="polite">
            <span>
              Illustrative request and response. Replace SETU_API_KEY with your
              own key.
            </span>
            <span className="sr-only">
              {copiedCode || copiedJson ? "Copied to clipboard" : ""}
            </span>
          </p>
        </motion.div>
      </div>

      <style>{`
        .qs-section {
          position: relative;
          margin-left: clamp(20px, 6.5vw, 88px);
          margin-right: clamp(20px, 2.5vw, 32px);
          border-left: 1px solid #19191d;
          border-bottom: 1px solid #19191d;
          background: #050505;
          font-family: "Geist", sans-serif;
        }

        .qs-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(80px, 10vw, 128px) clamp(22px, 6vw, 96px) 88px;
        }

        .qs-eyebrow {
          margin: 0 0 18px;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
        }

        .qs-copy h2 {
          max-width: 720px;
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 600;
          letter-spacing: -0.06em;
          line-height: 1.04;
        }

        .qs-lede { max-width: 520px; margin: 20px 0 0; color: #969ba3; font-size: 14px; line-height: 1.6; }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }

        /* ---- window ---- */
        .qs-window {
          position: relative;
          margin-top: 56px;
          border: 1px solid #1f1f28;
          background: #07070a;
        }

        .qs-window::before {
          position: absolute;
          top: -1px;
          left: 20px;
          width: 112px;
          height: 1px;
          content: "";
          background: #67e8f9;
        }

        .qs-controls { display: grid; gap: 14px; padding: 16px 20px; border-bottom: 1px solid #1f1f28; background: #0a0a0f; }

        .qs-row { display: flex; align-items: center; gap: 16px; min-width: 0; }

        .qs-label {
          flex: 0 0 72px;
          color: #686873;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .qs-scroll { display: flex; gap: 4px; min-width: 0; overflow-x: auto; scrollbar-width: none; }
        .qs-scroll::-webkit-scrollbar { display: none; }

        .qs-scroll button {
          position: relative;
          display: inline-flex;
          flex: 0 0 auto;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid transparent;
          background: transparent;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: color 200ms ease, background 200ms ease, border-color 200ms ease;
        }

        .qs-scroll button:hover { color: #f5f5f5; background: #0d0d11; }

        .qs-scroll button.is-active {
          border-color: #27272d;
          background: #111318;
          color: #f7f7f7;
        }

        .qs-scroll button.is-active::after {
          position: absolute;
          right: -1px;
          bottom: -1px;
          left: -1px;
          height: 1px;
          content: "";
          background: #67e8f9;
        }

        .qs-scroll button:focus-visible,
        .qs-copy-btn:focus-visible,
        .qs-code:focus-visible { outline: 2px solid #f0abfc; outline-offset: 2px; }

        .qs-logo { display: grid; flex: 0 0 18px; width: 18px; height: 18px; place-items: center; background: #e4e4e7; }
        .qs-logo img { width: 13px; height: 13px; object-fit: contain; }
        .qs-logo b { color: #08070b; font-size: 10px; font-weight: 600; }

        /* ---- route strip ---- */
        .qs-route {
          display: flex;
          align-items: center;
          padding: 18px 20px;
          border-bottom: 1px solid #1f1f28;
        }

        .qs-node {
          display: inline-flex;
          flex: 0 0 auto;
          align-items: center;
          gap: 8px;
          height: 34px;
          padding: 0 12px;
          border: 1px solid #27272d;
          background: #0d0d11;
          color: #e4e4e7;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          white-space: nowrap;
          animation: qs-fade 400ms ease backwards;
        }

        .qs-node-setu { position: relative; border-color: #3a4247; }
        .qs-node-setu img { width: 16px; height: 16px; object-fit: contain; }

        /* the section's one orchid mark: the gateway's port */
        .qs-node-setu b { position: absolute; top: 50%; right: -2px; width: 3px; height: 18px; background: #e879f9; transform: translateY(-50%); }

        .qs-link { position: relative; flex: 1; min-width: 20px; max-width: 160px; height: 1px; overflow: hidden; background: #3a4247; }

        .qs-link i {
          position: absolute;
          top: 0;
          left: -28px;
          width: 28px;
          height: 1px;
          background: #67e8f9;
          animation: qs-hop 3.6s cubic-bezier(0.45, 0, 0.2, 1) infinite;
        }

        .qs-link-2 i { animation-delay: 0.9s; }

        .qs-endpoint {
          margin-left: auto;
          padding-left: 20px;
          overflow: hidden;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.04em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ---- panels ---- */
        .qs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #1f1f28; }
        .qs-panel { display: flex; min-width: 0; flex-direction: column; background: #07070a; }

        .qs-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 11px 18px;
          border-bottom: 1px solid #1f1f28;
          background: #09090e;
        }

        .qs-title {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          overflow: hidden;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          white-space: nowrap;
        }

        .qs-title em { overflow: hidden; color: #565d66; font-style: normal; letter-spacing: 0.06em; text-overflow: ellipsis; }

        .qs-status { display: inline-flex; align-items: center; gap: 6px; color: #5eead4; font-size: 10px; letter-spacing: 0.06em; }
        .qs-status i { width: 5px; height: 5px; border-radius: 50%; background: #5eead4; }

        .qs-copy-btn {
          flex: 0 0 auto;
          padding: 6px 10px;
          border: 1px solid #27272d;
          background: transparent;
          color: #a1a1aa;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 180ms ease, border-color 180ms ease, background 180ms ease;
        }

        .qs-copy-btn:hover { border-color: #3a4247; background: #0d0d11; color: #f5f5f5; }
        .qs-copy-btn.is-copied { border-color: rgba(94, 234, 212, 0.4); color: #5eead4; }

        .qs-code {
          height: 400px;
          padding: 18px 0;
          overflow: auto;
          background: #050505;
          scrollbar-width: thin;
          scrollbar-color: #202026 transparent;
        }

        .qs-pre {
          margin: 0;
          font-family: "JetBrains Mono", monospace;
          font-size: 12px;
          line-height: 1.7;
          tab-size: 4;
          counter-reset: line;
        }

        .qs-pre code { display: block; width: max-content; min-width: 100%; }

        .qs-line {
          position: relative;
          display: block;
          min-height: 1.7em;
          padding: 0 18px 0 56px;
          color: #e2e8f0;
          white-space: pre;
          animation: qs-line 360ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
          animation-delay: calc(var(--n) * 12ms);
        }

        .qs-line::before {
          position: absolute;
          left: 0;
          width: 38px;
          content: counter(line);
          counter-increment: line;
          color: #3a4247;
          font-size: 11px;
          text-align: right;
          user-select: none;
        }

        .t-keyword { color: #c084fc; }
        .t-string { color: #5eead4; }
        .t-number { color: #f59e0b; }
        .t-fn { color: #67e8f9; }
        .t-type { color: #7db7ff; }
        .t-key { color: #a5c4f3; }
        .t-comment { color: #686873; font-style: italic; }
        .t-punct { color: #8f8f97; }
        .t-var { color: #e2e8f0; }

        .qs-footer {
          margin: 0;
          padding: 12px 18px;
          border-top: 1px solid #1f1f28;
          background: #09090e;
          color: #686873;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.03em;
        }

        .qs-window.is-paused * { animation-play-state: paused !important; }

        @keyframes qs-hop {
          0% { transform: translateX(0); opacity: 0; }
          12% { opacity: 1; }
          55% { opacity: 1; }
          70%, 100% { transform: translateX(190px); opacity: 0; }
        }
        @keyframes qs-line { from { opacity: 0; transform: translateX(-6px); } }
        @keyframes qs-fade { from { opacity: 0; } }

        /* ---- responsive ---- */
        @media (max-width: 900px) {
          .qs-grid { grid-template-columns: 1fr; }
          .qs-code { height: 340px; }
          .qs-endpoint { display: none; }
        }

        @media (max-width: 700px) {
          .qs-section { margin-left: 0; margin-right: 0; border-left: 0; }
          .qs-inner { padding: 72px 20px 56px; }
          .qs-copy h2 { font-size: clamp(32px, 10vw, 44px); }
          .qs-window { margin-top: 40px; }
          .qs-controls { padding: 14px; }
          .qs-row { flex-direction: column; align-items: flex-start; gap: 8px; }
          .qs-scroll { width: 100%; -webkit-mask-image: linear-gradient(90deg, #000 88%, transparent); mask-image: linear-gradient(90deg, #000 88%, transparent); }
          .qs-route { padding: 14px; }
          .qs-node { padding: 0 8px; font-size: 10px; }
          .qs-node .qs-logo { display: none; }
          .qs-head { padding: 10px 14px; }
          .qs-line { padding-left: 48px; font-size: 11px; }
          .qs-line::before { width: 30px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .qs-window * { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
