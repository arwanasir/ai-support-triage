import fs from 'fs';
import path from 'path';

type DatasetItem = {
  subject: string;
  body: string;
  category: string;
  priority: string;
  sentiment: string;
};

export function loadDataset(): DatasetItem[] {
  const filePath = path.join(__dirname, "../dataset.jsonl");
  const raw = fs.readFileSync(filePath, "utf-8");

  return raw
    .split("\n")
    .filter(line => line.trim().length > 0)
    .map(line => JSON.parse(line));
}