"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Step1Contact from "./Step1Contact";
import Step2Delivery from "./Step2Delivery";
import Step3Method from "./Step3Method";
import Step4Payment, { type PaymentSelection } from "./Step4Payment";
import Step5Complete from "./Step5Complete";
import styles from "./checkoutWizard.module.scss";
import StepPagination from "./components/StepPagination";
import type { FormValues } from "./Step1Contact";
import { useCommerce } from "@/contexts/CommerceContext";
import { useToast } from "@/contexts/ToastContext";
import { getCurrentUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import {
  submitCheckout,
  initiateFlittPayment,
  type CheckoutPayload,
  type CheckoutResponse,
  type PaymentMethod,
  type SelectedBank,
} from "@/lib/api/checkout";

type CheckoutWizardProps = {
  onStepChange?: (step: number) => void;
  onDeliverySummaryChange?: (summary: {
    mode: "unknown" | "pickup" | "courier";
    amount: number | null;
  }) => void;
};

type DeliverySelection = {
  method: string;
  expressDelivery?: boolean;
  address: {
    id?: string | number;
    savedAddressId?: number;
    city?: string;
    region?: string;
    line1?: string;
    line2?: string;
    postalCode?: string;
    coords?: { lat: number; lng: number };
  } | null;
};

const CHECKOUT_PROGRESS_KEY = "athomeCheckoutProgress";

type CheckoutProgress = {
  step: number;
  orderType: "store" | "delivery" | null;
  pickupBranchCode: string | null;
  shippingMethodId: number | null;
  contactData: FormValues | null;
  deliveryData: DeliverySelection | null;
};

// UI payment values differ from the backend enum — map them here.
const PAYMENT_METHOD_MAP: Record<PaymentSelection["method"], PaymentMethod> = {
  card: "card",
  invoice: "installment", // "განვადება"
  installment: "bankTransfer", // "გადარიცხვა"
};

function mapBank(bank: string): SelectedBank {
  if (bank === "boa") return "bog";
  if (bank === "tbc" || bank === "credo") return bank;
  return "bog";
}

export default function CheckoutWizard({ onStepChange, onDeliverySummaryChange }: CheckoutWizardProps) {
  const en = useStorefrontLocale() === "en";
  const { cart, clearCart } = useCommerce();
  const { showToast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState<"store" | "delivery" | null>(null);
  const [pickupBranchCode, setPickupBranchCode] = useState<string | null>(null);
  const [shippingMethodId, setShippingMethodId] = useState<number | null>(null);
  const [contactData, setContactData] = useState<FormValues | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliverySelection | null>(
    null
  );
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(
    null
  );
  const [orderItems, setOrderItems] = useState(cart.items);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [progressRestored, setProgressRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CHECKOUT_PROGRESS_KEY);
      if (saved) {
        const progress = JSON.parse(saved) as Partial<CheckoutProgress>;
        const savedStep = Number(progress.step);

        if (Number.isInteger(savedStep) && savedStep >= 1 && savedStep <= 4) {
          setStep(savedStep);
          onStepChange?.(savedStep);
        }
        setOrderType(progress.orderType ?? null);
        setPickupBranchCode(progress.pickupBranchCode ?? null);
        setShippingMethodId(progress.shippingMethodId ?? null);
        setContactData(progress.contactData ?? null);
        setDeliveryData(progress.deliveryData ?? null);

        if (progress.orderType) {
          onDeliverySummaryChange?.({
            mode: progress.orderType === "store" ? "pickup" : "courier",
            amount: null,
          });
        }
      }
    } catch {
      sessionStorage.removeItem(CHECKOUT_PROGRESS_KEY);
    } finally {
      setProgressRestored(true);
    }
  }, [onDeliverySummaryChange, onStepChange]);

  useEffect(() => {
    if (!progressRestored || step === 5) return;

    const progress: CheckoutProgress = {
      step,
      orderType,
      pickupBranchCode,
      shippingMethodId,
      contactData,
      deliveryData,
    };
    sessionStorage.setItem(CHECKOUT_PROGRESS_KEY, JSON.stringify(progress));
  }, [
    contactData,
    deliveryData,
    orderType,
    pickupBranchCode,
    progressRestored,
    shippingMethodId,
    step,
  ]);

  const handleStep2Next = () => {
    if (orderType === "store") {
      goToStep(4);
    } else {
      goToStep(3);
    }
  };

  const handleOrderTypeChange = useCallback((value: "store" | "delivery") => {
    setOrderType(value);
    onDeliverySummaryChange?.({
      mode: value === "store" ? "pickup" : "courier",
      amount: null,
    });
  }, [onDeliverySummaryChange]);

  const handleDeliveryAmountChange = useCallback((amount: number | null) => {
    onDeliverySummaryChange?.({ mode: "courier", amount });
  }, [onDeliverySummaryChange]);

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    onStepChange?.(nextStep);
  };

  function buildPayload(payment: PaymentSelection): CheckoutPayload {
    const isCompany = contactData?.type === "company";
    const fullName = isCompany
      ? contactData?.companyName ?? ""
      : [contactData?.firstName, contactData?.lastName]
          .filter(Boolean)
          .join(" ");

    const paymentMethod = PAYMENT_METHOD_MAP[payment.method];
    const isCourier = orderType === "delivery";
    const address = deliveryData?.address;

    return {
      customerType: isCompany ? "legal" : "physical",
      fullName,
      email: contactData?.email ?? payment.email ?? "",
      phone: contactData?.phone ?? "",
      additionalPhone: contactData?.altPhone || null,
      personalId: (isCompany ? contactData?.companyId : contactData?.personalId) || null,
      deliveryType: isCourier ? "Courier" : "Pickup",
      expressDelivery: isCourier ? deliveryData?.expressDelivery ?? false : false,
      pickupBranchCode: isCourier ? null : pickupBranchCode,
      shippingMethodId: isCourier ? shippingMethodId : null,
      shippingFullName: isCourier ? fullName : null,
      shippingLine1: isCourier
        ? address?.line1 || null
        : null,
      shippingLine2: isCourier ? address?.line2 || null : null,
      shippingCity: isCourier ? address?.city ?? null : null,
      shippingRegion: isCourier ? address?.region ?? null : null,
      shippingPostalCode: isCourier ? address?.postalCode || null : null,
      shippingCountry: isCourier ? "GE" : null,
      shippingPhone: isCourier ? contactData?.phone ?? null : null,
      deliveryLatitude: isCourier ? address?.coords?.lat ?? null : null,
      deliveryLongitude: isCourier ? address?.coords?.lng ?? null : null,
      savedAddressId: isCourier ? address?.savedAddressId ?? null : null,
      paymentMethod,
      selectedBank:
        paymentMethod === "bankTransfer" ? "bog" : mapBank(payment.bank),
      installmentMonths:
        paymentMethod === "installment" ? payment.installmentMonths : null,
      couponCode: null,
      customerNote: null,
      termsAccepted: true,
      guestItems: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        ...(item.swaps?.length ? { swaps: item.swaps } : {}),
      })),
    };
  }

  async function handlePlaceOrder(payment: PaymentSelection) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = buildPayload(payment);
      const result = await submitCheckout(payload);

      if (typeof window !== "undefined") {
        sessionStorage.setItem("pendingOrderId", String(result.orderId));
        sessionStorage.setItem(
          "pendingOrderNumber",
          result.orderNumber ?? ""
        );
        sessionStorage.setItem(
          "pendingOrderEmail",
          payload.email
        );
        sessionStorage.setItem(
          "pendingCheckoutSummary",
          JSON.stringify({
            result,
            items: cart.items,
            contactData,
            orderType,
          })
        );
        sessionStorage.removeItem(CHECKOUT_PROGRESS_KEY);
      }

      // Keep the cart until payment is positively confirmed. Failed, cancelled
      // or timed-out payments must remain retryable without rebuilding the cart.
      setOrderItems(cart.items);
      setCheckoutResult(result);

      // Phase 3: redirect to bank when a payment URL is returned (happy path —
      // backend already returns the flitt/bank URL).
      if (result.paymentRedirectUrl) {
        window.location.href = result.paymentRedirectUrl;
        return;
      }

      // Fallback: TBC (flitt) ბარათით გადახდისას, თუ ბექმა redirect URL არ
      // დააბრუნა, front თვითონ იძახებს flitt-ის initiate-ს და გადაამისამართებს.
      if (payload.paymentMethod === "card" && payload.selectedBank === "tbc") {
        try {
          // Flitt ამოწმებს, რომ email ემთხვევოდეს შეკვეთის email-ს. ავტორიზებულ
          // შეკვეთას ბექი account email-ით ქმნის, ამიტომ პრიორიტეტი account email-ს.
          const currentUser = await getCurrentUser().catch(() => null);
          const orderEmail = currentUser?.email || payload.email;
          const flitt = await initiateFlittPayment(result.orderId, {
            currency: result.currency ?? "GEL",
            email: orderEmail,
          });
          if (flitt.redirectUrl) {
            window.location.href = flitt.redirectUrl;
            return;
          }
        } catch {
          // initiate ჩავარდა — გადავდივართ დასრულების გვერდზე (Step 5).
        }
      }

      await clearCart();
      goToStep(5);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "შეკვეთის გაფორმება ვერ მოხერხდა";

      // სწრაფი მიწოდების ფანჯარა შეიძლება გადახდამდე დაიხუროს. არჩევანს ვხსნით,
      // მაგრამ ჩვეულებრივ მიწოდებაზე ჩუმად არ ვაგზავნით — მომხმარებელი თავიდან ადასტურებს.
      const code =
        error instanceof ApiError
          ? (error.details as { code?: string } | null)?.code
          : undefined;
      if (code === "EXPRESS_NOT_AVAILABLE") {
        setDeliveryData((current) => current ? { ...current, expressDelivery: false } : current);
        setSubmitError(
          `${message} ${en ? "Express delivery was removed. Please review and confirm the order again." : "სწრაფი მიწოდების მონიშვნა მოიხსნა. გთხოვთ, გადაამოწმოთ და ხელახლა დაადასტუროთ შეკვეთა."}`,
        );
        return;
      }

      // მარაგის დეფიციტი (409 OUT_OF_STOCK) — ბექი აბრუნებს მზა ქართულ ტექსტს
      // ყველა დეფიციტური პროდუქტით. ვაჩვენებთ და ვაბრუნებთ კალათაზე, სადაც
      // მომხმარებელი რაოდენობას შეასწორებს (შეკვეთა საერთოდ არ იქმნება).
      if (code === "OUT_OF_STOCK") {
        showToast(
          en
            ? "Some products are no longer available in the requested quantity. Please review your cart."
            : "ზოგი პროდუქტი მოთხოვნილი რაოდენობით აღარ არის მარაგში. გთხოვთ, გადაამოწმოთ კალათა.",
          "error",
        );
        router.push("/basket");
        return;
      }

      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.container}>
        <div className={styles.paginationWrapper}>
          <StepPagination currentStep={step} totalSteps={5} />
        </div>

        {step === 1 && (
          <Step1Contact
            onNext={(data) => {
              setContactData(data);
              goToStep(2);
            }}
          />
        )}

        {step === 2 && (
          <Step2Delivery
            onOptionChange={handleOrderTypeChange}
            onPickupBranchChange={setPickupBranchCode}
            onShippingMethodChange={setShippingMethodId}
            onNext={handleStep2Next}
            onPrev={() => goToStep(1)}
          />
        )}

        {step === 3 && (
          <Step3Method
            customerName={
              contactData?.type === "company"
                ? contactData.companyName
                : [contactData?.firstName, contactData?.lastName].filter(Boolean).join(" ")
            }
            customerPhone={contactData?.phone}
            onDeliveryAmountChange={handleDeliveryAmountChange}
            onNext={(data: DeliverySelection) => {
              setDeliveryData(data);
              goToStep(4);
            }}
            onPrev={() => goToStep(2)}
          />
        )}

        {step === 4 && (
          <Step4Payment
            onNext={handlePlaceOrder}
            onPrev={() => goToStep(orderType === "store" ? 2 : 3)}
            submitting={submitting}
            error={submitError}
          />
        )}

        {step === 5 && (
          <Step5Complete
            contactData={contactData}
            orderType={orderType}
            result={checkoutResult}
            items={orderItems}
          />
        )}
    </div>
  );
}
