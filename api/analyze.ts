import { evaluateCode } from "../src/shared/codeEvaluator";

type AnalyzeRequestBody = {
  code?: unknown;
  language?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, message: "Method not allowed" }));
    return;
  }

  const body: AnalyzeRequestBody = req.body ?? {};
  const code = asString(body.code);
  const language = asString(body.language) || "javascript";

  if (!code.trim()) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        ok: true,
        isCorrect: false,
        message: "No code provided",
        details: {
          language,
          errors: [
            {
              message: "Please paste your code before analyzing.",
              severity: "error",
              hint: "Add some code, then click Analyze.",
            },
          ],
          guidance: [],
        },
      })
    );
    return;
  }

  try {
    const evalResult = evaluateCode(code, language);

    if (evalResult.isValid) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      // IMPORTANT: strict success behavior.
      res.end(JSON.stringify({ ok: true, isCorrect: true, message: "Yes you are right" }));
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        ok: true,
        isCorrect: false,
        message: "Issues found",
        details: {
          language: evalResult.language,
          errors: evalResult.errors,
          guidance: evalResult.guidance,
        },
      })
    );
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        ok: false,
        message: "Backend error",
        error: error?.message ? String(error.message) : String(error),
      })
    );
  }
}
