/**
 * Square API client for merchant operations
 */

import { CatalogObject, SquareClient } from 'square';

import { Location, MerchantInfo } from '../../merchants/types';
import { config } from '../../utils/config';

/**
 * Fetch merchant information from Square
 */
export async function fetchMerchantInfo(accessToken: string): Promise<MerchantInfo> {
  try {
    const client = new SquareClient({
      environment: config.square.environment,
      token: accessToken,
    });

    // Fetch merchant details
    const { data: merchants } = await client.merchants.list();

    if (merchants.length === 0) {
      throw new Error('fetchMerchantInfo_missingMerchant');
    }

    const [merchant] = merchants;

    console.log('Fetched merchant from Square API', { merchant });

    // Fetch locations
    const locationsResponse = await client.locations.list();
    const fetchedLocations = locationsResponse.locations ?? [];

    const locations: Location[] = fetchedLocations.map((loc) => {
      const addr = loc.address;
      const addressParts = [
        addr?.addressLine1,
        addr?.addressLine2,
        addr?.locality,
        addr?.administrativeDistrictLevel1,
        addr?.postalCode,
      ].filter(Boolean);

      return {
        id: loc.id ?? '',
        name: loc.name ?? '',
        address: addressParts.length > 0 ? addressParts.join(', ') : undefined,
        timezone: loc.timezone ?? undefined,
        capabilities: loc.capabilities,
      };
    });

    return {
      id: merchant.id ?? '',
      name: merchant.businessName ?? '',
      locations,
    };
  } catch (error) {
    throw new Error('fetchMerchantInfo_failed', { cause: error });
  }
}

/**
 * Fetch all catalog items from Square
 */
export async function fetchCatalogItems(accessToken: string): Promise<CatalogObject[]> {
  try {
    const client = new SquareClient({
      environment: config.square.environment,
      token: accessToken,
    });

    const items: CatalogObject[] = [];
    let page = await client.catalog.list({
      types: 'ITEM',
    });

    // Get items from first page
    items.push(...page.data);

    // Fetch remaining pages
    while (page.hasNextPage()) {
      page = await page.getNextPage();
      items.push(...page.data);
    }

    console.log(`Fetched ${items.length} items from Square catalog`);

    return items;
  } catch (error) {
    throw new Error('fetchCatalogItems_failed', { cause: error });
  }
}
