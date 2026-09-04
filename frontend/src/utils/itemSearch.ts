export interface SearchableItem {
  title?: string;
  description?: string;
  location?: string;
  category?: {
    name?: string;
  };
}

const SEARCH_SYNONYMS: Record<string, string[]> = {
  bag: ["backpack", "handbag", "purse", "rucksack", "luggage", "satchel", "tote"],
  backpack: ["bag", "rucksack", "schoolbag"],
  phone: ["mobile", "smartphone", "cellphone", "iphone", "android"],
  mobile: ["phone", "smartphone", "cellphone"],
  laptop: ["computer", "notebook", "macbook"],
  wallet: ["purse", "billfold"],
  keys: ["key", "keychain"],
  watch: ["smartwatch", "wristwatch"],
  glasses: ["spectacles", "eyeglasses", "sunglasses"],
  earphones: ["earbuds", "headphones", "airpods"],
  earbuds: ["earphones", "airpods", "headphones"],
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenMatches(queryToken: string, textToken: string) {
  if (textToken.includes(queryToken) || queryToken.includes(textToken)) {
    return true;
  }

  const synonyms = SEARCH_SYNONYMS[queryToken] || [];
  return synonyms.some(
    (synonym) => textToken.includes(synonym) || synonym.includes(textToken),
  );
}

export function matchesItemSearch(
  item: SearchableItem,
  query: string,
): boolean {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) return true;

  const searchableText = normalize(
    [item.title, item.description, item.location, item.category?.name]
      .filter(Boolean)
      .join(" "),
  );

  if (!searchableText) return false;

  const queryTokens = normalizedQuery.split(/\s+/);
  const textTokens = searchableText.split(/\s+/);

  return queryTokens.every((queryToken) =>
    textTokens.some((textToken) => tokenMatches(queryToken, textToken)),
  );
}
