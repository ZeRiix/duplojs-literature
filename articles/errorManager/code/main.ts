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
		return E.right("register.alreadyExists", {
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

export function consumeRegisterIssue(input: string) {
	const result = registerUser(input);

	return E.matchInformation(
		result,
		{
			"register.emailInvalid": () => ({
				screen: "register",
				field: "email",
				messageKey: "register.email.invalid",
			}),
			"register.alreadyExists": ({ email }) => ({
				screen: "login",
				prefill: {
					email,
				},
				messageKey: "register.account.alreadyExists",
			}),
			"register.created": (user) => ({
				screen: "onboarding",
				user,
			}),
		},
	);
}

interface PaymentRequest {
	amount: number;
	cardToken: string;
}

interface PaymentAuthorization {
	authorizationId: string;
}

export declare function requestPaymentAuthorization(
	request: PaymentRequest,
): Promise<
	| E.Right<"payment.authorized", PaymentAuthorization>
	| E.Left<"payment.cardExpired", PaymentRequest>
	| E.Left<"payment.insufficientFunds", PaymentRequest>
	| E.Left<"payment.providerUnavailable", { provider: "stripe" }>
>;
