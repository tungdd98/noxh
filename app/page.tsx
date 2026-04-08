'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

function CurrencyInputDemo() {
  const [salary, setSalary] = useState<number | ''>('');
  return (
    <div className="space-y-1">
      <CurrencyInput
        id="salary"
        placeholder="VD: 10.000.000"
        value={salary}
        onChange={setSalary}
      />
      {salary !== '' && (
        <p className="text-muted-foreground text-xs">
          Giá trị: {salary.toLocaleString('vi-VN')} đồng
        </p>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground mb-4 text-[11px] font-semibold tracking-[0.5px] uppercase">
      {children}
    </p>
  );
}

const brandScale = [
  { label: '50', bg: 'bg-[#EEF2FF]', text: 'text-[#1E1B4B]', hex: '#EEF2FF' },
  { label: '200', bg: 'bg-[#C7D2FE]', text: 'text-[#1E1B4B]', hex: '#C7D2FE' },
  { label: '400', bg: 'bg-[#818CF8]', text: 'text-white', hex: '#818CF8' },
  { label: '500', bg: 'bg-[#6366F1]', text: 'text-white', hex: '#6366F1' },
  { label: '600', bg: 'bg-[#4F46E5]', text: 'text-white', hex: '#4F46E5' },
  { label: '950', bg: 'bg-[#1E1B4B]', text: 'text-white', hex: '#1E1B4B' },
];

const semanticColors = [
  { label: 'Success', bg: 'bg-[#059669]', hex: '#059669' },
  { label: 'Warning', bg: 'bg-[#D97706]', hex: '#D97706' },
  { label: 'Destructive', bg: 'bg-destructive', hex: '#DC2626' },
  { label: 'Info', bg: 'bg-[#0284C7]', hex: '#0284C7' },
];

export default function DesignSystemPage() {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? 'dark' : ''}>
      <main className="bg-background text-foreground min-h-screen p-8">
        <div className="mx-auto max-w-3xl space-y-12">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-[28px] font-bold tracking-[-0.5px]">
                Design System
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Nhà Ở Xã Hội — Indigo Modern
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setDark(!dark)}>
              {dark ? '☀️ Light' : '🌙 Dark'}
            </Button>
          </div>

          {/* ── 1. Colors ── */}
          <section>
            <SectionLabel>Colors</SectionLabel>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-medium">
                  Brand Scale
                </p>
                <div className="flex gap-2">
                  {brandScale.map((s) => (
                    <div key={s.label} className="flex-1">
                      <div
                        className={`${s.bg} ${s.text} flex h-12 items-end rounded-md p-1.5`}
                      >
                        <span className="text-[9px] leading-none font-semibold">
                          {s.label}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-center text-[9px]">
                        {s.hex}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-medium">
                  Semantic Colors
                </p>
                <div className="flex gap-2">
                  {semanticColors.map((s) => (
                    <div key={s.label} className="flex-1">
                      <div className={`${s.bg} h-10 rounded-md`} />
                      <p className="text-muted-foreground mt-1 text-center text-[9px]">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── 2. Typography ── */}
          <section>
            <SectionLabel>Typography</SectionLabel>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="font-heading text-[36px] leading-[1.2] font-bold tracking-[-1px]">
                  Display — Tìm nhà phù hợp
                </div>
                <div className="font-heading text-[28px] leading-[1.25] font-bold tracking-[-0.5px]">
                  H1 — Nhà ở xã hội
                </div>
                <div className="font-heading text-[22px] leading-[1.3] font-semibold tracking-[-0.3px]">
                  H2 — Điều kiện đăng ký
                </div>
                <div className="font-heading text-[17px] leading-[1.4] font-semibold">
                  H3 — Thông tin dự án
                </div>
                <div className="text-[14px] leading-[1.6] font-normal">
                  Body — Nhà ở xã hội là loại nhà ở được đầu tư xây dựng để bán,
                  cho thuê cho các đối tượng được hưởng chính sách hỗ trợ về nhà
                  ở.
                </div>
                <div className="text-muted-foreground text-[12px] leading-[1.5] font-normal">
                  Caption — Cập nhật ngày 08/04/2026
                </div>
                <div className="text-muted-foreground text-[11px] font-semibold tracking-[0.5px] uppercase">
                  Label — Trạng thái dự án
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── 3. Buttons ── */}
          <section>
            <SectionLabel>Buttons</SectionLabel>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-muted-foreground mb-2 text-xs">Variants</p>
                  <div className="flex flex-wrap gap-2">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 text-xs">Sizes</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 text-xs">States</p>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled>Disabled</Button>
                    <Button variant="outline" disabled>
                      Disabled Outline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── 4. Badges ── */}
          <section>
            <SectionLabel>Badges</SectionLabel>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="success">Đủ điều kiện</Badge>
                  <Badge variant="warning">Cần xem lại</Badge>
                  <Badge variant="destructive">Không đủ</Badge>
                  <Badge variant="info">Thông tin</Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── 5. Forms ── */}
          <section>
            <SectionLabel>Forms</SectionLabel>
            <Card>
              <CardHeader>
                <CardTitle className="text-[17px]">Form Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="income">Thu nhập hàng tháng</Label>
                  <Input id="income" placeholder="VD: 10.000.000 ₫" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="income-err" className="text-destructive">
                    Thu nhập hàng tháng *
                  </Label>
                  <Input
                    id="income-err"
                    placeholder="VD: 10.000.000 ₫"
                    className="border-destructive"
                  />
                  <p className="text-destructive text-xs">
                    Vui lòng nhập thu nhập hàng tháng
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Disabled</Label>
                  <Input placeholder="Không thể chỉnh sửa" disabled />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="salary">Thu nhập (VNĐ)</Label>
                  <CurrencyInputDemo />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Textarea id="note" placeholder="Nhập ghi chú..." rows={3} />
                </div>
                <div className="space-y-1.5">
                  <Label>Tỉnh / Thành phố</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tỉnh thành..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                      <SelectItem value="hn">Hà Nội</SelectItem>
                      <SelectItem value="dn">Đà Nẵng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tình trạng hôn nhân</Label>
                  <RadioGroup defaultValue="single" className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single" className="font-normal">
                        Độc thân
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="married" id="married" />
                      <Label htmlFor="married" className="font-normal">
                        Đã kết hôn
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="confirm" />
                  <Label htmlFor="confirm" className="font-normal">
                    Tôi xác nhận thông tin trên là chính xác
                  </Label>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── 6. Toast ── */}
          <section>
            <SectionLabel>Toast / Notification</SectionLabel>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      toast.success('Bạn đủ điều kiện mua nhà ở xã hội!')
                    }
                  >
                    Success Toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.error('Có lỗi xảy ra, vui lòng thử lại!')
                    }
                  >
                    Error Toast
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => toast.warning('Thu nhập gần ngưỡng tối đa!')}
                  >
                    Warning Toast
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      toast.info('Điều kiện cập nhật tháng 04/2026')
                    }
                  >
                    Info Toast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
