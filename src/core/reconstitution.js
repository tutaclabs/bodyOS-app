export function calculateUnits({ vialMg, bacMl, desiredMcg }) {
  if (!vialMg || !bacMl || !desiredMcg) return 0;
  const concentrationMcgPerMl = (vialMg * 1000) / bacMl;
  const mlToPull = desiredMcg / concentrationMcgPerMl;
  return mlToPull * 100; // 100 units = 1ml
}

