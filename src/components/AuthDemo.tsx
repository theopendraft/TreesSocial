import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export const AuthDemo = () => {
  const [showLoginDemo, setShowLoginDemo] = useState(false);
  const [showSignupDemo, setShowSignupDemo] = useState(false);

  const demoFeatures = [
    {
      title: 'Username Functionality',
      description: 'Users can now sign in with either email or username',
      features: [
        'Toggle between email and username login',
        'Unique username validation',
        'Username availability checking',
        'Username format restrictions (letters, numbers, _, -)'
      ]
    },
    {
      title: 'Enhanced Password Security',
      description: 'Strong password requirements for better security',
      features: [
        'Minimum 8 characters',
        'Must contain numbers',
        'Must contain special characters',
        'Must contain uppercase letters',
        'Must contain lowercase letters',
        'Real-time password strength validation'
      ]
    },
    {
      title: 'Improved User Experience',
      description: 'Better feedback and validation throughout the process',
      features: [
        'Visual password strength indicators',
        'Real-time username availability checking',
        'Clear error messages',
        'Password visibility toggle',
        'Form validation with helpful feedback'
      ]
    }
  ];

  const renderPasswordStrengthDemo = () => {
    const requirements = [
      { key: 'length', label: 'At least 8 characters', met: true },
      { key: 'number', label: 'Contains a number', met: true },
      { key: 'special', label: 'Contains special character', met: true },
      { key: 'uppercase', label: 'Contains uppercase letter', met: true },
      { key: 'lowercase', label: 'Contains lowercase letter', met: true }
    ];

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Password Requirements:</Label>
        <div className="space-y-1">
          {requirements.map((req) => (
            <div key={req.key} className="flex items-center space-x-2 text-xs">
              <req.met ? CheckCircle : XCircle className={`w-3 h-3 ${
                req.met ? 'text-green-500' : 'text-red-500'
              }`} />
              <span className={req.met ? 'text-green-600' : 'text-red-600'}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Enhanced Authentication System
        </h1>
        <p className="text-muted-foreground text-lg">
          New username functionality and improved password security
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {demoFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{feature.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.features.map((feat, featIndex) => (
                  <li key={featIndex} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demo Buttons */}
      <div className="flex justify-center space-x-4">
        <Button 
          onClick={() => setShowLoginDemo(true)}
          className="bg-primary hover:bg-primary-dark"
        >
          Try Enhanced Login
        </Button>
        <Button 
          onClick={() => setShowSignupDemo(true)}
          variant="outline"
        >
          Try Enhanced Signup
        </Button>
      </div>

      {/* Login Demo */}
      {showLoginDemo && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Enhanced Login Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Welcome Back</h3>
            </div>

            {/* Login Method Toggle */}
            <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
              >
                Email
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
              >
                Username
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 border rounded-md"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full p-2 border rounded-md pr-10"
                  disabled
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  disabled
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded"
                disabled
              />
              <label htmlFor="remember" className="text-sm">Remember me</label>
            </div>

            <Button className="w-full" disabled>
              Sign In
            </Button>

            <div className="text-center space-y-2">
              <Button variant="ghost" className="text-sm" disabled>
                Forgot Password?
              </Button>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button variant="link" className="p-0" onClick={() => {
                  setShowLoginDemo(false);
                  setShowSignupDemo(true);
                }}>
                  Sign up
                </Button>
              </p>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowLoginDemo(false)}
            >
              Close Demo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Signup Demo */}
      {showSignupDemo && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Enhanced Signup Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Create Account</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                placeholder="Enter your full name"
                className="w-full p-2 border rounded-md"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <div className="relative">
                <input
                  placeholder="Choose a unique username"
                  className="w-full p-2 border rounded-md pr-20 border-green-500"
                  disabled
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Username can contain letters, numbers, underscores (_), and hyphens (-)
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 border rounded-md"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Create a strong password"
                  className="w-full p-2 border rounded-md pr-10"
                  disabled
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  disabled
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              {renderPasswordStrengthDemo()}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full p-2 border rounded-md"
                disabled
              />
            </div>

            <Button className="w-full" disabled>
              Create Account
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button variant="link" className="p-0" onClick={() => {
                setShowSignupDemo(false);
                setShowLoginDemo(true);
              }}>
                Sign in
              </Button>
            </p>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowSignupDemo(false)}
            >
              Close Demo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Frontend Enhancements</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Username/Email toggle for login</li>
                <li>• Real-time username availability checking</li>
                <li>• Password strength validation with visual indicators</li>
                <li>• Enhanced form validation and error handling</li>
                <li>• Password visibility toggles</li>
                <li>• Improved user feedback and notifications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Backend Enhancements</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Username availability API endpoint</li>
                <li>• Enhanced password validation (8+ chars, numbers, special chars)</li>
                <li>• Login with email OR username</li>
                <li>• Improved user model with fullName field</li>
                <li>• Better error handling and validation</li>
                <li>• Username format restrictions and validation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
