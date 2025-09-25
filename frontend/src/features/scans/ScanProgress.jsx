import { useState, useEffect } from "react";

export default function ScanProgress({ onFinish }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      name: "Recon",
      description: "Discovering targets and services",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      name: "Scanning",
      description: "Running vulnerability checks",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
      ),
    },
    {
      name: "Normalizing",
      description: "Processing and organizing results",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
    },
    {
      name: "Done",
      description: "Scan completed successfully",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // Increase by 2% every interval
      });
    }, 150); // Update every 150ms for smooth progress

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate current step based on progress
    const stepProgress = progress / 100;
    const newCurrentStep = Math.min(
      Math.floor(stepProgress * steps.length),
      steps.length - 1
    );

    if (newCurrentStep !== currentStep) {
      setCurrentStep(newCurrentStep);
    }

    // Call onFinish when progress reaches 100%
    if (progress >= 100 && onFinish) {
      setTimeout(() => {
        onFinish();
      }, 1000); // Wait 1 second after completion before calling onFinish
    }
  }, [progress, currentStep, steps.length, onFinish]);

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "active";
    return "pending";
  };

  const getStepClasses = (stepIndex) => {
    const status = getStepStatus(stepIndex);
    const baseClasses = "flex flex-col items-center relative";

    switch (status) {
      case "completed":
        return `${baseClasses} text-green-400`;
      case "active":
        return `${baseClasses} text-blue-400`;
      default:
        return `${baseClasses} text-gray-500`;
    }
  };

  const getStepCircleClasses = (stepIndex) => {
    const status = getStepStatus(stepIndex);
    const baseClasses =
      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300";

    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-500 border-green-500 text-white`;
      case "active":
        return `${baseClasses} bg-blue-500 border-blue-500 text-white animate-pulse`;
      default:
        return `${baseClasses} bg-gray-700 border-gray-600 text-gray-400`;
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-md border border-gray-700 mb-6">
      <h3 className="text-xl font-semibold mb-6">Scan Progress</h3>

      {/* Stepper */}
      <div className="relative mb-8">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-600 mx-5">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${(progress / 100) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="flex justify-between relative z-10">
          {steps.map((step, index) => (
            <div key={step.name} className={getStepClasses(index)}>
              {/* Step circle with icon */}
              <div className={getStepCircleClasses(index)}>{step.icon}</div>

              {/* Step label */}
              <div className="mt-3 text-center">
                <div className="text-sm font-medium">{step.name}</div>
                <div className="text-xs text-gray-400 mt-1 max-w-24">
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar with percentage */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">
            {currentStep < steps.length - 1
              ? `Currently: ${steps[currentStep].name}`
              : "Scan Complete!"}
          </span>
          <span className="text-sm text-gray-300">{Math.round(progress)}%</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current step description */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          {steps[currentStep].description}
        </p>
      </div>
    </div>
  );
}
