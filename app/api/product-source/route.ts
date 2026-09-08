import { NextResponse } from "next/server";

const allowedHosts = new Set(["kream.co.kr", "www.kream.co.kr"]);
const requestTimeoutMs = 30000;
const requiredFields = ["korean_product_name", "product_name", "brand", "model_number", "original_price_krw", "current_price_krw", "image_url"] as const;
type ProductField = typeof requiredFields[number];
type Product = Partial<Record<ProductField, string>>;

function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

function decodeHtml(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function normalize(value: unknown) {
  return typeof value === "string" ? decodeHtml(value).replace(/\s+/g, " ").trim() : "";
}

function metaContent(source: string, key: string) {
  const tags = source.match(/<meta\b[^>]*>/gi) ?? [];

  for (const tag of tags) {
    const keyMatch = tag.match(
      /\b(?:property|name|itemprop)\s*=\s*[^"']+["']/i
    );

    const contentMatch = tag.match(
      /\bcontent\s*=\s*[^"']*["']/i
    );

    if (!keyMatch || !contentMatch) continue;

    const metaKey = keyMatch[1].toLowerCase();

    if (
      metaKey === key.toLowerCase() ||
      (key === "kream:product_name_ko" && metaKey === "name_ko")
    ) {
      return normalize(contentMatch[1]);
    }
  }

  return "";
}

function nestedValue(value: unknown, keys: string[]) {
  if (!value || typeof value !== "object") return "";
  for (const key of keys) {
    const candidate = (value as Record<string, unknown>)[key];
    if (typeof candidate === "string" || typeof candidate === "number") return normalize(String(candidate));
  }
  return "";
}

function parseKrwAmount(value: string) {
  const amount = value.replace(/[₩원,\s]/g, "");
  return /^\d+$/.test(amount) && Number.isSafeInteger(Number(amount)) ? amount : "";
}

function labeledPrice(source: string, labels: string[]) {
  const text = source.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const labelPattern = labels.join("|");
  const match = text.match(new RegExp(`(?:${labelPattern})\\s*[:：]?\\s*(?:약\\s*)?([0-9]{1,3}(?:,[0-9]{3})*|\\d+)\\s*원?`, "i"));
  return match ? parseKrwAmount(match[1]) : "";
}

function productFromObject(value: unknown): Product {
  if (!value || typeof value !== "object") return {};
  const object = value as Record<string, unknown>;
  const brandValue = object.brand;
  const imageValue = object.image ?? object.image_url ?? object.imageUrl;
  const priceValue = object.price;
  return {
    product_name: nestedValue(object, ["name", "product_name", "productName", "title"]),
    brand: typeof brandValue === "string" ? normalize(brandValue) : nestedValue(brandValue, ["name", "title"]),
    model_number: nestedValue(object, ["sku", "model", "model_number", "modelNumber", "style_code", "styleCode"]),
    original_price_krw: nestedValue(object, ["release_price", "releasePrice", "retail_price", "retailPrice", "original_price_krw", "originalPriceKrw"]),
    current_price_krw: nestedValue(object, ["current_price_krw", "currentPriceKrw", "market_price", "marketPrice", "sale_price", "salePrice", "price"]) || nestedValue(priceValue, ["current", "market", "sale", "amount"]),
    image_url: Array.isArray(imageValue) ? normalize(imageValue[0]) : normalize(imageValue),
    korean_product_name: nestedValue(object, ["korean_product_name", "koreanProductName", "name_ko", "nameKo", "title_ko", "titleKo"]),
  };
}

function mergeProduct(...products: Product[]) {
  return products.reduce<Product>((result, product) => {
    for (const field of requiredFields) {
      if (!result[field] && product[field]) result[field] = product[field];
    }
    return result;
  }, {});
}

function extractJsonLd(source: string) {
  const productValues: Product[] = [];
  const blocks = [...source.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const value = JSON.parse(block[1]);
      const candidates = Array.isArray(value) ? value : [value, ...(Array.isArray(value?.["@graph"]) ? value["@graph"] : [])];
      for (const candidate of candidates) {
        if (candidate?.["@type"] === "Product" || candidate?.name || candidate?.sku) productValues.push(productFromObject(candidate));
      }
    } catch (error) {
      console.warn("Product source JSON-LD block could not be parsed:", error);
    }
  }
  return mergeProduct(...productValues);
}

function extractEmbeddedState(source: string) {
  const productValues: Product[] = [];
  const keyPattern = "(?:name|product_name|productName|title|brand|sku|model|model_number|modelNumber|style_code|styleCode|price|release_price|releasePrice|retail_price|retailPrice|current_price_krw|currentPriceKrw|market_price|marketPrice|sale_price|salePrice|original_price_krw|originalPriceKrw|image|image_url|imageUrl|korean_product_name|koreanProductName|name_ko|nameKo|title_ko|titleKo)";
  const objectPattern = new RegExp(`\\{[^{}]{0,5000}\\b${keyPattern}\\b[^{}]{0,5000}\\}`, "gi");
  for (const match of source.matchAll(objectPattern)) {
    try {
      const jsonObject = match[0].replace(/([{,])\s*([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":').replace(/'/g, '"');
      productValues.push(productFromObject(JSON.parse(jsonObject)));
    } catch {
      // Embedded application state is often JavaScript rather than strict JSON.
    }
  }
  return mergeProduct(...productValues);
}

function extractProduct(source: string) {
  const openGraph: Product = { product_name: metaContent(source, "og:title"), image_url: metaContent(source, "og:image") };
  const standardMetadata: Product = {
    korean_product_name: metaContent(source, "kream:product_name_ko") || metaContent(source, "product:name:ko") || metaContent(source, "name_ko"),
    brand: metaContent(source, "brand") || metaContent(source, "product:brand"),
    model_number: metaContent(source, "sku") || metaContent(source, "product:sku") || metaContent(source, "product:model"),
    original_price_krw: labeledPrice(source, ["발매가", "출시가", "정가"]) || metaContent(source, "product:price:original") || metaContent(source, "product:price:retail"),
    current_price_krw: metaContent(source, "product:price:amount") || metaContent(source, "price"),
  };
  const product = mergeProduct(openGraph, standardMetadata, extractJsonLd(source), extractEmbeddedState(source));
  return { product, missingFields: requiredFields.filter((field) => !product[field]) };
}

function diagnosticResponse(message: string, details: { stage: string; upstreamStatus: number | null; contentType: string; finalUrl: string; parserError: string }) {
  return NextResponse.json({ error: message, ...(isDevelopment() ? details : {}) }, { status: details.upstreamStatus && details.upstreamStatus >= 400 ? details.upstreamStatus : 502 });
}

export async function POST(request: Request) {
  let sourceUrl: URL;
  try {
    const body = await request.json();
    sourceUrl = new URL(String(body?.source_url ?? "").trim());
  } catch {
    return NextResponse.json({ error: "Enter a valid KREAM product URL." }, { status: 400 });
  }

  const normalizedUrl = sourceUrl.toString();
  console.info("Product source normalized URL:", normalizedUrl);
  if (sourceUrl.protocol !== "https:" || !allowedHosts.has(sourceUrl.hostname)) return NextResponse.json({ error: "Only HTTPS KREAM product URLs are supported." }, { status: 400 });

  let upstreamStatus: number | null = null;
  let contentType = "";
  let finalUrl = normalizedUrl;
  try {
    const response = await fetch(sourceUrl, {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(requestTimeoutMs),
    headers: {
    "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
    Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Referer: "https://kream.co.kr/",
    },
    });

    upstreamStatus = response.status;
    contentType = response.headers.get("content-type") ?? "";
    finalUrl = response.url || normalizedUrl;
    console.info("Product source upstream response:", { status: response.status, statusText: response.statusText, finalUrl, contentType });
    if (!response.ok) {
      const parserError = `Upstream returned ${response.status} ${response.statusText}`;
      console.error("Product source fetch failed:", { normalizedUrl, upstreamStatus, statusText: response.statusText, finalUrl, contentType, parserError });
      return diagnosticResponse("KREAM page could not be read. Enter the values manually.", { stage: "upstream_response", upstreamStatus, contentType, finalUrl, parserError });
    }

    const html = await response.text();

    console.info("Product source HTML downloaded:", {
    normalizedUrl,
    status: response.status,
    contentType,
    htmlLength: html.length,
    });

    const { product, missingFields } = extractProduct(html);    
    if (Object.keys(product).length === 0) {
      const parserError = `Missing required field(s): ${missingFields.join(", ")}`;
      console.error("Product source parsing failed:", { normalizedUrl, upstreamStatus, finalUrl, contentType, parserError });
      return diagnosticResponse("Some product details could not be extracted. Enter the missing values manually.", { stage: "parsing", upstreamStatus, contentType, finalUrl, parserError });
    }
    if (missingFields.length > 0) {
      console.warn("Product source parsing completed with missing fields:", { normalizedUrl, missingFields });
    }
    return NextResponse.json({ product, missingFields });
  } catch (error) {
    const errorDetails = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack, cause: error.cause } : error;
    const parserError = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error("Product source upstream fetch failed:", { normalizedUrl, upstreamStatus, finalUrl, contentType, error: errorDetails, cause: error instanceof Error ? error.cause : undefined });
    return diagnosticResponse("KREAM page could not be read. Enter the values manually.", { stage: "upstream_fetch", upstreamStatus, contentType, finalUrl, parserError });
  }
}