import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const ProcessStepIndicator = ({ currentStep = 1, completedSteps = [], onStepChange }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      path: '/file-selection',
      label: 'File Selection',
      description: 'Import and organize files',
      icon: 'FolderOpen'
    },
    {
      id: 2,
      path: '/metadata-entry',
      label: 'Metadata Entry',
      description: 'Configure file metadata',
      icon: 'Edit3'
    },
    {
      id: 3,
      path: '/cover-art-management',
      label: 'Cover Art',
      description: 'Manage visual assets',
      icon: 'Image'
    },
    {
      id: 4,
      path: '/file-processing',
      label: 'Processing',
      description: 'Execute batch operations',
      icon: 'Play'
    },
    {
      id: 5,
      path: '/processing-summary',
      label: 'Summary',
      description: 'Review results',
      icon: 'CheckCircle'
    }
  ];

  const getCurrentStepFromPath = () => {
    const currentPath = location?.pathname;
    const step = steps?.find(s => s?.path === currentPath);
    return step ? step?.id : currentStep;
  };

  const activeStep = currentStep || getCurrentStepFromPath();

  const getStepStatus = (stepId) => {
    if (completedSteps?.includes(stepId)) return 'completed';
    if (stepId === activeStep) return 'active';
    return 'accessible'; // All steps accessible for navigation
  };

  const handleStepClick = (step) => {
    console.log('🔄 Step Navigation:', {
      clicked: step?.label,
      path: step?.path,
      currentPath: location?.pathname
    });
    
    try {
      // Direct navigation - always allow
      navigate(step?.path);
      console.log('✅ Navigation successful to:', step?.path);
      
      // Call parent callback if provided
      if (onStepChange) {
        onStepChange(step?.id);
      }
    } catch (error) {
      console.error('❌ Navigation failed:', error);
    }
  };

  const getStepClasses = (status) => {
    return `nav-step ${status}`;
  };

  const getConnectorClasses = (stepId) => {
    const isCompleted = completedSteps?.includes(stepId) || stepId < activeStep;
    return `flex-1 h-0.5 mx-4 transition-all duration-300 ${
      isCompleted ? 'bg-success' : 'bg-border'
    }`;
  };

  const getLabelClasses = (status) => {
    switch (status) {
      case 'active':
        return 'text-primary font-semibold';
      case 'completed':
        return 'text-success font-medium';
      case 'accessible':
        return 'text-foreground hover:text-primary cursor-pointer transition-colors duration-200';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border-b border-border shadow-sm">
      <div className="px-6 py-6">
        {/* Desktop Horizontal Layout */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            {steps?.map((step, index) => {
              const status = getStepStatus(step?.id);
              
              return (
                <React.Fragment key={step?.id}>
                  <div className="flex flex-col items-center space-y-3">
                    <button
                      className={getStepClasses(status)}
                      onClick={() => handleStepClick(step)}
                      title={`${step?.description} - Click to navigate`}
                      type="button"
                    >
                      {status === 'completed' ? (
                        <Icon name="Check" size={20} />
                      ) : (
                        <Icon name={step?.icon} size={20} />
                      )}
                    </button>
                    <div className="text-center max-w-24">
                      <div className={`text-sm font-medium transition-colors duration-200 ${getLabelClasses(status)}`}>
                        {step?.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 hidden lg:block text-center">
                        {step?.description}
                      </div>
                    </div>
                  </div>
                  {index < steps?.length - 1 && (
                    <div className={getConnectorClasses(step?.id)} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Mobile Compact Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={getStepClasses(getStepStatus(activeStep))}>
                {getStepStatus(activeStep) === 'completed' ? (
                  <Icon name="Check" size={20} />
                ) : (
                  <Icon name={steps?.[activeStep - 1]?.icon} size={20} />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Step {activeStep} of {steps?.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {steps?.[activeStep - 1]?.label}
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {completedSteps?.length}/{steps?.length} completed
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(activeStep / steps?.length) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Mobile Step Navigation */}
          <div className="flex justify-between gap-2">
            {steps?.map((step) => {
              const status = getStepStatus(step?.id);
              return (
                <button
                  key={step?.id}
                  onClick={() => handleStepClick(step)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                    status === 'active' ? 'bg-primary text-primary-foreground' :
                    status === 'completed' ? 'bg-success text-success-foreground' :
                    'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                  title={`Go to ${step?.label}`}
                  type="button"
                >
                  {step?.id}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessStepIndicator;