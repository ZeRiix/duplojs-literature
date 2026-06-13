import { ResponseContract, useProcessBuilder } from "@duplojs/http";
import { asyncPipe, DPE, E, O } from "@duplojs/utils";
import { userExist } from "../checkers";
import { tokenProvider } from "../providers/token";

export const authenticationProcess = useProcessBuilder()
	.extract({
		headers: {
			authorization: DPE.string(),
		},
	})
	.cut(
		ResponseContract.unauthorized("token.invalid"),
		async({ authorization }, { response, output }) => asyncPipe(
			authorization,
			tokenProvider.verify,
			E.whenIsLeftElse(
				() => response("token.invalid"),
				({ payload }) => output({ authenticatedUserId: payload.userId }),
			),
		),
	)
	.check(
		userExist,
		{
			input: O.getProperty("authenticatedUserId"),
			result: "user.find",
			otherwise: ResponseContract.notFound("token.user.notfound"),
			indexing: "user",
		},
	)
	.exports(["user"]);
