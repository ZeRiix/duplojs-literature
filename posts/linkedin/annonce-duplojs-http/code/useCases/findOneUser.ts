import { D, type DP } from "@duplojs/utils";
import { type userSchema } from "../schema";

export function findOneUser(id: number): Promise<DP.Output<typeof userSchema>> {
	return Promise.resolve({
		id: 1,
		name: "William",
		email: "william@mail.com",
		createdAt: D.create("2026-01-01"),
	});
}
