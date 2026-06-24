import { E } from "@duplojs/utils";

interface User {
	id: string;
	email: string;
}

type RegisterIssue =
	| E.Left<"register.emailInvalid", { input: string }>
	| E.Left<"register.alreadyExists", { email: string }>
	| E.Left<"register.emailBlocked", { email: string }>
	| E.Right<"register.created", User>;

declare const result: RegisterIssue;

interface ResponseLike {
	status(code: number): {
		json(body: unknown): unknown;
	};
}

declare const response: ResponseLike;

E.matchInformation(
	result,
	{
		"register.emailInvalid": () => response.status(400).json({
			field: "email",
			code: "email.invalid",
		}),
		"register.alreadyExists": ({ email }) => response.status(409).json({
			email,
			code: "account.alreadyExists",
		}),
		"register.created": (user) => response.status(201).json(user),
		"register.emailBlocked": () => {},
	},
);
