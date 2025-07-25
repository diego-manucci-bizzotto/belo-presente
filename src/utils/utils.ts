
export const getEmojiByCategory = (category: string): string => {
  const map: Record<string, string> = {
    "Chá de Casa Nova": "🏠",
    "Chá de Bebê": "🍼",
    "Chá Revelação": "💙🩷",
    "Chá de Fraldas": "🩲",
    "Chá de Lingerie": "👙",
    "Chá de Panela": "🧑‍🍳",
    "Chá de Cozinha": "🍴",
    "Casamento": "💐",
    "Noivado": "💍",
    "Quinze Anos": "👧",
    "Aniversário": "🎂",
    "Bodas": "💎",
    "Festinha do Pet": "🐶",
    "Festa Infantil": "👠",
    "Formatura": "🎓",
    "Dia dos Namorados": "💞",
    "Natal": "🎅",
    "Compras": "🛒",
    "Outro": "❓",
  };

  return map[category] || "❔";
};