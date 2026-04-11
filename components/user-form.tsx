'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { UserInfo, CriteriaWeights } from '@/types/noxh';
import {
  DEFAULT_CRITERIA_WEIGHTS,
  CATEGORY_OPTIONS,
  HOUSING_STATUS_OPTIONS,
} from '@/types/noxh';

type Props = {
  onSubmit: (info: UserInfo, weights: CriteriaWeights) => void;
  loading?: boolean;
};

const DEFAULT_FORM: UserInfo = {
  income: 0,
  savings: 0,
  workAddress: '',
  maritalStatus: 'single',
  category: '',
  housingStatus: 'no_house',
  previouslyBought: false,
};

const LS_FORM_KEY = 'noxh_user_form';
const LS_WEIGHTS_KEY = 'noxh_criteria_weights';

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const WEIGHT_OPTIONS = [
  { value: 'high', label: 'Cao' },
  { value: 'medium', label: 'TB' },
  { value: 'low', label: 'Thấp' },
  { value: 'off', label: 'Tắt' },
] as const;

const CRITERIA_LABELS: Record<keyof CriteriaWeights, string> = {
  finance: 'Tài chính',
  location: 'Vị trí',
  urgency: 'Mức độ cấp thiết',
  investorReputation: 'Uy tín CĐT',
};

const INPUT_CLASS =
  'h-auto w-full rounded-2xl border-2 border-border bg-input px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1';

const SELECT_TRIGGER_CLASS =
  'w-full rounded-2xl border-2 border-border bg-input px-3.5 py-2.5 text-sm font-medium text-foreground h-auto data-[size=default]:h-auto';

export function UserForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<UserInfo>(DEFAULT_FORM);
  const [weights, setWeights] = useState<CriteriaWeights>(
    DEFAULT_CRITERIA_WEIGHTS
  );
  const [criteriaOpen, setCriteriaOpen] = useState(false);

  // Load từ localStorage sau khi hydrate xong (tránh server/client mismatch)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(readLS(LS_FORM_KEY, DEFAULT_FORM));
    setWeights(readLS(LS_WEIGHTS_KEY, DEFAULT_CRITERIA_WEIGHTS));
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_FORM_KEY, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    localStorage.setItem(LS_WEIGHTS_KEY, JSON.stringify(weights));
  }, [weights]);

  const isValid =
    form.income > 0 && form.category !== '' && form.workAddress.trim() !== '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(form, weights);
  }

  function setWeight(
    key: keyof CriteriaWeights,
    value: CriteriaWeights[keyof CriteriaWeights]
  ) {
    setWeights((w) => ({ ...w, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Hôn nhân */}
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
                'flex flex-1 cursor-pointer items-center justify-center rounded-2xl border-2 px-3 py-2.5 text-sm font-bold transition-all',
                form.maritalStatus === opt.value
                  ? 'border-primary bg-primary text-primary-foreground shadow-[0_4px_0_0_rgba(194,65,12,0.5)]'
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

      {/* Thu nhập */}
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

      {/* Vốn tự có */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-bold" htmlFor="savings">
          Vốn tự có
        </Label>
        <CurrencyInput
          id="savings"
          placeholder="VD: 500.000.000"
          value={form.savings || ''}
          onChange={(val) =>
            setForm((f) => ({ ...f, savings: val === '' ? 0 : val }))
          }
          className={INPUT_CLASS}
        />
      </div>

      {/* Địa chỉ nơi làm việc */}
      <div className="space-y-1.5">
        <Label
          className="text-foreground text-xs font-bold"
          htmlFor="workAddress"
        >
          Địa chỉ nơi làm việc
        </Label>
        <Input
          id="workAddress"
          placeholder="VD: Xuân Đỉnh, Bắc Từ Liêm"
          value={form.workAddress}
          onChange={(e) =>
            setForm((f) => ({ ...f, workAddress: e.target.value }))
          }
          className={INPUT_CLASS}
        />
      </div>

      {/* Đối tượng */}
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
            {CATEGORY_OPTIONS.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tình trạng nhà ở */}
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
          {HOUSING_STATUS_OPTIONS.map((c) => (
            <Label
              key={c.id}
              htmlFor={`housing-${c.id}`}
              className={cn(
                'flex w-full cursor-pointer items-center rounded-2xl border-2 px-3.5 py-2.5 text-sm font-bold transition-all',
                form.housingStatus === c.id
                  ? 'border-primary bg-primary text-primary-foreground shadow-[0_4px_0_0_rgba(194,65,12,0.5)]'
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

      {/* Đã từng mua */}
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

      {/* Tiêu chí đánh giá — accordion */}
      <div className="border-border rounded-2xl border-2">
        <button
          type="button"
          onClick={() => setCriteriaOpen((o) => !o)}
          className="text-foreground flex w-full items-center justify-between px-3.5 py-2.5 text-sm font-bold"
        >
          <span>Tiêu chí đánh giá</span>
          <span>{criteriaOpen ? '▲' : '▼'}</span>
        </button>

        {criteriaOpen && (
          <div className="border-border space-y-3 border-t-2 px-3.5 py-3">
            {(Object.keys(CRITERIA_LABELS) as (keyof CriteriaWeights)[]).map(
              (key) => (
                <div key={key} className="space-y-1.5">
                  <span className="text-foreground text-xs font-bold">
                    {CRITERIA_LABELS[key]}
                  </span>
                  <div className="border-border flex overflow-hidden rounded-xl border-2">
                    {WEIGHT_OPTIONS.map((opt, i) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWeight(key, opt.value)}
                        className={cn(
                          'flex-1 py-1.5 text-xs font-bold transition-all',
                          i > 0 && 'border-border border-l-2',
                          weights[key] === opt.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-input text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Đối tượng — bắt buộc, không tắt */}
            <div className="space-y-1.5 opacity-60">
              <span className="text-foreground text-xs font-bold">
                Đối tượng
              </span>
              <div className="border-border flex items-center justify-center rounded-xl border-2 py-1.5">
                <span className="text-muted-foreground text-xs font-bold">
                  🔒 Bắt buộc
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!isValid || loading}
        className="w-full"
      >
        {loading ? 'Đang tính...' : 'Tìm dự án phù hợp →'}
      </Button>
    </form>
  );
}
