class SaltComparisonService {
  /**
   * Identifies alternatives based on salt composition
   * @param {Object} medicine - Current medicine object
   * @param {Array} database - Full database or queried subset
   * @returns {Array} List of alternative medicines, sorted by price or match score
   */
  static findAlternatives(medicine, database) {
    if (!medicine || !medicine.saltComposition) return [];

    const alternatives = database.filter(
      (med) => med.saltComposition === medicine.saltComposition && med.medicineId !== medicine.medicineId
    );

    // Sort by price (lowest first)
    return alternatives.sort((a, b) => a.priceInr - b.priceInr);
  }
}

module.exports = SaltComparisonService;
