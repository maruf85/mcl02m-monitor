import fs from "node:fs/promises";
import path from "node:path";

const dictionaryPath = path.resolve(import.meta.dirname, "../../data/menu-translations.json");

const defaultTranslations: Record<string, string> = {
  "关机": "Shutdown",
  "手动": "Manual",
  "长按": "Press and hold",
  "火锅": "Hot Pot",
  "蒸煮": "Steam & Boil",
  "汤粥": "Soup & Porridge",
  "炒菜": "Stir Fry",
  "煎炸": "Deep Fry",
  "设置": "Settings",
  "恢复": "Restore",
};

let translations = { ...defaultTranslations };

export async function loadTranslations() {
  try {
    const saved = JSON.parse(
      await fs.readFile(dictionaryPath, "utf8")
    );

    translations = { ...translations, ...saved };
  } catch {
    await fs.mkdir(path.dirname(dictionaryPath), {
      recursive: true,
    });

    await saveTranslations();
  }
}

async function saveTranslations() {
  await fs.mkdir(path.dirname(dictionaryPath), {
    recursive: true,
  });

  await fs.writeFile(
    dictionaryPath,
    JSON.stringify(translations, null, 2),
    "utf8"
  );
}

export async function translateMenuText(
  text: string | null
): Promise<string | null> {
  if (!text) return null;

  return translations[text] ?? text;
}
