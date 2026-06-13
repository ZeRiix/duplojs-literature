import { D, DPE } from "@duplojs/utils";
import { Signer, createTokenHandler } from "@duplojs/json-web-token";

const tokenHandler = createTokenHandler({
	maxAge: D.createTime(15, "minute"),
	signer: Signer.createHS256({ secret: "my-secret" }),
	issuer: "my-app",
	audience: ["web"],
	customPayloadShape: {
		userId: DPE.string(),
	},
});

const token = await tokenHandler.createOrThrow({
	userId: "1",
});

// send to client ...

const verifiedToken = await tokenHandler.verify("receive-token");
