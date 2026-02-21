import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: any = null;

async function getZAIInstance() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const barcode = searchParams.get('barcode');

    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode parameter is required' },
        { status: 400 }
      );
    }

    // Get ZAI instance
    const zai = await getZAIInstance();

    // Search for product information using web search
    const searchResults = await zai.functions.invoke('web_search', {
      query: `barcode ${barcode} product name brand`,
      num: 3,
    });

    // Extract product name from search results
    let productName = '';
    let confidence = 'low';

    if (Array.isArray(searchResults) && searchResults.length > 0) {
      // Try to extract product name from the search results
      // Look for common product information patterns
      for (const result of searchResults) {
        const title = result.name || '';
        const snippet = result.snippet || '';

        // Try to find product name in title (exclude common retail sites info)
        let cleanTitle = title
          .replace(/Price|Buy|Online|Shop|Store|Amazon|eBay|Walmart|Tokopedia|Shopee|Lazada/gi, '')
          .replace(/\s+\|.*$/, '') // Remove everything after |
          .replace(/\s+-.*$/, '') // Remove everything after -
          .replace(/\s+-\s+.*$/, '')
          .replace(/\s*\|\s*.*$/, '')
          .trim();

        // Remove barcode from title if present
        cleanTitle = cleanTitle.replace(barcode, '').trim();

        // Clean up common patterns
        cleanTitle = cleanTitle
          .replace(/^\d+\s*/, '') // Remove leading numbers
          .replace(/\s*\([^)]*\)/g, '') // Remove parentheses content
          .replace(/\s*\[[^\]]*\]/g, '') // Remove brackets content
          .trim();

        if (cleanTitle && cleanTitle.length > 3 && cleanTitle.length < 100) {
          productName = cleanTitle;
          confidence = 'medium';
          break;
        }
      }
    }

    // If no good result from title, try to extract from snippet
    if (!productName && Array.isArray(searchResults) && searchResults.length > 0) {
      const result = searchResults[0];
      const snippet = result.snippet || '';

      // Try to find a product name pattern in snippet
      const productMatch = snippet.match(/product\s+["']?([^"'\.]+)/i) ||
                           snippet.match(/brand\s+["']?([^"'\.]+)/i) ||
                           snippet.match(/item\s+["']?([^"'\.]+)/i);

      if (productMatch && productMatch[1]) {
        productName = productMatch[1].trim();
        if (productName.length > 3 && productName.length < 100) {
          confidence = 'low';
        }
      }
    }

    // Return the search results
    return NextResponse.json({
      success: true,
      productName: productName || '',
      confidence: productName ? confidence : 'none',
      barcode,
      rawResults: Array.isArray(searchResults) ? searchResults.slice(0, 2) : [], // Include raw results for debugging
    });

  } catch (error) {
    console.error('Error searching product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search product',
        productName: '',
      },
      { status: 500 }
    );
  }
}
