// no need the "use-client" since project-view already has it so its children will as well
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { useEffect, useRef } from "react";
import { Fragment } from "@/generated/prisma/client";
import { MessageLoading } from "./message-loading";

interface Props {
    // any changes you make here have to correspond to the caller on "project-view.tsx"
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment | null) => void;
};

export const MessagesContainer = ({ 
    // this has to correspond to the Props Interface
    projectId,
    activeFragment,
    setActiveFragment, 
}: Props) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const trpc = useTRPC();
    const lastAssistantMessageIdRef = useRef<string | null>(null);

    // the useSuspenseQuery if being used in a deeper component (like messages-container) then the page will load faster
    // It's not really faster tho but visually faster
    const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({
        projectId: projectId,
    }, {
        refetchInterval: 2000, // refresh after every 5 seconds (this could work since it's not a live chat)
    }));

    useEffect(() => {
        const lastAssistantMessage = messages.findLast(
            (message) => message.role === "ASSISTANT"
            // if can't find will return undefined
        );

        if (
            // the question mark will return false if lastAssistantMessage's undefined
            lastAssistantMessage?.fragment &&
            lastAssistantMessage.id !== lastAssistantMessageIdRef.current 
            // the lastAMes.id will only renew when user input a new message, then it will run the if statement below
            // otherwise, this will always be False to prevent it from setting a new Active Fragment every 5 seconds in refetch
        ) {
            setActiveFragment(lastAssistantMessage.fragment);
            lastAssistantMessageIdRef.current = lastAssistantMessage.id;
        }
    }, [messages, setActiveFragment]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [messages.length]);

    const lastMessage = messages[messages.length - 1];
    const isLastMessageUser = lastMessage?.role === "USER";

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="pt-2 pr1">
                    {messages.map((message) => (
                        <MessageCard 
                            key={message.id}
                            content={message.content}
                            role={message.role}
                            fragment={message.fragment}
                            createdAt={message.createdAt}
                            isActiveFragment={activeFragment?.id === message.fragment?.id} // check if there's a fragment
                            onFragmentClick={() => setActiveFragment(message.fragment)} // select the fragment
                            type={message.type}
                        />
                    ))}
                    {isLastMessageUser && <MessageLoading />}
                    {/* auto scroll down to the last message */}
                    <div ref={bottomRef} /> 
                </div>
            </div>
            <div className="relative p-3 pt-1">
                {/* this div create the fade out transition */}
                <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" /> 
                <MessageForm projectId={projectId} />
            </div>
        </div>
    );
};