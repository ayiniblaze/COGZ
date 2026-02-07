import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createHmac } from "node:crypto";
import { evaluateCode } from "@/shared/codeEvaluator";

const app = new Hono<{ Bindings: Env }>();

function toBase64UrlFromString(value: string) {
	return Buffer.from(value, "utf8").toString("base64url");
}

function hmacSha256(secret: string, message: string) {
	return createHmac("sha256", secret).update(message).digest("base64url");
}

function createToken(secret: string, payload: Record<string, unknown>) {
	const body = toBase64UrlFromString(JSON.stringify(payload));
	const signature = hmacSha256(secret, body);
	return `${body}.${signature}`;
}

app.get("/api/health", (c) => c.json({ ok: true }));

app.post(
	"/api/login",
	zValidator(
		"json",
		z.object({
			username: z.string().min(1),
			password: z.string().min(1),
		})
	),
	async (c) => {
		const { username, password } = c.req.valid("json");

		const envAny = c.env as any;
		const expectedUser = (envAny?.ADMIN_USER as string | undefined) ?? "cogz";
		const expectedPass = (envAny?.ADMIN_PASS as string | undefined) ?? "cogz";

		if (username !== expectedUser || password !== expectedPass) {
			return c.json({ ok: false, message: "Invalid username or password" }, 401);
		}

		const secret = (envAny?.AUTH_SECRET as string | undefined) ?? "dev-secret-change-me";
		const now = Date.now();
		const token = createToken(secret, {
			sub: username,
			iat: now,
			exp: now + 1000 * 60 * 60 * 24,
		});

		return c.json({ ok: true, token });
	}
);

app.post(
	"/api/analyze",
	zValidator(
		"json",
		z.object({
			code: z.string().min(1),
			language: z.string().optional().default("unknown"),
		})
	),
	async (c) => {
		const { code, language } = c.req.valid("json");

		// Backend-only evaluation
		const evalResult = evaluateCode(code, language);

		if (evalResult.isValid) {
			// IMPORTANT: When the user has debugged correctly, do not provide extra hints.
			return c.json({
				ok: true,
				isCorrect: true,
				message: "Yes you are right",
			});
		}

		return c.json({
			ok: true,
			isCorrect: false,
			message: "Not correct yet",
			details: {
				language: evalResult.language,
				errors: evalResult.errors,
				guidance: evalResult.guidance,
			},
		});
	}
);

export default app;
