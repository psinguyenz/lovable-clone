// This will turn the structures we created in src/lib/utils.ts into a collapsible and viewable interface
import { TreeItem } from "@/types";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarProvider,
    SidebarRail,
} from "@/components/ui/sidebar";
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";

interface TreeViewProps {
    data: TreeItem[];
    value?: string | null;
    onSelect?: (value: string) => void;
};

export const TreeView = ({
    data,
    value,
    onSelect,
}: TreeViewProps) => {
    return (
        <SidebarProvider>
            <Sidebar collapsible="none" className="w-full">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {/* go through the highest level (root) and put it to Component Tree to continue processing */}
                                {data.map((item, index) => (
                                    <Tree 
                                        key={index}
                                        item={item}
                                        selectedValue={value}
                                        onSelect={onSelect}
                                        parentPath=""
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail />
            </Sidebar>
        </SidebarProvider>
    )
};

interface TreeProps {
    item: TreeItem;
    selectedValue?: string | null;
    onSelect?: (value: string) => void;
    parentPath: string;
}


const Tree = ({ item, selectedValue, onSelect, parentPath }: TreeProps) => {
    const [name, ...items] = Array.isArray(item) ? item: [item];
    // if item is a Folder ex: ["src", "app.js"], then name will be "src", items will be "app.js"
    // if item is a File then name will be "app.js", items will be empty
    const currentPath = parentPath ? `${parentPath}/${name}` : name;
    // ex: src + components + button.tsx = src/components/button.tsx

    if (!items.length) {
        // It's a file (because items is empty)
        const isSelected = selectedValue === currentPath;

        return (
            <SidebarMenuButton
                isActive={isSelected}
                className="data-[active=true]:bg-transparent"
                onClick={() => onSelect?.(currentPath)}
            >
                <FileIcon />
                <span className="truncate">
                    {name}
                </span>
            </SidebarMenuButton>
        )
    }

    // It's a folder
    return (
        <SidebarMenuItem>
            <Collapsible
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                defaultOpen
            >
                {/* CollapsibleTrigger show icon Folder and name, when pressed will open or close */}
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <ChevronRightIcon className="transition-transform" />
                        <FolderIcon />
                        <span className="truncate">
                            {name}
                        </span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                {/* Inside itself calls another Tree to draw the child node, this repeats until it reaches File */}
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {items.map((subItem, index) => (
                            <Tree 
                                key={index}
                                item={subItem}
                                selectedValue={selectedValue}
                                onSelect={onSelect}
                                parentPath={currentPath}
                            />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    )
};