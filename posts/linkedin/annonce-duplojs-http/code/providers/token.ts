import { D, DPE } from "@duplojs/utils";
import { Signer, createTokenHandler } from "@duplojs/json-web-token";
import { envs } from "../env";

export const tokenProvider = createTokenHandler({
	maxAge: D.createTime(15, "minute"),
	signer: Signer.createHS256({ secret: envs.TOKEN_SECRET }),
	issuer: "my-app",
	audience: ["web"],
	customPayloadShape: {
		userId: DPE.number(),
		userEmail: DPE.email(),
	},
});
