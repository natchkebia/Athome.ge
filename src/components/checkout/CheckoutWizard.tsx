"use client";
import { useState } from "react";
import Step1Contact from "./Step1Contact";
import Step2Delivery from "./Step2Delivery";
import Step3Method from "./Step3Method";
import Step4Payment from "./Step4Payment";
import styles from "./checkoutWizard.module.scss";
import Breadcrumb from "../ breadcrumb/Breadcrumb";
import StepPagination from "./components/StepPagination";

export default function CheckoutWizard() {
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState<"store" | "delivery" | null>(null);

  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: "მიწოდების დეტალები" },
  ];

  const handleStep2Next = () => {
    if (orderType === "store") {
      setStep(4); 
    } else {
      setStep(3);
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbs} />

      <div className={styles.container}>
        <div className={styles.paginationWrapper}>
          <StepPagination currentStep={step} totalSteps={5} />
        </div>

        {step === 1 && <Step1Contact onNext={() => setStep(2)} />}

        {step === 2 && (
          <Step2Delivery
            onOptionChange={(v) => setOrderType(v)}
            onNext={handleStep2Next}
            onPrev={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <Step3Method onNext={() => setStep(4)} onPrev={() => setStep(2)} />
        )}

        {step === 4 && (
          <Step4Payment
            onNext={() => setStep(5)}
            onPrev={() => setStep(orderType === "store" ? 2 : 3)}
          />
        )}

        {step === 5 && (
          <div>
            {/* აქ მერე ჩაანაცვლებ  */}
            <h2>შეკვეთა მიღებულია 🎉</h2>
          </div>
        )}
      </div>
    </>
  );
}
