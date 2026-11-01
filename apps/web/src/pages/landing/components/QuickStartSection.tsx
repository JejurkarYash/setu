import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const LANGUAGES = [
  {
    id: "go",
    label: "Go",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#00ADD8" fillOpacity="0.2" />
        <path
          d="M11.83 4C7.5 4 4 7.35 4 11.45c0 2.5 1.25 4.7 3.2 6.05V20h2.8v-1.65c.6.15 1.24.25 1.93.25 4.33 0 7.83-3.35 7.83-7.45S16.16 4 11.83 4z"
          fill="#00ADD8"
        />
      </svg>
    ),
  },
  {
    id: "python",
    label: "Python",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <path
          d="M11.92 2C8.77 2 6.09 2.65 6.09 4.18v2.18h5.83v.73H5.25C2.63 7.09 2 8.78 2 11.2c0 2.42.45 4.11 3.25 4.11h1.75v-1.82c0-1.74 1.48-3.18 3.25-3.18h4.5c1.1 0 2-.9 2-2V4.18C17.75 2.65 15.07 2 11.92 2z"
          fill="#387EB8"
        />
        <path
          d="M12.08 22c3.15 0 5.83-.65 5.83-2.18v-2.18h-5.83v-.73h6.67c2.62 0 3.25-1.69 3.25-4.11 0-2.42-.45-4.11-3.25-4.11h-1.75v1.82c0 1.74-1.48 3.18-3.25 3.18h-4.5c-1.1 0-2 .9-2 2v2.91c0 1.53 2.68 2.18 5.83 2.18z"
          fill="#FFE873"
        />
      </svg>
    ),
  },
  {
    id: "typescript",
    label: "TypeScript",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#3178C6" />
        <text x="4.3" y="16.8" fill="#fff" fontSize="10.5" fontWeight="700" fontFamily="Arial, sans-serif">TS</text>
      </svg>
    ),
  },
  {
    id: "javascript",
    label: "JavaScript",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#F7DF1E" />
        <text x="4.2" y="16.8" fill="#111" fontSize="10.5" fontWeight="700" fontFamily="Arial, sans-serif">JS</text>
      </svg>
    ),
  },
  {
    id: "curl",
    label: "cURL",
    icon: (
      <svg
        className="w-4 h-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#67E8F9"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    id: "java",
    label: "Java",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <path
          d="M11.53 2c0 .28.11.54.3.73.19.19.45.3.73.3 1.15 0 2.28.31 3.27.9.99.59 1.79 1.44 2.3 2.45.51 1.01.78 2.14.78 3.29 0 .28.11.54.3.73.19.19.45.3.73.3.28 0 .54-.11.73-.3.19-.19.3-.45.3-.73 0-1.43-.32-2.85-.94-4.16-.62-1.31-1.51-2.45-2.63-3.32-1.12-.87-2.45-1.44-3.86-1.68-.28-.05-.55.12-.6.4-.04.23.1.45.33.52z"
          fill="#f89820"
        />
        <path
          d="M7.5 7.5c-.28 0-.54.11-.73.3-.19.19-.3.45-.3.73 0 2.21.88 4.33 2.44 5.89 1.56 1.56 3.68 2.44 5.89 2.44.28 0 .54-.11.73-.3.19-.19.3-.45.3-.73 0-.28-.11-.54-.3-.73-.19-.19-.45-.3-.73-.3-1.77 0-3.47-.7-4.73-1.95C9.2 11.97 8.5 10.27 8.5 8.53c0-.28-.11-.54-.3-.73-.19-.19-.45-.3-.7-.3z"
          fill="#5382a1"
        />
        <path
          d="M12 18.5c-1.38 0-2.71-.35-3.9-1.01-1.19-.66-2.17-1.61-2.83-2.76-.66-1.15-1.02-2.46-1.02-3.83 0-.28-.11-.54-.3-.73-.19-.19-.45-.3-.73-.3-.28 0-.54.11-.73.3-.19.19-.3.45-.3.73 0 1.63.42 3.22 1.21 4.62.79 1.4 1.91 2.55 3.27 3.32 1.36.77 2.93 1.18 4.54 1.18.28 0 .54-.11.73-.3.19-.19.3-.45.3-.73 0-.28-.11-.54-.3-.73-.19-.19-.45-.3-.73-.3z"
          fill="#e76f00"
        />
      </svg>
    ),
  },
  {
    id: "php",
    label: "PHP",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="10" ry="6.8" fill="#777BB4" />
        <text x="5.1" y="14.8" fill="#fff" fontSize="6.8" fontWeight="700" fontFamily="Arial, sans-serif">PHP</text>
      </svg>
    ),
  },
  {
    id: "ruby",
    label: "Ruby",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 9l10 13L22 9L12 2z" fill="#CC342D" />
        <path d="M12 5.2l6.8 4.8-6.8 9.2L5.2 10 12 5.2z" fill="#E24329" />
      </svg>
    ),
  },
];

