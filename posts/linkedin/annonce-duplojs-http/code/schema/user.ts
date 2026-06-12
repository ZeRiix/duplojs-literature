import { DPE } from "@duplojs/utils";

export const userSchema = DPE.object({
    id: DPE.number(),
    name: DPE.string(),
    email: DPE.email(),
    createdAt: DPE.date(),
});
