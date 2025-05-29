import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { Wallet } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [income, setIncome] = useState('');
  const [userType, setUserType] = useState('Student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const userTypeOptions = [
    { value: 'Student', label: 'Student' },
    { value: 'Salaried', label: 'Salaried' },
    { value: 'Freelancer', label: 'Freelancer' },
    { value: 'Family', label: 'Family' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (isNaN(Number(income)) || Number(income) <= 0) {
      return setError('Please enter a valid income amount');
    }
    
    setIsLoading(true);
    
    try {
      await register(
        name, 
        email, 
        password, 
        Number(income), 
        userType as 'Student' | 'Salaried' | 'Freelancer' | 'Family'
      );
      navigate('/onboarding');
    } catch (err) {
      setError('Failed to create an account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-card p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <Wallet size={32} className="text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
          
          {error && (
            <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
            
            <Input
              label="Email"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
              
              <Input
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Monthly Income (₹)"
                type="number"
                id="income"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="Enter your monthly income"
                required
              />
              
              <Select
                label="User Type"
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                options={userTypeOptions}
                required
              />
            </div>
            
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="mt-4"
            >
              Register
            </Button>
          </form>
          
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;