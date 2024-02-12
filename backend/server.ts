import express, { Request, Response } from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import axios from 'axios';

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors());

interface BillCreationRequest {
  vendorId: string;
  lineItems: Array<{
    description: string;
    totalAmount: string;
    accountId: string;
  }>;
  dueDate: string;
  currency: string;
}

interface BillCreationResponse {
  billId: string;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
}


const createBill = async (data: BillCreationRequest): Promise<BillCreationResponse> => {
  try {
    const response = await axios.post<BillCreationResponse>('https://embedded.runalloy.com/2023-12/one/accounting/bills', data, {
      headers: {
        'Authorization': `Bearer rqnd6bZYU2I5PDrsJ5I4h`, // Replace YOUR_API_KEY with actual API key
        'accept': 'application/json',
        'content-type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating bill:', error);
    throw error;
  }
};

const billData: BillCreationRequest = {
  vendorId: "abc123",
  lineItems: [
    {
      description: "bill for services rendered",
      totalAmount: "2237.91",
      accountId: "account_id"
    }
  ],
  dueDate: "2023-12-31",
  currency: "USD"
};

createBill(billData)
  .then(response => console.log('Bill created:', response))
  .catch(error => console.error('Failed to create bill:', error));

// Open a database connection
const dbPromise = open({
  filename: './mydb.sqlite',
  driver: sqlite3.Database,
});

// Initialize the database
const initializeDb = async () => {
  const db = await dbPromise;
  await db.exec('CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT, total TEXT, date TEXT)');
};
initializeDb();

// Endpoint to handle form submissions
app.post('/submit-expense', async (req: Request, res: Response) => {
  const { category, total, date } = req.body;
  try {
    const db = await dbPromise;
    await db.run('INSERT INTO expenses (category, total, date) VALUES (?, ?, ?)', [category, total, date]);
    res.status(200).send('Expense submitted successfully');
  } catch (error) {
    res.status(500).send('Error submitting expense');
  }
});

app.get('/get-expenses', async (req, res) => {
  try {
    const db = await dbPromise;
    const expenses = await db.all('SELECT * FROM expenses ORDER BY date DESC'); // Fetches all expenses
    res.json(expenses); // Sends the expenses as JSON
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching expenses');
  }
});

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
