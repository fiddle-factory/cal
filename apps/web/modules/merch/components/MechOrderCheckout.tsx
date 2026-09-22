"use client";

import { useMemo, useState } from "react";

import classNames from "@calcom/ui/classNames";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { StepCard } from "@calcom/ui/components/card";
import { Divider } from "@calcom/ui/components/divider";
import { Icon } from "@calcom/ui/components/icon";
import { TextField } from "@calcom/ui/components/form";
import { RadioGroup, Root as RadioItem } from "@calcom/ui/components/radio";

type ShirtSize = "S" | "M" | "L" | "XL" | "XXL";

const SIZES: ShirtSize[] = ["S", "M", "L", "XL", "XXL"];

const STEPS = [
  { id: "cart", label: "Order" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "done", label: "Confirmation" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const UNIT_PRICE = 32;
const MECH_PRICE = 249;

export interface MechOrderCheckoutProps {
  initialQuantity?: number;
}

export function MechOrderCheckout({ initialQuantity = 1 }: MechOrderCheckoutProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [size, setSize] = useState<ShirtSize>("M");
  const [quantity, setQuantity] = useState(initialQuantity);
  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
  });
  const [orderNumber] = useState(() => `CAL-MECH-${Math.floor(100000 + Math.random() * 900000)}`);

  const currentStep = STEPS[stepIndex].id;

  const subtotal = useMemo(() => MECH_PRICE + UNIT_PRICE * quantity, [quantity]);
  const shippingCost = subtotal > 200 ? 0 : 12;
  const tax = useMemo(() => Math.round(subtotal * 0.08 * 100) / 100, [subtotal]);
  const total = useMemo(
    () => Math.round((subtotal + shippingCost + tax) * 100) / 100,
    [subtotal, shippingCost, tax]
  );

  const canContinueShipping =
    shipping.name.trim().length > 1 &&
    shipping.email.includes("@") &&
    shipping.address.trim().length > 3 &&
    shipping.city.trim().length > 1;

  const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="bg-subtle min-h-screen">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <Badge variant="blue" startIcon="gift">
            Limited drop
          </Badge>
          <h1 className="text-emphasis mt-3 text-2xl font-semibold leading-7">
            Checkout: Cal.com Mech Unit + Tee bundle
          </h1>
          <p className="text-subtle mt-1 text-sm">
            One collectible Cal.com desk mech, plus a Cal.com t-shirt in your size.
          </p>
        </div>

        <ol className="mb-8 flex items-center gap-2">
          {STEPS.map((step, i) => {
            const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "upcoming";
            return (
              <li key={step.id} className="flex flex-1 items-center gap-2">
                <div
                  className={classNames(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    state === "done" && "bg-brand-default text-brand",
                    state === "active" && "border-brand-default text-emphasis border-2",
                    state === "upcoming" && "bg-emphasis text-subtle"
                  )}>
                  {state === "done" ? <Icon name="check" className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={classNames(
                    "hidden text-sm font-medium sm:inline",
                    state === "upcoming" ? "text-subtle" : "text-emphasis"
                  )}>
                  {step.label}
                </span>
                {i < STEPS.length - 1 && <div className="bg-subtle h-px flex-1" />}
              </li>
            );
          })}
        </ol>

        <StepCard>
          {currentStep === "cart" && (
            <div>
              <h2 className="text-emphasis text-base font-semibold">Review your order</h2>
              <div className="border-subtle bg-default mt-4 flex items-center gap-4 rounded-lg border p-4">
                <div className="bg-emphasis flex h-16 w-16 shrink-0 items-center justify-center rounded-md">
                  <Icon name="blocks" className="text-subtle h-8 w-8" />
                </div>
                <div className="flex-1">
                  <p className="text-emphasis text-sm font-medium">Cal.com Desk Mech, Unit 01</p>
                  <p className="text-subtle text-sm">Die-cast collectible &middot; ships assembled</p>
                </div>
                <p className="text-emphasis text-sm font-medium">${MECH_PRICE.toFixed(2)}</p>
              </div>

              <div className="border-subtle bg-default mt-3 flex items-center gap-4 rounded-lg border p-4">
                <div className="bg-emphasis flex h-16 w-16 shrink-0 items-center justify-center rounded-md">
                  <Icon name="tags" className="text-subtle h-8 w-8" />
                </div>
                <div className="flex-1">
                  <p className="text-emphasis text-sm font-medium">Cal.com T-Shirt</p>
                  <p className="text-subtle text-sm">100% cotton &middot; heather grey</p>

                  <RadioGroup
                    value={size}
                    onValueChange={(value) => setSize(value as ShirtSize)}
                    className="mt-3 flex flex-wrap gap-2">
                    {SIZES.map((s) => (
                      <label
                        key={s}
                        htmlFor={`size-${s}`}
                        className={classNames(
                          "border-default text-emphasis flex h-8 w-10 cursor-pointer items-center justify-center rounded-md border text-xs font-medium transition",
                          size === s && "border-brand-default bg-brand-default text-brand"
                        )}>
                        <RadioItem value={s} id={`size-${s}`} className="sr-only" />
                        {s}
                      </label>
                    ))}
                  </RadioGroup>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-subtle text-xs font-medium">Qty</span>
                    <div className="border-default flex items-center rounded-md border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        className="text-subtle hover:text-emphasis flex h-7 w-7 items-center justify-center"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                        <span className="block h-0.5 w-2.5 bg-current" />
                      </button>
                      <span className="text-emphasis w-6 text-center text-sm font-medium">{quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        className="text-subtle hover:text-emphasis flex h-7 w-7 items-center justify-center"
                        onClick={() => setQuantity((q) => Math.min(9, q + 1))}>
                        <Icon name="plus" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-emphasis self-start text-sm font-medium">
                  ${(UNIT_PRICE * quantity).toFixed(2)}
                </p>
              </div>

              <Divider className="my-6" />
              <OrderSummary subtotal={subtotal} shippingCost={shippingCost} tax={tax} total={total} />

              <div className="mt-6 flex justify-end">
                <Button EndIcon="chevron-right" onClick={goNext}>
                  Continue to shipping
                </Button>
              </div>
            </div>
          )}

          {currentStep === "shipping" && (
            <div>
              <h2 className="text-emphasis text-base font-semibold">Shipping details</h2>
              <p className="text-subtle mt-1 text-sm">Where should we send your mech and tee?</p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  name="name"
                  label="Full name"
                  placeholder="Ada Lovelace"
                  value={shipping.name}
                  onChange={(e) => setShipping((s) => ({ ...s, name: e.target.value }))}
                />
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="ada@cal.com"
                  value={shipping.email}
                  onChange={(e) => setShipping((s) => ({ ...s, email: e.target.value }))}
                />
                <TextField
                  containerClassName="sm:col-span-2"
                  name="address"
                  label="Shipping address"
                  placeholder="123 Booking Ave"
                  addOnLeading={<Icon name="map-pin" className="h-4 w-4" />}
                  value={shipping.address}
                  onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
                />
                <TextField
                  name="city"
                  label="City"
                  placeholder="San Francisco"
                  value={shipping.city}
                  onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                />
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Button color="minimal" StartIcon="chevron-left" onClick={goBack}>
                  Back
                </Button>
                <Button EndIcon="chevron-right" disabled={!canContinueShipping} onClick={goNext}>
                  Continue to payment
                </Button>
              </div>
            </div>
          )}

          {currentStep === "payment" && (
            <div>
              <h2 className="text-emphasis text-base font-semibold">Payment</h2>
              <p className="text-subtle mt-1 text-sm">Secured checkout via Cal.com billing.</p>

              <div className="border-subtle bg-default mt-5 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Icon name="credit-card" className="text-subtle h-4 w-4" />
                  <span className="text-emphasis text-sm font-medium">Card details</span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    containerClassName="sm:col-span-2"
                    name="cardNumber"
                    label="Card number"
                    placeholder="4242 4242 4242 4242"
                    defaultValue="4242 4242 4242 4242"
                  />
                  <TextField name="expiry" label="Expiry" placeholder="MM/YY" defaultValue="12/28" />
                  <TextField name="cvc" label="CVC" placeholder="123" defaultValue="123" />
                </div>
                <div className="text-subtle mt-4 flex items-center gap-1.5 text-xs">
                  <Icon name="lock" className="h-3.5 w-3.5" />
                  Payments are encrypted end-to-end.
                </div>
              </div>

              <Divider className="my-6" />
              <OrderSummary subtotal={subtotal} shippingCost={shippingCost} tax={tax} total={total} />

              <div className="mt-6 flex items-center justify-between">
                <Button color="minimal" StartIcon="chevron-left" onClick={goBack}>
                  Back
                </Button>
                <Button color="primary" EndIcon="circle-check" onClick={goNext}>
                  Place order &middot; ${total.toFixed(2)}
                </Button>
              </div>
            </div>
          )}

          {currentStep === "done" && (
            <div className="text-center">
              <div className="bg-cal-success mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                <Icon name="check" className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-emphasis mt-4 text-xl font-semibold">Order confirmed</h2>
              <p className="text-subtle mt-1 text-sm">
                Confirmation sent to {shipping.email || "your email"}.
              </p>

              <div className="border-subtle bg-default mt-6 rounded-lg border p-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-subtle text-sm">Order number</span>
                  <span className="text-emphasis text-sm font-medium">{orderNumber}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-subtle text-sm">Shipping to</span>
                  <span className="text-emphasis text-sm font-medium">
                    {shipping.name || "—"}, {shipping.city || "—"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-subtle text-sm">T-shirt size</span>
                  <Badge variant="gray">{size}</Badge>
                </div>
                <Divider className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-emphasis text-sm font-semibold">Total paid</span>
                  <span className="text-emphasis text-sm font-semibold">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button color="secondary" StartIcon="mail">
                  Resend confirmation
                </Button>
              </div>
            </div>
          )}
        </StepCard>
      </main>
    </div>
  );
}

function OrderSummary({
  subtotal,
  shippingCost,
  tax,
  total,
}: {
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-subtle">Subtotal</span>
        <span className="text-emphasis">${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-subtle">Shipping</span>
        <span className="text-emphasis">{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-subtle">Tax</span>
        <span className="text-emphasis">${tax.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between border-t pt-2 text-sm">
        <span className="text-emphasis font-semibold">Total</span>
        <span className="text-emphasis font-semibold">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
