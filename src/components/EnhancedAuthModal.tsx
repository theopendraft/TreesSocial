import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { authAPI } from "@/services/api";
import { usersAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import {
  Phone,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Shield,
} from "lucide-react";

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export const EnhancedAuthModal = ({
  isOpen,
  onClose,
  onLogin,
}: EnhancedAuthModalProps) => {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [registerData, setRegisterData] = useState({
    fullName: "",
    username: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // OTP verification states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendOtpDisabled, setResendOtpDisabled] = useState(false);

  const { login, register } = useAuth();

  // Password strength validator
  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  // Check if username exists
  const checkUsernameExists = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameError("");
      return;
    }
    try {
      const response = await authAPI.checkUsername(username);
      if (response.success && !response.data?.available) {
        setUsernameError("Username already exists");
      } else {
        setUsernameError("");
      }
    } catch (error) {
      // Silently fail validation
    }
  };

  // Check if phone exists
  const checkPhoneExists = async (phone: string) => {
    if (!phone || phone.length < 10) {
      setPhoneError("");
      return;
    }
    try {
      const response = await authAPI.checkPhone(phone);
      if (response.success && !response.data?.available) {
        setPhoneError("Phone number already exists");
      } else {
        setPhoneError("");
      }
    } catch (error) {
      // Silently fail validation
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      // Set demo token in localStorage
      localStorage.setItem("token", "demo-token");

      toast({
        title: "Success",
        description: "Demo login successful! Refreshing page...",
      });

      onLogin();
      onClose();

      // Refresh the page to trigger auth check
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Demo login failed.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start OTP countdown timer
  const startOtpTimer = () => {
    setOtpTimer(60);
    setResendOtpDisabled(true);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendOtpDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!registerData.email && !registerData.mobileNumber) {
      toast({
        title: "Error",
        description:
          "Please provide either email or mobile number to receive OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Determine identifier and type
      const identifier = registerData.email || registerData.mobileNumber;
      const type = registerData.email ? "email" : "sms";

      // Call backend API to send OTP
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://api.inventurcubes.com/api"}/auth/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier,
            type,
            purpose: "registration",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setOtpSent(true);
      startOtpTimer();
      toast({
        title: "OTP Sent! ✅",
        description: `Verification code has been sent to ${
          type === "email" ? "your email" : "your mobile number"
        }. Check your ${type === "email" ? "inbox" : "messages"}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendOtpDisabled) return;
    await handleSendOtp();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.identifier || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(loginData.identifier, loginData.password);
      if (success) {
        toast({
          title: "Success!",
          description: "Welcome back to Treesh!",
        });
        onLogin();
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
  const usernameFormat = /^[a-zA-Z0-9_]{3,20}$/;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!registerData.fullName) {
      toast({
        title: "Full Name Required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }
    if (!registerData.username) {
      toast({
        title: "Username Required",
        description: "Please choose a username.",
        variant: "destructive",
      });
      return;
    }
    if (!usernameFormat.test(registerData.username)) {
      toast({
        title: "Invalid Username",
        description:
          "Username must be 3-20 characters, only letters, numbers, and underscores.",
        variant: "destructive",
      });
      return;
    }
    if (!registerData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email.",
        variant: "destructive",
      });
      return;
    }
    if (!registerData.password) {
      toast({
        title: "Password Required",
        description: "Please create a password.",
        variant: "destructive",
      });
      return;
    }
    if (!passwordFormat.test(registerData.password)) {
      toast({
        title: "Weak Password",
        description:
          "Password must have at least 1 uppercase, 1 lowercase, 1 number, 1 special character.",
        variant: "destructive",
      });
      return;
    }
    if (!registerData.confirmPassword) {
      toast({
        title: "Confirm Password",
        description: "Please confirm your password.",
        variant: "destructive",
      });
      return;
    }
    // Validate password match
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    // Validate password length
    if (registerData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    // Validate OTP
    if (!otpSent || !otpCode) {
      toast({
        title: "Error",
        description: "Please verify your email with OTP first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Verify OTP first
      const identifier = registerData.email || registerData.mobileNumber;
      const otpVerifyResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://api.inventurcubes.com/api"}/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier,
            purpose: "registration",
            code: otpCode,
          }),
        }
      );

      const otpData = await otpVerifyResponse.json();

      if (!otpVerifyResponse.ok) {
        toast({
          title: "Invalid OTP",
          description: otpData.error || "Please check your OTP code and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Step 2: Check availability: username
      const usernameCheck = await authAPI.checkUsername(registerData.username);
      // Custom username check: allow same name if surname is different
      const [name, ...surnameArr] = registerData.fullName.trim().split(" ");
      const surname = surnameArr.join(" ");
      if (!usernameCheck.success || usernameCheck.data?.available === false) {
        // Fetch users with the same username
        const searchRes = await usersAPI.searchUsers(registerData.username);
        if (searchRes.success && Array.isArray(searchRes.data)) {
          const conflict = searchRes.data.find((u: any) => {
            if (!u.fullName) return false;
            const [existingName, ...existingSurnameArr] = u.fullName.trim().split(" ");
            const existingSurname = existingSurnameArr.join(" ");
            // Block only if both name and surname match
            return (
              existingName.toLowerCase() === name.toLowerCase() &&
              existingSurname.toLowerCase() === surname.toLowerCase()
            );
          });
          if (conflict) {
            toast({
              title: "Username taken",
              description: "A user with this name and surname already exists. Please choose a different username or surname.",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
        } else {
          toast({
            title: "Username taken",
            description: "Please choose a different username.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }
      // Check email
      const emailCheck = await authAPI.checkEmail(registerData.email);
      if (!emailCheck.success || emailCheck.data?.available === false) {
        toast({
          title: "Email already registered",
          description: "Try logging in or use another email.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      // Check phone if provided
      if (registerData.mobileNumber) {
        const phoneCheck = await authAPI.checkPhone(registerData.mobileNumber);
        if (!phoneCheck.success || phoneCheck.data?.available === false) {
          toast({
            title: "Phone already in use",
            description: "Use another number or log in.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      const success = await register(
        registerData.fullName,
        registerData.username,
        registerData.email,
        registerData.password,
        registerData.confirmPassword
      );
      if (success) {
        toast({
          title: "Success!",
          description: "Welcome to Treesh! Your account has been created.",
        });
        onLogin();
      } else {
        toast({
          title: "Registration Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setOtpSent(false);
    setOtpCode("");
    setOtpTimer(0);
    setResendOtpDisabled(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg lg:max-w-xl xl:max-w-2xl bg-offwhite max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl lg:text-3xl font-bold text-gray-900 font-treesh">
            Welcome to Treesh
          </DialogTitle>
          <DialogDescription className="sr-only">
            Login or create an account to continue.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-offwhite data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-offwhite data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="login-identifier"
                  className="text-sm font-medium text-gray-700"
                >
                  Email or Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-identifier"
                    type="text"
                    placeholder="Enter your email or username"
                    value={loginData.identifier}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        identifier: e.target.value,
                      }))
                    }
                    className="pl-10 bg-white border-gray-200 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="login-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="pl-10 bg-white border-gray-200 focus:border-primary focus:ring-primary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 text-base"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="register-fullname"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-fullname"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerData.fullName}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="pl-10 bg-white border-gray-200 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="register-username"
                  className="text-sm font-medium text-gray-700"
                >
                  Username <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Choose a username"
                    value={registerData.username}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRegisterData((prev) => ({
                        ...prev,
                        username: value,
                      }));
                      // Check username availability after user stops typing
                      checkUsernameExists(value);
                    }}
                    className={`pl-10 bg-white border-gray-200 focus:border-primary focus:ring-primary ${
                      usernameError ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {usernameError && (
                  <p className="text-xs text-red-500 mt-1">{usernameError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="register-email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="pl-10 bg-white border-gray-200 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="register-mobile"
                  className="text-sm font-medium text-gray-700"
                >
                  Mobile Number{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-mobile"
                    type="tel"
                    placeholder="Enter mobile number"
                    value={registerData.mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRegisterData((prev) => ({
                        ...prev,
                        mobileNumber: value,
                      }));
                      // Check phone availability
                      checkPhoneExists(value);
                    }}
                    className={`pl-10 bg-white border-gray-200 focus:border-primary focus:ring-primary ${
                      phoneError ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="register-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRegisterData((prev) => ({
                        ...prev,
                        password: value,
                      }));
                      checkPasswordStrength(value);
                    }}
                    className="pl-10 bg-white border-gray-200 focus:border-primary focus:ring-primary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {registerData.password && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md space-y-2">
                    <p className="text-xs font-medium text-gray-700">Password must contain:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${passwordStrength.hasMinLength ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={`text-xs ${passwordStrength.hasMinLength ? 'text-green-700' : 'text-gray-500'}`}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${passwordStrength.hasUpperCase ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={`text-xs ${passwordStrength.hasUpperCase ? 'text-green-700' : 'text-gray-500'}`}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${passwordStrength.hasLowerCase ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={`text-xs ${passwordStrength.hasLowerCase ? 'text-green-700' : 'text-gray-500'}`}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${passwordStrength.hasNumber ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={`text-xs ${passwordStrength.hasNumber ? 'text-green-700' : 'text-gray-500'}`}>
                          One number
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${passwordStrength.hasSpecialChar ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={`text-xs ${passwordStrength.hasSpecialChar ? 'text-green-700' : 'text-gray-500'}`}>
                          One special character (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="register-confirm-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="pl-10 bg-white border-gray-200 focus:border-primary focus:ring-primary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-gray-100"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* OTP Verification Section */}
              {!otpSent ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOtp}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 border-primary"
                  disabled={!registerData.email && !registerData.mobileNumber}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send OTP for Verification
                </Button>
              ) : (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-blue-900">
                      OTP Verification <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      {otpTimer > 0 && (
                        <span className="text-xs text-blue-600">
                          Resend in {otpTimer}s
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResendOtp}
                        disabled={resendOtpDisabled}
                        className="text-xs h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                      >
                        Resend OTP
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      maxLength={6}
                      className="h-10 text-center text-lg font-mono tracking-widest bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    {otpCode.length === 6 && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>

                  <p className="text-xs text-blue-600">
                    OTP sent to:{" "}
                    {registerData.email || registerData.mobileNumber}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 text-base"
                disabled={isLoading || !otpSent || otpCode.length !== 6}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-xs sm:text-sm text-muted-foreground pt-4 border-t border-gray-200">
          <p>
            By continuing, you agree to our{" "}
            <span className="text-primary hover:underline cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-primary hover:underline cursor-pointer">
              Privacy Policy
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
