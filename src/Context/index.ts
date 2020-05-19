import { generateContextFromRequest } from "./generateContextFromRequest";
import { ContainerInstance } from "typedi";

export type Context = ReturnType<typeof generateContextFromRequest> & {
    requestId: number;
    container: ContainerInstance;
};

export type Auth = Context["auth"];
