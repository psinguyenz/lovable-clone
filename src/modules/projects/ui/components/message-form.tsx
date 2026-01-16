import { z } from "zod"
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import TextareaAutosize from "react-textarea-autosize"
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Usage } from "./usage";
import { useRouter } from "next/navigation";

// Caution note: we use cn when the condition is dynamic(non-static) or input through props
interface Props {
    projectId: string;
};

const formSchema = z.object({
    // use Zod to create a schema (plan) for form
    value: z.string()
        .min(1, {message: "Value is required" })
        .max(10000, { message: "Value is too long"}), // add this to prevent spammers
})

export const MessageForm = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: usage } = useQuery(trpc.usage.status.queryOptions())

    // initiate Form with React Hook Form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), // autocheck with the schema above
        defaultValues: {
            value: "",
        },
    });

    const createMessage = useMutation(trpc.messages.create.mutationOptions({
        // this happens after we submit
        onSuccess: () => {
            form.reset(); // delete form content after succesfully submitted
            queryClient.invalidateQueries(
                // refresh messages
                trpc.messages.getMany.queryOptions({ projectId})
            );
            queryClient.invalidateQueries(
                // automatically update the user's points
                trpc.usage.status.queryOptions()
            );
        },
        onError: (error) => {
            toast.error(error.message);

            if (error.data?.code === "TOO_MANY_REQUESTS") {
                router.push("/pricing"); // auto redirect to pricing page when run out of credits
            }
        }
    }))

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // when user hit submit, this get values from form then call "createMessage" to push to server using tRPC
        await createMessage.mutateAsync({
            value: values.value,
            projectId,
        });
    };

    const [isFocused, setIsFocused] = useState(false);
    const showUsage = !!usage;
    const isPending = createMessage.isPending;
    const isButtonDisabled = isPending || !form.formState.isValid;

    return (
        <Form {...form}>
            {showUsage && (
                <Usage
                    points={usage.remainingPoints}
                    msBeforeNext={usage.msBeforeNext}
                />
            )}

            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn(
                    "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
                    isFocused && "shadow-xs",
                    showUsage && "rounded-t-none",
                )}
            >
                {/* connect to an input space */}
                <FormField 
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <TextareaAutosize 
                            {...field}
                            disabled={isPending} // only disable if it's pending
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            minRows={2}
                            maxRows={8}
                            className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                            placeholder="What would you like to build"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmit)(e);
                                }
                            }}
                        />
                    )}
                />
                <div className="flex gap-x-2 items-end justify-between pt-2">
                    <div className="text-[10px] text-muted-foreground font-mono">
                        <kbd>
                            <span className="ml-auto pointer-events-none inline-flex h-5 select-none items-center 
                            gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                &#8984;
                            </span>Ctrl + Enter
                        </kbd>
                        &nbsp;to submit
                    </div>
                    <Button 
                        disabled={isButtonDisabled}
                        className={cn(
                            "size-8 rounded-full",
                            isButtonDisabled && "bg-muted-foreground border"
                        )}
                    >
                        {isPending ? (
                            // a spinning icon while being sent
                            <Loader2Icon className="size-4 animate-spin" />
                        ) : (
                            <ArrowUpIcon />
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};