'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BalanceCard } from '@/components/finance/balance-card';
import { TransactionBadge } from '@/components/finance/transaction-badge';
import { AmountInput } from '@/components/finance/amount-input';
import { toast } from 'sonner';

export default function Home() {
  const [dark, setDark] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');

  return (
    <div className={dark ? 'dark' : ''}>
      <main className="bg-background text-foreground min-h-screen p-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-[28px] font-bold tracking-[-0.5px]">
              Design System Preview
            </h1>
            <Button variant="outline" onClick={() => setDark(!dark)}>
              {dark ? '☀️ Light' : '🌙 Dark'}
            </Button>
          </div>

          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Balance Card
            </p>
            <BalanceCard label="Tổng tài sản" amount={124580000} change={2.4} />
          </section>

          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Transaction Badges
            </p>
            <div className="flex gap-2">
              <TransactionBadge type="income" />
              <TransactionBadge type="expense" />
              <TransactionBadge type="saving" />
              <Badge>Default</Badge>
            </div>
          </section>

          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Buttons
            </p>
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </section>

          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Amount Input
            </p>
            <div className="space-y-2">
              <AmountInput
                value={amount}
                onChange={setAmount}
                transactionType="income"
                placeholder="0"
              />
              <AmountInput
                value={amount}
                onChange={setAmount}
                transactionType="expense"
                placeholder="0"
              />
            </div>
          </section>

          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Card
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Giao dịch gần đây</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    label: 'Lương tháng 4',
                    type: 'income',
                    amount: '+8.200.000 ₫',
                  },
                  {
                    label: 'Siêu thị Big C',
                    type: 'expense',
                    amount: '-450.000 ₫',
                  },
                  {
                    label: 'Tiết kiệm',
                    type: 'saving',
                    amount: '+2.000.000 ₫',
                  },
                ].map((tx) => (
                  <div
                    key={tx.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <TransactionBadge
                        type={tx.type as 'income' | 'expense' | 'saving'}
                      />
                      <span className="text-sm">{tx.label}</span>
                    </div>
                    <span
                      className={`text-sm font-semibold [font-variant-numeric:tabular-nums] ${
                        tx.type === 'income'
                          ? 'text-income'
                          : tx.type === 'expense'
                            ? 'text-expense'
                            : 'text-saving'
                      }`}
                    >
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Form Elements
            </p>
            <div className="space-y-3">
              <Input placeholder="Mô tả giao dịch..." />
              <div className="flex items-center gap-2">
                <Checkbox id="confirm" />
                <label htmlFor="confirm" className="text-sm">
                  Xác nhận giao dịch
                </label>
              </div>
            </div>
          </section>

          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Toast Notifications
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => toast.success('Thêm giao dịch thành công!')}
              >
                Success Toast
              </Button>
              <Button
                variant="destructive"
                onClick={() => toast.error('Có lỗi xảy ra!')}
              >
                Error Toast
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
