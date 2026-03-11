"use client";

import { usePathname } from "next/navigation";
import { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import Navbar from "./navbar";
import { isChinesePath } from "@/lib/i18n-utils";
import { useMemo } from "react";

type Node = DocsLayoutProps["tree"]["children"][number];

/**
 * Filter page tree by locale
 */
function filterPageTreeByLocale(
  pageTree: DocsLayoutProps["tree"],
  isChinese: boolean
): DocsLayoutProps["tree"] {
  const filtered = { ...pageTree };

  function isChineseUrl(url: string): boolean {
    return (
      url.includes("/_cn") ||
      url.includes("/(root)_cn") ||
      /(?:^|\/)\w+_cn(?:\/|$)/.test(url)
    );
  }

  function shouldIncludeNode(node: Node): boolean {
    const nodeAny = node as any;
    const url = nodeAny.index?.url || nodeAny.url || "";

    if (isChinese) {
      return isChineseUrl(url);
    } else {
      return !isChineseUrl(url);
    }
  }

  function filterNode(node: Node): Node | null {
    const nodeCopy = { ...node } as Node;
    const nodeAny = nodeCopy as any;

    // Filter children recursively
    if (nodeAny.children) {
      nodeAny.children = nodeAny.children
        .map(filterNode)
        .filter((child: Node | null): child is Node => child !== null);
    }

    // Keep the node if it matches locale or has matching children
    const hasMatchingChildren =
      nodeAny.children && nodeAny.children.length > 0;
    const matchesLocale = shouldIncludeNode(nodeCopy);

    if (matchesLocale || hasMatchingChildren) {
      return nodeCopy;
    }

    return null;
  }

  filtered.children = filtered.children
    .map(filterNode)
    .filter((child: Node | null): child is Node => child !== null) as any;

  return filtered;
}

interface ClientNavbarProps {
  pageTree: DocsLayoutProps["tree"];
}

export function ClientNavbar({ pageTree }: ClientNavbarProps) {
  const pathname = usePathname();
  const isChinese = isChinesePath(pathname);

  const filteredPageTree = useMemo(() => {
    return filterPageTreeByLocale(pageTree, isChinese);
  }, [pageTree, isChinese]);

  return <Navbar pageTree={filteredPageTree} />;
}
