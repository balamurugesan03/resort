import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as seed from '@shared/data.js';
import { api } from '@shared/lib/api.js';

const CatalogContext = createContext(null);

const ENDPOINTS = {
  rooms: '/rooms', menu: '/menu', packages: '/packages', vehicles: '/vehicles',
  transportServices: '/transport', offers: '/offers', gallery: '/gallery', reviews: '/reviews',
};

// Renders instantly with bundled data, then swaps in live data from the API.
export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState({
    resort: seed.resort, activities: seed.activities, menuCategories: seed.menuCategories,
    galleryCategories: seed.galleryCategories,
    rooms: seed.rooms, menu: seed.menu, packages: seed.packages, vehicles: seed.vehicles,
    transportServices: seed.transportServices, offers: seed.offers, gallery: seed.gallery, reviews: seed.reviews,
  });

  const refresh = useCallback(async (key) => {
    const keys = key ? [key] : Object.keys(ENDPOINTS);
    const results = await Promise.allSettled(keys.map((k) => api(ENDPOINTS[k])));
    setCatalog((c) => {
      const next = { ...c };
      // On the initial load, an empty collection keeps the bundled data; an explicit refresh (after an admin edit) is trusted as-is.
      results.forEach((r, i) => { if (r.status === 'fulfilled' && Array.isArray(r.value) && (r.value.length || key)) next[keys[i]] = r.value; });
      return next;
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return <CatalogContext.Provider value={{ ...catalog, refresh }}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);
