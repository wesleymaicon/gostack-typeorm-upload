/* eslint-disable no-param-reassign */
import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (acumulator, transaction: Transaction) => {
        if (transaction.type === 'income') {
          acumulator.income += Number(transaction.value);
        } else {
          acumulator.outcome += Number(transaction.value);
        }

        acumulator.total = acumulator.income - acumulator.outcome;

        return acumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }
}

export default TransactionsRepository;
