"use client";
import { useState } from "react";
import Step1Contact from "./Step1Contact";
import Step2Delivery from "./Step2Delivery";
import Step3Method from "./Step3Method";
import Step4Payment, { type PaymentSelection } from "./Step4Payment";
import Step5Complete from "./Step5Complete";
import styles from "./checkoutWizard.module.scss";
import Breadcrumb from "../ breadcrumb/Breadcrumb";
import StepPagination from "./components/StepPagination";
import type { FormValues } from "./Step1Contact";
import { useCommerce } from "@/contexts/CommerceContext";
import {
  submitCheckout,
  type CheckoutPayload,
  type CheckoutResponse,
  type PaymentMethod,
  type SelectedBank,
} from "@/lib/api/checkout";

type CheckoutWizardProps = {
  onStepChange?: (step: number) => void;
};

type DeliverySelection = {
  method: string;
  address: {
    id?: string;
    city?: string;
    street?: string;
    house?: string;
    coords?: { lat: number; lng: number };
  } | null;
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

export default function CheckoutWizard({ onStepChange }: CheckoutWizardProps) {
  const { cart, clearCart } = useCommerce();
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState<"store" | "delivery" | null>(null);
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

  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: "მიწოდების დეტალები" },
  ];

  const handleStep2Next = () => {
    if (orderType === "store") {
      goToStep(4);
    } else {
      goToStep(3);
    }
  };

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
      deliveryType: isCourier ? "courier" : "pickup",
      shippingMethodId: null,
      shippingFullName: isCourier ? fullName : null,
      shippingLine1: isCourier
        ? [address?.street, address?.house].filter(Boolean).join(" ") || null
        : null,
      shippingCity: isCourier ? address?.city ?? null : null,
      deliveryLatitude: isCourier ? address?.coords?.lat ?? null : null,
      deliveryLongitude: isCourier ? address?.coords?.lng ?? null : null,
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
      }

      // snapshot items before clearing the cart so the summary still renders
      setOrderItems(cart.items);
      setCheckoutResult(result);
      await clearCart();

      // Phase 3: redirect to bank when a payment URL is returned.
      if (result.paymentRedirectUrl) {
        window.location.href = result.paymentRedirectUrl;
        return;
      }

      goToStep(5);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "შეკვეთის გაფორმება ვერ მოხერხდა"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Breadcrumb items={breadcrumbs} />

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
            onOptionChange={(v) => setOrderType(v)}
            onNext={handleStep2Next}
            onPrev={() => goToStep(1)}
          />
        )}

        {step === 3 && (
          <Step3Method
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
    </>
  );
}
