import { ProjectView } from "@/modules/projects/ui/views/project-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

interface Props {
    params: Promise<{
        projectId: string; // this gotta match the name in the dynamic folder [projectId]
    }>
};

const Page = async ({ params }: Props) => {
    const { projectId } = await params;

    const queryClient = await getQueryClient();
    void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({
        projectId,
    }));
    void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
        id: projectId,
    }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<p>Loading Project...</p>}>
                {/* explicitly name this projectId because the "id" reference to some other id in html */}
                <ProjectView projectId={projectId} /> 
            </Suspense>
        </HydrationBoundary>
    );
}

export default Page;