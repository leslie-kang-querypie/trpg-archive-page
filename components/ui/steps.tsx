import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed';
}

interface StepsProps {
  steps: Step[];
  className?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  ({ steps, className }, ref) => {
    return (
      <div ref={ref} className={cn('w-full', className)}>
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center">
            {steps.map((step, stepIndex) => (
              <li
                key={step.id}
                className={cn(
                  'relative',
                  stepIndex !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''
                )}
              >
                {/* Connector line */}
                {stepIndex !== steps.length - 1 && (
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div
                      className={cn(
                        'h-0.5 w-full',
                        step.status === 'completed'
                          ? 'bg-primary'
                          : 'bg-muted-foreground/25'
                      )}
                    />
                  </div>
                )}

                {/* Step content */}
                <div className="relative flex flex-col items-center">
                  {step.status === 'completed' ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-5 w-5" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                      step.status === 'current'
                        ? "border-2 border-primary bg-background text-primary"
                        : "border-2 border-muted-foreground/25 bg-background text-muted-foreground"
                    )}>
                      {stepIndex + 1}
                    </div>
                  )}
                  
                  {/* Step labels */}
                  <div className="absolute top-10 min-w-0 text-center">
                    <p
                      className={cn(
                        'text-sm font-medium whitespace-nowrap',
                        step.status === 'current'
                          ? 'text-primary'
                          : step.status === 'completed'
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    );
  }
);
Steps.displayName = 'Steps';

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ steps, currentStep, onStepClick, className }, ref) => {
    const stepsWithStatus = steps.map((step, index) => ({
      ...step,
      status:
        index < currentStep
          ? ('completed' as const)
          : index === currentStep
          ? ('current' as const)
          : ('pending' as const),
    }));

    return (
      <div ref={ref} className={cn('w-full py-8 mb-8', className)}>
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center">
            {stepsWithStatus.map((step, stepIndex) => (
              <li
                key={step.id}
                className={cn(
                  'relative',
                  stepIndex !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''
                )}
              >
                {/* Connector line */}
                {stepIndex !== steps.length - 1 && (
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div
                      className={cn(
                        'h-0.5 w-full',
                        step.status === 'completed'
                          ? 'bg-primary'
                          : 'bg-muted-foreground/25'
                      )}
                    />
                  </div>
                )}

                {/* Step content */}
                <button
                  type="button"
                  className="relative flex flex-col items-center group disabled:cursor-default"
                  onClick={() => onStepClick?.(stepIndex)}
                  disabled={!onStepClick}
                >
                  {step.status === 'completed' ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
                      <Check className="h-5 w-5" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                      step.status === 'current'
                        ? "border-2 border-primary bg-background text-primary"
                        : "border-2 border-muted-foreground/25 bg-background text-muted-foreground group-hover:border-muted-foreground/50 group-hover:text-muted-foreground"
                    )}>
                      {stepIndex + 1}
                    </div>
                  )}
                  
                  {/* Step labels */}
                  <div className="absolute top-10 min-w-0 text-center">
                    <p
                      className={cn(
                        'text-sm font-medium whitespace-nowrap',
                        step.status === 'current'
                          ? 'text-primary'
                          : step.status === 'completed'
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                        {step.description}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    );
  }
);
Stepper.displayName = 'Stepper';

export { Steps, Stepper, type Step, type StepsProps, type StepperProps };