// 🛡️ AI Input Sanitization & Prompt Injection Protection

// Dangerous patterns that could manipulate AI behavior
const DANGEROUS_PATTERNS = [
  /ignore previous instructions/i,
  /you are now/i,
  /act as if/i,
  /system prompt/i,
  /reveal.*password/i,
  /show.*database/i,
  /dump.*data/i,
  /forget.*instructions/i,
  /new instructions/i,
  /override/i,
  /jailbreak/i,
  /DAN mode/i,
];

// Special tokens that shouldn't be in user input
const SPECIAL_TOKENS = [
  '<|', '|>', '
