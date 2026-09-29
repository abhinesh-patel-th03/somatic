/*
 * Demo data for the "20-Day Mastitis Risk Score Trajectory" panel.
 * 25 test cows: 18 Low, 4 Medium, 3 High (actual tiers).
 * Cow #18 (Low -> Pred Medium) and Cow #19 (Medium -> Pred Low) are misclassified.
 *
 * Values are generated with a seeded generator, so the chart looks the same
 * on every load / deployment (no Math.random()).
 */

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r3 = (n) => Number(n.toFixed(3));
const range = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));

export const DAYS = range(20, (i) => `Day ${i + 1}`);

const cows = [];

// Cows 1-17: Actual Low -> Predicted Low
for (let i = 1; i <= 17; i++) {
  const rnd = mulberry32(1000 + i);
  cows.push({
    id: `cow_${i}`, name: `Cow #${i}`,
    actual: "Low", predicted: "Low", status: "Correct",
    trajectory: range(20, (d) => r3(0.08 + Math.sin(d / 3) * 0.03 + rnd() * 0.04)),
  });
}

// Cow 18: Actual Low -> Predicted Medium (misclassified)
cows.push({
  id: "cow_18", name: "Cow #18",
  actual: "Low", predicted: "Medium", status: "Misclassified",
  trajectory: [0.10, 0.12, 0.11, 0.15, 0.18, 0.22, 0.25, 0.28, 0.31, 0.33,
               0.35, 0.38, 0.40, 0.41, 0.43, 0.42, 0.44, 0.42, 0.41, 0.42],
});

// Cow 19: Actual Medium -> Predicted Low (misclassified)
cows.push({
  id: "cow_19", name: "Cow #19",
  actual: "Medium", predicted: "Low", status: "Misclassified",
  trajectory: [0.20, 0.22, 0.25, 0.28, 0.30, 0.32, 0.35, 0.37, 0.36, 0.34,
               0.32, 0.30, 0.29, 0.28, 0.30, 0.31, 0.30, 0.32, 0.31, 0.31],
});

// Cows 20-22: Actual Medium -> Predicted Medium
for (let i = 20; i <= 22; i++) {
  cows.push({
    id: `cow_${i}`, name: `Cow #${i}`,
    actual: "Medium", predicted: "Medium", status: "Correct",
    trajectory: range(20, (d) => r3(0.2 + (d / 19) * 0.32 + Math.sin(d + i) * 0.03)),
  });
}

// Cows 23-25: Actual High -> Predicted High
for (let i = 23; i <= 25; i++) {
  const rnd = mulberry32(2000 + i);
  cows.push({
    id: `cow_${i}`, name: `Cow #${i}`,
    actual: "High", predicted: "High", status: "Correct",
    trajectory: range(20, (d) => r3(0.25 + (d / 19) * 0.65 + rnd() * 0.04)),
  });
}

export const COWS = cows;

function classAverage(tier) {
  const group = cows.filter((c) => c.actual === tier);
  return range(20, (d) =>
    r3(group.reduce((sum, c) => sum + c.trajectory[d], 0) / group.length)
  );
}

export const CLASS_AVERAGES = {
  Low: classAverage("Low"),
  Medium: classAverage("Medium"),
  High: classAverage("High"),
};

// Options shown in the "View Target" dropdown (same grouping as the original dashboard)
export const COW_OPTION_GROUPS = [
  { label: "Misclassified Cows", ids: ["cow_18", "cow_19"], suffix: (c) => `(Actual ${c.actual} → Pred ${c.predicted})` },
  { label: "High Risk Cows (Confirmed Mastitis)", ids: ["cow_23", "cow_24", "cow_25"], suffix: () => "(High Risk - Correct)" },
  { label: "Medium Risk Cows", ids: ["cow_20", "cow_21", "cow_22"], suffix: () => "(Medium Risk - Correct)" },
  { label: "Low Risk Sample Subset", ids: ["cow_1", "cow_5", "cow_10", "cow_17"], suffix: () => "(Low Risk - Correct)" },
];
