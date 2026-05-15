// useCandyImage.js — place in client/src/salesman/hooks/
import { useState, useEffect } from "react";
import API_URL from "../../config";

const cache = {}; // in-memory cache so same image not fetched twice

export default function useCandyImage(candyId) {
  const [image, setImage] = useState(cache[candyId] || null);

  useEffect(() => {
    if (!candyId || cache[candyId]) {
      if (cache[candyId]) setImage(cache[candyId]);
      return;
    }
    fetch(`${API_URL}/api/salesman/config/image/${candyId}`)
      .then(r => r.json())
      .then(data => {
        if (data.image) {
          cache[candyId] = data.image;
          setImage(data.image);
        }
      })
      .catch(() => {});
  }, [candyId]);

  return image;
}
