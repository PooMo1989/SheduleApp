import "server-only";
import { appRouter } from "@/server/routers/_app";
import { createCallerFactory } from "@/lib/trpc/server";
import { createContext } from "@/lib/trpc/context";

const createCaller = createCallerFactory(appRouter);

export const api = async () => {
    const ctx = await createContext();
    return createCaller(ctx);
};
