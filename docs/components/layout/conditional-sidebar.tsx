"use client";

import { usePathname } from "next/navigation";
import { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import Sidebar from "./sidebar";
import IntegrationsSidebar from "./integrations-sidebar";
import { INTEGRATION_ORDER } from "@/lib/integrations";
import { normalizeUrl } from "@/lib/analytics-utils";
import { useMemo } from "react";
import VersionSelector, {
  getVersionFromPathname,
} from "@/components/ui/reference-sidebar/version-selector";
import { isChinesePath } from "@/lib/i18n-utils";

interface ConditionalSidebarProps {
  pageTree: DocsLayoutProps["tree"];
}

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

export default function ConditionalSidebar({
  pageTree,
}: ConditionalSidebarProps) {
  const pathname = usePathname();
  const isChinese = isChinesePath(pathname);

  // Filter pageTree by current locale
  const filteredPageTree = useMemo(() => {
    return filterPageTreeByLocale(pageTree, isChinese);
  }, [pageTree, isChinese]);

  // Normalize the pathname to handle /integrations/... paths
  const normalizedPathname = normalizeUrl(pathname);
  // Check if this is an integration landing page (e.g., /langgraph)
  // Use the first segment of the normalized pathname to ensure correct matching
  const firstSegment = normalizedPathname.replace(/^\//, "").split("/")[0];
  const isIntegrationRoute = INTEGRATION_ORDER.includes(
    firstSegment as (typeof INTEGRATION_ORDER)[number],
  );

  // Check if this is a reference route (e.g., /reference)
  const isReferenceRoute = firstSegment === "reference";
  // Check if this is a learn route (e.g., /learn)
  const isLearnRoute = firstSegment === "learn";
  const currentVersion = getVersionFromPathname(pathname);

  // Find the learn folder and use its children
  const learnPageTree = useMemo(() => {
    if (!isLearnRoute) return null;

    const learnFolder = filteredPageTree.children.find((node) => {
      if (node.type !== "folder") return false;
      const folderNode = node as any;
      const url = folderNode.index?.url || folderNode.url;
      const name =
        typeof folderNode.name === "string" ? folderNode.name : undefined;
      return url === "/learn" || name?.toLowerCase() === "learn";
    }) as Node | undefined;

    if (learnFolder && "children" in learnFolder) {
      return {
        ...filteredPageTree,
        children: (learnFolder as any).children || [],
      };
    }

    return null;
  }, [isLearnRoute, filteredPageTree]);

  // Find the reference folder and drill into the active version
  const referencePageTree = useMemo(() => {
    if (!isReferenceRoute) return null;

    // Find the reference folder
    const referenceFolder = filteredPageTree.children.find((node) => {
      if (node.type !== "folder") return false;
      const folderNode = node as any;
      const url = folderNode.index?.url || folderNode.url;
      const name =
        typeof folderNode.name === "string" ? folderNode.name : undefined;
      return url === "/reference" || name?.toLowerCase() === "reference";
    }) as Node | undefined;

    if (referenceFolder && "children" in referenceFolder) {
      const referenceChildren = (referenceFolder as any).children || [];

      // Find the version folder (v1 or v2) within the reference folder
      const versionFolder = referenceChildren.find((node: any) => {
        if (node.type !== "folder") return false;
        const url = node.index?.url || node.url;
        const name = typeof node.name === "string" ? node.name : undefined;
        return (
          url === `/reference/${currentVersion}` ||
          name?.toLowerCase() === currentVersion
        );
      });

      if (versionFolder && "children" in versionFolder) {
        // Return a pageTree with only the version folder's children
        return {
          ...filteredPageTree,
          children: (versionFolder as any).children || [],
        };
      }

      // Fallback: return the reference folder's children directly
      return {
        ...filteredPageTree,
        children: referenceChildren,
      };
    }

    return null;
  }, [isReferenceRoute, filteredPageTree, currentVersion]);

  if (isIntegrationRoute) {
    return <IntegrationsSidebar pageTree={filteredPageTree} />;
  }

  if (isLearnRoute && learnPageTree) {
    return (
      <Sidebar pageTree={learnPageTree} showIntegrationSelector={false} />
    );
  }

  if (isReferenceRoute && referencePageTree) {
    return (
      <Sidebar
        pageTree={referencePageTree}
        showIntegrationSelector={false}
        headerSlot={<VersionSelector />}
      />
    );
  }

  return <Sidebar pageTree={filteredPageTree} />;
}