const PROVIDERS = [
  {
    id: "openai",
    label: "OpenAI",
    model: "gpt-4o",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <path
          d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.9807 5.9807 0 0 0 .5157 4.9108 6.0512 6.0512 0 0 0 6.5098 2.9 6.0512 6.0512 0 0 0 10.2862-3.1578 5.9807 5.9807 0 0 0 3.9977-2.9 6.0462 6.0462 0 0 0-.7427-7.0966z"
          fill="#10A37F"
        />
        <path
          d="M15.5 11.2v-1.5c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v1.5c0 .6.4 1 1 1h2c.6 0 1-.4 1-1z"
          fill="#fff"
        />
      </svg>
    ),
  },
  {
    id: "anthropic",
    label: "Anthropic",
    model: "claude-3-5-sonnet-20241022",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <path
          d="M17.522 4.155h-4.322L5.86 21.845h4.156l1.722-4.522h7.622l1.722 4.522h4.311L17.522 4.155Zm-3.822 9.611 2.8-7.533 2.8 7.533h-5.6Z"
          fill="#D97706"
        />
      </svg>
    ),
  },
  {
    id: "gemini",
    label: "Google Gemini",
    model: "gemini-1.5-pro",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="gemini-spark-gradient" x1="3" y1="3" x2="21" y2="21">
            <stop offset="0" stopColor="#4285F4" />
            <stop offset="0.34" stopColor="#34A853" />
            <stop offset="0.68" stopColor="#FBBC04" />
            <stop offset="1" stopColor="#EA4335" />
          </linearGradient>
        </defs>
        <path
          d="M12 1.5c.55 5.2 1.45 8.2 3.55 10.1 1.9 1.75 4.15 2.45 6.95 2.9-2.8.45-5.05 1.15-6.95 2.9-2.1 1.9-3 4.9-3.55 10.1-.55-5.2-1.45-8.2-3.55-10.1-1.9-1.75-4.15-2.45-6.95-2.9 2.8-.45 5.05-1.15 6.95-2.9C10.55 9.7 11.45 6.7 12 1.5Z"
          fill="url(#gemini-spark-gradient)"
        />
      </svg>
    ),
  },
];

function getProviderConfig(providerId: string) {
  const provider = PROVIDERS.find((p) => p.id === providerId) || PROVIDERS[0];
  const configByProvider: Record<
    string,
    { route: string; model: string; endpoint: string }
  > = {
    openai: {
      route: "https://api.setu.dev/v1/chat/completions",
      endpoint: "/v1/chat/completions",
      model: provider.model,
    },
    anthropic: {
      route: "https://api.setu.dev/anthropic/v1/messages",
      endpoint: "/anthropic/v1/messages",
      model: provider.model,
    },
    gemini: {
      route: `https://api.setu.dev/v1beta/models/${provider.model}:generateContent`,
      endpoint: `/v1beta/models/${provider.model}:generateContent`,
      model: provider.model,
    },
  };
  return {
    ...(configByProvider[providerId] ?? configByProvider.openai),
    provider,
  };
}

