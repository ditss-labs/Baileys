export const __esModule: boolean;
/**
 * Given a piece of text, checks for any URL present, generates link preview for the same and returns it
 * Return undefined if the fetch failed or no URL was found
 * @param text first matched URL in text
 * @returns the URL info required to generate link preview
 */
export function getUrlInfo(text: any, opts?: {
    thumbnailWidth: number;
    fetchOpts: {
        timeout: number;
    };
}): Promise<{
    'canonical-url': any;
    'matched-text': any;
    title: any;
    description: any;
    originalThumbnailUrl: any;
}>;
