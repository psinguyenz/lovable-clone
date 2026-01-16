"use client";

import { dark } from "@clerk/themes";
import { useCurrentTheme } from "@/hooks/use-current-theme";
import { UserButton } from "@clerk/nextjs";

interface Props {
    showName?: boolean;
}

export const UserControl = ({ showName }: Props) => {
    const currentTheme = useCurrentTheme();

    return (
        <UserButton 
            showName={showName}
            appearance={{
                elements: {
                    userButtonBox: "rouned-md!",
                    userButtonAvatarBox: "rouned-md! size-9",
                    userButtonTrigger: "rouned-md!",
                },
                // use the dark theme if the current theme is dark, otherwise use the default theme
                baseTheme: currentTheme === "dark" ? dark : undefined, 
            }}
        />
    );
};