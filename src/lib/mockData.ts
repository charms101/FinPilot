export interface UserMock {
  id: string;
  name: string;
  email: string;
  image: string;
  createdAt: string;
}

export interface AccountMock {
  id: string;
  userId: string;
  type: string;
  balance: number;
  interestRate: number;
  accountNumber: string;
}

export interface TransactionMock {
  id: string;
  userId: string;
  amount: number;
  merchant: string;
  description: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
}

export interface BudgetMock {
  id: string;
  userId: string;
  category: string;
  limit: number;
  spent: number;
}

export interface GoalMock {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface SubscriptionMock {
  id: string;
  userId: string;
  name: string;
  monthlyCost: number;
  nextBillingDate: string;
}

export interface NotificationMock {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ReceiptMock {
  id: string;
  userId: string;
  merchant: string;
  amount: number;
  date: string;
  imageUrl: string;
}

export const DEMO_USER: UserMock = {
  id: 'user_demo_123',
  name: 'Charmi Sutariya',
  email: 'sutariyacharmi74@gmail.com',
  image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256',
  createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
};

export const DEMO_ACCOUNTS: AccountMock[] = [
  {
    id: 'acc_checking',
    userId: DEMO_USER.id,
    type: 'Checking',
    balance: 1100,
    interestRate: 0.01,
    accountNumber: '•••• 4321',
  },
  {
    id: 'acc_savings',
    userId: DEMO_USER.id,
    type: 'Savings',
    balance: 6800,
    interestRate: 4.25, // High-yield Savings Account
    accountNumber: '•••• 8765',
  },
  {
    id: 'acc_credit',
    userId: DEMO_USER.id,
    type: 'Credit Card',
    balance: 350, // Negative means balance owed
    interestRate: 18.99,
    accountNumber: '•••• 9876',
  },
];

export const DEMO_BUDGETS: BudgetMock[] = [
  { id: 'b_food', userId: DEMO_USER.id, category: 'Food', limit: 300, spent: 235.50 },
  { id: 'b_shopping', userId: DEMO_USER.id, category: 'Shopping', limit: 50, spent: 20 },
  { id: 'b_entertainment', userId: DEMO_USER.id, category: 'Entertainment', limit: 20, spent: 0 },
  { id: 'b_transportation', userId: DEMO_USER.id, category: 'Transportation', limit: 50, spent: 40 },
  { id: 'b_utilities', userId: DEMO_USER.id, category: 'Bills', limit: 200, spent: 100.00 },
];

export const DEMO_GOALS: GoalMock[] = [
  {
    id: 'g_emergency',
    userId: DEMO_USER.id,
    name: 'Emergency Fund',
    targetAmount: 1000,
    currentAmount: 100,
    deadline: new Date('2026-12-31').toISOString(),
  },
  {
    id: 'g_japan',
    userId: DEMO_USER.id,
    name: 'Japan Trip',
    targetAmount: 6000,
    currentAmount: 2000,
    deadline: new Date('2027-04-15').toISOString(),
  },
  {
    id: 'college_fund',
    userId: DEMO_USER.id,
    name: 'College fund',
    targetAmount: 17000,
    currentAmount: 6000,
    deadline: new Date('2026-08-31').toISOString(),
  },
];

export const DEMO_SUBSCRIPTIONS: SubscriptionMock[] = [
  { id: 'sub_netflix', userId: DEMO_USER.id, name: 'Netflix', monthlyCost: 15.49, nextBillingDate: new Date('2026-07-02').toISOString() },
  { id: 'sub_spotify', userId: DEMO_USER.id, name: 'Spotify', monthlyCost: 10.99, nextBillingDate: new Date('2026-07-10').toISOString() },
  { id: 'sub_chatgpt', userId: DEMO_USER.id, name: 'ChatGPT Plus', monthlyCost: 20.00, nextBillingDate: new Date('2026-07-15').toISOString() },
  { id: 'sub_gym', userId: DEMO_USER.id, name: 'Gym Membership', monthlyCost: 55.00, nextBillingDate: new Date('2026-07-01').toISOString() },
];

export const DEMO_NOTIFICATIONS: NotificationMock[] = [
  { id: 'n_1', userId: DEMO_USER.id, message: '+$2,500.00 paycheck deposited from ACME Corp', read: false, createdAt: new Date('2026-06-20T08:00:00Z').toISOString() },
  { id: 'n_2', userId: DEMO_USER.id, message: '-$45.00 Target purchase detected', read: false, createdAt: new Date('2026-06-21T14:30:00Z').toISOString() },
  { id: 'n_3', userId: DEMO_USER.id, message: 'Budget alert: Shopping has reached 97% of limit', read: false, createdAt: new Date('2026-06-22T19:15:00Z').toISOString() },
  { id: 'n_4', userId: DEMO_USER.id, message: 'Large expense warning: $450.00 spent at Apple Store', read: true, createdAt: new Date('2026-06-15T11:00:00Z').toISOString() },
  { id: 'n_5', userId: DEMO_USER.id, message: 'Goal Milestone: Emergency Fund is now 66% funded!', read: true, createdAt: new Date('2026-06-10T09:00:00Z').toISOString() },
];

// Generate 100 realistic transactions spread across the last 60 days
const MERCHANTS_BY_CATEGORY: Record<string, { merchant: string; desc: string; amountRange: [number, number] }[]> = {
  Food: [
    { merchant: 'Starbucks', desc: 'Coffee and snacks', amountRange: [4.50, 15.00] },
    { merchant: 'Whole Foods', desc: 'Weekly groceries', amountRange: [60.00, 150.00] },
    { merchant: 'Uber Eats', desc: 'Dinner delivery', amountRange: [25.00, 65.00] },
    { merchant: 'Chipotle', desc: 'Lunch burrito', amountRange: [12.00, 28.00] },
    { merchant: 'Sweetgreen', desc: 'Salad lunch', amountRange: [14.00, 22.00] },
  ],
  Shopping: [
    { merchant: 'Amazon', desc: 'Household goods', amountRange: [15.00, 120.00] },
    { merchant: 'Target', desc: 'Shopping run', amountRange: [30.00, 95.00] },
    { merchant: 'Zara', desc: 'Clothing items', amountRange: [45.00, 150.00] },
    { merchant: 'Apple Store', desc: 'Tech accessories', amountRange: [29.00, 450.00] },
  ],
  Transportation: [
    { merchant: 'Uber', desc: 'Ride home', amountRange: [12.00, 40.00] },
    { merchant: 'Lyft', desc: 'Airport ride', amountRange: [35.00, 60.00] },
    { merchant: 'Shell', desc: 'Gasoline refill', amountRange: [40.00, 65.00] },
    { merchant: 'Metropolitan Transit', desc: 'Train card reload', amountRange: [10.00, 30.00] },
  ],
  Bills: [
    { merchant: 'Comcast Xfinity', desc: 'High-speed internet', amountRange: [79.99, 79.99] },
    { merchant: 'ConEd', desc: 'Electricity utility', amountRange: [120.00, 180.00] },
    { merchant: 'Verizon Wireless', desc: 'Mobile phone plan', amountRange: [85.00, 95.00] },
    { merchant: 'State Farm', desc: 'Auto insurance', amountRange: [110.00, 110.00] },
  ],
  Entertainment: [
    { merchant: 'AMC Theatres', desc: 'Movie tickets and snacks', amountRange: [18.00, 45.00] },
    { merchant: 'Ticketmaster', desc: 'Concert tickets', amountRange: [80.00, 220.00] },
    { merchant: 'Steam Games', desc: 'Digital game download', amountRange: [9.99, 59.99] },
    { merchant: 'Starry Lanes', desc: 'Bowling with friends', amountRange: [25.00, 60.00] },
  ],
  Healthcare: [
    { merchant: 'CVS Pharmacy', desc: 'Prescription refill', amountRange: [8.50, 45.00] },
    { merchant: 'City Dental', desc: 'Dental cleaning copay', amountRange: [50.00, 50.00] },
    { merchant: 'Quest Diagnostics', desc: 'Lab work coverage', amountRange: [35.00, 75.00] },
  ],
  Education: [
    { merchant: 'Coursera', desc: 'Data Science specialization', amountRange: [49.00, 49.00] },
    { merchant: 'O\'Reilly Books', desc: 'Programming reference text', amountRange: [35.00, 65.00] },
  ],
  Other: [
    { merchant: 'USPS', desc: 'Shipping postage', amountRange: [5.80, 22.00] },
    { merchant: 'Chase Bank', desc: 'Monthly account fee waiver', amountRange: [0.00, 0.00] },
  ],
};

const INCOME_SOURCES = [
  { merchant: 'ACME Corp', desc: 'Bi-weekly Salary', amountRange: [2500.00, 2500.00] },
  { merchant: 'Upwork', desc: 'Freelance consulting payment', amountRange: [350.00, 850.00] },
];

function generate100Transactions(): TransactionMock[] {
  const transactions: TransactionMock[] = [];
  const now = new Date('2026-06-23T14:30:00Z');
  
  // Create fixed salaries first
  // Paychecks: June 15, May 31, May 15, April 30, April 15...
  const datesOfPaychecks: Date[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 15 - 3); // Spaced 15 days apart
    datesOfPaychecks.push(d);
  }

