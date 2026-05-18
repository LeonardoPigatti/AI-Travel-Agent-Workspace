const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY ?? "";

interface PexelsPhoto {
  id: number;
  src: {
    large2x: string;
    large: string;
    medium: string;
  };
  alt: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
}

const cache = new Map<string, string>();

export async function getDestinationImage(destination: string): Promise<string> {
  const keyword = destination.split(",")[0].trim();

  if (cache.has(keyword)) return cache.get(keyword)!;

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword + " travel city landmark")}&per_page=1&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );

    if (!res.ok) throw new Error("Pexels error");

    const data: PexelsResponse = await res.json();
    const url = data.photos[0]?.src.large2x ?? "";

    if (url) cache.set(keyword, url);
    return url;
  } catch {
    return "";
  }
}