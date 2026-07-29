import fs from 'fs';
import { fileURLToPath } from 'url';

type DatasetItem = {
  subject: string;
  body: string;
  category: string;
  priority: string;
  sentiment: string;
};

export function loadDataset(): DatasetItem[] {
  const filePath = fileURLToPath(new URL("../dataset.jsonl", import.meta.url));
  const raw = fs.readFileSync(filePath, "utf-8");

  return raw
    .split("\n")
    .filter(line => line.trim().length > 0)
    .map(line => JSON.parse(line));
}