  datesOfPaychecks.forEach((d, idx) => {
    transactions.push({
      id: `t_salary_${idx}`,
      userId: DEMO_USER.id,
      amount: 2500.00,
      merchant: 'ACME Corp',
      description: 'Bi-weekly Salary Payment',
      category: 'Income',
      type: 'INCOME',
      date: d.toISOString(),
    });
  });

  // Freelance income
  const datesOfFreelance = [5, 18, 32, 45, 52];
  datesOfFreelance.forEach((daysAgo, idx) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    const amount = parseFloat((Math.random() * (750 - 300) + 300).toFixed(2));
    transactions.push({
      id: `t_freelance_${idx}`,
      userId: DEMO_USER.id,
      amount,
      merchant: 'Upwork Client',
      description: 'Freelance Design Retainer',
      category: 'Income',
      type: 'INCOME',
      date: d.toISOString(),
    });
  });

  // Generate expenses
  const categories = Object.keys(MERCHANTS_BY_CATEGORY);
  let expenseCount = 0;

  for (let i = 1; i <= 90; i++) {
    const d = new Date(now);
    // Spread expenses backwards over 60 days
    d.setDate(d.getDate() - (i * 0.65 + Math.random() * 0.5));
    
    // Pick random category weighted towards Food, Shopping, Transportation
    let category = 'Food';
    const rand = Math.random();
    if (rand < 0.35) {
      category = 'Food';
    } else if (rand < 0.60) {
      category = 'Shopping';
    } else if (rand < 0.75) {
      category = 'Transportation';
    } else if (rand < 0.85) {
      category = 'Bills';
    } else if (rand < 0.92) {
      category = 'Entertainment';
    } else if (rand < 0.95) {
      category = 'Healthcare';
    } else if (rand < 0.98) {
      category = 'Education';
    } else {
      category = 'Other';
    }

    const merchantsList = MERCHANTS_BY_CATEGORY[category];
    const item = merchantsList[Math.floor(Math.random() * merchantsList.length)];
    const amount = parseFloat((Math.random() * (item.amountRange[1] - item.amountRange[0]) + item.amountRange[0]).toFixed(2));

    if (amount > 0) {
      transactions.push({
        id: `t_expense_${expenseCount}`,
        userId: DEMO_USER.id,
        amount,
        merchant: item.merchant,
        description: item.desc,
        category,
        type: 'EXPENSE',
        date: d.toISOString(),
      });
      expenseCount++;
    }
  }

  // Add subscription transactions (recurring monthly expenses)
  const subscriptions = DEMO_SUBSCRIPTIONS;
  for (let m = 0; m < 2; m++) { // Past 2 months
    subscriptions.forEach((sub, sIdx) => {
      const d = new Date(sub.nextBillingDate);
      d.setMonth(d.getMonth() - m - 1);
      transactions.push({
        id: `t_sub_${m}_${sIdx}`,
        userId: DEMO_USER.id,
        amount: sub.monthlyCost,
        merchant: sub.name,
        description: `Recurring Subscription Payment`,
        category: sub.name === 'Gym Membership' ? 'Healthcare' : 'Entertainment',
        type: 'EXPENSE',
        date: d.toISOString(),
      });
    });
  }

  // Sort transactions by date descending
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const DEMO_TRANSACTIONS = generate100Transactions();
