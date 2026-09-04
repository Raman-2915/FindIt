export interface SearchableItem {
  title?: string;
  description?: string;
  location?: string;
  status?: string;
  category?: {
    name?: string;
  };
}

const SEARCH_GROUPS = [
  ["bag", "backpack", "handbag", "purse", "rucksack", "schoolbag", "luggage", "satchel", "tote"],
  ["phone", "mobile", "smartphone", "cellphone", "iphone", "android"],
  ["laptop", "computer", "notebook", "macbook"],
  ["wallet", "purse", "billfold"],
  ["key", "keys", "keychain"],
  ["watch", "smartwatch", "wristwatch"],
  ["glasses", "spectacles", "eyeglasses", "sunglasses"],
  ["earphone", "earphones", "earbud", "earbuds", "headphone", "headphones", "airpods"],
];

const SEARCH_SYNONYMS: Record<string, string[]> = Object.fromEntries(
  SEARCH_GROUPS.flatMap((group) =>
    group.map((term) => [term, group.filter((candidate) => candidate !== term)]),
  ),
);

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function singularize(value: string) {
  if (value.length > 4 && value.endsWith("ies")) return `${value.slice(0, -3)}y`;
  if (value.length > 3 && value.endsWith("s")) return value.slice(0, -1);
  return value;
}

function tokenMatches(queryToken: string, textToken: string) {
  const query = singularize(queryToken);
  const text = singularize(textToken);

  if (query === text || text.includes(query) || query.includes(text)) return true;

  const synonyms = SEARCH_SYNONYMS[query] || SEARCH_SYNONYMS[queryToken] || [];

  return synonyms.some((synonym) => {
    const normalizedSynonym = singularize(synonym);
    return (
      text === normalizedSynonym ||
      text.includes(normalizedSynonym) ||
      normalizedSynonym.includes(text)
    );
  });
}

export function matchesItemSearch(item: SearchableItem, query: string): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;

  const searchableText = normalize(
    [item.title, item.description, item.location, item.category?.name, item.status]
      .filter(Boolean)
      .join(" "),
  );

  if (!searchableText) return false;

  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const textTokens = searchableText.split(/\s+/).filter(Boolean);

  return queryTokens.every((queryToken) =>
    textTokens.some((textToken) => tokenMatches(queryToken, textToken)),
  );
}
