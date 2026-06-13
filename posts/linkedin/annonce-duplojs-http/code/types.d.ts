import { type TheFormData } from "@duplojs/utils";

import { type TheDate, type SerializedTheDate } from "@duplojs/utils/date";

export type Routes = {
	method: "POST";
	path: "/documents";
	body: TheFormData<{
		userId: number;
		files: File[];
	}>;
	responses: {
		code: "422";
		information: "extract-error";
		body?: undefined;
	} | {
		code: "204";
		information: "files.receive";
		body?: undefined;
	};
} | {
	method: "GET";
	path: "/some-action";
	headers: {
		authorization: string;
	};
	responses: {
		code: "200";
		information: "some-information.send";
		body: {
			id: number;
			name: string;
			email: string;
			createdAt: SerializedTheDate | TheDate;
		};
	} | {
		code: "422";
		information: "extract-error";
		body?: undefined;
	} | {
		code: "401";
		information: "token.invalid";
		body?: undefined;
	} | {
		code: "404";
		information: "token.user.notfound";
		body?: undefined;
	};
};
