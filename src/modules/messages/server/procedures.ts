import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { consumeCredits } from "@/lib/usage";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const messagesRouter = createTRPCRouter({
    // get many messages
    // use the protectedProcedure to ensure the user is authenticated and make sure a type exist 100%
    getMany: protectedProcedure
        .input(
            z.object({
                projectId: z.string().min(1, { message: "Project ID is required "}),
            }),
        )
        .query(async ({ input, ctx }) => {
            const messages = await prisma.message.findMany({
                where: {
                    projectId: input.projectId,
                    project: {
                        userId: ctx.auth.userId,
                    }
                },
                include: {
                    fragment: true,
                },
                orderBy: {
                    updatedAt: "asc",
                },
                // include: {
                //     fragment: true, // include the code
                // }
            });

            return messages;
        }),

    create: protectedProcedure
        .input(
            z.object({
                value: z.string()
                    .min(1, {message: "Value is required" })
                    .max(10000, { message: "Value is too long"}), // add this to prevent spammers
                projectId: z.string().min(1, { message: "Project ID is required "}),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            // add the existingProject to check the userId
            // this will not allow users to create messages in someone else's project
            const existingProject = await prisma.project.findUnique({
                where: {
                    id: input.projectId,
                    userId: ctx.auth.userId, // it needs to match the userId who created that project
                },
            });

            if (!existingProject) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Project not found"})
            }

            try {
                await consumeCredits();
            } catch (error) {
                if (error instanceof Error) {
                    // something unexpected happened
                    throw new TRPCError({ code: "BAD_REQUEST", message: "Something went wrong"})
                } else {
                    throw new TRPCError({
                        code: "TOO_MANY_REQUESTS",
                        message: "You have run out of credits" // call this before it create a message so you don't run out of money
                    });
                }
            }

            const createdMessage = await prisma.message.create({
                data: {
                    // projectId: input.projectId,
                    projectId: existingProject.id, // use this for even more safety
                    content: input.value,
                    role: "USER",
                    type: "RESULT",
                },
            });

            await inngest.send({
                name: "code-agent/run",
                data: {
                    value: input.value,
                    projectId: input.projectId, // receive this id
                },
            });

            return createdMessage;
        }),
});

// message.create