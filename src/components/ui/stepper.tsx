import React from "react";

interface StepperProps {
  steps: {
    label: string;
    description?: string;
  }[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between mt-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.label}>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= index + 1
                  ? "bg-facebook text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {index + 1}
            </div>
            <div className="ml-2">
              <div
                className={`text-sm font-medium ${
                  currentStep >= index + 1
                    ? "text-facebook dark:text-facebook"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {step.label}
              </div>
              {step.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </div>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 ${
                currentStep > index + 1
                  ? "bg-facebook"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stepper;
