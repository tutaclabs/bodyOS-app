import { libraryItems } from '../data/library-items';

const FUNCTIONAL_CATEGORIES = {
  energy: ['energy', 'energy production', 'mitochondrial', 'fatigue', 'stamina'],
  sleep: ['sleep', 'melatonin', 'circadian', 'rest', 'recovery'],
  skin: ['skin', 'collagen', 'wrinkle', 'appearance', 'dermatology'],
  recovery: ['recovery', 'repair', 'healing', 'tissue', 'injury'],
  cognitive: ['cognitive', 'focus', 'memory', 'brain', 'mental'],
  immune: ['immune', 'immunity', 'infection', 'defense'],
  antiInflammatory: ['anti-inflammatory', 'inflammation', 'inflammatory'],
  cardiovascular: ['cardiovascular', 'heart', 'circulation', 'blood pressure']
};

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function findFunctionalOverlaps(protocolName, libraryItem) {
  const normalizedName = normalizeText(protocolName);
  const normalizedUses = libraryItem.wellnessUses.map(use => normalizeText(use)).join(' ');
  const normalizedMechanism = normalizeText(libraryItem.mechanismOfAction);
  const allText = `${normalizedName} ${normalizedUses} ${normalizedMechanism}`;
  
  const overlaps = [];
  
  for (const [category, keywords] of Object.entries(FUNCTIONAL_CATEGORIES)) {
    const matches = keywords.filter(keyword => allText.includes(keyword));
    if (matches.length > 0) {
      overlaps.push(category);
    }
  }
  
  return overlaps;
}

function findLibraryItem(protocolName) {
  const normalized = normalizeText(protocolName);
  
  for (const item of libraryItems) {
    const itemName = normalizeText(item.name);
    if (normalized.includes(itemName) || itemName.includes(normalized.split(' ')[0])) {
      return item;
    }
  }
  
  return null;
}

export function analyzeStackRedundancies(protocols) {
  const redundancies = [];
  const categoryGroups = {};
  
  if (!protocols || !Array.isArray(protocols) || protocols.length < 2) {
    return { hasRedundancies: false, warnings: [] };
  }
  
  for (const protocol of protocols) {
    const libraryItem = findLibraryItem(protocol.name);
    if (!libraryItem) continue;
    
    const overlaps = findFunctionalOverlaps(protocol.name, libraryItem);
    
    for (const category of overlaps) {
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push({
        protocol,
        libraryItem
      });
    }
  }
  
  for (const [category, items] of Object.entries(categoryGroups)) {
    if (items.length >= 2) {
      const protocolNames = items.map(i => i.protocol.name).join(', ');
      const categoryLabel = category.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
      
      redundancies.push({
        category,
        message: `Your stack contains ${items.length} items targeting ${categoryLabel} optimization: ${protocolNames}`,
        protocols: items.map(i => i.protocol),
        count: items.length
      });
    }
  }
  
  return {
    hasRedundancies: redundancies.length > 0,
    warnings: redundancies
  };
}