function getCodeExample(lang: string, providerId: string) {
  const provider = PROVIDERS.find((p) => p.id === providerId) || PROVIDERS[0];
  const config = getProviderConfig(providerId);
  const model = config.model;
  const route = config.route;
  const bodyPrompt = "Hello through Setu gateway!";

  const commonResponse =
    providerId === "anthropic"
      ? `{
  "id": "msg_setu_${lang}_${provider.id}",
  "type": "message",
  "role": "assistant",
  "model": "${model}",
  "content": [
    {
      "type": "text",
      "text": "Hello! Routed successfully through Setu via ${provider.label}."
    }
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 16,
    "output_tokens": 25,
    "total_tokens": 41
  }
}`
      : providerId === "gemini"
        ? `{
  "candidates": [
    {
      "content": {
        "parts": [
          { "text": "Hello! Routed successfully through Setu via ${provider.label}." }
        ],
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
}`
        : `{
  "id": "msg_setu_${lang}_${provider.id}",
  "object": "chat.completion",
  "created": 1711984215,
  "model": "${model}",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! Routed successfully through Setu via ${provider.label}."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 16,
    "completion_tokens": 25,
    "total_tokens": 41
  },
  "setu_metadata": {
    "gateway_latency_ms": 3.12,
    "provider": "${provider.id}",
    "cached": false
  }
}`;

  const goCode = [
    "package main",
    "",
    "import (",
    '  "bytes"',
    '  "encoding/json"',
    '  "fmt"',
    '  "net/http"',
    '  "os"',
    ")",
    "",
    "func main() {",
    '  apiKey := os.Getenv("SETU_API_KEY")',
    "  body, _ := json.Marshal(map[string]any{",
    `    "model": "${model}",`,
    providerId === "gemini"
      ? `    "contents": []map[string]any{{"parts": []map[string]string{{"text": "${bodyPrompt}"}}}},`
      : `    "messages": []map[string]string{{"role": "user", "content": "${bodyPrompt}"}},`,
    "  })",
    "",
    `  req, err := http.NewRequest("POST", "${route}", bytes.NewReader(body))`,
    "  if err != nil { panic(err) }",
    "",
    '  req.Header.Set("Content-Type", "application/json")',
    providerId === "openai"
      ? '  req.Header.Set("Authorization", "Bearer "+apiKey)'
      : providerId === "anthropic"
        ? '  req.Header.Set("x-api-key", apiKey)\n  req.Header.Set("anthropic-version", "2023-06-01")'
        : '  req.Header.Set("x-goog-api-key", apiKey)',
    "",
    "  resp, err := http.DefaultClient.Do(req)",
    "  if err != nil { panic(err) }",
    "  defer resp.Body.Close()",
    "",
    "  fmt.Println(resp.Status)",
    "}",
  ].join("\n");

  const pythonPayload =
    providerId === "anthropic"
      ? `payload = {
    "model": "${model}",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "${bodyPrompt}"}],
}`
      : providerId === "gemini"
        ? `payload = {
    "contents": [{"parts": [{"text": "${bodyPrompt}"}]}],
    "generationConfig": {"temperature": 0.2},
}`
        : `payload = {
    "model": "${model}",
    "messages": [{"role": "user", "content": "${bodyPrompt}"}],
}`;

  const pythonHeaders = [
    '    "Content-Type": "application/json",',
    providerId === "openai"
      ? '    "Authorization": f"Bearer {setu_api_key}",'
      : providerId === "anthropic"
        ? '    "x-api-key": setu_api_key,\n    "anthropic-version": "2023-06-01",'
        : '    "x-goog-api-key": setu_api_key,',
  ].join("\n");

  const pythonCode = [
    "import os",
    "import requests",
    "",
    'setu_api_key = os.getenv("SETU_API_KEY")',
    `url = "${route}"`,
    "",
    pythonPayload,
    "",
    "headers = {",
    pythonHeaders,
    "}",
    "",
    "response = requests.post(url, headers=headers, json=payload, timeout=30)",
    "print(response.status_code)",
    "print(response.json())",
  ].join("\n");

  const typeScriptBaseURL =
    providerId === "openai"
      ? "https://api.setu.dev/v1"
      : providerId === "anthropic"
        ? "https://api.setu.dev/anthropic"
        : "https://api.setu.dev";

  const typeScriptHeaders =
    providerId === "openai"
      ? '    "Authorization": `Bearer ${apiKey}`,'
      : providerId === "anthropic"
        ? '    "x-api-key": apiKey,\n    "anthropic-version": "2023-06-01",'
        : '    "x-goog-api-key": apiKey,';

  const typeScriptCode = [
    'import OpenAI from "openai";',
    "",
    "const apiKey = process.env.SETU_API_KEY!;",
    "",
    "const client = new OpenAI({",
    `  baseURL: "${typeScriptBaseURL}",`,
    "  apiKey,",
    "  defaultHeaders: {",
    typeScriptHeaders,
    "  },",
    "});",
    "",
    "const response = await client.chat.completions.create({",
    `  model: "${model}",`,
    `  messages: [{ role: "user", content: "${bodyPrompt}" }],`,
    "});",
    "",
    "console.log(response.choices[0].message.content);",
  ].join("\n");

  const curlBody =
    providerId === "gemini"
      ? `{ "contents": [{ "parts": [{ "text": "${bodyPrompt}" }] }] }`
      : `{ "model": "${model}", "messages": [{ "role": "user", "content": "${bodyPrompt}" }] }`;

  const curlHeaders = [
    '  -H "Content-Type: application/json"',
    providerId === "openai"
      ? '  -H "Authorization: Bearer $SETU_API_KEY"'
      : providerId === "anthropic"
        ? '  -H "x-api-key: $SETU_API_KEY" \\\n  -H "anthropic-version: 2023-06-01"'
        : '  -H "x-goog-api-key: $SETU_API_KEY"',
  ].join(" \\\n");

  const curlCode = `curl -X POST "${route}" \\\n${curlHeaders} \\\n  -d '${curlBody}'`;

  const javaPayload =
    providerId === "anthropic"
      ? `String json = "{\\\"model\\\":\\\"${model}\\\",\\\"max_tokens\\\":1024,\\\"messages\\\":[{\\\"role\\\":\\\"user\\\",\\\"content\\\":\\\"${bodyPrompt}\\\"}]}";`
      : providerId === "gemini"
        ? `String json = "{\\\"contents\\\":[{\\\"parts\\\":[{\\\"text\\\":\\\"${bodyPrompt}\\\"}]}]}";`
        : `String json = "{\\\"model\\\":\\\"${model}\\\",\\\"messages\\\":[{\\\"role\\\":\\\"user\\\",\\\"content\\\":\\\"${bodyPrompt}\\\"}]}";`;

  const javaHeaders = [
    '      .header("Content-Type", "application/json")',
    providerId === "openai"
      ? '      .header("Authorization", "Bearer " + System.getenv("SETU_API_KEY"))'
      : providerId === "anthropic"
        ? '      .header("x-api-key", System.getenv("SETU_API_KEY"))\n      .header("anthropic-version", "2023-06-01")'
        : '      .header("x-goog-api-key", System.getenv("SETU_API_KEY"))',
  ].join("\n");

  const javaCode = [
    "import java.net.URI;",
    "import java.net.http.HttpClient;",
    "import java.net.http.HttpRequest;",
    "import java.net.http.HttpResponse;",
    "",
    "public class SetuClient {",
    "  public static void main(String[] args) throws Exception {",
    `    ${javaPayload}`,
    "",
    "    HttpClient client = HttpClient.newHttpClient();",
    "    HttpRequest request = HttpRequest.newBuilder()",
    `      .uri(URI.create("${route}"))`,
    javaHeaders,
    "      .POST(HttpRequest.BodyPublishers.ofString(json))",
    "      .build();",
    "",
    "    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());",
    "    System.out.println(response.body());",
    "  }",
    "}",
  ].join("\n");

  const phpPayload =
    providerId === "anthropic"
      ? `$payload = [\n  'model' => '${model}',\n  'max_tokens' => 1024,\n  'messages' => [\n    ['role' => 'user', 'content' => '${bodyPrompt}'],\n  ],\n];`
      : providerId === "gemini"
        ? `$payload = [\n  'contents' => [[\n    'parts' => [[\n      'text' => '${bodyPrompt}',\n    ]],\n  ]],\n  'generationConfig' => ['temperature' => 0.2],\n];`
        : `$payload = [\n  'model' => '${model}',\n  'messages' => [\n    ['role' => 'user', 'content' => '${bodyPrompt}'],\n  ],\n];`;

  const phpHeaders = [
    "  'Content-Type: application/json',",
    providerId === "openai"
      ? "  'Authorization: Bearer ' . $apiKey,"
      : providerId === "anthropic"
        ? "  'x-api-key: ' . $apiKey,\n  'anthropic-version: 2023-06-01',"
        : "  'x-goog-api-key: ' . $apiKey,",
  ].join("\n");

  const phpCode = [
    "<?php",
    "$apiKey = getenv('SETU_API_KEY');",
    phpPayload,
    "",
    `$ch = curl_init('${route}');`,
    "curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);",
    "curl_setopt($ch, CURLOPT_POST, true);",
    "curl_setopt($ch, CURLOPT_HTTPHEADER, [",
    phpHeaders,
    "]);",
    "curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));",
    "$response = curl_exec($ch);",
    "curl_close($ch);",
    "",
    "echo $response;",
    "?>",
  ].join("\n");

  const rubyPayload =
    providerId === "anthropic"
      ? `payload = {\n  model: '${model}',\n  max_tokens: 1024,\n  messages: [{ role: 'user', content: '${bodyPrompt}' }]\n}`
      : providerId === "gemini"
        ? `payload = {\n  contents: [{ parts: [{ text: '${bodyPrompt}' }] }],\n  generationConfig: { temperature: 0.2 }\n}`
        : `payload = {\n  model: '${model}',\n  messages: [{ role: 'user', content: '${bodyPrompt}' }]\n}`;

  const rubyHeaders = [
    providerId === "openai"
      ? "request['Authorization'] = 'Bearer ' + ENV.fetch('SETU_API_KEY')"
      : providerId === "anthropic"
        ? "request['x-api-key'] = ENV.fetch('SETU_API_KEY')\nrequest['anthropic-version'] = '2023-06-01'"
        : "request['x-goog-api-key'] = ENV.fetch('SETU_API_KEY')",
  ]
    .filter(Boolean)
    .join("\n");

  const rubyCode = [
    "require 'net/http'",
    "require 'uri'",
    "require 'json'",
    "",
    `uri = URI.parse('${route}')`,
    "request = Net::HTTP::Post.new(uri)",
    "request['Content-Type'] = 'application/json'",
    rubyHeaders,
    "",
    rubyPayload,
    "request.body = payload.to_json",
    "response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(request) }",
    "puts response.body",
  ].join("\n");

  switch (lang) {
    case "go":
      return { language: "go", code: goCode, response: commonResponse };
    case "python":
      return { language: "python", code: pythonCode, response: commonResponse };
    case "typescript":
      return {
        language: "typescript",
        code: typeScriptCode,
        response: commonResponse,
      };
    case "javascript":
      return {
        language: "javascript",
        code: typeScriptCode,
        response: commonResponse,
      };
    case "curl":
      return { language: "bash", code: curlCode, response: commonResponse };
    case "java":
      return { language: "java", code: javaCode, response: commonResponse };
    case "php":
      return { language: "php", code: phpCode, response: commonResponse };
    case "ruby":
      return { language: "ruby", code: rubyCode, response: commonResponse };
    default:
      return {
        language: "bash",
        code: "# Unsupported language",
        response: "{}",
      };
  }
}

