/**
 * Code evaluator module
 * Provides syntax checking, execution, and guidance for user-submitted code
 */

export interface EvalResult {
  isValid: boolean;
  language: "javascript" | "python" | "c" | "java" | "other";
  errors: CodeError[];
  warnings: string[];
  guidance: string[];
  successMessage?: string;
  executionOutput?: string;
  executionTime?: number;
}

export interface CodeError {
  line?: number;
  column?: number;
  message: string;
  severity: "error" | "warning";
  hint?: string;
}

/**
 * Check JavaScript/TypeScript syntax
 */
export function checkJavaScriptSyntax(code: string): CodeError[] {
  const errors: CodeError[] = [];
  const trimmed = code.trim();
  
  // Allow partial function/method declarations
  if (trimmed.endsWith(')') || trimmed.endsWith('{') || trimmed.endsWith(':')) {
    return errors; // Partial code is OK
  }
  
  try {
    new Function(code);
  } catch (err: any) {
    const message = err.message || String(err);
    // Be lenient with incomplete code
    if (message.includes('Unexpected end')) {
      return errors; // Partial code is acceptable
    }
    const match = message.match(/(\w+):\s+(.+)/);
    if (match) {
      errors.push({
        message: match[2],
        severity: "error",
        hint: generateJSHint(match[2]),
      });
    } else {
      errors.push({
        message: message,
        severity: "error",
      });
    }
  }
  return errors;
}

/**
 * Check Python syntax (basic - requires backend for full evaluation)
 */
export function checkPythonSyntax(code: string): CodeError[] {
  const errors: CodeError[] = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    // Check for print without parentheses (Python 2 vs 3)
    if (/\bprint\s+[^(]/.test(trimmedLine) && !trimmedLine.includes('print(')) {
      errors.push({
        message: `'print' statement without parentheses - use print() not print`,
        severity: 'error',
        hint: 'Python 3 requires parentheses. Use: print("text") instead of print "text"',
        line: i + 1,
      });
    }

    // Check for missing colons on keywords that need them
    const needsColon = /^\s*(if|elif|else|for|while|def|class|try|except|finally|with)\b/.test(line);
    if (needsColon && !trimmedLine.endsWith(':')) {
      // "else:" doesn't need condition, but "if/elif/for/while/def" do
      const keyword = trimmedLine.match(/^\s*(\w+)/)?.[1];
      if (keyword !== 'else' && keyword !== 'finally') {
        errors.push({
          message: `'${keyword}' statement must end with a colon (:)`,
          severity: 'error',
          hint: `Add a ':' at the end of the '${keyword}' line`,
          line: i + 1,
        });
      }
    }

    // Check for else/finally missing colon
    if (/^\s*(else|finally)\s*/.test(line) && !trimmedLine.endsWith(':')) {
      errors.push({
        message: `'${trimmedLine.split(/\s/)[0]}' statement must end with a colon (:)`,
        severity: 'error',
        hint: `Use: ${trimmedLine.split(/\s/)[0]}: (with colon)`,
        line: i + 1,
      });
    }

    // Check for assignment (=) instead of comparison (==) in conditions
    const assignmentInCondition = /\b(if|elif|while|for)\b.*[^!=<>]\s=\s[^=]/.test(trimmedLine);
    if (assignmentInCondition) {
      errors.push({
        message: `Possible assignment (=) instead of comparison (==) in ${trimmedLine.match(/\b(if|elif|while|for)\b/)?.[1]} condition`,
        severity: 'error',
        hint: 'Use == for comparison instead of = for assignment. For example: if x == 5 not if x = 5',
        line: i + 1,
      });
    }

    // Check for common typos: len vs len(
    if (/\blen\s+\w+/.test(trimmedLine) && !trimmedLine.includes('len(')) {
      errors.push({
        message: `'len' should be used as a function: len(...)`,
        severity: 'error',
        hint: 'Use: len(variable) with parentheses, not len variable',
        line: i + 1,
      });
    }

    // Check for range vs range(
    if (/\brange\s+\w+/.test(trimmedLine) && !trimmedLine.includes('range(')) {
      errors.push({
        message: `'range' should be used as a function: range(...)`,
        severity: 'error',
        hint: 'Use: range(10) with parentheses, not range 10',
        line: i + 1,
      });
    }

    // Check for mismatched parentheses/brackets/braces
    const openParen = (line.match(/\(/g) || []).length;
    const closeParen = (line.match(/\)/g) || []).length;
    const openBracket = (line.match(/\[/g) || []).length;
    const closeBracket = (line.match(/\]/g) || []).length;
    const openBrace = (line.match(/\{/g) || []).length;
    const closeBrace = (line.match(/\}/g) || []).length;
    
    if (openParen !== closeParen) {
      errors.push({
        message: 'Mismatched parentheses',
        severity: 'error',
        hint: 'Check that all ( are closed with )',
        line: i + 1,
      });
    }
    
    if (openBracket !== closeBracket) {
      errors.push({
        message: 'Mismatched brackets',
        severity: 'error',
        hint: 'Check that all [ are closed with ]',
        line: i + 1,
      });
    }

    if (openBrace !== closeBrace) {
      errors.push({
        message: 'Mismatched braces',
        severity: 'error',
        hint: 'Check that all { are closed with }',
        line: i + 1,
      });
    }
  }

  return errors;
}

