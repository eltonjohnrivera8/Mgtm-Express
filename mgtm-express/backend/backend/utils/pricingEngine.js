// ═══════════════════════════════════════════════════════════════════
// MGTM EXPRESS — PRICING ENGINE
// ═══════════════════════════════════════════════════════════════════
// Naglalaman ng lahat ng delivery fee calculations.
//
// FORMULA:
//   Base Delivery Fee = (distance_km × rate_per_km) + base_fee
//   Final Fee         = MAX(minimum_fee, base_delivery_fee)
//   Total Fee         = final_fee + (additional_stores × store_fee)
//
// DEFAULT RATES (mababago sa Admin Panel / database settings):
//   Rate per km    : ₱18
//   Base fee       : ₱20
//   Minimum fee    : ₱55 (para sa unang 1 km)
//   Additional store: ₱15 per extra pickup location
// ═══════════════════════════════════════════════════════════════════

'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Earth's radius para sa Haversine formula ──────────────────────
const EARTH_RADIUS_KM = 6371;

// ── Default rates (fallback kung walang database settings) ────────
const DEFAULT_RATES = {
  ratePerKm:          parseFloat(process.env.RATE_PER_KM)          || 18,
  baseFee:            parseFloat(process.env.BASE_FEE)              || 20,
  minimumFee:         parseFloat(process.env.MINIMUM_FEE)           || 55,
  additionalStoreFee: parseFloat(process.env.ADDITIONAL_STORE_FEE)  || 15,
};

// ── In-memory cache para sa pricing settings ──────────────────────
// Para hindi mag-query sa database tuwing may bagong order
let cachedRates      = null;
let cacheExpiry      = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// ═══════════════════════════════════════════════════════════════════
// HAVERSINE DISTANCE CALCULATOR
// ═══════════════════════════════════════════════════════════════════

/**
 * I-convert ang degrees sa radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Kalkulahin ang distansya sa pagitan ng dalawang GPS coordinates
 * gamit ang Haversine formula.
 *
 * Ang Haversine formula ay nagbibigay ng "as-the-crow-flies" na distansya —
 * hindi ito ang aktwal na daan, pero malapit na para sa delivery fee purposes.
 *
 * @param {number} lat1 - Latitude ng unang punto (hub)
 * @param {number} lng1 - Longitude ng unang punto (hub)
 * @param {number} lat2 - Latitude ng pangalawang punto (customer)
 * @param {number} lng2 - Longitude ng pangalawang punto (customer)
 * @returns {number} Distansya sa kilometers (rounded sa 2 decimal places)
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  // Validate inputs — lahat dapat ay valid numbers
  if (
    isNaN(lat1) || isNaN(lng1) ||
    isNaN(lat2) || isNaN(lng2)
  ) {
    throw new Error('Invalid na coordinates para sa distance calculation');
  }

  // Siguraduhing nasa valid range ang coordinates
  if (
    lat1 < -90  || lat1 > 90  ||
    lat2 < -90  || lat2 > 90  ||
    lng1 < -180 || lng1 > 180 ||
    lng2 < -180 || lng2 > 180
  ) {
    throw new Error('Coordinates ay wala sa valid range');
  }

  // Haversine formula
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = EARTH_RADIUS_KM * c;

  // Round sa 2 decimal places
  return Math.round(distanceKm * 100) / 100;
}

// ═══════════════════════════════════════════════════════════════════
// SETTINGS FETCHER
// ═══════════════════════════════════════════════════════════════════

/**
 * Kunin ang pricing rates mula sa database settings.
 * May caching para sa performance.
 * @returns {Promise<object>} Pricing rates
 */
