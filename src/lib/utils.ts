import { TreeItem } from "@/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn used to overwrite the latest class in Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
* Convert a record of files to a tree structure.
* @param files -Record of file paths to content
* @returns Tree structure for TreeView component
* 
* @example
* Input: {"src/Button.tsx": "...", "README.md": "..."}
* Output: [["src", "Button.tsx"], "README.md"]
*/
export function convertFilesToTreeItems(
  files: { [path:string]: string},
) : TreeItem[] {
  // Define proper type for tree structure
  interface TreeNode {
    [key: string]: TreeNode | null;
  };

  // Build a tree structure first
  const tree: TreeNode = {};

  // Sort files to ensure consistent ordering
  const sortedPaths = Object.keys(files).sort();

  for (const filePath of sortedPaths) {
    const parts = filePath.split("/");
    let current = tree;

    // Loop throughout the filePath
    for (let i=0; i < parts.length-1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {}; // If there's none then create new
      }
      current=current[part]; // If there's a path then we go inside
    }

    // Add the file (leaf node) after we go throughout a path
    const fileName = parts[parts.length - 1];
    current[fileName] = null;
  }
  // After the for loop, a "src/app.ts" will look like this:
  // {
  //   "src": {
  //     "app.ts": null
  //   }
  // }


  /**
  * Convert tree structure to TreeItem format 
  */
  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
    const entries = Object.entries(node); // Get list of everything inside the folder

    // If the folder empty
    if (entries.length === 0) {
      return name || "";
    }

    const children: TreeItem[] = [];

    for (const [key, value] of entries) {
      if (value === null) {
        // This is a file
        children.push(key); // add file in array
      } else {
        // This is a folder, then we run convertNode again to get deeper in the tree
        const subTree = convertNode(value, key);
        if (Array.isArray(subTree)) {
          children.push([key, ...subTree]); // one entry can either be TreeItem[] or TreeItem
        } else {
          children.push([key, subTree]);
        }
      }
    }
    return children;
  }
  // We gotta know which is Folder (for collapsible) and which is File (for showing content)

  const result = convertNode(tree);
  return Array.isArray(result) ? result : [result];
};
