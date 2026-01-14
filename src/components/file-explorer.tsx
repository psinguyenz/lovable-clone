// This combine data structure from utils.ts and UI from tree-view.tsx
import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { useState, useMemo, useCallback, Fragment } from "react";

import { Hint } from "./hint";
import { Button } from "./ui/button";
import { Codeview } from "./code-view";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import { 
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./tree-view";

type FileCollection = { [path: string]: string};

/** 
 * get language from file's extension (app.tsx => tsx)
 */
function getLanguageFromExtension(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase();
    return extension || "text";
};

interface FileBreadcrumbProps {
    filePath: string
}

/**
 *  Show where the file at
 */ 
const FileBreadcrumb = ({ filePath } : FileBreadcrumbProps) => {
    const pathSegments = filePath.split("/");
    const maxSegments = 3;

    const renderBreadcrumbItems = () => {
        if (pathSegments.length <= maxSegments) {
            // Show all segments if 3 or less
            return pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1;

                return (
                    <Fragment key={index}>
                        <BreadcrumbItem>
                            {isLast ? (
                                <BreadcrumbPage className="font-medium">
                                    {segment}
                                </BreadcrumbPage>
                            ) : (
                                <span className="text-muted-foreground">
                                    {segment}
                                </span>
                            )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                    </Fragment>
                )
            })
        } else {
            const firstSegment = pathSegments[0];
            const lastSegment = pathSegments[pathSegments.length - 1];

            return (
                <>
                    <BreadcrumbItem>
                        <span className="text-muted-foreground">
                            {firstSegment}
                        </span>
                        <BreadcrumbSeparator />

                        <BreadcrumbItem>
                            {/* print "..." in the middle */}
                            <BreadcrumbEllipsis />
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />

                        <BreadcrumbItem>
                            {/* BreadcrumbPage will highlight the file name */}
                            <BreadcrumbPage className="font-medium">
                                {lastSegment}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbItem>
                </>
            )
        }
    };

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {renderBreadcrumbItems()}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

interface FileExplorerProps {
    files: FileCollection;
};

export const FileExplorer = ({
    files,
}: FileExplorerProps) => {
    const [copied, setCopied] = useState(false);
    // preselect the first file we can find
    const [selectedFile, setSelectedFile] = useState<string | null>(() => {
        const fileKeys = Object.keys(files);
        return fileKeys.length > 0 ? fileKeys[0] : null;
    });

    // useMemo help it only reruns when the files list change, make the experience smoother
    const treeData = useMemo(() => {
        return convertFilesToTreeItems(files);
    }, [files]);

    const handleFileSelect = useCallback((
        filePath: string
    ) => {
        if(files[filePath]) {
            setSelectedFile(filePath)
        }
    }, [files]);

    const handleCopy = useCallback(() => {
        if (selectedFile) {
            // copy code content into temp memory
            navigator.clipboard.writeText(files[selectedFile]);
            setCopied(true); // to change it to CopyCheckIcon
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
    }, [selectedFile, files]);

    return (
        // change "orientation" to "direction" in the latest shadcn ui
        <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
                {/* this is for the tree graph of the files created for you to select using breadcrumb*/}
                <TreeView 
                    data={treeData}
                    value={selectedFile}
                    onSelect={handleFileSelect}
                />
            </ResizablePanel>

            <ResizableHandle className="hoverLbg-primary transition-colors" />
            <ResizablePanel defaultSize={70} minSize={50}>
                {selectedFile && files[selectedFile] ? (
                    <div className="h-full w-full flex flex-col">
                        <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center
                        gap-x-2">
                            <FileBreadcrumb filePath={selectedFile} />
                            <Hint text="Copy to clipboard" side="bottom">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="ml-auto"
                                    onClick={handleCopy}
                                    disabled={copied}
                                >
                                    {copied ? <CopyCheckIcon /> : <CopyIcon />}
                                </Button>
                            </Hint>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <Codeview 
                                code={files[selectedFile]}
                                lang={getLanguageFromExtension(selectedFile)}
                            />
                        </div>
                    </div>
                ) : (
                    // if nothing is selected yet then output this line
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Select a file to view it&apos;s content
                    </div>
                )}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
};