/**
 * Check C syntax (basic checks)
 */
export function checkCSyntax(code: string): CodeError[] {
  const errors: CodeError[] = [];
  const lines = code.split('\n');

  // Check for matching braces
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push({
      message: `Mismatched braces: ${openBraces} opening, ${closeBraces} closing`,
      severity: 'error',
      hint: 'Make sure every { has a corresponding }',
    });
  }

  // Check for matching parentheses
  const openParen = (code.match(/\(/g) || []).length;
  const closeParen = (code.match(/\)/g) || []).length;
  if (openParen !== closeParen) {
    errors.push({
      message: `Mismatched parentheses: ${openParen} opening, ${closeParen} closing`,
      severity: 'error',
      hint: 'Make sure every ( has a corresponding )',
    });
  }

  // Check for matching brackets
  const openBracket = (code.match(/\[/g) || []).length;
  const closeBracket = (code.match(/\]/g) || []).length;
  if (openBracket !== closeBracket) {
    errors.push({
      message: `Mismatched brackets: ${openBracket} opening, ${closeBracket} closing`,
      severity: 'error',
      hint: 'Make sure every [ has a corresponding ]',
    });
  }

  // Check for main function
  if (!code.includes('main')) {
    errors.push({
      message: 'Missing main() function - every C program needs a main function',
      severity: 'error',
      hint: 'Add: int main() { ... return 0; }',
    });
  }

  // Check for incomplete main function
  const mainMatch = code.match(/int\s+main\s*\(\s*\)\s*\{([^}]*)/s);
  if (mainMatch && !mainMatch[1].includes('return')) {
    errors.push({
      message: 'main() function should have a return statement',
      severity: 'error',
      hint: 'Add: return 0; at the end of main()',
    });
  }

  // Check for assignment (=) instead of comparison (==) in conditions
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for if/while/for with single = instead of ==
    const assignmentInCondition = /\b(if|while|for)\s*\([^)]*[^!=<>]\s=\s[^=][^)]*\)/.test(line);
    if (assignmentInCondition) {
      errors.push({
        message: `Possible assignment (=) instead of comparison (==) in ${line.match(/\b(if|while|for)\b/)?.[1]} condition`,
        severity: 'error',
        hint: 'Use == for comparison instead of = for assignment. For example: if (num == 5) not if (num = 5)',
        line: i + 1,
      });
    }
  }

  // Check for missing semicolons on statements
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines, comments, includes, and preprocessor directives
    if (!line || line.startsWith('//') || line.startsWith('*') || 
        line.startsWith('#include') || line.startsWith('#define') || 
        line.startsWith('#')) {
      continue;
    }

    // Skip lines that are just braces or structure keywords
    if (line === '{' || line === '}' || line === '},' || 
        line.startsWith('if') || line.startsWith('else') || 
        line.startsWith('for') || line.startsWith('while') ||
        line.endsWith('{')) {
      continue;
    }

    // Check variable declarations, assignments, and function calls
    // These should end with semicolon
    const needsSemicolon = /^(int|char|float|double|void|long|short|unsigned)\s+.*[a-zA-Z0-9_\)\]]\s*$/.test(line) ||
                          /^[a-zA-Z_]\w*\s*=.*[a-zA-Z0-9_\)\]]\s*$/.test(line) ||
                          /^\w+\s*\([^)]*\)\s*[a-zA-Z0-9_\)]\s*$/.test(line) ||
                          /^(printf|scanf|return)\s*\(.*\)\s*$/.test(line);

    if (needsSemicolon && !line.endsWith(';') && !line.endsWith(',')) {
      errors.push({
        message: `Missing semicolon at end of statement: "${line}"`,
        severity: 'error',
        hint: 'Add a semicolon (;) at the end of variable declarations, assignments, and function calls',
        line: i + 1,
      });
    }
  }

  return errors;
}

/**
 * Check Java syntax (basic checks)
 */
