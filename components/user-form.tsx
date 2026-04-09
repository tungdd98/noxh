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
import type { UserInfo, Criteria } from '@/types/noxh';

type Props = {
  criteria: Criteria;
  initialValues: UserInfo | null;
  onSubmit: (info: UserInfo) => void;
};

const DEFAULT_FORM: UserInfo = {
  income: 0,
  maritalStatus: 'single',
  spouseIncome: 0,
  provinceId: '',
  category: '',
  housingStatus: 'no_house',
  previouslyBought: false,
};

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
      {/* 1. Thu nhập */}
      <div className="space-y-1.5">
        <Label htmlFor="income">Thu nhập hàng tháng</Label>
        <CurrencyInput
          id="income"
          placeholder="VD: 12.000.000"
          value={form.income || ''}
          onChange={(val) =>
            setForm((f) => ({ ...f, income: val === '' ? 0 : val }))
          }
        />
      </div>

      {/* 2. Hôn nhân */}
      <div className="space-y-1.5">
        <Label>Tình trạng hôn nhân</Label>
        <RadioGroup
          value={form.maritalStatus}
          onValueChange={(v) =>
            setForm((f) => ({
              ...f,
              maritalStatus: v as 'single' | 'married',
              spouseIncome: 0,
            }))
          }
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="single" id="single" />
            <Label htmlFor="single" className="cursor-pointer font-normal">
              Độc thân
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="married" id="married" />
            <Label htmlFor="married" className="cursor-pointer font-normal">
              Đã kết hôn
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* 3. Thu nhập vợ/chồng (conditional) */}
      {form.maritalStatus === 'married' && (
        <div className="space-y-1.5">
          <Label htmlFor="spouse-income">Thu nhập vợ/chồng</Label>
          <CurrencyInput
            id="spouse-income"
            placeholder="VD: 10.000.000"
            value={form.spouseIncome || ''}
            onChange={(val) =>
              setForm((f) => ({ ...f, spouseIncome: val === '' ? 0 : val }))
            }
          />
        </div>
      )}

      {/* 4. Tỉnh thành */}
      <div className="space-y-1.5">
        <Label>Tỉnh / Thành phố muốn mua</Label>
        <Select
          value={form.provinceId}
          onValueChange={(v) => setForm((f) => ({ ...f, provinceId: v }))}
        >
          <SelectTrigger>
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

      {/* 5. Đối tượng */}
      <div className="space-y-1.5">
        <Label>Đối tượng</Label>
        <Select
          value={form.category}
          onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
        >
          <SelectTrigger>
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

      {/* 6. Tình trạng nhà ở */}
      <div className="space-y-1.5">
        <Label>Tình trạng nhà ở hiện tại</Label>
        <RadioGroup
          value={form.housingStatus}
          onValueChange={(v) =>
            setForm((f) => ({
              ...f,
              housingStatus: v as 'no_house' | 'small_house',
            }))
          }
          className="space-y-2"
        >
          {criteria.housingConditions.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <RadioGroupItem value={c.id} id={`housing-${c.id}`} />
              <Label
                htmlFor={`housing-${c.id}`}
                className="cursor-pointer font-normal"
              >
                {c.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* 7. Đã từng mua NOXH */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="previously-bought"
          checked={form.previouslyBought}
          onCheckedChange={(v) =>
            setForm((f) => ({ ...f, previouslyBought: Boolean(v) }))
          }
        />
        <Label
          htmlFor="previously-bought"
          className="cursor-pointer font-normal"
        >
          Đã từng mua hoặc thuê nhà ở xã hội
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={!isValid}>
        Kiểm tra điều kiện →
      </Button>
    </form>
  );
}
