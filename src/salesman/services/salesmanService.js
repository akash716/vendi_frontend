import API_URL from "../../config";
const API = `${API_URL}/api/salesman`;

export const getAvailableCandies = async (stallId) => {
  const res = await fetch(`${API}/${stallId}/candies`);
  return res.json();
};

export const sellCandy = async (stallId, candyId, qty) => {
  const res = await fetch(`${API}/${stallId}/sell`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candyId, qty }),
  });

  return res.json();
};
