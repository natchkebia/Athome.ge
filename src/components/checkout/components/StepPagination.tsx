import styles from "./StepPagination.module.scss";

interface StepPaginationProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepPagination({
  currentStep,
  totalSteps,
}: StepPaginationProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className={styles.pagination}>
      {steps.map((step, index) => {
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <div key={step} className={styles.stepWrapper}>
            <div
              className={`${styles.circle}
              ${isActive ? " " + styles.active : ""}
              ${isCompleted ? " " + styles.completed : ""}`}
            >
              {isCompleted ? <img src="/icons/check1.svg" /> : step}
            </div>
            {isActive && index !== steps.length - 1 && (
              <div className={styles.line} />
            )}
          </div>
        );
      })}
    </div>
  );
}
