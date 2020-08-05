import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';
import Transaction from '../models/Transaction';

import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

interface TransactionData {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, filename);

    const transactionsData: TransactionData[] = [];

    const createTransaction = new CreateTransactionService();

    const readStream = fs.createReadStream(filePath);

    const parseCSV = readStream.pipe(csvParse({ from_line: 2 }));

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      transactionsData.push({
        title,
        type,
        value,
        category,
      });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const transactions: Transaction[] = [];

    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < transactionsData.length; index++) {
      const { title, type, value, category } = transactionsData[index];

      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransaction.execute({
        title,
        type,
        value,
        category,
      });

      transactions.push(transaction);
    }

    fs.promises.unlink(filePath);

    return transactions;
  }
}

export default ImportTransactionsService;