function highlightCode(code: string, language: string): React.ReactNode[] {
  const lines = code.split("\n");
  return lines.map((line, lineIdx) => {
    if (
      (language === "bash" && line.trim().startsWith("#")) ||
      (language === "go" &&
        (line.trim().startsWith("//") || line.trim().startsWith("/*"))) ||
      (language === "typescript" && line.trim().startsWith("//")) ||
      (language === "javascript" && line.trim().startsWith("//")) ||
      (language === "python" && line.trim().startsWith("#")) ||
      (language === "java" &&
        (line.trim().startsWith("//") || line.trim().startsWith("*"))) ||
      (language === "php" &&
        (line.trim().startsWith("//") || line.trim().startsWith("#"))) ||
      (language === "ruby" && line.trim().startsWith("#"))
    ) {
      return (
        <div key={lineIdx} className="code-line">
          <span className="line-num">{lineIdx + 1}</span>
          <span className="token-comment">{line}</span>
        </div>
      );
    }

    return (
      <div key={lineIdx} className="code-line">
        <span className="line-num">{lineIdx + 1}</span>
        {renderTokens(line, language)}
      </div>
    );
  });
}

function renderTokens(line: string, _language: string) {
  const keywordSet = new Set([
    "import",
    "package",
    "func",
    "return",
    "var",
    "const",
    "if",
    "else",
    "defer",
    "go",
    "range",
    "for",
    "type",
    "struct",
    "map",
    "any",
    "interface",
    "chan",
    "from",
    "await",
    "async",
    "def",
    "print",
    "class",
    "public",
    "private",
    "new",
    "throws",
    "try",
    "catch",
    "echo",
    "require",
    "do",
    "end",
    "nil",
    "true",
    "false",
    "null",
  ]);

  const tokens = line
    .split(/(\s+|["'`].*?["'`]|[(){}\[\].,:=+\-*/%])/g)
    .filter(Boolean);

  return tokens.map((token, i) => {
    if (!token) return null;

    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'")) ||
      (token.startsWith("`") && token.endsWith("`"))
    ) {
      return (
        <span key={i} className="token-string">
          {token}
        </span>
      );
    }

    if (keywordSet.has(token)) {
      return (
        <span key={i} className="token-keyword">
          {token}
        </span>
      );
    }

    if (/^\d+(\.\d+)?$/.test(token)) {
      return (
        <span key={i} className="token-number">
          {token}
        </span>
      );
    }

    if (i + 1 < tokens.length && tokens[i + 1] === "(") {
      return (
        <span key={i} className="token-function">
          {token}
        </span>
      );
    }

    if (/^[A-Z][a-zA-Z0-9_]*$/.test(token)) {
      return (
        <span key={i} className="token-type">
          {token}
        </span>
      );
    }

    if (/^[(){}\[\].,:=+\-*/%<>!&|]$/.test(token)) {
      return (
        <span key={i} className="token-punctuation">
          {token}
        </span>
      );
    }

    return (
      <span key={i} className="token-variable">
        {token}
      </span>
    );
  });
}

function highlightJson(jsonStr: string): React.ReactNode[] {
  const lines = jsonStr.split("\n");
  return lines.map((line, idx) => (
    <div key={idx} className="code-line">
      <span className="line-num">{idx + 1}</span>
      {line.split(/([{}\[\],:]|"[^"]*")/g).map((part, pIdx) => {
        if (!part) return null;
        if (part.startsWith('"') && part.endsWith('"')) {
          if (line.includes(":") && line.indexOf(part) < line.indexOf(":")) {
            return (
              <span key={pIdx} className="token-json-key">
                {part}
              </span>
            );
          }
          return (
            <span key={pIdx} className="token-string">
              {part}
            </span>
          );
        }
        if (/true|false|null/.test(part)) {
          return (
            <span key={pIdx} className="token-boolean">
              {part}
            </span>
          );
        }
        if (/^\s*\d+(\.\d+)?\s*$/.test(part)) {
          return (
            <span key={pIdx} className="token-number">
              {part}
            </span>
          );
        }
        if (/[{\]}\[\]:,]/.test(part)) {
          return (
            <span key={pIdx} className="token-punctuation">
              {part}
            </span>
          );
        }
        return (
          <span key={pIdx} className="token-variable">
            {part}
          </span>
        );
      })}
    </div>
  ));
}

