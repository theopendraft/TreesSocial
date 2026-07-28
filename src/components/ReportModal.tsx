import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertCircle, Flag, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'user' | 'post' | 'reel' | 'stream' | 'story';
  targetId: string;
  targetName?: string;
}

const reportReasons = {
  user: [
    'Harassment or bullying',
    'Fake account',
    'Inappropriate content',
    'Spam or scam',
    'Hate speech',
    'Impersonation',
    'Other'
  ],
  post: [
    'Inappropriate content',
    'Spam',
    'Harassment',
    'False information',
    'Intellectual property violation',
    'Violence or graphic content',
    'Nudity or sexual content',
    'Other'
  ],
  reel: [
    'Inappropriate content',
    'Spam',
    'Harassment',
    'False information',
    'Intellectual property violation',
    'Violence or graphic content',
    'Nudity or sexual content',
    'Other'
  ],
  stream: [
    'Inappropriate content',
    'Harassment',
    'Spam',
    'Violence or dangerous behavior',
    'Nudity or sexual content',
    'False information',
    'Other'
  ],
  story: [
    'Inappropriate content',
    'Spam',
    'Harassment',
    'False information',
    'Nudity or sexual content',
    'Violence or graphic content',
    'Other'
  ]
};

const severityLevels = [
  { value: 'low', label: 'Low', description: 'Minor violation' },
  { value: 'medium', label: 'Medium', description: 'Moderate violation' },
  { value: 'high', label: 'High', description: 'Serious violation' },
  { value: 'critical', label: 'Critical', description: 'Immediate action needed' }
];

export const ReportModal = ({ isOpen, onClose, type, targetId, targetName }: ReportModalProps) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [severity, setSeverity] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedReason) {
      newErrors.reason = 'Please select a reason for reporting';
    }

    if (!severity) {
      newErrors.severity = 'Please select the severity level';
    }

    if (additionalInfo.length > 1000) {
      newErrors.additionalInfo = 'Additional information cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Submit report
      console.log('Report submitted:', {
        type,
        targetId,
        reason: selectedReason,
        severity,
        additionalInfo,
        timestamp: new Date().toISOString()
      });
      
      setIsSubmitted(true);
      
      toast({
        title: 'Report Submitted Successfully',
        description: 'Thank you for helping keep our community safe',
      });
      
      // Auto close after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setSeverity('');
    setAdditionalInfo('');
    setIsSubmitted(false);
    setIsSubmitting(false);
    setErrors({});
    onClose();
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'user': return <Flag className="w-5 h-5 text-red-500" />;
      case 'post': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'reel': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'stream': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'story': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <Flag className="w-5 h-5 text-red-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'user': return 'User';
      case 'post': return 'Post';
      case 'reel': return 'Reel';
      case 'stream': return 'Stream';
      case 'story': return 'Story';
      default: return 'Content';
    }
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Report Submitted Successfully</h3>
            <p className="text-muted-foreground mb-4">
              Thank you for helping keep our community safe. We'll review your report and take appropriate action.
            </p>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Report Details:</strong><br />
                Type: {getTypeLabel()}<br />
                Reason: {selectedReason}<br />
                Severity: {severity}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              This window will close automatically in a few seconds...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center space-x-2">
            {getTypeIcon()}
            <DialogTitle>
              Report {getTypeLabel()}
              {targetName && ` - ${targetName}`}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Report Type Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <Flag className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Reporting {getTypeLabel().toLowerCase()}</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Your report will be reviewed by our moderation team. Please provide accurate information to help us take appropriate action.
            </p>
          </div>

          {/* Reason Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Why are you reporting this {type === 'user' ? 'user' : type}? *
            </Label>
            <RadioGroup 
              value={selectedReason} 
              onValueChange={(value) => {
                setSelectedReason(value);
                if (errors.reason) setErrors(prev => ({ ...prev, reason: '' }));
              }}
              className="space-y-2"
            >
              {reportReasons[type].map((reason) => (
                <div key={reason} className="flex items-center space-x-3 p-2 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label htmlFor={reason} className="text-sm cursor-pointer flex-1">
                    {reason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {errors.reason && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.reason}</span>
              </div>
            )}
          </div>

          {/* Severity Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              How severe is this violation? *
            </Label>
            <RadioGroup 
              value={severity} 
              onValueChange={(value) => {
                setSeverity(value);
                if (errors.severity) setErrors(prev => ({ ...prev, severity: '' }));
              }}
              className="space-y-2"
            >
              {severityLevels.map((level) => (
                <div key={level.value} className="flex items-center space-x-3 p-2 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={level.value} id={level.value} />
                  <div className="flex-1">
                    <Label htmlFor={level.value} className="text-sm font-medium cursor-pointer">
                      {level.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
            
            {errors.severity && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.severity}</span>
              </div>
            )}
          </div>
          
          {/* Additional Information */}
          <div className="space-y-3">
            <Label htmlFor="additional-info" className="text-sm font-medium">
              Additional Information (Optional)
            </Label>
            <Textarea
              id="additional-info"
              placeholder="Please provide any additional details that might help us understand the issue..."
              value={additionalInfo}
              onChange={(e) => {
                setAdditionalInfo(e.target.value);
                if (errors.additionalInfo) setErrors(prev => ({ ...prev, additionalInfo: '' }));
              }}
              className="min-h-[80px] resize-none"
              maxLength={1000}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {errors.additionalInfo && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.additionalInfo}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {additionalInfo.length}/1000 characters
              </span>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-muted-foreground">
              <strong>Privacy Notice:</strong> Your report will be handled confidentially. 
              We may contact you for additional information if needed. 
              False reports may result in account restrictions.
            </p>
          </div>
        </div>
        
        {/* Fixed footer with buttons */}
        <div className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedReason || !severity || isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <>
                  <Flag className="w-4 h-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};