async function getPricingRates() {
  // I-check kung valid pa ang cache
  if (cachedRates && cacheExpiry && Date.now() < cacheExpiry) {
    return cachedRates;
  }

  try {
    // I-fetch ang pricing settings mula sa database
    const settings = await prisma.businessSettings.findMany({
      where: {
        key: {
          in: [
            'rate_per_km',
            'base_fee',
            'minimum_fee',
            'additional_store_fee',
            'hub_latitude',
            'hub_longitude',
            'free_delivery_threshold',
          ],
        },
      },
    });

    // I-convert ang settings array sa object
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = parseFloat(s.value);
      return acc;
    }, {});

    // Gumamit ng database values, fallback sa DEFAULT_RATES
    const rates = {
      ratePerKm:             settingsMap['rate_per_km']             ?? DEFAULT_RATES.ratePerKm,
      baseFee:               settingsMap['base_fee']                ?? DEFAULT_RATES.baseFee,
      minimumFee:            settingsMap['minimum_fee']             ?? DEFAULT_RATES.minimumFee,
      additionalStoreFee:    settingsMap['additional_store_fee']    ?? DEFAULT_RATES.additionalStoreFee,
      hubLat:                settingsMap['hub_latitude']            ?? parseFloat(process.env.HUB_LAT || '15.7933'),
      hubLng:                settingsMap['hub_longitude']           ?? parseFloat(process.env.HUB_LNG || '120.2072'),
      freeDeliveryThreshold: settingsMap['free_delivery_threshold'] ?? 0,
    };

    // I-cache ang rates
    cachedRates = rates;
    cacheExpiry = Date.now() + CACHE_DURATION;

    return rates;

  } catch (error) {
    // Kapag may database error, gamitin ang environment variables
    console.warn('⚠️  Cannot fetch pricing from DB, using defaults:', error.message);
    return {
      ...DEFAULT_RATES,
      hubLat: parseFloat(process.env.HUB_LAT || '15.7933'),
      hubLng: parseFloat(process.env.HUB_LNG || '120.2072'),
      freeDeliveryThreshold: 0,
    };
  }
}

/**
 * I-invalidate ang pricing cache.
 * I-call ito kapag na-update ang pricing settings sa Admin Panel.
 */
function invalidatePricingCache() {
  cachedRates = null;
  cacheExpiry = null;
  console.log('🔄 Pricing cache invalidated');
}

// ═══════════════════════════════════════════════════════════════════
// DELIVERY FEE CALCULATOR
// ═══════════════════════════════════════════════════════════════════

/**
 * Kalkulahin ang delivery fee batay sa distance at pricing settings.
 *
 * @param {object} params
 * @param {number} params.customerLat       - Customer's latitude
 * @param {number} params.customerLng       - Customer's longitude
 * @param {number} [params.additionalStops] - Bilang ng extra pickup locations (default: 0)
 * @param {number} [params.orderSubtotal]   - Para sa free delivery threshold check
 * @param {object} [params.customRates]     - Para sa testing o override ng rates
 *
 * @returns {Promise<{
 *   distanceKm:       number,
 *   baseDeliveryFee:  number,
 *   additionalFee:    number,
 *   totalDeliveryFee: number,
 *   breakdown:        object,
 *   isFreeDelivery:   boolean,
 * }>}
 */
async function calculateDeliveryFee({
  customerLat,
  customerLng,
  additionalStops   = 0,
  orderSubtotal     = 0,
  customRates       = null,
}) {
  // Validate coordinates
  if (!customerLat || !customerLng) {
    throw new Error('Kailangan ang customer coordinates para kalkulahin ang delivery fee');
  }

  // Kunin ang rates (mula sa DB o custom override)
  const rates = customRates || await getPricingRates();

  // Kalkulahin ang distansya mula sa hub papunta sa customer
  const distanceKm = calculateDistance(
    rates.hubLat,
    rates.hubLng,
    parseFloat(customerLat),
    parseFloat(customerLng)
  );

  // Kalkulahin ang base delivery fee
  // Formula: (distance × rate_per_km) + base_fee
  const computedFee = (distanceKm * rates.ratePerKm) + rates.baseFee;

  // Iapply ang minimum fee
  // Ang delivery fee ay HINDI dapat bumaba sa minimum_fee (₱55)
  const baseDeliveryFee = Math.max(rates.minimumFee, Math.round(computedFee));

  // Kalkulahin ang additional store fees
  // ₱15 × bilang ng extra pickup locations
  const additionalFee = Math.max(0, additionalStops) * rates.additionalStoreFee;

  // Check kung may free delivery
  const isFreeDelivery =
    rates.freeDeliveryThreshold > 0 &&
    orderSubtotal >= rates.freeDeliveryThreshold;

  // Total delivery fee
  const totalDeliveryFee = isFreeDelivery ? 0 : (baseDeliveryFee + additionalFee);

  // Detailed breakdown para sa receipt at customer display
  const breakdown = {
    distanceKm,
    formula:           `(${distanceKm} km × ₱${rates.ratePerKm}) + ₱${rates.baseFee}`,
    computedFee:        Math.round(computedFee),
    minimumApplied:     computedFee < rates.minimumFee,
    baseDeliveryFee,
    additionalStops,
    additionalStopFee:  rates.additionalStoreFee,
    additionalFee,
    subtotal:           baseDeliveryFee + additionalFee,
    isFreeDelivery,
    freeDeliveryThreshold: rates.freeDeliveryThreshold,
    totalDeliveryFee,
    rates: {
      ratePerKm:          rates.ratePerKm,
      baseFee:            rates.baseFee,
      minimumFee:         rates.minimumFee,
      additionalStoreFee: rates.additionalStoreFee,
    },
  };

  return {
    distanceKm,
    baseDeliveryFee,
    additionalFee,
    totalDeliveryFee,
    breakdown,
    isFreeDelivery,
  };
}

