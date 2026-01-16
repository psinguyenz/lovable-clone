import { useTheme } from "next-themes";

export function useCurrentTheme() {
    const { theme, systemTheme } = useTheme();
    
    // if the theme is already set, return it
    if (theme === "dark" || theme === "light") {
        return theme;
    }

    return systemTheme;
}