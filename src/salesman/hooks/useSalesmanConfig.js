import { useEffect, useState, useCallback } from "react";
import API_URL from "../../config";

const API = API_URL;

export default function useSalesmanConfig(stallId) {
  const [config,    setConfig]    = useState(null);
  const [candies,   setCandies]   = useState([]);
  const [loading,   setLoading]   = useState(true);   // only true on first load
  const [reloading, setReloading] = useState(false);  // silent background reload

  const normalizeOffers = (offers = []) =>
    offers.map(o => {
      let parsedPattern = null;
      if (o.price_pattern) {
        try {
          const raw = typeof o.price_pattern === "string"
            ? JSON.parse(o.price_pattern) : o.price_pattern;
          parsedPattern = Array.isArray(raw)
            ? raw.map(p => ({ price: Number(p.price), qty: Number(p.qty) })) : null;
        } catch { parsedPattern = null; }
      }
      return {
        ...o,
        price:         o.price == null ? null : Number(o.price),
        offer_price:   Number(o.offer_price || 0),
        unique_count:  Number(o.unique_count || 0),
        price_pattern: parsedPattern,
      };
    });

  const normalizeCandies = (list = []) =>
    list.map(c => ({
      ...c,
      price: c.price !== undefined ? Number(c.price) : c.price,
      stock: c.stock !== undefined ? Number(c.stock) : c.stock,
    }));

  // firstLoad=true → shows loading spinner (first open)
  // firstLoad=false → silent reload, no spinner, candies stay visible
  const loadAll = useCallback(async (firstLoad = false) => {
    if (!stallId) return;
    if (firstLoad) setLoading(true);
    else setReloading(true);

    try {
      const res  = await fetch(`${API}/api/salesman/config/${stallId}`);
      if (!res.ok) throw new Error("Failed to load config");
      const json = await res.json();

      setConfig({
        stall:  json.stall,
        event:  json.event,
        offers: normalizeOffers(json.offers || []),
      });
      setCandies(normalizeCandies(json.candies || []));
    } catch (err) {
      console.error("useSalesmanConfig ERROR:", err.message);
      if (firstLoad) { setConfig(null); setCandies([]); }
      // on silent reload error — keep existing candies visible
    } finally {
      setLoading(false);
      setReloading(false);
    }
  }, [stallId]);

  useEffect(() => { loadAll(true); }, [stallId]);

  // reloadCandies = silent reload (no loading screen)
  return { config, candies, reloadCandies: () => loadAll(false), loading, reloading };
}
