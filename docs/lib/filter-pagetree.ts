import { DocsLayoutProps } from "fumadocs-ui/layouts/docs";

type Node = DocsLayoutProps["tree"]["children"][number] & {
  url?: string;
  index?: { url?: string };
  children?: Node[];
};

/**
 * Check if URL is a Chinese version
 */
function isChineseUrl(url: string): boolean {
  return (
    url.includes("/_cn") ||
    url.includes("/(root)_cn") ||
    /(?:^|\/)\w+_cn(?:\/|$)/.test(url)
  );
}

/**
 * Check if URL is an English version
 */
function isEnglishUrl(url: string): boolean {
  return !isChineseUrl(url);
}

/**
 * Filter page tree by locale (language)
 * - English locale: show only English pages
 * - Chinese locale: show only Chinese pages
 */
export function filterPageTreeByLocale(
  pageTree: DocsLayoutProps["tree"],
  isChinese: boolean
): DocsLayoutProps["tree"] {
  const filtered = { ...pageTree };

  function shouldIncludeNode(node: Node): boolean {
    const url = node.index?.url || node.url || "";

    if (isChinese) {
      // For Chinese locale, include only Chinese URLs
      return isChineseUrl(url);
    } else {
      // For English locale, include only English URLs
      return isEnglishUrl(url);
    }
  }

  function filterNode(node: Node): Node | null {
    const nodeCopy = { ...node } as Node;

    // Filter children recursively
    if (nodeCopy.children) {
      nodeCopy.children = nodeCopy.children
        .map(filterNode)
        .filter((child): child is Node => child !== null);
    }

    // Keep the node if:
    // 1. It matches the current locale, OR
    // 2. It has children that match the current locale
    const hasMatchingChildren =
      nodeCopy.children && nodeCopy.children.length > 0;
    const matchesLocale = shouldIncludeNode(nodeCopy);

    if (matchesLocale || hasMatchingChildren) {
      return nodeCopy;
    }

    return null;
  }

  filtered.children = filtered.children
    .map(filterNode)
    .filter((child): child is Node => child !== null) as any;

  return filtered;
}
