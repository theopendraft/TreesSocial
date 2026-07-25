import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: () => void;
}

export const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "username">("email");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    special: false,
    uppercase: false,
    lowercase: false,
  });

  // Mock usernames for demonstration (in real app, this would be an API call)
  const existingUsernames = [
    "john_doe",
    "jane_smith",
    "admin",
    "user123",
    "test_user",
  ];

  // Check if username is available
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);

    // Simulate API call to check username availability
    setTimeout(() => {
      const isAvailable = !existingUsernames.includes(username.toLowerCase());
      setUsernameAvailable(isAvailable);
      setCheckingUsername(false);
    }, 500);
  };

  // Validate password strength
  const validatePassword = (password: string) => {
    const validations = {
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
    };

    setPasswordValidation(validations);
    return Object.values(validations).every(Boolean);
  };

  // Handle username change
  const handleUsernameChange = (value: string) => {
    // Only allow alphanumeric characters, underscores, and hyphens
    const cleanUsername = value.replace(/[^a-zA-Z0-9_-]/g, "");
    setUsername(cleanUsername);

    if (cleanUsername.length >= 3) {
      checkUsernameAvailability(cleanUsername);
    } else {
      setUsernameAvailable(null);
    }
  };

  const validateLogin = () => {
    const newErrors: { [key: string]: string } = {};
    if (loginMethod === "email" && !email)
      newErrors.email = "Email is required";
    if (loginMethod === "username" && !username)
      newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName) newErrors.fullName = "Full name is required";
    if (!email) newErrors.email = "Email is required";
    if (!username) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    // Check password strength
    if (!validatePassword(password)) {
      newErrors.password = "Password does not meet requirements";
    }

    // Check username availability
    if (usernameAvailable === false) {
      newErrors.username = "Username is already taken";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Login successful!");
      onLogin?.();
      onClose();
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Account created successfully!");
      onLogin?.();
      onClose();
    } catch (error) {
      toast.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Set demo token in localStorage
      localStorage.setItem("token", "demo-token");

      // Set demo user data (this will be verified by the backend)
      const demoUser = {
        id: "demo_user_id",
        username: "demo_user",
        email: "demo@example.com",
        fullName: "Demo User",
        bio: "This is a demo account",
        avatar: "",
        isVerified: false,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
      };

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Demo login successful!");
      onLogin?.();
      onClose();

      // Refresh the page to trigger auth check
      window.location.reload();
    } catch (error) {
      toast.error("Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const renderPasswordStrength = () => {
    const requirements = [
      {
        key: "length",
        label: "At least 8 characters",
        icon: passwordValidation.length ? CheckCircle : XCircle,
      },
      {
        key: "number",
        label: "Contains a number",
        icon: passwordValidation.number ? CheckCircle : XCircle,
      },
      {
        key: "special",
        label: "Contains special character",
        icon: passwordValidation.special ? CheckCircle : XCircle,
      },
      {
        key: "uppercase",
        label: "Contains uppercase letter",
        icon: passwordValidation.uppercase ? CheckCircle : XCircle,
      },
      {
        key: "lowercase",
        label: "Contains lowercase letter",
        icon: passwordValidation.lowercase ? CheckCircle : XCircle,
      },
    ];

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Password Requirements:</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {requirements.map((req) => (
            <div key={req.key} className="flex items-center space-x-2 text-xs">
              <req.icon
                className={`w-3 h-3 flex-shrink-0 ${
                  passwordValidation[req.key as keyof typeof passwordValidation]
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              />
              <span
                className={
                  passwordValidation[req.key as keyof typeof passwordValidation]
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-center text-2xl md:text-3xl font-bold text-primary font-treesh">
            Welcome to Treesh
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="login" className="text-base font-medium">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-base font-medium">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-6 mt-6">
            <div className="text-center mb-6">
              <h3 className="text-xl md:text-2xl font-semibold">
                Welcome Back
              </h3>
            </div>

            {/* Login Method Toggle */}
            <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
              <Button
                variant={loginMethod === "email" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLoginMethod("email")}
                className="flex-1 text-sm md:text-base"
              >
                Email
              </Button>
              <Button
                variant={loginMethod === "username" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLoginMethod("username")}
                className="flex-1 text-sm md:text-base"
              >
                Username
              </Button>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <Label
                htmlFor="login-identifier"
                className="font-inter text-base"
              >
                {loginMethod === "email" ? "Email" : "Username"}
              </Label>
              <Input
                id="login-identifier"
                type={loginMethod === "email" ? "email" : "text"}
                placeholder={
                  loginMethod === "email"
                    ? "Enter your email"
                    : "Enter your username"
                }
                value={loginMethod === "email" ? email : username}
                onChange={(e) =>
                  loginMethod === "email"
                    ? setEmail(e.target.value)
                    : setUsername(e.target.value)
                }
                className={`font-inter h-12 text-base ${
                  errors.email || errors.username ? "border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <Label htmlFor="password" className="font-inter text-base">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`font-inter h-12 text-base pr-12 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <Button
                onClick={handleLogin}
                className="w-full bg-primary hover:bg-primary-dark text-white font-inter h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              <Button
                onClick={handleDemoLogin}
                variant="outline"
                className="w-full h-12 text-base"
                disabled={loading}
              >
                Demo Login
              </Button>

              <p className="text-center text-sm md:text-base text-gray-600">
                Don't have an account?{" "}
                <button className="text-blue-600 hover:underline">
                  Sign up
                </button>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-6 mt-6">
            <div className="text-center mb-6">
              <h3 className="text-xl md:text-2xl font-semibold">
                Create Account
              </h3>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="font-inter text-base">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`font-inter h-12 text-base ${
                      errors.fullName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="username" className="font-inter text-base">
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      placeholder="Choose a unique username"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className={`font-inter h-12 text-base pr-20 ${
                        errors.username
                          ? "border-red-500"
                          : usernameAvailable === false
                          ? "border-red-500"
                          : usernameAvailable === true
                          ? "border-green-500"
                          : ""
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                      {checkingUsername && (
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                      )}
                      {usernameAvailable === true && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {usernameAvailable === false && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Username can contain letters, numbers, underscores (_), and
                    hyphens (-)
                  </div>
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username}</p>
                  )}
                  {usernameAvailable === false && (
                    <div className="text-xs text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Username is already taken</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="signupEmail" className="font-inter text-base">
                    Email
                  </Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`font-inter h-12 text-base ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="font-inter text-base">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="font-inter h-12 text-base"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="signupPassword"
                  className="font-inter text-base"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signupPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                    className={`font-inter h-12 text-base pr-12 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                {renderPasswordStrength()}
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="confirmPassword"
                  className="font-inter text-base"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`font-inter h-12 text-base pr-12 ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : confirmPassword && password !== confirmPassword
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
                {confirmPassword && password !== confirmPassword && (
                  <div className="text-xs text-red-500">
                    Passwords do not match
                  </div>
                )}
              </div>

              <Button
                onClick={handleSignup}
                className="w-full bg-primary hover:bg-primary-dark text-white font-inter h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm md:text-base text-muted-foreground">
                Already have an account?{" "}
                <button className="text-blue-600 hover:underline">
                  Sign in
                </button>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
