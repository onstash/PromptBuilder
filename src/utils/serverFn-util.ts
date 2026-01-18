// ═══════════════════════════════════════════════════════════════════════════
// USER-AGENT PARSING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const browsers: [RegExp, string][] = [
  [/Edg(?:e|A|iOS)?\/(\d+)/, "Edge"],
  [/OPR\/(\d+)|Opera\/(\d+)/, "Opera"],
  [/Chrome\/(\d+).*Safari/, "Chrome"],
  [/Firefox\/(\d+)/, "Firefox"],
  [/Safari\/(\d+)(?!.*Chrome)/, "Safari"],
  [/MSIE (\d+)|Trident.*rv:(\d+)/, "Internet Explorer"],
];

/**
 * Parse browser name and version from user-agent string
 */
function parseBrowser(userAgent: string | null): string {
  if (!userAgent) return "Unknown";

  // Order matters - check more specific patterns first

  for (const [regex, name] of browsers) {
    const match = userAgent.match(regex);
    if (match) {
      const version = match[1] || match[2] || "";
      return version ? `${name} ${version}` : name;
    }
  }

  return "Unknown";
}

/**
 * Parse device type from user-agent string
 */
function parseDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown";

  const ua = userAgent.toLowerCase();

  // Check for tablets first (they often contain "mobile" too)
  if (/ipad|tablet|playbook|silk/.test(ua)) {
    return "Tablet";
  }

  // Check for mobile devices
  if (
    /mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|opera mobi/.test(ua)
  ) {
    return "Mobile";
  }

  // Check for Android (without mobile = tablet)
  if (/android/.test(ua)) {
    return "Tablet";
  }

  // Default to desktop
  return "Desktop";
}

/**
 * Parse operating system from user-agent string
 */
function parseOS(userAgent: string | null): string {
  if (!userAgent) return "Unknown";

  const osPatterns: [RegExp, string][] = [
    [/Windows NT 10/, "Windows 10"],
    [/Windows NT 6\.3/, "Windows 8.1"],
    [/Windows NT 6\.2/, "Windows 8"],
    [/Windows NT 6\.1/, "Windows 7"],
    [/Windows/, "Windows"],
    [/Mac OS X (\d+)[._](\d+)/, "macOS"],
    [/Macintosh/, "macOS"],
    [/iPhone OS (\d+)/, "iOS"],
    [/iPad.*OS (\d+)/, "iPadOS"],
    [/Android (\d+)/, "Android"],
    [/Linux/, "Linux"],
    [/CrOS/, "Chrome OS"],
  ];

  for (const [regex, name] of osPatterns) {
    const match = userAgent.match(regex);
    if (match) {
      // Extract version if available
      if (match[1]) {
        const version = match[2] ? `${match[1]}.${match[2]}` : match[1];
        return `${name} ${version}`;
      }
      return name;
    }
  }

  return "Unknown";
}

type RequestMetadata = {
  userAgent: string | null;
  referer: string | null;
  refererParts: string[];
  acceptLanguage: string | null;
  ip: string | null;
  origin: string | null;
  device: string;
  os: string;
  browser: string;
};

export function getMetadataFromRequest(request: Request): RequestMetadata {
  // Extract headers from the browser request
  const userAgent = request.headers.get("user-agent");
  const referer = request.headers.get("referer");
  // Split referer into chunks of max 205 characters for Mixpanel property limits
  const refererParts: string[] = [];
  if (referer) {
    for (let i = 0; i < referer.length; i += 205) {
      refererParts.push(referer.slice(i, i + 205));
    }
  }
  const acceptLanguage = request.headers.get("accept-language");
  const xForwardedFor = request.headers.get("x-forwarded-for");
  const ip = xForwardedFor
    ? xForwardedFor.split(",")[0].trim()
    : request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip");
  const origin = request.headers.get("origin");

  const device = parseDevice(userAgent);
  const os = parseOS(userAgent);
  const browser = parseBrowser(userAgent);

  return {
    userAgent,
    referer,
    refererParts,
    acceptLanguage,
    ip,
    origin,
    device,
    os,
    browser,
  };
}
