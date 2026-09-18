/**
 * Generates an SVG data URI avatar locally without relying on external CDNs (like ui-avatars.com),
 * completely avoiding CORS issues, duplicate header errors, and offline failures.
 */
export function getAvatarUrl(name?: string, bg = "6366f1", color = "ffffff"): string {
  const cleanName = (name || "User").trim();
  const initials =
    cleanName
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "U";

  // Clean background hex (remove leading # if any, handle 'random')
  let fillBg = bg ? bg.replace(/^#/, "") : "6366f1";
  if (fillBg === "random" || !fillBg) {
    const palette = [
      "6366f1", // indigo
      "8b5cf6", // violet
      "ec4899", // pink
      "3b82f6", // blue
      "10b981", // emerald
      "f59e0b", // amber
      "06b6d4", // cyan
      "14b8a6", // teal
      "f43f5e", // rose
    ];
    const hash = cleanName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    fillBg = palette[hash % palette.length];
  }
  const fillText = color ? color.replace(/^#/, "") : "ffffff";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><rect width="100%" height="100%" rx="64" fill="#${fillBg}"/><text x="50%" y="54%" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="700" fill="#${fillText}" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
