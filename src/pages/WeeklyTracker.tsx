import React, { useState } from 'react';
import { useBudget, WeeklySpend } from '../contexts/BudgetContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Plus, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WeeklyTracker: React.FC = () => {
  const { 
    income, 
    fixedExpenses, 
    reducibleExpenses, 
    emiPlans, 
    weeklySpends, 
    addWeeklySpend 
  } = useBudget();
  
  const [weekNumber, setWeekNumber] = useState(1);
  const [spendAmount, setSpendAmount] = useState('');
  const [error, setError] = useState('');
  
  // Calculate monthly budget
  const totalFixedExpenses = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalReducibleExpenses = reducibleExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalEMI = emiPlans.reduce((sum, plan) => sum + plan.monthlyPayment, 0);
  const totalMonthlyExpenses = totalFixedExpenses + totalReducibleExpenses + totalEMI;
  const monthlyBalance = income - totalMonthlyExpenses;
  
  // Calculate weekly budget (monthly / 4.33)
  const weeklyBudget = monthlyBalance > 0 ? Math.floor(monthlyBalance / 4.33) : 0;
  
  // Calculate total spent this month
  const totalSpentThisMonth = weeklySpends.reduce((sum, spend) => sum + spend.amount, 0);
  
  // Calculate remaining budget
  const remainingBudget = Math.max(0, monthlyBalance - totalSpentThisMonth);
  
  // Calculate weekly budget remaining
  const weeksRemaining = 4 - weeklySpends.length;
  const weeklyBudgetRemaining = weeksRemaining > 0 ? Math.floor(remainingBudget / weeksRemaining) : 0;
  
  // Handle adding a new weekly spend
  const handleAddWeeklySpend = () => {
    setError('');
    
    if (!spendAmount || isNaN(Number(spendAmount)) || Number(spendAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (weeklySpends.some(spend => spend.week === weekNumber)) {
      setError(`Week ${weekNumber} has already been recorded`);
      return;
    }
    
    const newSpend: WeeklySpend = {
      week: weekNumber,
      amount: Number(spendAmount),
      date: new Date()
    };
    
    addWeeklySpend(newSpend);
    setSpendAmount('');
    setWeekNumber(prev => Math.min(4, prev + 1));
  };
  
  // Prepare data for weekly spending chart
  const weeklySpendingData = {
    labels: weeklySpends.map(spend => `Week ${spend.week}`),
    datasets: [
      {
        label: 'Weekly Spending',
        data: weeklySpends.map(spend => spend.amount),
        borderColor: '#4dabf7',
        backgroundColor: 'rgba(77, 171, 247, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Weekly Budget',
        data: weeklySpends.map(() => weeklyBudget),
        borderColor: '#51cf66',
        backgroundColor: 'rgba(81, 207, 102, 0.2)',
        borderDash: [5, 5],
      },
    ],
  };
  
  // Prepare data for budget vs actual chart
  const budgetVsActualData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Budget',
        data: [weeklyBudget, weeklyBudget, weeklyBudget, weeklyBudget],
        backgroundColor: '#51cf66',
      },
      {
        label: 'Actual',
        data: [
          weeklySpends.find(spend => spend.week === 1)?.amount || 0,
          weeklySpends.find(spend => spend.week === 2)?.amount || 0,
          weeklySpends.find(spend => spend.week === 3)?.amount || 0,
          weeklySpends.find(spend => spend.week === 4)?.amount || 0,
        ],
        backgroundColor: '#4dabf7',
      },
    ],
  };
  
  return (
    <Layout title="Weekly Tracker">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-primary/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Weekly Budget</p>
              <h3 className="text-2xl font-bold">₹{weeklyBudget.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">Based on monthly balance</p>
            </div>
            <div className="bg-primary/20 p-2 rounded-lg">
              <Calendar size={24} className="text-primary" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-secondary/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Remaining Budget</p>
              <h3 className="text-2xl font-bold">₹{remainingBudget.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">For this month</p>
            </div>
            <div className="bg-secondary/20 p-2 rounded-lg">
              <DollarSign size={24} className="text-secondary" />
            </div>
          </div>
        </Card>
        
        <Card className={`${weeklyBudgetRemaining > 0 ? 'bg-success/10' : 'bg-warning/10'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Weekly Budget Remaining</p>
              <h3 className={`text-2xl font-bold ${weeklyBudgetRemaining > 0 ? 'text-success' : 'text-warning'}`}>
                ₹{weeklyBudgetRemaining.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {weeksRemaining > 0 ? `For ${weeksRemaining} remaining week${weeksRemaining > 1 ? 's' : ''}` : 'Month complete'}
              </p>
            </div>
            <div className={`${weeklyBudgetRemaining > 0 ? 'bg-success/20' : 'bg-warning/20'} p-2 rounded-lg`}>
              {weeklyBudgetRemaining > 0 ? (
                <TrendingUp size={24} className="text-success" />
              ) : (
                <TrendingDown size={24} className="text-warning" />
              )}
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Record Weekly Spending" className="lg:col-span-1">
          {error && (
            <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <Input
              label="Week Number"
              type="number"
              id="weekNumber"
              value={weekNumber.toString()}
              onChange={(e) => setWeekNumber(Number(e.target.value))}
              min="1"
              max="4"
            />
          </div>
          
          <div className="mb-6">
            <Input
              label="Amount Spent (₹)"
              type="number"
              id="spendAmount"
              value={spendAmount}
              onChange={(e) => setSpendAmount(e.target.value)}
              placeholder="Enter amount spent this week"
            />
          </div>
          
          <Button onClick={handleAddWeeklySpend} fullWidth>
            <Plus size={16} className="mr-2" /> Record Spending
          </Button>
          
          {weeklySpends.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">Recorded Weeks</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {weeklySpends.map((spend) => (
                  <div 
                    key={spend.week} 
                    className="flex justify-between py-2 border-b border-gray-200 last:border-0"
                  >
                    <span>Week {spend.week}</span>
                    <span className="font-medium">₹{spend.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
        
        <Card title="Weekly Spending Trend" className="lg:col-span-2">
          {weeklySpends.length > 0 ? (
            <div className="h-80">
              <Line 
                data={weeklySpendingData}
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
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-gray-500">
              <Calendar size={48} className="mb-4 text-gray-300" />
              <p>No weekly spending data recorded yet.</p>
              <p className="text-sm mt-2">Record your first week to see the trend.</p>
            </div>
          )}
        </Card>
      </div>
      
      {weeklySpends.length > 0 && (
        <div className="mt-6">
          <Card title="Budget vs Actual Spending">
            <div className="h-80">
              <Line 
                data={budgetVsActualData}
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
                  }
                }}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Spending Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Budget (Monthly):</span>
                    <span className="font-medium">₹{monthlyBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="font-medium">₹{totalSpentThisMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-medium">₹{remainingBudget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Weekly Average</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target Weekly Budget:</span>
                    <span className="font-medium">₹{weeklyBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual Weekly Average:</span>
                    <span className="font-medium">
                      ₹{(totalSpentThisMonth / weeklySpends.length).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Variance:</span>
                    <span className={`font-medium ${
                      (totalSpentThisMonth / weeklySpends.length) <= weeklyBudget 
                        ? 'text-success' 
                        : 'text-danger'
                    }`}>
                      {(totalSpentThisMonth / weeklySpends.length) <= weeklyBudget ? '✓ Under budget' : '✗ Over budget'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default WeeklyTracker;