// ═══════════════════════════════════════════════════════════════════
// DELIVERY FEE ESTIMATOR (para sa frontend preview — walang actual order)
// ═══════════════════════════════════════════════════════════════════

/**
 * Quick estimate ng delivery fee para sa customer preview.
 * Hindi kailangan ng full order details.
 *
 * @param {number} customerLat
 * @param {number} customerLng
 * @returns {Promise<{
 *   distanceKm: number,
 *   fee:        number,
 *   breakdown:  string,
 * }>}
 */
async function estimateDeliveryFee(customerLat, customerLng) {
  try {
    const result = await calculateDeliveryFee({
      customerLat,
      customerLng,
      additionalStops: 0,
      orderSubtotal:   0,
    });

    return {
      distanceKm: result.distanceKm,
      fee:        result.totalDeliveryFee,
      breakdown:  `${result.distanceKm} km × ₱${DEFAULT_RATES.ratePerKm} + ₱${DEFAULT_RATES.baseFee} = ₱${result.totalDeliveryFee}`,
      isMinimum:  result.breakdown.minimumApplied,
    };
  } catch (error) {
    throw new Error(`Hindi ma-estimate ang delivery fee: ${error.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
// ORDER TOTAL CALCULATOR
// ═══════════════════════════════════════════════════════════════════

/**
 * Kalkulahin ang buong order total.
 *
 * @param {object} params
 * @param {Array}  params.items          - Array ng { price, quantity }
 * @param {number} params.customerLat    - Delivery coordinates
 * @param {number} params.customerLng
 * @param {string} params.orderType      - 'DELIVERY' o 'PICKUP'
 * @param {number} [params.additionalStops]
 *
 * @returns {Promise<{
 *   itemsSubtotal:    number,
 *   deliveryFee:      number,
 *   additionalFee:    number,
 *   total:            number,
 *   distanceKm:       number|null,
 *   breakdown:        object,
 * }>}
 */
async function calculateOrderTotal({
  items,
  customerLat,
  customerLng,
  orderType        = 'DELIVERY',
  additionalStops  = 0,
}) {
  // Kalkulahin ang items subtotal
  const itemsSubtotal = items.reduce((sum, item) => {
    return sum + (parseFloat(item.price) * parseInt(item.quantity, 10));
  }, 0);

  // Walang delivery fee para sa pickup orders
  if (orderType === 'PICKUP') {
    return {
      itemsSubtotal:    Math.round(itemsSubtotal * 100) / 100,
      deliveryFee:      0,
      additionalFee:    0,
      total:            Math.round(itemsSubtotal * 100) / 100,
      distanceKm:       null,
      breakdown:        { orderType: 'PICKUP', note: 'Walang delivery fee para sa pickup orders' },
    };
  }

  // Kalkulahin ang delivery fee para sa delivery orders
  const feeResult = await calculateDeliveryFee({
    customerLat,
    customerLng,
    additionalStops,
    orderSubtotal: itemsSubtotal,
  });

  const total = itemsSubtotal + feeResult.totalDeliveryFee;

  return {
    itemsSubtotal:    Math.round(itemsSubtotal * 100) / 100,
    deliveryFee:      feeResult.baseDeliveryFee,
    additionalFee:    feeResult.additionalFee,
    totalDeliveryFee: feeResult.totalDeliveryFee,
    total:            Math.round(total * 100) / 100,
    distanceKm:       feeResult.distanceKm,
    isFreeDelivery:   feeResult.isFreeDelivery,
    breakdown:        feeResult.breakdown,
  };
}

module.exports = {
  calculateDistance,
  calculateDeliveryFee,
  estimateDeliveryFee,
  calculateOrderTotal,
  getPricingRates,
  invalidatePricingCache,
  DEFAULT_RATES,
};
