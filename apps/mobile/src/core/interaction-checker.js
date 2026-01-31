const INTERACTION_RULES = [
  {
    compounds: ['iron', 'calcium'],
    conflict: 'Iron and Calcium compete for absorption. Separate by at least 2 hours.',
    severity: 'moderate'
  },
  {
    compounds: ['zinc', 'copper'],
    conflict: 'Zinc and Copper compete for absorption. Consider spacing intake.',
    severity: 'moderate'
  },
  {
    compounds: ['magnesium', 'calcium'],
    conflict: 'Magnesium and Calcium may compete for absorption when taken together.',
    severity: 'low'
  },
  {
    compounds: ['calcium', 'zinc'],
    conflict: 'Calcium may reduce Zinc absorption. Space intake by 2+ hours.',
    severity: 'moderate'
  }
];

function normalizeCompoundName(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function findCompoundInName(compound, protocolName) {
  const normalized = normalizeCompoundName(protocolName);
  const compoundLower = compound.toLowerCase();
  
  if (normalized.includes(compoundLower)) {
    return true;
  }
  
  const commonVariants = {
    'iron': ['ferrous', 'ferric', 'fe-'],
    'calcium': ['ca-', 'calcium citrate', 'calcium carbonate'],
    'zinc': ['zn-', 'zinc gluconate', 'zinc picolinate'],
    'copper': ['cu-', 'copper bisglycinate'],
    'magnesium': ['mg-', 'magnesium glycinate', 'magnesium citrate', 'magnesium threonate']
  };
  
  if (commonVariants[compoundLower]) {
    return commonVariants[compoundLower].some(variant => normalized.includes(variant));
  }
  
  return false;
}

export function checkProtocolInteractions(protocols) {
  const warnings = [];
  
  if (!protocols || !Array.isArray(protocols) || protocols.length < 2) {
    return { hasConflicts: false, warnings: [] };
  }
  
  for (const rule of INTERACTION_RULES) {
    const [compound1, compound2] = rule.compounds;
    const protocols1 = protocols.filter(p => findCompoundInName(compound1, p.name));
    const protocols2 = protocols.filter(p => findCompoundInName(compound2, p.name));
    
    if (protocols1.length > 0 && protocols2.length > 0) {
      const protocol1Names = protocols1.map(p => p.name).join(', ');
      const protocol2Names = protocols2.map(p => p.name).join(', ');
      
      warnings.push({
        message: rule.conflict,
        compounds: [compound1, compound2],
        protocols: [...protocols1, ...protocols2],
        severity: rule.severity,
        detail: `${protocol1Names} and ${protocol2Names} may interact. ${rule.conflict}`
      });
    }
  }
  
  return {
    hasConflicts: warnings.length > 0,
    warnings: warnings
  };
}
