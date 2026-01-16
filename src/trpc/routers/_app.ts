import { createTRPCRouter } from '../init';
import { messagesRouter } from '@/modules/messages/server/procedures';
import { projectsRouter } from '@/modules/projects/server/procedures';
import { usageRouter } from '@/modules/usage/server/procedures';

export const appRouter = createTRPCRouter({
// trpc enable full stack type-safety from start to end
    messages: messagesRouter,
    projects: projectsRouter,
    usage: usageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;