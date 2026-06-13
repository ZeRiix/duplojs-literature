import { C } from "@duplojs/utils";
import { User } from "./entity";

// create newType
const maybeUserId = User.Id.create(12);
const userId = User.Id.createOrThrow(12);

// In Job
const _user = User.create({
	id: User.Id.createOrThrow(12),
	nickname: User.Nickname.createOrThrow("Math"),
});

// To hydrate a simple data
const maybeUser = User.Entity.map({
	id: 1,
	nickname: "William",
	roles: ["client"],
});

const user = User.Entity.mapOrThrow({
	id: 1,
	nickname: "William",
	roles: ["client"],
});

const updateUser = User.Entity.update(
	user,
	{ nickname: User.Nickname.createOrThrow("Math") },
);

const rawUser = C.unwrapEntity(user);
//      ^?
