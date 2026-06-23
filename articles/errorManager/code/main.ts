import { E } from "@duplojs/utils";

interface User {
	id: string;
	email: string;
}

const usersByEmail = new Map<string, User>([
	[
		"ada@example.com",
		{
			id: "user_1",
			email: "ada@example.com",
		},
	],
]);

export function registerUser(input: string) {
	const email = input.trim().toLowerCase();

	if (!email.includes("@")) {
		return E.left("register.emailInvalid", {
			input,
		});
	}

	const existingUser = usersByEmail.get(email);

	if (existingUser) {
		return E.left("register.alreadyExists", {
			userId: existingUser.id,
			email,
		});
	}

	const user: User = {
		id: crypto.randomUUID(),
		email,
	};

	usersByEmail.set(email, user);

	return E.right("register.created", user);
}

export function discriminateRegisterIssue(input: string) {
	const result = registerUser(input);

	if (E.hasInformation(result, "register.alreadyExists")) {
		const conflict = E.unwrapByInformation(
			result,
			"register.alreadyExists",
		);

		return {
			email: conflict.email,
			userId: conflict.userId,
		};
	}

	return result;
}

interface ResponseLike {
	status(code: number): {
		json(body: unknown): unknown;
	};
}

export function handleRegister(input: string, response: ResponseLike) {
	const result = registerUser(input);

	return E.matchInformation(
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
		},
	);
}
