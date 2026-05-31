"use client";
import { useState } from "react";
import Step1Contact from "./Step1Contact";
import Step2Delivery from "./Step2Delivery";
import Step3Method from "./Step3Method";
import Step4Payment from "./Step4Payment";
import Step5Complete from "./Step5Complete";
import styles from "./checkoutWizard.module.scss";
import Breadcrumb from "../ breadcrumb/Breadcrumb";
import StepPagination from "./components/StepPagination";
import type { FormValues } from "./Step1Contact";

type CheckoutWizardProps = {
  onStepChange?: (step: number) => void;
};

export default function CheckoutWizard({ onStepChange }: CheckoutWizardProps) {
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState<"store" | "delivery" | null>(null);
  const [contactData, setContactData] = useState<FormValues | null>(null);

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
          <Step3Method onNext={() => goToStep(4)} onPrev={() => goToStep(2)} />
        )}

        {step === 4 && (
          <Step4Payment
            onNext={() => goToStep(5)}
            onPrev={() => goToStep(orderType === "store" ? 2 : 3)}
          />
        )}

        {step === 5 && (
          <Step5Complete contactData={contactData} orderType={orderType} />
        )}
      </div>
    </>
  );
}
