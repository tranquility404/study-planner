import { useState } from 'react';
import { BookOpen, Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { login, signup } from '../api/apiRequests';
import { useNavigate } from 'react-router-dom';

// Main component for the authentication page
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    };
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      setErrors(newErrors);
      return;
    }
    
    // Handle successful form submission (would normally connect to backend)
    console.log('Form submitted:', formData);
    try {
        let res = isLogin? await login(formData.email, formData.password): await signup(formData.name, formData.email, formData.password);
        localStorage.setItem('token', res.data["token"]);
        navigate('/');
    } catch (error) {
        console.error('Error during form submission:', error);
        alert('An error occurred. Please try again.');
        return;
    }
  };

  // Toggle between login and signup
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Clear form data and errors when switching modes
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setErrors({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="bg-indigo-600 text-white p-6 md:p-12 md:w-2/5 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-8">
            <BookOpen className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">StudyPlanner</h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Organize your study sessions efficiently</h2>
          <p className="text-indigo-200 mb-8">
            Track your progress, set goals, and achieve academic success with our comprehensive study planning tool.
          </p>
        </div>
        
        <div className="hidden md:block">
          <div className="bg-indigo-700 p-4 rounded-lg mb-4">
            <p className="italic text-indigo-200">"StudyPlanner helped me improve my grades by 20% in just one semester!"</p>
            <p className="font-medium mt-2">— Alex Johnson, Computer Science Student</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth forms */}
      <div className="p-6 md:p-12 flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Start organizing your study sessions today'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field - only for signup */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
            )}
            
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 w-full rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            
            {/* Confirm Password field - only for signup */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            )}
            
            {/* Forgot password link - only for login */}
            {isLogin && (
              <div className="flex justify-end">
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div>
            )}
            
            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>
          
          {/* Toggle between login and signup */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleAuthMode}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {isLogin ? 'Create a new account' : 'Back to login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}