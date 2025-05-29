import React, { useEffect, useState } from 'react';
import { useBudget, EMIPlan } from '../contexts/BudgetContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Slider from '../components/Slider';
import { CreditCard, Calculator, TrendingDown, Check, Plus, Trash2 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EMIPlanner: React.FC = () => {
  const { 
    income, 
    fixedExpenses, 
    reducibleExpenses, 
    emiPlans, 
    setEmiPlans,
    recommendedEMIPlan,
    setRecommendedEMIPlan
  } = useBudget();
  
  // New EMI form state
  const [emiType, setEmiType] = useState('');
  const [emiLoanAmount, setEmiLoanAmount] = useState('');
  const [emiInterestRate, setEmiInterestRate] = useState('');
  const [emiDuration, setEmiDuration] = useState('');
  const [emiNecessity, setEmiNecessity] = useState(5);
  const [calculatedEMI, setCalculatedEMI] = useState<number | null>(null);
  const [error, setError] = useState('');
  
  // Calculate monthly budget
  const totalFixedExpenses = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalReducibleExpenses = reducibleExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalEMI = emiPlans.reduce((sum, plan) => sum + plan.monthlyPayment, 0);
  const totalMonthlyExpenses = totalFixedExpenses + totalReducibleExpenses + totalEMI;
  const monthlyBalance = income - totalMonthlyExpenses;
  
  // Calculate EMI affordability
  const maxRecommendedEMI = income * 0.4 - totalEMI; // 40% of income minus existing EMIs
  const isAffordable = calculatedEMI !== null && calculatedEMI <= maxRecommendedEMI;
  
  // Calculate EMI
  const calculateEMI = () => {
    setError('');
    
    if (!emiLoanAmount || !emiInterestRate || !emiDuration) {
      setError('Please fill all the fields');
      return;
    }
    
    const principal = Number(emiLoanAmount);
    const rate = Number(emiInterestRate) / 100 / 12; // Monthly interest rate
    const time = Number(emiDuration);
    
    if (principal <= 0 || rate <= 0 || time <= 0) {
      setError('Please enter valid positive values');
      return;
    }
    
    // EMI calculation formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = principal * rate * Math.pow(1 + rate, time) / (Math.pow(1 + rate, time) - 1);
    setCalculatedEMI(Math.round(emi));
  };
  
  // Add EMI plan
  const addEmiPlan = () => {
    if (calculatedEMI === null) {
      setError('Please calculate EMI first');
      return;
    }
    
    const newEmiPlan: EMIPlan = {
      id: Date.now().toString(),
      type: emiType,
      loanAmount: Number(emiLoanAmount),
      interestRate: Number(emiInterestRate),
      durationMonths: Number(emiDuration),
      necessity: emiNecessity,
      monthlyPayment: calculatedEMI
    };
    
    setEmiPlans([...emiPlans, newEmiPlan]);
    
    // Reset form
    setEmiType('');
    setEmiLoanAmount('');
    setEmiInterestRate('');
    setEmiDuration('');
    setEmiNecessity(5);
    setCalculatedEMI(null);
  };
  
  // Remove EMI plan
  const removeEmiPlan = (id: string) => {
    setEmiPlans(emiPlans.filter(plan => plan.id !== id));
  };
  
  // Simulate Knapsack DP algorithm for EMI optimization
  useEffect(() => {
    if (emiPlans.length === 0) {
      setRecommendedEMIPlan(null);
      return;
    }
    
    // Simple scoring algorithm for EMI plans
    const scoredPlans = emiPlans.map(plan => {
      // Calculate total interest paid
      const totalInterest = (plan.monthlyPayment * plan.durationMonths) - plan.loanAmount;
      
      // Calculate affordability score (higher is better)
      const affordabilityScore = Math.min(10, (maxRecommendedEMI / plan.monthlyPayment) * 5);
      
      // Calculate interest score (higher is better - lower interest rate)
      const interestScore = Math.max(1, 10 - (plan.interestRate / 2));
      
      // Calculate duration score (moderate durations are better)
      const durationScore = plan.durationMonths <= 24 ? 8 : 
                           plan.durationMonths <= 60 ? 10 : 
                           plan.durationMonths <= 120 ? 7 : 5;
      
      // Calculate total score weighted by necessity
      const totalScore = (
        (affordabilityScore * 0.4) + 
        (interestScore * 0.3) + 
        (durationScore * 0.1) + 
        (plan.necessity * 0.2)
      );
      
      return {
        ...plan,
        score: Math.round(totalScore * 10) / 10,
        totalInterest
      };
    });
    
    // Sort by score (descending)
    const sortedPlans = [...scoredPlans].sort((a, b) => b.score! - a.score!);
    
    // Set the highest scoring plan as recommended
    setRecommendedEMIPlan(sortedPlans[0]);
  }, [emiPlans, maxRecommendedEMI, setRecommendedEMIPlan]);
  
  // Prepare data for EMI comparison chart
  const emiComparisonData = {
    labels: emiPlans.map(plan => plan.type),
    datasets: [
      {
        label: 'Monthly Payment (₹)',
        data: emiPlans.map(plan => plan.monthlyPayment),
        backgroundColor: emiPlans.map(plan => 
          plan.id === recommendedEMIPlan?.id ? '#51cf66' : '#4dabf7'
        ),
      },
    ],
  };
  
  // Prepare data for EMI score chart
  const emiScoreData = {
    labels: emiPlans.map(plan => plan.type),
    datasets: [
      {
        label: 'Score',
        data: emiPlans.map(plan => plan.score || 0),
        backgroundColor: emiPlans.map(plan => 
          plan.id === recommendedEMIPlan?.id ? '#51cf66' : '#ffa94d'
        ),
      },
    ],
  };
  
  return (
    <Layout title="EMI Planner">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-primary/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Current EMI Total</p>
              <h3 className="text-2xl font-bold">₹{totalEMI.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {(totalEMI / income * 100).toFixed(1)}% of income
              </p>
            </div>
            <div className="bg-primary/20 p-2 rounded-lg">
              <CreditCard size={24} className="text-primary" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-secondary/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Max Recommended EMI</p>
              <h3 className="text-2xl font-bold">₹{maxRecommendedEMI.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">Additional capacity</p>
            </div>
            <div className="bg-secondary/20 p-2 rounded-lg">
              <Calculator size={24} className="text-secondary" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Monthly Balance</p>
              <h3 className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                ₹{monthlyBalance.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500 mt-1">After all expenses</p>
            </div>
            <div className="bg-gray-200 p-2 rounded-lg">
              <TrendingDown size={24} className="text-gray-700" />
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="EMI Calculator" className="lg:col-span-1">
          {error && (
            <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          <Input
            label="Loan Type"
            type="text"
            id="emiType"
            value={emiType}
            onChange={(e) => setEmiType(e.target.value)}
            placeholder="e.g., Home Loan, Car Loan"
          />
          
          <Input
            label="Loan Amount (₹)"
            type="number"
            id="emiLoanAmount"
            value={emiLoanAmount}
            onChange={(e) => setEmiLoanAmount(e.target.value)}
            placeholder="Enter loan amount"
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
            placeholder="Loan duration in months"
          />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Necessity (1-10)
            </label>
            <Slider
              min={1}
              max={10}
              value={emiNecessity}
              onChange={setEmiNecessity}
            />
            <p className="text-xs text-gray-500 mt-1">
              How necessary is this loan? (1: Luxury, 10: Essential)
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Button onClick={calculateEMI} variant="outline">
              <Calculator size={16} className="mr-2" /> Calculate EMI
            </Button>
            
            <Button 
              onClick={addEmiPlan} 
              disabled={calculatedEMI === null}
            >
              <Plus size={16} className="mr-2" /> Add Plan
            </Button>
          </div>
          
          {calculatedEMI !== null && (
            <div className={`p-4 rounded-lg ${isAffordable ? 'bg-success/10' : 'bg-danger/10'} mb-4`}>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Calculated EMI:</span>
                <span className="font-bold">₹{calculatedEMI.toLocaleString()}/month</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Total Payment:</span>
                <span className="font-medium">
                  ₹{(calculatedEMI * Number(emiDuration)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Total Interest:</span>
                <span className="font-medium">
                  ₹{(calculatedEMI * Number(emiDuration) - Number(emiLoanAmount)).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center">
                  {isAffordable ? (
                    <>
                      <Check size={16} className="text-success mr-2" />
                      <span className="text-success font-medium">Affordable based on your income</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown size={16} className="text-danger mr-2" />
                      <span className="text-danger font-medium">Exceeds recommended EMI limit</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
        
        <div className="lg:col-span-2 space-y-6">
          <Card title="Your EMI Plans">
            {emiPlans.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2">Type</th>
                      <th className="text-right py-2 px-2">Loan Amount</th>
                      <th className="text-right py-2 px-2">Interest</th>
                      <th className="text-right py-2 px-2">Duration</th>
                      <th className="text-right py-2 px-2">Monthly EMI</th>
                      <th className="text-right py-2 px-2">Score</th>
                      <th className="text-center py-2 px-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emiPlans.map((plan) => (
                      <tr 
                        key={plan.id} 
                        className={`border-b border-gray-100 ${
                          plan.id === recommendedEMIPlan?.id ? 'bg-success/5' : ''
                        }`}
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            {plan.id === recommendedEMIPlan?.id && (
                              <span className="bg-success/20 text-success text-xs px-2 py-0.5 rounded-full mr-2">
                                Best
                              </span>
                            )}
                            {plan.type}
                          </div>
                        </td>
                        <td className="text-right py-3 px-2">₹{plan.loanAmount.toLocaleString()}</td>
                        <td className="text-right py-3 px-2">{plan.interestRate}%</td>
                        <td className="text-right py-3 px-2">{plan.durationMonths} months</td>
                        <td className="text-right py-3 px-2 font-medium">₹{plan.monthlyPayment.toLocaleString()}</td>
                        <td className="text-right py-3 px-2 font-medium">{plan.score || '-'}/10</td>
                        <td className="text-center py-3 px-2">
                          <button 
                            onClick={() => removeEmiPlan(plan.id)}
                            className="text-gray-500 hover:text-danger"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200 font-semibold">
                      <td className="py-3 px-2">Total</td>
                      <td className="text-right py-3 px-2">
                        ₹{emiPlans.reduce((sum, plan) => sum + plan.loanAmount, 0).toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-2">-</td>
                      <td className="text-right py-3 px-2">-</td>
                      <td className="text-right py-3 px-2">
                        ₹{emiPlans.reduce((sum, plan) => sum + plan.monthlyPayment, 0).toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-2">-</td>
                      <td className="text-center py-3 px-2">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No EMI plans added yet.</p>
            )}
          </Card>
          
          {emiPlans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Monthly Payment Comparison">
                <div className="h-64">
                  <Bar 
                    data={emiComparisonData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Amount (₹)'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              </Card>
              
              <Card title="EMI Plan Scores">
                <div className="h-64">
                  <Bar 
                    data={emiScoreData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 10,
                          title: {
                            display: true,
                            text: 'Score (out of 10)'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            </div>
          )}
          
          {recommendedEMIPlan && (
            <Card title="Recommended EMI Plan" className="bg-success/5 border border-success/20">
              <div className="flex items-start">
                <div className="bg-success/20 p-2 rounded-full mr-4">
                  <Check size={20} className="text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{recommendedEMIPlan.type}</h3>
                  <p className="text-gray-600 mb-4">
                    This plan has the best balance of affordability, interest rate, and necessity.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Monthly Payment</p>
                      <p className="font-semibold text-lg">₹{recommendedEMIPlan.monthlyPayment.toLocaleString()}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Total Interest</p>
                      <p className="font-semibold text-lg">
                        ₹{((recommendedEMIPlan.monthlyPayment * recommendedEMIPlan.durationMonths) - recommendedEMIPlan.loanAmount).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-500">Score</p>
                      <p className="font-semibold text-lg">{recommendedEMIPlan.score}/10</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EMIPlanner;