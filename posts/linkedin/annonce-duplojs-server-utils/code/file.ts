import { SF } from "@duplojs/server-utils";
import { E, unwrap } from "@duplojs/utils";

const writeResult = SF.writeTextFile(
	"/tmp/post-example.txt",
	"DuploJS server-utils: Robust typed servers helpers",
);

writeResult;
// ^?

if (E.isRight(writeResult)) {
	const readResult = await SF.readTextFile("/tmp/post-example.txt");

	if (E.isRight(readResult)) {
		const fileContent = unwrap(readResult);
		// ^?
		console.log("File content:", fileContent);
	}
}
