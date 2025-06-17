import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageCircle, Users, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail, isValidUsername } from '../utils/helpers';

// Login and Registration component
const AuthForm = () => {
  const { login, register, error, isLoading, clearError } = useAuth();
  
  // Form states
  const [loginForm, setLoginForm] = useState({
    identifier: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState('login');

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    setFormErrors({});

    // Validate form
    const errors = {};
    if (!loginForm.identifier.trim()) {
      errors.identifier = 'Username or email is required';
    }
    if (!loginForm.password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Attempt login
    const result = await login(loginForm.identifier, loginForm.password);
    if (!result.success) {
      setFormErrors({ general: result.message });
    }
  };

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    clearError();
    setFormErrors({});

    // Validate form
    const errors = {};
    
    if (!registerForm.username.trim()) {
      errors.username = 'Username is required';
    } else if (!isValidUsername(registerForm.username)) {
      errors.username = 'Username must be 3-20 characters, letters, numbers, and underscores only';
    }
    
    if (!registerForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(registerForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!registerForm.password) {
      errors.password = 'Password is required';
    } else if (registerForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Attempt registration
    const result = await register(registerForm.username, registerForm.email, registerForm.password);
    if (!result.success) {
      setFormErrors({ general: result.message });
    }
  };

  // Handle input changes for login form
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle input changes for register form
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat App</h1>
          <p className="text-gray-600">Connect and chat with people in real-time</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm mb-2">
              <MessageCircle className="h-6 w-6 text-blue-600 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">Real-time Chat</p>
          </div>
          <div className="text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm mb-2">
              <Users className="h-6 w-6 text-green-600 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">Online Users</p>
          </div>
          <div className="text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm mb-2">
              <Zap className="h-6 w-6 text-yellow-600 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">Instant Sync</p>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      name="identifier"
                      placeholder="Username or Email"
                      value={loginForm.identifier}
                      onChange={handleLoginChange}
                      className={formErrors.identifier ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {formErrors.identifier && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.identifier}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      className={formErrors.password ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {formErrors.password && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
                    )}
                  </div>
                  
                  {(error || formErrors.general) && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {error || formErrors.general}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={registerForm.username}
                      onChange={handleRegisterChange}
                      className={formErrors.username ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {formErrors.username && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.username}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      className={formErrors.email ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      className={formErrors.password ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {formErrors.password && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      className={formErrors.confirmPassword ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {formErrors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                  
                  {(error || formErrors.general) && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {error || formErrors.general}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Built with React, Socket.io, and MongoDB</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

