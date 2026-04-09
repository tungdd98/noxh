'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { UserInfo, Criteria } from '@/types/noxh';

type Props = {
  criteria: Criteria;
  initialValues: UserInfo | null;
  onSubmit: (info: UserInfo) => void;
};

const DEFAULT_FORM: UserInfo = {
  income: 0,
  maritalStatus: 'single',
  provinceId: '',
  category: '',
  housingStatus: 'no_house',
  previouslyBought: false,
};

const INPUT_CLASS =
  'w-full rounded-[10px] border-2 border-border bg-input px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1';

const SELECT_TRIGGER_CLASS =
  'w-full rounded-[10px] border-2 border-border bg-input px-3.5 py-2.5 text-sm font-medium text-foreground h-auto';

export function UserForm({ criteria, initialValues, onSubmit }: Props) {
  const [form, setForm] = useState<UserInfo>(initialValues ?? DEFAULT_FORM);

  const isValid =
    form.income > 0 && form.provinceId !== '' && form.category !== '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-bold">
          Tình trạng hôn nhân
        </Label>
        <RadioGroup
          value={form.maritalStatus}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, maritalStatus: v as 'single' | 'married' }))
          }
          className="flex gap-2"
        >
          {(
            [
              { value: 'single', label: 'Độc thân' },
              { value: 'married', label: 'Đã kết hôn' },
            ] as const
          ).map((opt) => (
            <Label
              key={opt.value}
              htmlFor={opt.value}
              className={cn(
                'flex flex-1 cursor-pointer items-center justify-center rounded-[10px] border-2 px-3 py-2.5 text-sm font-bold transition-all',
                form.maritalStatus === opt.value
                  ? 'border-primary bg-primary text-primary-foreground shadow-[2px_2px_0_var(--border)]'
                  : 'bg-input border-border text-foreground hover:bg-muted'
              )}
            >
              <RadioGroupItem
                value={opt.value}
                id={opt.value}
                className="sr-only"
              />
              {opt.label}
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-bold" htmlFor="income">
          Thu nhập hàng tháng
        </Label>
        <CurrencyInput
          id="income"
          placeholder="VD: 12.000.000"
          value={form.income || ''}
          onChange={(val) =>
            setForm((f) => ({ ...f, income: val === '' ? 0 : val }))
          }
          className={INPUT_CLASS}
        />
        {form.maritalStatus === 'married' && (
          <p className="text-muted-foreground text-xs">
            Nhập tổng thu nhập của cả 2 vợ chồng
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-bold">
          Tỉnh / Thành phố muốn mua
        </Label>
        <Select
          value={form.provinceId}
          onValueChange={(v) => setForm((f) => ({ ...f, provinceId: v }))}
        >
          <SelectTrigger className={SELECT_TRIGGER_CLASS}>
            <SelectValue placeholder="Chọn tỉnh thành..." />
          </SelectTrigger>
          <SelectContent>
            {criteria.provinces.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-bold">Đối tượng</Label>
        <Select
          value={form.category}
          onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
        >
          <SelectTrigger className={SELECT_TRIGGER_CLASS}>
            <SelectValue placeholder="Chọn đối tượng..." />
          </SelectTrigger>
          <SelectContent>
            {criteria.eligibleCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-bold">
          Tình trạng nhà ở hiện tại
        </Label>
        <RadioGroup
          value={form.housingStatus}
          onValueChange={(v) =>
            setForm((f) => ({
              ...f,
              housingStatus: v as 'no_house' | 'small_house',
            }))
          }
          className="flex flex-col gap-2"
        >
          {criteria.housingConditions.map((c) => (
            <Label
              key={c.id}
              htmlFor={`housing-${c.id}`}
              className={cn(
                'flex w-full cursor-pointer items-center rounded-[10px] border-2 px-3.5 py-2.5 text-sm font-bold transition-all',
                form.housingStatus === c.id
                  ? 'border-primary bg-primary text-primary-foreground shadow-[2px_2px_0_var(--border)]'
                  : 'bg-input border-border text-foreground hover:bg-muted'
              )}
            >
              <RadioGroupItem
                value={c.id}
                id={`housing-${c.id}`}
                className="sr-only"
              />
              {c.label}
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="previously-bought"
          checked={form.previouslyBought}
          onCheckedChange={(v) =>
            setForm((f) => ({ ...f, previouslyBought: Boolean(v) }))
          }
          className="border-border border-2"
        />
        <Label
          htmlFor="previously-bought"
          className="text-foreground cursor-pointer text-sm font-medium"
        >
          Đã từng mua hoặc thuê nhà ở xã hội
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full text-sm font-extrabold"
        disabled={!isValid}
      >
        Kiểm tra điều kiện →
      </Button>
    </form>
  );
}
