"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { MessagesContainer } from "../components/messages-container";
import { Suspense } from "react";

interface Props {
    projectId: string;
};

export const ProjectView = ({ projectId }: Props) => {
    return (
        <div className="h-screen">
            {/* the resizable was imported from shadcn ui */}
            {/* now the "orientation" is changed to "direction" in the new Shadcn */}
            <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="flex flex-col min-h-0"
                >
                    <Suspense fallback={<p>Loading messages...</p>}>
                        <MessagesContainer projectId={projectId}/>
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                    defaultSize={65} // this and the above size has to add up to 100
                    minSize={50}
                >
                    TODO: Preview
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};