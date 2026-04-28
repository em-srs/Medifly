class RiderAssignmentService {
  /**
   * Assigns the nearest available rider to a new order
   * @param {Object} order - The order object with delivery coordinates
   * @param {Array} availableRiders - Array of Rider models with status 'ONLINE'
   * @returns {Object|null} - The assigned Rider object or null if none available
   */
  static assignRider(order, availableRiders) {
    if (!availableRiders || availableRiders.length === 0) return null;

    // Simple proximity logic (mock calculation for now without full map API)
    // In production, use Google Maps Distance Matrix API
    let closestRider = availableRiders[0];
    let minDistance = Number.MAX_VALUE;

    // ... (Distance calculation logic)
    
    return closestRider;
  }
}

module.exports = RiderAssignmentService;