export default function QuickStartSection() {
  const prefersReducedMotion = useReducedMotion();
  const [activeLang, setActiveLang] = useState<string>("go");
  const [activeProvider, setActiveProvider] = useState<string>("openai");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const currentExample = getCodeExample(activeLang, activeProvider);
  const routeLabel = getProviderConfig(activeProvider).endpoint;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentExample.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // no-op
    }
  };

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(currentExample.response);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    } catch {
      // no-op
    }
  };

  return (
    <section
      className="problem-solution-section quickstart-section"
      data-chapter="05 / QUICK START"
      id="quickstart"
    >
      <motion.div
        className="problem-accent-line"
        initial={prefersReducedMotion ? false : { scaleX: 0, opacity: 0 }}
        whileInView={
          prefersReducedMotion ? undefined : { scaleX: 1, opacity: 1 }
        }
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />

      <div className="problem-solution-inner">
        <div className="problem-solution-copy">
          <p className="problem-solution-eyebrow">GET STARTED</p>
          <h2>Your first request. Through Setu.</h2>
          <p className="problem-description">
            Connect your application to Setu and route requests through one
            unified gateway.
          </p>
        </div>

        <div className="workspace-container">
          <div className="workspace-toolbar">
            <div className="selector-group">
              <span className="selector-label">Language:</span>
              <div className="toolbar-scrollable-row">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setActiveLang(lang.id)}
                    className={`toolbar-tab ${activeLang === lang.id ? "is-active" : ""}`}
                    type="button"
                    aria-pressed={activeLang === lang.id}
                  >
                    <span className="tab-icon">{lang.icon}</span>
                    <span className="tab-text">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="selector-group provider-group">
              <span className="selector-label">Provider:</span>
              <div className="toolbar-scrollable-row">
                {PROVIDERS.map((prov) => (
                  <button
                    key={prov.id}
                    onClick={() => setActiveProvider(prov.id)}
                    className={`toolbar-tab provider-tab ${activeProvider === prov.id ? "is-active" : ""}`}
                    type="button"
                    aria-pressed={activeProvider === prov.id}
                  >
                    <span className="tab-icon">{prov.icon}</span>
                    <span className="tab-text">{prov.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="workspace-grid">
            <div className="workspace-panel">
              <div className="panel-header">
                <span className="panel-label">
                  REQUEST ({activeLang.toUpperCase()} →{" "}
                  {activeProvider.toUpperCase()})
                </span>
                <button
                  onClick={handleCopyCode}
                  className={`copy-btn ${copiedCode ? "is-copied" : ""}`}
                  aria-label="Copy request code"
                  type="button"
                >
                  {copiedCode ? (
                    <span className="copy-success-flex">
                      <svg
                        className="w-3 h-3 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Copied!
                    </span>
                  ) : (
                    "Copy code"
                  )}
                </button>
              </div>
              <div className="code-container">
                <AnimatePresence mode="wait">
                  <motion.pre
                    key={`${activeLang}-${activeProvider}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="code-pre"
                  >
                    <code>
                      {highlightCode(
                        currentExample.code,
                        currentExample.language,
                      )}
                    </code>
                  </motion.pre>
                </AnimatePresence>
              </div>
            </div>

            <div className="workspace-panel">
              <div className="panel-header">
                <div className="response-header-left">
                  <span className="panel-label">RESPONSE</span>
                  <span className="status-badge">
                    <span className="status-dot" /> 200 OK
                  </span>
                </div>
                <button
                  onClick={handleCopyResponse}
                  className={`copy-btn ${copiedResponse ? "is-copied" : ""}`}
                  aria-label="Copy response JSON"
                  type="button"
                >
                  {copiedResponse ? (
                    <span className="copy-success-flex">
                      <svg
                        className="w-3 h-3 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Copied!
                    </span>
                  ) : (
                    "Copy JSON"
                  )}
                </button>
              </div>
              <div className="code-container">
                <AnimatePresence mode="wait">
                  <motion.pre
                    key={`resp-${activeLang}-${activeProvider}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="code-pre response-pre"
                  >
                    <code>{highlightJson(currentExample.response)}</code>
                  </motion.pre>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="workspace-footer">
            <span className="illustrative-note">
              * Illustrative payload. Setu routes OpenAI, Anthropic, and Gemini
              through provider-aware headers.
            </span>
            <span className="endpoint-meta">POST {routeLabel}</span>
          </div>
        </div>
      </div>

      <style>{`
        .quickstart-section {
          position: relative;
          background: #070707;
          padding: 60px 0 90px;
        }

        .workspace-container {
          position: relative;
          margin-top: 40px;
          background: #090b0d;
          border: 1px solid #293137;
          border-radius: 0;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
          overflow: hidden;
        }

        .workspace-container::before {
          position: absolute;
          top: -1px;
          left: 20px;
          width: 112px;
          height: 1px;
          content: "";
          background: #67e8f9;
          pointer-events: none;
        }

        .workspace-toolbar {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #0a0a0f;
          border-bottom: 1px solid #1f1f28;
          padding: 16px 20px;
        }

        @media (min-width: 1024px) {
          .workspace-toolbar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
          }
        }

        .selector-group {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          min-width: 0;
        }

        @media (min-width: 1024px) {
          .selector-group {
            width: auto;
            flex: 1;
          }
          .selector-group.provider-group {
            flex: 0.8;
          }
        }

        .selector-label {
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #787d89;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .toolbar-scrollable-row {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
          width: 100%;
          min-width: 0;
        }

        .toolbar-scrollable-row::-webkit-scrollbar {
          display: none;
        }

        .toolbar-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid #1f1f28;
          color: #9ca3af;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 7px 12px;
          border-radius: 0;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .toolbar-tab:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #f5f5f5;
          border-color: rgba(148, 163, 184, 0.2);
        }

        .toolbar-tab:focus-visible,
        .copy-btn:focus-visible {
          outline: 1px solid rgba(232, 121, 249, 0.7);
          outline-offset: 2px;
        }

        .tab-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
          width: 16px;
          height: 16px;
        }

        .tab-text {
          line-height: 1;
        }

        .toolbar-tab:hover .tab-icon {
          transform: scale(1.05);
        }

        .toolbar-tab.is-active {
          background: #15191b;
          border-color: rgba(103, 232, 249, 0.42);
          color: #f5f5f5;
          box-shadow: inset 0 -1px 0 rgba(103, 232, 249, 0.7);
        }

        .workspace-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #1f1f28;
        }

        .workspace-panel {
          background: #07070a;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: #09090e;
          border-bottom: 1px solid #1f1f28;
        }

        .panel-label {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8c8f99;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .response-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          color: #34D399;
          background: rgba(52, 211, 153, 0.08);
          border: 1px solid rgba(52, 211, 153, 0.2);
          padding: 2px 6px;
          border-radius: 0;
          flex-shrink: 0;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          background: #34D399;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(52, 211, 153, 0.5);
        }

        .copy-btn {
          background: transparent;
          border: 1px solid #1f1f28;
          color: #a7a7b1;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 5px 10px;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }

        .copy-btn:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #f5f5f5;
          border-color: rgba(148, 163, 184, 0.3);
        }

        .copy-btn.is-copied {
          border-color: rgba(52, 211, 153, 0.4);
          background: rgba(52, 211, 153, 0.06);
          color: #34D399;
        }

        .copy-success-flex {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .code-container {
          padding: 18px;
          overflow-x: auto;
          background: #050505;
          flex: 1;
          max-height: 420px;
          scrollbar-width: thin;
          scrollbar-color: #1f1f28 transparent;
        }

        .code-container::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }

        .code-container::-webkit-scrollbar-thumb {
          background: #1f1f28;
        }

        .code-pre {
          margin: 0;
          font-family: "JetBrains Mono", monospace;
          font-size: 11.5px;
          line-height: 1.65;
          white-space: pre;
        }

        .code-line {
          display: flex;
          align-items: center;
          min-height: 1.65em;
        }

        .line-num {
          display: inline-block;
          width: 28px;
          user-select: none;
          text-align: right;
          margin-right: 18px;
          color: #3f424e;
          font-size: 10.5px;
          flex-shrink: 0;
        }

        /* Professional Dark Theme Syntax Palette */
        .token-keyword { color: #c084fc; font-weight: 500; }
        .token-string { color: #34d399; }
        .token-function { color: #67e8f9; }
        .token-number { color: #f59e0b; }
        .token-boolean { color: #f59e0b; }
        .token-type { color: #60a5fa; }
        .token-comment { color: #6b7280; font-style: italic; }
        .token-punctuation { color: #9ca3af; }
        .token-variable { color: #e2e8f0; }
        .token-json-key { color: #93c5fd; }

        .workspace-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          background: #09090e;
          border-top: 1px solid #1f1f28;
        }

        .illustrative-note {
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          color: #787d89;
          letter-spacing: 0.03em;
        }

        .endpoint-meta {
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          color: #9ca3af;
          letter-spacing: 0.05em;
        }

        @media (max-width: 900px) {
          .workspace-grid {
            grid-template-columns: 1fr;
          }
          
          .endpoint-meta {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
