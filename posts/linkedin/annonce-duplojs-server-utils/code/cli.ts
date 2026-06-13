import { SC } from "@duplojs/server-utils";
import { DPE } from "@duplojs/utils";

await SC.exec(
	{
		displayName: "resize image",
		description: "Resize an image CLI",
		options: [
			SC.createArrayOption(
				"formats",
				DPE.literal(["webp", "avif", "jpeg"]),
				{
					separator: ",",
					description: "default convert to webp",
				},
			),
			SC.createOption(
				"quality",
				DPE.number().min(0).max(100),
				{
					aliases: ["q"],
					description: "Compression quality (0-100), default 80",
				},
			),
		],
		subjects: [
			SC.createArgument(
				"filePath",
				DPE.string(),
				{
					description: "Absolute file path",
				},
			),
			SC.createArgument(
				"width",
				DPE.number(),
			),
			SC.createArgument(
				"height",
				DPE.number(),
				{
					description: "If not specified, equal to width",
					optional: true,
				},
			),
		],
	},
	({
		args: { filePath, width, height },
		options: { formats = <const>["webp"], quality },
	}) => {
		for (const format of formats) {
			void console.log(
				"Resize:",
				{
					filePath,
					width,
					height: height ?? width,
					quality: quality ?? 80,
					format,
				},
			);
		}
	},
);
