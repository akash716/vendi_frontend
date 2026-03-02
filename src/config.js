/**
 * ╔══════════════════════════════════════════════╗
 * ║         VENDI POS — API CONFIGURATION        ║
 * ║                                              ║
 * ║  Sirf YAHAN apni deployed API URL daalo.     ║
 * ║  Baaki poora code automatically use karega.  ║
 * ╚══════════════════════════════════════════════╝
 *
 * Development:   http://localhost:5000
 * Production:    https://your-api.onrender.com
 *
 * Vite env variable bhi support karta hai:
 *   .env.local mein: VITE_API_URL=https://your-api.onrender.com
 */

const API_URL = import.meta.env.VITE_API_URL || "https://vendi-backend-ang6.onrender.com";
export default API_URL;
