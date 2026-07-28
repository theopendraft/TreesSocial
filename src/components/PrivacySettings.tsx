import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Users, 
  UserCheck, 
  MessageCircle, 
  MapPin, 
  Globe, 
  Lock, 
  Save,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PrivacySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: PrivacySettings) => void;
  currentSettings: PrivacySettings;
}

interface PrivacySettings {
  isPrivate: boolean;
  showOnlineStatus: boolean;
  allowMessages: boolean;
  showLocation: boolean;
  showWebsite: boolean;
  showPhone: boolean;
  allowTagging: boolean;
  allowMentions: boolean;
  showActivityStatus: boolean;
  allowStoryViews: boolean;
}

const defaultSettings: PrivacySettings = {
  isPrivate: false,
  showOnlineStatus: true,
  allowMessages: true,
  showLocation: true,
  showWebsite: true,
  showPhone: false,
  allowTagging: true,
  allowMentions: true,
  showActivityStatus: true,
  allowStoryViews: true,
};

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}) => {
  const [settings, setSettings] = useState<PrivacySettings>(currentSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(settings);
      onClose();
      
      toast({
        title: 'Privacy Settings Updated!',
        description: 'Your privacy preferences have been saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update privacy settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
  };

  const handleClose = () => {
    setSettings(currentSettings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Account Privacy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Account Privacy
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Private Account</Label>
                    <p className="text-sm text-muted-foreground">
                      Only approved followers can see your posts and stories
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.isPrivate}
                  onCheckedChange={(value) => handleSettingChange('isPrivate', value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Show Online Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others see when you're active
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.showOnlineStatus}
                  onCheckedChange={(value) => handleSettingChange('showOnlineStatus', value)}
                />
              </div>
            </div>
          </div>

          {/* Communication */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Communication
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Allow Direct Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others send you private messages
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.allowMessages}
                  onCheckedChange={(value) => handleSettingChange('allowMessages', value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Allow Tagging</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others tag you in posts and comments
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.allowTagging}
                  onCheckedChange={(value) => handleSettingChange('allowTagging', value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Allow Mentions</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others mention you using @username
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.allowMentions}
                  onCheckedChange={(value) => handleSettingChange('allowMentions', value)}
                />
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Profile Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Show Location</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your location on your profile
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.showLocation}
                  onCheckedChange={(value) => handleSettingChange('showLocation', value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Show Website</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your website link on your profile
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.showWebsite}
                  onCheckedChange={(value) => handleSettingChange('showWebsite', value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Show Phone Number</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your phone number on your profile
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.showPhone}
                  onCheckedChange={(value) => handleSettingChange('showPhone', value)}
                />
              </div>
            </div>
          </div>

          {/* Activity & Stories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Activity & Stories
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500/10 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Show Activity Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others see when you're active on the platform
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.showActivityStatus}
                  onCheckedChange={(value) => handleSettingChange('showActivityStatus', value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Allow Story Views</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others see who viewed your stories
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.allowStoryViews}
                  onCheckedChange={(value) => handleSettingChange('allowStoryViews', value)}
                />
              </div>
            </div>
          </div>

          {/* Privacy Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Privacy Summary</h4>
            <div className="flex flex-wrap gap-2">
              {settings.isPrivate && (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  <Lock className="w-3 h-3 mr-1" />
                  Private Account
                </Badge>
              )}
              {!settings.isPrivate && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Globe className="w-3 h-3 mr-1" />
                  Public Account
                </Badge>
              )}
              {!settings.allowMessages && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  DMs Disabled
                </Badge>
              )}
              {!settings.showLocation && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <MapPin className="w-3 h-3 mr-1" />
                  Location Hidden
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset to Defaults
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
