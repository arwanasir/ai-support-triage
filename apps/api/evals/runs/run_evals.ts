import dotenv from 'dotenv';
import { loadDataset } from './loader.js';
import fs from 'fs';

dotenv.config({ path: "../../.env" });

const { ticketAnalyser } = await import("../../src/ai/ai-service.js");
async function runEvals() {
    const dataset = loadDataset();

    let total = 0;
    let categoryCorrect = 0;
    let priorityCorrect = 0;
    let sentimentCorrect = 0;


    for (const ticket of dataset) {
        total++;
        const result = await ticketAnalyser(ticket.subject, ticket.body);

        if (result.analysis.category === ticket.category) categoryCorrect++;
        if (result.analysis.priority === ticket.priority) priorityCorrect++;
        if (result.analysis.sentiment === ticket.sentiment) sentimentCorrect++;


        console.log("Category Accuracy:", (categoryCorrect / total) * 100 + "%");
        console.log("Priority Accuracy:", (priorityCorrect / total) * 100 + "%")
        console.log("Sentiment Accuracy:", (sentimentCorrect / total) * 100 + "%")


    }

    const report = {
        timestamp: new Date().toISOString(),
        dataset_size: total,
        category_accuracy: categoryCorrect / total,
        priority_accuracy: priorityCorrect / total,
        sentiment_accuracy: sentimentCorrect / total,
        overall_accuracy: (categoryCorrect + priorityCorrect + sentimentCorrect) / (total * 3)
    }
    fs.writeFileSync('evals/report.json',
        JSON.stringify(report, null, 2),
        'utf-8'
    )
}

runEvals()