export function checkJavaSyntax(code: string): CodeError[] {
  const errors: CodeError[] = [];
  const lines = code.split('\n');

  // Check for matching braces
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push({
      message: `Mismatched braces: ${openBraces} opening, ${closeBraces} closing`,
      severity: 'error',
      hint: 'Make sure every { has a corresponding }',
    });
  }

  // Check for matching parentheses
  const openParen = (code.match(/\(/g) || []).length;
  const closeParen = (code.match(/\)/g) || []).length;
  if (openParen !== closeParen) {
    errors.push({
      message: `Mismatched parentheses: ${openParen} opening, ${closeParen} closing`,
      severity: 'error',
      hint: 'Make sure every ( has a corresponding )',
    });
  }

  // Check for matching brackets
  const openBracket = (code.match(/\[/g) || []).length;
  const closeBracket = (code.match(/\]/g) || []).length;
  if (openBracket !== closeBracket) {
    errors.push({
      message: `Mismatched brackets: ${openBracket} opening, ${closeBracket} closing`,
      severity: 'error',
      hint: 'Make sure every [ has a corresponding ]',
    });
  }

  // Check for class definition
  if (!code.includes('class ')) {
    errors.push({
      message: 'Missing class definition - Java programs need at least one public class',
      severity: 'error',
      hint: 'Add: public class ClassName { ... }',
    });
  }

  // Check for main method
  if (!code.includes('main')) {
    errors.push({
      message: 'Missing main() method - must have: public static void main(String[] args)',
      severity: 'error',
      hint: 'Add the main method as entry point',
    });
  }

  // Check for assignment (=) instead of comparison (==) in conditions
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for if/while/for with single = instead of ==
    // Match patterns like: if (var = value) or while (x = 5)
    const assignmentInCondition = /\b(if|while|for)\s*\([^)]*[^!=<>]\s=\s[^=][^)]*\)/.test(line);
    if (assignmentInCondition) {
      errors.push({
        message: `Possible assignment (=) instead of comparison (==) in ${line.match(/\b(if|while|for)\b/)?.[1]} condition`,
        severity: 'error',
        hint: 'Use == for comparison instead of = for assignment. For example: if (num == 5) not if (num = 5)',
        line: i + 1,
      });
    }
  }

  // Check for missing semicolons on statements
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines, comments, and annotations
    if (!line || line.startsWith('//') || line.startsWith('*') || 
        line.startsWith('@') || line.startsWith('import') || 
        line.startsWith('package')) {
      continue;
    }

    // Skip lines that are just braces or control keywords
    if (line === '{' || line === '}' || line.startsWith('if') || 
        line.startsWith('else') || line.startsWith('for') || 
        line.startsWith('while') || line.endsWith('{')) {
      continue;
    }

    // Check variable declarations, assignments, and method calls
    // These should end with semicolon
    const needsSemicolon = /^(public|private|protected|static)?\s*(int|String|double|boolean|void|long|char|float)\s+.*[a-zA-Z0-9_\)\]]\s*$/.test(line) ||
                          /^[a-zA-Z_]\w*\s*=.*[a-zA-Z0-9_\)\]]\s*$/.test(line) ||
                          /^\w+\s*\([^)]*\)\s*[a-zA-Z0-9_\)]\s*$/.test(line) ||
                          /^(System\.out\.println|System\.out\.print|return)\s*\(.*\)\s*$/.test(line);

    if (needsSemicolon && !line.endsWith(';') && !line.endsWith(',')) {
      errors.push({
        message: `Missing semicolon at end of statement: "${line}"`,
        severity: 'error',
        hint: 'Add a semicolon (;) at the end of variable declarations, assignments, and method calls',
        line: i + 1,
      });
    }
  }

  return errors;
}

function generateJSHint(errorMessage: string): string {
  const hints: Record<string, string> = {
    "Unexpected token": "Check brackets, parentheses, and quotes balance.",
    "is not defined": "Variable may not be declared. Use const/let/var.",
    "Cannot read properties":
      "Trying to access property on undefined/null value.",
    "Invalid or unexpected token":
      "Check syntax near the error location.",
  };

  for (const [key, hint] of Object.entries(hints)) {
    if (errorMessage.includes(key)) {
      return hint;
    }
  }
  return "Review the syntax near the error line.";
}

/**
 * Main evaluator function
 */
export function evaluateCode(code: string, language: string): EvalResult {
  const normalizedLang = language.toLowerCase();
  const errors: CodeError[] = [];
  const warnings: string[] = [];
  const guidance: string[] = [];

  if (!code.trim()) {
    return {
      isValid: false,
      language: "other",
      errors: [
        {
          message: "Code cannot be empty",
          severity: "error",
        },
      ],
      warnings,
      guidance: ["Write some code to get started!"],
    };
  }

  let lang: "javascript" | "python" | "c" | "java" | "other" = "other";

  if (
    normalizedLang.includes("js") ||
    normalizedLang.includes("javascript") ||
    normalizedLang.includes("ts") ||
    normalizedLang.includes("typescript")
  ) {
    lang = "javascript";
    errors.push(...checkJavaScriptSyntax(code));
  } else if (normalizedLang.includes("python") || normalizedLang.includes("py")) {
    lang = "python";
    errors.push(...checkPythonSyntax(code));
  } else if (normalizedLang.includes("java") && !normalizedLang.includes("script")) {
    lang = "java";
    errors.push(...checkJavaSyntax(code));
  } else if (normalizedLang.includes("c")) {
    lang = "c";
    errors.push(...checkCSyntax(code));
  }

  // Check for common issues
  if (code.includes("console.log") && lang === "javascript") {
    guidance.push("✓ Found console.log for debugging.");
  }

  if (code.length < 10) {
    guidance.push("💡 Try adding more logic to make this code meaningful.");
  }

  const isCodeValid = errors.length === 0;
  
  if (isCodeValid) {
    guidance.push("✓ No syntax errors detected! Good job.");
  }

  return {
    isValid: isCodeValid,
    language: lang,
    errors,
    warnings,
    guidance,
    successMessage: isCodeValid ? "✅ Your code is correct!" : undefined,
  };
}
