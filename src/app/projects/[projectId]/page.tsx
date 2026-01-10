interface Props {
    params: Promise<{
        projectId: string; // this gotta match the name in the dynamic folder [projectId]
    }>
};

const Page = async ({ params }: Props) => {
    const { projectId } = await params;

    return (
        <div>
            Project id: {projectId}
        </div>
    );
}

export default Page;