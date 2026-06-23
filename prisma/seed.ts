import { PrismaClient } from '@prisma/client'
import {
  DEMO_USER,
  DEMO_ACCOUNTS,
  DEMO_BUDGETS,
  DEMO_GOALS,
  DEMO_SUBSCRIPTIONS,
  DEMO_NOTIFICATIONS,
  DEMO_TRANSACTIONS
} from '../src/lib/mockData'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean the database
  console.log('🧹 Cleaning existing data...')
  await prisma.transaction.deleteMany()
  await prisma.account.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.receipt.deleteMany()
  await prisma.user.deleteMany()

  // Seed user
  console.log('👤 Seeding user...')
  const user = await prisma.user.create({
    data: {
      id: DEMO_USER.id,
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      image: DEMO_USER.image,
      createdAt: new Date(DEMO_USER.createdAt),
    }
  })

  // Seed accounts
  console.log('💳 Seeding accounts...')
  for (const acc of DEMO_ACCOUNTS) {
    await prisma.account.create({
      data: {
        id: acc.id,
        userId: user.id,
        type: acc.type,
        balance: acc.balance,
        interestRate: acc.interestRate,
        accountNumber: acc.accountNumber,
      }
    })
  }

  // Seed budgets
  console.log('📅 Seeding budgets...')
  for (const budget of DEMO_BUDGETS) {
    await prisma.budget.create({
      data: {
        id: budget.id,
        userId: user.id,
        category: budget.category,
        limit: budget.limit,
        spent: budget.spent,
      }
    })
  }

  // Seed goals
  console.log('🎯 Seeding goals...')
  for (const goal of DEMO_GOALS) {
    await prisma.goal.create({
      data: {
        id: goal.id,
        userId: user.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: new Date(goal.deadline),
      }
    })
  }

  // Seed subscriptions
  console.log('🔔 Seeding subscriptions...')
  for (const sub of DEMO_SUBSCRIPTIONS) {
    await prisma.subscription.create({
      data: {
        id: sub.id,
        userId: user.id,
        name: sub.name,
        monthlyCost: sub.monthlyCost,
        nextBillingDate: new Date(sub.nextBillingDate),
      }
    })
  }

  // Seed notifications
  console.log('💬 Seeding notifications...')
  for (const notif of DEMO_NOTIFICATIONS) {
    await prisma.notification.create({
      data: {
        id: notif.id,
        userId: user.id,
        message: notif.message,
        read: notif.read,
        createdAt: new Date(notif.createdAt),
      }
    })
  }

  // Seed transactions
  console.log('📈 Seeding transactions (this might take a few seconds)...')
  const BATCH_SIZE = 20;
  for (let i = 0; i < DEMO_TRANSACTIONS.length; i += BATCH_SIZE) {
    const batch = DEMO_TRANSACTIONS.slice(i, i + BATCH_SIZE);
    await prisma.transaction.createMany({
      data: batch.map(tx => ({
        id: tx.id,
        userId: user.id,
        amount: tx.amount,
        merchant: tx.merchant,
        description: tx.description,
        category: tx.category,
        type: tx.type,
        date: new Date(tx.date),
      }))
    });
  }

  console.log('✨ Seeding complete! Database is populated.')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
