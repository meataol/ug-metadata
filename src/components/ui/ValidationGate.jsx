import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const ValidationGate = ({ 
  isVisible = false,
  errors = [],
  warnings = [],
  onRetry,
  onContinue,
  onCancel,
  title = "Validation Required",
  description = "Please review the following issues before continuing:",
  allowContinueWithWarnings = false,
  isModal = true
}) => {
  if (!isVisible) return null;

  const hasErrors = errors?.length > 0;
  const hasWarnings = warnings?.length > 0;
  const canContinue = !hasErrors && (allowContinueWithWarnings || !hasWarnings);

  const ValidationItem = ({ item, type }) => (
    <div className={`flex items-start space-x-3 p-4 rounded-lg border ${
      type === 'error' ?'bg-error/10 border-error/20' :'bg-warning/10 border-warning/20'
    }`}>
      <div className={`mt-0.5 ${type === 'error' ? 'text-error' : 'text-warning'}`}>
        <Icon 
          name={type === 'error' ? 'AlertCircle' : 'AlertTriangle'} 
          size={20} 
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${
          type === 'error' ? 'text-error' : 'text-warning'
        }`}>
          {item?.title || (type === 'error' ? 'Error' : 'Warning')}
        </div>
        <div className="text-sm text-foreground mt-1 font-medium">
          {item?.message}
        </div>
        {item?.field && (
          <div className="text-xs text-muted-foreground mt-2 font-mono bg-muted px-2 py-1 rounded">
            Field: {item?.field}
          </div>
        )}
      </div>
      {item?.action && (
        <Button
          variant="outline"
          size="sm"
          onClick={item?.action?.onClick}
          iconName={item?.action?.icon}
          iconSize={14}
        >
          {item?.action?.label}
        </Button>
      )}
    </div>
  );

  const content = (
    <div className="bg-card border border-border rounded-lg shadow-elevated max-w-2xl w-full">
      {/* Header - Enhanced visibility */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-warning/5 to-error/5">
        <div className="flex items-start space-x-3">
          <div className={`mt-1 p-2 rounded-lg ${
            hasErrors 
              ? 'bg-error/10 text-error' :'bg-warning/10 text-warning'
          }`}>
            <Icon 
              name={hasErrors ? 'AlertCircle' : 'AlertTriangle'} 
              size={28} 
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-heading font-bold text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {description}
            </p>
          </div>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              iconName="X"
              iconSize={20}
              className="text-muted-foreground hover:text-foreground"
            />
          )}
        </div>
      </div>

      {/* Content - Improved contrast */}
      <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
        {/* Errors */}
        {hasErrors && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-error/5 rounded-lg border border-error/10">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <h3 className="text-base font-semibold text-error">
                Errors ({errors?.length})
              </h3>
            </div>
            <div className="space-y-3">
              {errors?.map((error, index) => (
                <ValidationItem 
                  key={`error-${index}`} 
                  item={error} 
                  type="error" 
                />
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {hasWarnings && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-warning/5 rounded-lg border border-warning/10">
              <Icon name="AlertTriangle" size={20} className="text-warning" />
              <h3 className="text-base font-semibold text-warning">
                Warnings ({warnings?.length})
              </h3>
            </div>
            <div className="space-y-3">
              {warnings?.map((warning, index) => (
                <ValidationItem 
                  key={`warning-${index}`} 
                  item={warning} 
                  type="warning" 
                />
              ))}
            </div>
          </div>
        )}

        {/* Help Text - Enhanced visibility */}
        {allowContinueWithWarnings && hasWarnings && !hasErrors && (
          <div className="alert info">
            <Icon name="Info" size={20} />
            <div className="text-sm">
              <strong>Note:</strong> You can continue with warnings, but it's recommended to resolve them for optimal results.
            </div>
          </div>
        )}

        {/* Helpful guidance */}
        <div className="alert info">
          <Icon name="Lightbulb" size={20} />
          <div className="text-sm">
            <div className="font-medium mb-1">Quick Fix:</div>
            <div>Each file must have a title. You can use the filename as the title or enter custom titles.</div>
          </div>
        </div>
      </div>

      {/* Actions - Enhanced button styling */}
      <div className="p-6 border-t border-border bg-muted/20">
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              iconName="X"
              iconPosition="left"
              iconSize={16}
              className="sm:order-1"
            >
              Cancel
            </Button>
          )}
          
          {onRetry && hasErrors && (
            <Button
              variant="secondary"
              onClick={onRetry}
              iconName="RotateCcw"
              iconPosition="left"
              iconSize={16}
              className="sm:order-2"
            >
              Retry Validation
            </Button>
          )}
          
          {onContinue && canContinue && (
            <Button
              variant={hasWarnings ? "warning" : "default"}
              onClick={onContinue}
              iconName="ArrowRight"
              iconPosition="right"
              iconSize={16}
              className="sm:order-3"
            >
              {hasWarnings ? "Continue with Warnings" : "Continue"}
            </Button>
          )}
          
          {hasErrors && (
            <Button
              variant="outline"
              disabled
              iconName="Lock"
              iconPosition="left"
              iconSize={16}
              className="sm:order-3 opacity-50 cursor-not-allowed"
            >
              Resolve Errors First
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="animate-slide-up">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {content}
    </div>
  );
};

export default ValidationGate;