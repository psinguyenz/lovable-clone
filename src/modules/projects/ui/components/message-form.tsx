import { z } from "zod"
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import TextareaAutosize from "react-textarea-autosize"
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";

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
    const queryClient = useQueryClient();

    // initiate Form with React Hook Form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), // autocheck with the schema above
        defaultValues: {
            value: "",
        },
    });

    const createMessage = useMutation(trpc.messages.create.mutationOptions({
        // this happens after we submit
        onSuccess: (data) => {
            form.reset(); // delete form content after succesfully submitted
            queryClient.invalidateQueries(
                // refresh messages
                trpc.messages.getMany.queryOptions({ projectId})
            );
            // TODO: Invalidate usage status
        },
        onError: (error) => {
            // TODO: Redirect to pricing page if specific error
            toast.error(error.message);
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
    const showUsage = false;
    const isPending = createMessage.isPending;
    const isButtonDisabled = isPending || !form.formState.isValid;

    return (
        <Form {...form}>
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
                            </span>Enter
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