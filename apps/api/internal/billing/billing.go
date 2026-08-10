package billing

// Rate holds per-token cost, expressed as USD per token (i.e. USD-per-million / 1,000,000).
type Rate struct {
	InputRate  float64
	OutputRate float64
}

// Verified against official docs on 2026-08-10:
//
//	OpenAI:    https://openai.com/api/pricing/
//	Anthropic: https://platform.claude.com/docs/en/about-claude/pricing
//	Google:    https://ai.google.dev/gemini-api/docs/pricing
var Rates = map[string]Rate{

	// ---------- OpenAI ----------
	"gpt-5.5": {
		InputRate:  5.00 / 1000000,
		OutputRate: 30.00 / 1000000,
	},
	"gpt-5.5-pro": {
		InputRate:  30.00 / 1000000,
		OutputRate: 180.00 / 1000000,
	},
	"gpt-5.4": {
		InputRate:  2.50 / 1000000,
		OutputRate: 15.00 / 1000000,
	},
	"gpt-5.4-nano": {
		InputRate:  0.20 / 1000000,
		OutputRate: 1.25 / 1000000,
	},
	"gpt-4.1": {
		InputRate:  2.00 / 1000000,
		OutputRate: 8.00 / 1000000,
	},
	"gpt-4.1-mini": {
		InputRate:  0.40 / 1000000,
		OutputRate: 1.60 / 1000000,
	},
	"gpt-4.1-nano": {
		InputRate:  0.10 / 1000000,
		OutputRate: 0.40 / 1000000,
	},
	"o3": {
		InputRate:  2.00 / 1000000,
		OutputRate: 8.00 / 1000000,
	},
	"o4-mini": {
		InputRate:  1.10 / 1000000,
		OutputRate: 4.40 / 1000000,
	},

	// ---------- Anthropic (Claude) ----------
	"claude-fable-5": {
		InputRate:  10.00 / 1000000,
		OutputRate: 50.00 / 1000000,
	},
	"claude-opus-5": {
		InputRate:  5.00 / 1000000,
		OutputRate: 25.00 / 1000000,
	},
	"claude-opus-4-8": {
		InputRate:  5.00 / 1000000,
		OutputRate: 25.00 / 1000000,
	},
	// Introductory pricing through Aug 31, 2026
	"claude-sonnet-5-intro": {
		InputRate:  2.00 / 1000000,
		OutputRate: 10.00 / 1000000,
	},
	// Standard pricing starting Sep 1, 2026
	"claude-sonnet-5": {
		InputRate:  3.00 / 1000000,
		OutputRate: 15.00 / 1000000,
	},
	"claude-sonnet-4-6": {
		InputRate:  3.00 / 1000000,
		OutputRate: 15.00 / 1000000,
	},
	"claude-haiku-4-5-20251001": {
		InputRate:  1.00 / 1000000,
		OutputRate: 5.00 / 1000000,
	},

	// ---------- Google (Gemini) ----------
	"gemini-3.6-flash": {
		InputRate:  1.50 / 1000000,
		OutputRate: 7.50 / 1000000,
	},
	"gemini-3.5-flash": {
		InputRate:  1.50 / 1000000,
		OutputRate: 9.00 / 1000000,
	},
	"gemini-3.5-flash-lite": {
		InputRate:  0.30 / 1000000,
		OutputRate: 2.50 / 1000000,
	},
	"gemini-3.1-flash-lite": {
		InputRate:  0.25 / 1000000,
		OutputRate: 1.50 / 1000000,
	},
	// <=200k token prompts; jumps to $4.00/$18.00 above 200k
	"gemini-3.1-pro-preview": {
		InputRate:  2.00 / 1000000,
		OutputRate: 12.00 / 1000000,
	},
	// <=200k token prompts; jumps to $2.50/$15.00 above 200k
	"gemini-2.5-pro": {
		InputRate:  1.25 / 1000000,
		OutputRate: 10.00 / 1000000,
	},
	"gemini-2.5-flash": {
		InputRate:  0.30 / 1000000,
		OutputRate: 2.50 / 1000000,
	},
	"gemini-2.5-flash-lite": {
		InputRate:  0.10 / 1000000,
		OutputRate: 0.40 / 1000000,
	},
}

func CalculateCost(model string, inputToken, outputToken int) float64 {
	rate, exists := Rates[model]
	if !exists {
		return 0.0
	}

	return (float64(inputToken)*rate.InputRate + float64(outputToken)*rate.OutputRate)
}
