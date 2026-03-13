/**
 * i18n utilities for URL handling
 */

/**
 * Check if a static param slug (from source.generateParams()) is a Chinese doc.
 * Used when BUILD_CN_ONLY=1 to only pre-render Chinese pages.
 */
export function isChineseSlug(slug: string[] | undefined): boolean {
  if (!slug || slug.length === 0) return false;
  if (slug[0] === "(root)_cn") return true;
  if (slug[0]?.endsWith("_cn")) return true;
  if (slug.some((s) => s === "_cn" || s.endsWith("_cn"))) return true;
  return false;
}

/**
 * Check if current pathname is Chinese version
 */
export function isChinesePath(pathname: string): boolean {
  if (pathname === "/_cn" || pathname.startsWith("/_cn/")) return true;
  if (pathname === "/(root)_cn" || pathname.startsWith("/(root)_cn/"))
    return true;
  if (/(?:^|\/)\w+_cn(?:\/|$)/.test(pathname)) return true;
  return false;
}

/**
 * Convert internal fumadocs URL to user-friendly URL
 * - /(root)_cn/* -> /_cn/*
 * - /langgraph_cn/* -> /langgraph_cn/* (keep as is for integrations)
 */
export function toUserUrl(url: string): string {
  // Handle (root)_cn prefix
  if (url.startsWith("/(root)_cn")) {
    return url.replace("/(root)_cn", "/_cn");
  }
  return url;
}

/**
 * Convert user-friendly URL to internal fumadocs URL
 * - /_cn/* -> /(root)_cn/*
 */
export function toInternalUrl(url: string): string {
  if (url.startsWith("/_cn/")) {
    return url.replace("/_cn/", "/(root)_cn/");
  }
  if (url === "/_cn") {
    return "/(root)_cn";
  }
  return url;
}

/**
 * List of integrations with Chinese support
 */
export const CN_INTEGRATIONS = [
  "adk",
  "aws-strands",
  "built-in-agent",
  "langgraph",
  "mastra",
  "microsoft-agent-framework",
];

/**
 * Convert English URL to Chinese URL
 */
export function toChineseUrl(url: string): string {
  // Handle root pages
  if (url === "/") return "/_cn";

  const path = url.startsWith("/") ? url.slice(1) : url;
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) return "/_cn";

  const firstSegment = segments[0];

  // Check if it's an integration
  if (CN_INTEGRATIONS.includes(firstSegment)) {
    segments[0] = `${firstSegment}_cn`;
    return "/" + segments.join("/");
  }

  // For other pages, add /_cn prefix
  return "/_cn/" + path;
}

/**
 * Convert Chinese URL to English URL
 */
export function toEnglishUrl(url: string): string {
  if (url === "/_cn" || url === "/(root)_cn") return "/";

  let newUrl = url;

  // Remove /_cn or /(root)_cn prefix
  if (newUrl.startsWith("/_cn/")) {
    newUrl = newUrl.slice(4);
  } else if (newUrl.startsWith("/(root)_cn/")) {
    newUrl = newUrl.slice(11);
  }

  // Remove _cn suffix from integrations
  CN_INTEGRATIONS.forEach((integration) => {
    newUrl = newUrl.replace(
      new RegExp(`/${integration}_cn(?=/|$)`, "g"),
      `/${integration}`
    );
  });

  if (!newUrl.startsWith("/")) {
    newUrl = "/" + newUrl;
  }

  return newUrl || "/";
}
