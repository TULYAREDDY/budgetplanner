import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBudget, Expense, EMIPlan, BudgetGoal, ExpensePriority } from '../contexts/BudgetContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Card from '../components/Card';
import Slider from '../components/Slider';
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, Lock, Unlock } from 'lucide-react';

const OnboardingWizard: React.FC = () => {
  const { currentUser, completeOnboarding } = useAuth();
  const { 
    setIncome, 
    setFixedExpenses, 
    setReducibleExpenses, 
    setEmiPlans, 
    setGoal,
    setLifestyleType
  } = useBudget();
  
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [income, setIncomeState] = useState(currentUser?.income || 0);
  
  // Fixed Expenses
  const [fixedExpenses, setFixedExpensesState] = useState<Expense[]>([]);
  const [fixedExpenseName, setFixedExpenseName] = useState('');
  const [fixedExpenseAmount, setFixedExpenseAmount] = useState('');
  
  // Reducible Expenses
  const [reducibleExpenses, setReducibleExpensesState] = useState<Expense[]>([]);
  const [reducibleExpenseName, setReducibleExpenseName] = useState('');
  const [reducibleExpenseAmount, setReducibleExpenseAmount] = useState('');
  const [reducibleExpensePriority, setReducibleExpensePriority] = useState<ExpensePriority>('Medium');
  const [reducibleExpenseLocked, setReducibleExpenseLocked] = useState(false);
  
  // EMI Plans
  const [emiPlans, setEmiPlansState] = useState<EMIPlan[]>([]);
  const [emiType, setEmiType] = useState('');
  const [emiLoanAmount, setEmiLoanAmount] = useState('');
  const [emiInterestRate, setEmiInterestRate] = useState('');
  const [emiDuration, setEmiDuration] = useState('');
  const [emiNecessity, setEmiNecessity] = useState(5);
  
  // Financial Goal
  const [hasGoal, setHasGoal] = useState(false);
  const [goalType, setGoalType] = useState<'Savings' | 'Investment' | 'Purchase'>('Savings');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  
  // Lifestyle
  const [lifestyleType, setLifestyleTypeState] = useState('Moderate');
  
  const priorityOptions = [
    { value: 'High', label: 'High Priority' },
    { value: 'Medium', label: 'Medium Priority' },
    { value: 'Low', label: 'Low Priority' }
  ];
  
  const goalTypeOptions = [
    { value: 'Savings', label: 'Savings' },
    { value: 'Investment', label: 'Investment' },
    { value: 'Purchase', label: 'Major Purchase' }
  ];
  
  const lifestyleOptions = [
    { value: 'Frugal', label: 'Frugal' },
    { value: 'Moderate', label: 'Moderate' },
    { value: 'Comfortable', label: 'Comfortable' },
    { value: 'Luxury', label: 'Luxury' }
  ];
  
  // Fixed Expenses Handlers
  const addFixedExpense = () => {
    if (fixedExpenseName && fixedExpenseAmount && !isNaN(Number(fixedExpenseAmount))) {
      const newExpense: Expense = {
        id: Date.now().toString(),
        name: fixedExpenseName,
        amount: Number(fixedExpenseAmount),
        priority: 'High',
        isFixed: true
      };
      
      setFixedExpensesState([...fixedExpenses, newExpense]);
      setFixedExpenseName('');
      setFixedExpenseAmount('');
    }
  };
  
  const removeFixedExpense = (id: string) => {
    setFixedExpensesState(fixedExpenses.filter(expense => expense.id !== id));
  };
  
  // Reducible Expenses Handlers
  const addReducibleExpense = () => {
    if (reducibleExpenseName && reducibleExpenseAmount && !isNaN(Number(reducibleExpenseAmount))) {
      const newExpense: Expense = {
        id: Date.now().toString(),
        name: reducibleExpenseName,
        amount: Number(reducibleExpenseAmount),
        priority: reducibleExpensePriority,
        isLocked: reducibleExpenseLocked
      };
      
      setReducibleExpensesState([...reducibleExpenses, newExpense]);
      setReducibleExpenseName('');
      setReducibleExpenseAmount('');
      setReducibleExpensePriority('Medium');
      setReducibleExpenseLocked(false);
    }
  };
  
  const removeReducibleExpense = (id: string) => {
    setReducibleExpensesState(reducibleExpenses.filter(expense => expense.id !== id));
  };
  
  const toggleLockReducibleExpense = (id: string) => {
    setReducibleExpensesState(
      reducibleExpenses.map(expense => 
        expense.id === id 
          ? { ...expense, isLocked: !expense.isLocked } 
          : expense
      )
    );
  };
  
  // EMI Plans Handlers
  const addEmiPlan = () => {
    if (
      emiType && 
      emiLoanAmount && 
      emiInterestRate && 
      emiDuration && 
      !isNaN(Number(emiLoanAmount)) && 
      !isNaN(Number(emiInterestRate)) && 
      !isNaN(Number(emiDuration))
    ) {
      const principal = Number(emiLoanAmount);
      const rate = Number(emiInterestRate) / 100 / 12; // Monthly interest rate
      const time = Number(emiDuration);
      
      // EMI calculation formula: P * r * (1+r)^n / ((1+r)^n - 1)
      const emi = principal * rate * Math.pow(1 + rate, time) / (Math.pow(1 + rate, time) - 1);
      
      const newEmiPlan: EMIPlan = {
        id: Date.now().toString(),
        type: emiType,
        loanAmount: principal,
        interestRate: Number(emiInterestRate),
        durationMonths: time,
        necessity: emiNecessity,
        monthlyPayment: Math.round(emi)
      };
      
      setEmiPlansState([...emiPlans, newEmiPlan]);
      setEmiType('');
      setEmiLoanAmount('');
      setEmiInterestRate('');
      setEmiDuration('');
      setEmiNecessity(5);
    }
  };
  
  const removeEmiPlan = (id: string) => {
    setEmiPlansState(emiPlans.filter(plan => plan.id !== id));
  };
  
  // Navigation Handlers
  const nextStep = () => {
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const handleComplete = () => {
    // Save all data to context
    console.log('Saving budget data to context:', {
      income,
      fixedExpenses,
      reducibleExpenses,
      emiPlans,
      hasGoal,
      goalAmount,
      goalType,
      goalDescription,
      lifestyleType
    });
    setIncome(income);
    setFixedExpenses(fixedExpenses);
    setReducibleExpenses(reducibleExpenses);
    setEmiPlans(emiPlans);
    
    if (hasGoal && goalAmount && goalType && goalDescription) {
      setGoal({
        type: goalType,
        targetAmount: Number(goalAmount),
        description: goalDescription
      });
    } else {
      setGoal(null);
    }
    
    setLifestyleType(lifestyleType);
    
    // Mark onboarding as complete
    completeOnboarding();
    
    // Navigate to dashboard
    navigate('/dashboard');
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <p className="text-gray-600 mb-6">Let's start with your monthly income and basic details.</p>
            
            <Input
              label="Monthly Income (₹)"
              type="number"
              id="income"
              value={income.toString()}
              onChange={(e) => setIncomeState(Number(e.target.value))}
              placeholder="Enter your monthly income"
              required
            />
            
            <Select
              label="Lifestyle Type"
              id="lifestyleType"
              value={lifestyleType}
              onChange={(e) => setLifestyleTypeState(e.target.value)}
              options={lifestyleOptions}
            />
            
            <div className="mt-8 flex justify-end">
              <Button onClick={nextStep}>
                Next <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Fixed Expenses</h2>
            <p className="text-gray-600 mb-6">
              Add your fixed monthly expenses that cannot be reduced (rent, utilities, etc.)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                label="Expense Name"
                type="text"
                id="fixedExpenseName"
                value={fixedExpenseName}
                onChange={(e) => setFixedExpenseName(e.target.value)}
                placeholder="e.g., Rent"
              />
              
              <Input
                label="Amount (₹)"
                type="number"
                id="fixedExpenseAmount"
                value={fixedExpenseAmount}
                onChange={(e) => setFixedExpenseAmount(e.target.value)}
                placeholder="Enter amount"
              />
              
              <div className="flex items-end">
                <Button 
                  onClick={addFixedExpense}
                  className="mb-4"
                  disabled={!fixedExpenseName || !fixedExpenseAmount}
                >
                  <Plus size={16} className="mr-2" /> Add Expense
                </Button>
              </div>
            </div>
            
            {fixedExpenses.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">Your Fixed Expenses</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {fixedExpenses.map((expense) => (
                    <div 
                      key={expense.id} 
                      className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                    >
                      <span className="font-medium">{expense.name}</span>
                      <div className="flex items-center">
                        <span className="text-gray-700 mr-4">₹{expense.amount.toLocaleString()}</span>
                        <button 
                          onClick={() => removeFixedExpense(expense.id)}
                          className="text-gray-500 hover:text-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between mt-4 pt-2 border-t border-gray-300">
                    <span className="font-semibold">Total Fixed Expenses:</span>
                    <span className="font-semibold">
                      ₹{fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic mt-4">No fixed expenses added yet.</p>
            )}
            
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft size={16} className="mr-2" /> Back
              </Button>
              <Button onClick={nextStep}>
                Next <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Reducible Expenses</h2>
            <p className="text-gray-600 mb-6">
              Add expenses that could potentially be reduced (entertainment, dining, etc.)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input
                label="Expense Name"
                type="text"
                id="reducibleExpenseName"
                value={reducibleExpenseName}
                onChange={(e) => setReducibleExpenseName(e.target.value)}
                placeholder="e.g., Dining Out"
              />
              
              <Input
                label="Amount (₹)"
                type="number"
                id="reducibleExpenseAmount"
                value={reducibleExpenseAmount}
                onChange={(e) => setReducibleExpenseAmount(e.target.value)}
                placeholder="Enter amount"
              />
              
              <Select
                label="Priority"
                id="reducibleExpensePriority"
                value={reducibleExpensePriority}
                onChange={(e) => setReducibleExpensePriority(e.target.value as ExpensePriority)}
                options={priorityOptions}
              />
              
              <div className="flex items-end mb-4">
                <div className="flex items-center mr-4">
                  <input
                    type="checkbox"
                    id="lockExpense"
                    checked={reducibleExpenseLocked}
                    onChange={() => setReducibleExpenseLocked(!reducibleExpenseLocked)}
                    className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="lockExpense" className="text-sm text-gray-700">
                    Lock (Don't Optimize)
                  </label>
                </div>
                <Button 
                  onClick={addReducibleExpense}
                  disabled={!reducibleExpenseName || !reducibleExpenseAmount}
                >
                  <Plus size={16} className="mr-2" /> Add
                </Button>
              </div>
            </div>
            
            {reducibleExpenses.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">Your Reducible Expenses</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {reducibleExpenses.map((expense) => (
                    <div 
                      key={expense.id} 
                      className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                    >
                      <div className="flex items-center">
                        <span className="font-medium mr-2">{expense.name}</span>
                        <span 
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            expense.priority === 'High' 
                              ? 'bg-priority-high/10 text-priority-high' 
                              : expense.priority === 'Medium'
                                ? 'bg-priority-medium/10 text-priority-medium'
                                : 'bg-priority-low/10 text-priority-low'
                          }`}
                        >
                          {expense.priority}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-700 mr-4">₹{expense.amount.toLocaleString()}</span>
                        <button 
                          onClick={() => toggleLockReducibleExpense(expense.id)}
                          className={`mr-2 ${expense.isLocked ? 'text-primary' : 'text-gray-400'}`}
                          title={expense.isLocked ? 'Unlock' : 'Lock'}
                        >
                          {expense.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                        <button 
                          onClick={() => removeReducibleExpense(expense.id)}
                          className="text-gray-500 hover:text-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between mt-4 pt-2 border-t border-gray-300">
                    <span className="font-semibold">Total Reducible Expenses:</span>
                    <span className="font-semibold">
                      ₹{reducibleExpenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic mt-4">No reducible expenses added yet.</p>
            )}
            
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft size={16} className="mr-2" /> Back
              </Button>
              <Button onClick={nextStep}>
                Next <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">EMI Plans</h2>
            <p className="text-gray-600 mb-6">
              Add any existing or planned EMI payments (loans, credit cards, etc.)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <Input
                label="Loan Type"
                type="text"
                id="emiType"
                value={emiType}
                onChange={(e) => setEmiType(e.target.value)}
                placeholder="e.g., Home Loan"
              />
              
              <Input
                label="Loan Amount (₹)"
                type="number"
                id="emiLoanAmount"
                value={emiLoanAmount}
                onChange={(e) => setEmiLoanAmount(e.target.value)}
                placeholder="Total loan amount"
              />
              
              <Input
                label="Interest Rate (%)"
                type="number"
                id="emiInterestRate"
                value={emiInterestRate}
                onChange={(e) => setEmiInterestRate(e.target.value)}
                placeholder="Annual interest rate"
                step="0.01"
              />
              
              <Input
                label="Duration (Months)"
                type="number"
                id="emiDuration"
                value={emiDuration}
                onChange={(e) => setEmiDuration(e.target.value)}
                placeholder="Loan duration"
              />
              
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Necessity (1-10)
                </label>
                <Slider
                  min={1}
                  max={10}
                  value={emiNecessity}
                  onChange={setEmiNecessity}
                />
                <div className="flex justify-end mt-2">
                  <Button 
                    onClick={addEmiPlan}
                    disabled={!emiType || !emiLoanAmount || !emiInterestRate || !emiDuration}
                  >
                    <Plus size={16} className="mr-2" /> Add EMI
                  </Button>
                </div>
              </div>
            </div>
            
            {emiPlans.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">Your EMI Plans</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {emiPlans.map((plan) => (
                    <div 
                      key={plan.id} 
                      className="flex flex-wrap items-center justify-between py-3 border-b border-gray-200 last:border-0"
                    >
                      <div className="w-full md:w-auto mb-2 md:mb-0">
                        <span className="font-medium">{plan.type}</span>
                        <div className="text-sm text-gray-500">
                          ₹{plan.loanAmount.toLocaleString()} at {plan.interestRate}% for {plan.durationMonths} months
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-4">
                          <div className="text-sm text-gray-500">Monthly Payment</div>
                          <div className="font-semibold">₹{plan.monthlyPayment.toLocaleString()}</div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm text-gray-500">Necessity</div>
                          <div className="font-semibold">{plan.necessity}/10</div>
                        </div>
                        <button 
                          onClick={() => removeEmiPlan(plan.id)}
                          className="text-gray-500 hover:text-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between mt-4 pt-2 border-t border-gray-300">
                    <span className="font-semibold">Total Monthly EMI:</span>
                    <span className="font-semibold">
                      ₹{emiPlans.reduce((sum, plan) => sum + plan.monthlyPayment, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic mt-4">No EMI plans added yet.</p>
            )}
            
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft size={16} className="mr-2" /> Back
              </Button>
              <Button onClick={nextStep}>
                Next <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Financial Goals</h2>
            <p className="text-gray-600 mb-6">
              Set a financial goal to work towards (optional)
            </p>
            
            <div className="mb-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="hasGoal"
                  checked={hasGoal}
                  onChange={() => setHasGoal(!hasGoal)}
                  className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="hasGoal" className="text-gray-700">
                  I have a specific financial goal
                </label>
              </div>
              
              {hasGoal && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Select
                      label="Goal Type"
                      id="goalType"
                      value={goalType}
                      onChange={(e) => setGoalType(e.target.value as 'Savings' | 'Investment' | 'Purchase')}
                      options={goalTypeOptions}
                    />
                    
                    <Input
                      label="Target Amount (₹)"
                      type="number"
                      id="goalAmount"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      placeholder="Enter target amount"
                    />
                  </div>
                  
                  <Input
                    label="Goal Description"
                    type="text"
                    id="goalDescription"
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    placeholder="e.g., Save for a new car, Emergency fund, etc."
                  />
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft size={16} className="mr-2" /> Back
              </Button>
              <Button onClick={nextStep}>
                Review <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        );
        
      case 6:
      // Calculate totals
      const totalFixedExpenses = fixedExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
      const totalReducibleExpenses = reducibleExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
      const totalEMI = emiPlans.reduce((sum: number, plan: any) => sum + plan.monthlyPayment, 0);
      const totalExpenses = totalFixedExpenses + totalReducibleExpenses + totalEMI;
      const balance = income - totalExpenses;
      
      return (
        <div>
          <h2 className="text-xl font-semibold mb-4">Review Your Budget</h2>
          <p className="text-gray-600 mb-6">
            Please review your budget information before finalizing.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Income & Lifestyle">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Monthly Income:</span>
                <span className="font-semibold">₹{income.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lifestyle Type:</span>
                <span className="font-semibold">{lifestyleType}</span>
              </div>
            </Card>
            
            <Card title="Expenses Summary">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Fixed Expenses:</span>
                <span className="font-semibold">₹{totalFixedExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Reducible Expenses:</span>
                <span className="font-semibold">₹{totalReducibleExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">EMI Payments:</span>
                <span className="font-semibold">₹{totalEMI.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                <span className="text-gray-600">Total Expenses:</span>
                <span className="font-semibold">₹{totalExpenses.toLocaleString()}</span>
              </div>
            </Card>
            
            <Card 
              title="Monthly Balance" 
              className={`${balance >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Remaining Balance:</span>
                <span className={`text-xl font-bold ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
                  ₹{balance.toLocaleString()}
                </span>
              </div>
              <p className="text-sm mt-2">
                {balance >= 0 
                  ? 'Great! You have a positive balance. You can save or invest this amount.' 
                  : 'Warning! Your expenses exceed your income. You need to reduce expenses or increase income.'}
              </p>
            </Card>
            
            {hasGoal && goalAmount && goalType && (
              <Card title="Financial Goal">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Goal Type:</span>
                  <span className="font-semibold">{goalType}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Target Amount:</span>
                  <span className="font-semibold">₹{Number(goalAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-semibold">{goalDescription}</span>
                </div>
              </Card>
            )}
          </div>
          
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>
            <Button onClick={handleComplete}>
              <Check size={16} className="mr-2" /> Complete Setup
            </Button>
          </div>
        </div>
      );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-card p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Budget Planner Setup</h1>
            <p className="text-gray-600">
              Let's set up your budget planner. This will help us provide personalized recommendations.
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
                <div 
                  key={stepNumber}
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    stepNumber === step 
                      ? 'bg-primary text-white' 
                      : stepNumber < step 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stepNumber}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${((step - 1) / 5) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;