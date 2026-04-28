class PricingService {
  /**
   * Calculates the final price of an order including taxes and delivery fees
   * @param {Array} items - Array of order items
   * @param {Object} userLocation - Custom location params or distances
   * @returns {Object} { subtotal, tax, shipping, total }
   */
  static calculateTotals(items, user, options = {}) {
    const { isEmergency = false } = options;
    const isSub = user?.isSubscribed || false;

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.05;

    // Platform fee
    const platformFee = isSub ? 2.0 : 6.0;

    // Delivery fee
    const deliveryFee = 30.0; // Between 20-40

    // Cold chain fee
    // Check if any item in the cart requires cold chain
    const requiresColdChain = items.some(item => item.coldChainRequired);
    let coldChainFee = 0;
    if (requiresColdChain) {
      coldChainFee = isSub ? 15.0 : 25.0; // Sub: 9-19, Non-sub: 15-35
    }

    // Emergency fee
    let emergencyFee = 0;
    if (isEmergency) {
      emergencyFee = isSub ? 25.0 : 50.0; // 50% discount for sub
    }

    // Late night fee (Assume 10 PM to 6 AM is late night)
    let lateNightFee = 0;
    const currentHour = new Date().getHours();
    const isLateNight = currentHour >= 22 || currentHour < 6;
    if (isLateNight) {
      lateNightFee = isSub ? 0 : 20.0; // Waived for sub, 15-25 for non-sub
    }

    const totalFees = platformFee + deliveryFee + coldChainFee + emergencyFee + lateNightFee;
    const total = subtotal + tax + totalFees;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      platformFee: parseFloat(platformFee.toFixed(2)),
      deliveryFee: parseFloat(deliveryFee.toFixed(2)),
      coldChainFee: parseFloat(coldChainFee.toFixed(2)),
      emergencyFee: parseFloat(emergencyFee.toFixed(2)),
      lateNightFee: parseFloat(lateNightFee.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }
}

module.exports = PricingService;
