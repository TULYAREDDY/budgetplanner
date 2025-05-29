import React, { useEffect, useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  Share2, 
  ArrowRight
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyReport: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    income, 
    fixedExpenses, 
    reducibleExpenses, 
    emiPlans,
    weeklySpends,
    optimizedExpenses,
    tips,
    alerts,
    goal
  } = useBudget();
  
  const [month, setMonth] = useState<string>(new Date().toLocaleString('default', { month: 'long' }));
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [savingsRate, setSavingsRate] = useState<number>(0);
  const [monthlyBalance, setMonthlyBalance] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [expenseBreakdown, setExpenseBreakdown] = useState<{category: string, amount: number}[]>([]);
  const [savingsProgress, setSavingsProgress] = useState<number>(0);
  const [monthlyScore, setMonthlyScore] = useState<number>(0);
  
  // Calculate financial metrics
  useEffect(() => {
    console.log('MonthlyReport optimizedExpenses:', optimizedExpenses);
    // Use optimizedExpenses and backend expenseBreakdown if available
    if (optimizedExpenses && optimizedExpenses.length > 0) {
      // Calculate totals from optimizedExpenses
      const fixedTotal = optimizedExpenses.filter(e => e.isFixed === true).reduce((sum, e) => sum + e.amount, 0);
      const reducibleTotal = optimizedExpenses.filter(e => e.isFixed !== true).reduce((sum, e) => sum + e.amount, 0);
      const emiTotal = emiPlans.reduce((sum, plan) => sum + plan.monthlyPayment, 0);
      const totalExp = fixedTotal + reducibleTotal + emiTotal;
      const balance = income - totalExp;
      const savingsPercentage = income > 0 ? (balance / income) * 100 : 0;
      
      setTotalExpenses(totalExp);
      setMonthlyBalance(balance);
      setSavingsRate(savingsPercentage);
      
      // Create expense breakdown from optimizedExpenses categories
      const breakdownMap: {[key: string]: number} = {
        'Housing & Utilities': 0,
        'Food & Groceries': 0,
        'Transportation': 0,
        'Entertainment': 0,
        'EMI Payments': emiTotal,
        'Others': 0
      };
      
      optimizedExpenses.forEach(expense => {
        const name = expense.name ? expense.name.toLowerCase() : '';
        const amount = expense.amount || 0;
        if (name.includes('rent') || name.includes('utility')) {
          breakdownMap['Housing & Utilities'] += amount;
        } else if (name.includes('food') || name.includes('grocery')) {
          breakdownMap['Food & Groceries'] += amount;
        } else if (name.includes('transport') || name.includes('fuel')) {
          breakdownMap['Transportation'] += amount;
        } else if (name.includes('entertainment') || name.includes('subscription')) {
          breakdownMap['Entertainment'] += amount;
        } else {
          breakdownMap['Others'] += amount;
        }
      });
      
      const breakdown = Object.entries(breakdownMap).map(([category, amount]) => ({category, amount}));
      setExpenseBreakdown(breakdown);
      
      // Calculate savings progress towards goal
      if (goal && goal.targetAmount > 0) {
        const progress = Math.min(100, (balance / goal.targetAmount) * 100);
        setSavingsProgress(progress);
      }
      
      // Calculate monthly financial score (0-100)
      let score = 0;
      
      // Savings rate contributes up to 40 points
      score += Math.min(40, savingsPercentage * 2);
      
      // Positive balance contributes up to 30 points
      score += balance > 0 ? 30 : Math.max(0, 30 + (balance / income) * 30);
      
      // EMI to income ratio contributes up to 20 points
      const emiRatio = emiTotal / income;
      score += emiRatio <= 0.3 ? 20 : Math.max(0, 20 - ((emiRatio - 0.3) * 100));
      
      // Weekly spending consistency contributes up to 10 points
      if (weeklySpends.length >= 2) {
        const weeklyVariance = calculateWeeklyVariance(weeklySpends);
        score += Math.max(0, 10 - weeklyVariance * 10);
      }
      
      setMonthlyScore(Math.round(score));
    } else {
      // Fallback to previous calculation if no optimizedExpenses
      const fixedTotal = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const reducibleTotal = reducibleExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const emiTotal = emiPlans.reduce((sum, plan) => sum + plan.monthlyPayment, 0);
      const totalExp = fixedTotal + reducibleTotal + emiTotal;
      const balance = income - totalExp;
      const savingsPercentage = income > 0 ? (balance / income) * 100 : 0;
      
      setTotalExpenses(totalExp);
      setMonthlyBalance(balance);
      setSavingsRate(savingsPercentage);
      
      // Create expense breakdown
      const breakdown = [
        { category: 'Housing & Utilities', amount: 0 },
        { category: 'Food & Groceries', amount: 0 },
        { category: 'Transportation', amount: 0 },
        { category: 'Entertainment', amount: 0 },
        { category: 'EMI Payments', amount: emiTotal },
        { category: 'Others', amount: 0 }
      ];
      
      // Distribute expenses to categories (simplified for demo)
      fixedExpenses.forEach(expense => {
        if (expense.name.toLowerCase().includes('rent') || expense.name.toLowerCase().includes('utility')) {
          breakdown[0].amount += expense.amount;
        } else if (expense.name.toLowerCase().includes('food') || expense.name.toLowerCase().includes('grocery')) {
          breakdown[1].amount += expense.amount;
        } else if (expense.name.toLowerCase().includes('transport') || expense.name.toLowerCase().includes('fuel')) {
          breakdown[2].amount += expense.amount;
        } else {
          breakdown[5].amount += expense.amount;
        }
      });
      
      reducibleExpenses.forEach(expense => {
        if (expense.name.toLowerCase().includes('entertainment') || expense.name.toLowerCase().includes('subscription')) {
          breakdown[3].amount += expense.amount;
        } else {
          breakdown[5].amount += expense.amount;
        }
      });
      
      setExpenseBreakdown(breakdown);
      
      // Calculate savings progress towards goal
      if (goal && goal.targetAmount > 0) {
        const progress = Math.min(100, (balance / goal.targetAmount) * 100);
        setSavingsProgress(progress);
      }
      
      // Calculate monthly financial score (0-100)
      let score = 0;
      
      // Savings rate contributes up to 40 points
      score += Math.min(40, savingsPercentage * 2);
      
      // Positive balance contributes up to 30 points
      score += balance > 0 ? 30 : Math.max(0, 30 + (balance / income) * 30);
      
      // EMI to income ratio contributes up to 20 points
      const emiRatio = emiTotal / income;
      score += emiRatio <= 0.3 ? 20 : Math.max(0, 20 - ((emiRatio - 0.3) * 100));
      
      // Weekly spending consistency contributes up to 10 points
      if (weeklySpends.length >= 2) {
        const weeklyVariance = calculateWeeklyVariance(weeklySpends);
        score += Math.max(0, 10 - weeklyVariance * 10);
      }
      
      setMonthlyScore(Math.round(score));
    }
  }, [income, fixedExpenses, reducibleExpenses, emiPlans, weeklySpends, goal]);
  
  // Calculate variance in weekly spending (0-1 scale, lower is better)
  const calculateWeeklyVariance = (spends: any[]) => {
    if (spends.length < 2) return 0;
    
    const amounts = spends.map(spend => spend.amount);
    const avg = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
    const squaredDiffs = amounts.map(val => Math.pow(val - avg, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / amounts.length;
    
    // Normalize to 0-1 scale
    return Math.min(1, variance / (avg * avg));
  };
  
  // Prepare data for expense breakdown pie chart
  const expenseBreakdownData = {
    labels: expenseBreakdown.map(item => item.category),
    datasets: [
      {
        data: expenseBreakdown.map(item => item.amount),
        backgroundColor: [
          '#4dabf7', // Housing
          '#63e6be', // Food
          '#ffa94d', // Transportation
          '#9775fa', // Entertainment
          '#ff6b6b', // EMI
          '#adb5bd', // Others
        ],
        borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };
  
  // Prepare data for monthly income vs expenses bar chart
  const incomeVsExpensesData = {
    labels: ['Income', 'Expenses', 'Balance'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [income, totalExpenses, Math.max(0, monthlyBalance)],
        backgroundColor: ['#51cf66', '#ff6b6b', '#4dabf7'],
      },
    ],
  };
  
  // Prepare data for expense optimization chart
  const optimizationData = {
    labels: ['Before Optimization', 'After Optimization'],
    datasets: [
      {
        label: 'Fixed Expenses',
        data: [
          fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0),
          optimizedExpenses ? optimizedExpenses.filter(e => e.isFixed).reduce((sum, expense) => sum + expense.amount, 0) : 0
        ],
        backgroundColor: '#4dabf7',
      },
      {
        label: 'Reducible Expenses',
        data: [
          reducibleExpenses.reduce((sum, expense) => sum + expense.amount, 0),
          optimizedExpenses ? optimizedExpenses.filter(e => !e.isFixed).reduce((sum, expense) => sum + expense.amount, 0) : 0
        ],
        backgroundColor: '#ffa94d',
      },
    ],
  };
  
  // Generate PDF report (mock function)
  const generatePDFReport = () => {
    alert('PDF Report generation would be implemented here in a production app.');
  };
  
  // Share report (mock function)
  const shareReport = () => {
    alert('Report sharing functionality would be implemented here in a production app.');
  };
  
  return (
    <Layout title={`Monthly Report - ${month} ${year}`}>
      {/* Summary Cards */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-500">Financial summary for</p>
          <h2 className="text-2xl font-bold">{month} {year}</h2>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={generatePDFReport}>
            <Download size={16} className="mr-2" /> Export PDF
          </Button>
          <Button variant="outline" onClick={shareReport}>
            <Share2 size={16} className="mr-2" /> Share
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-primary/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Monthly Income</p>
              <h3 className="text-2xl font-bold">₹{income.toLocaleString()}</h3>
            </div>
            <div className="bg-primary/20 p-2 rounded-lg">
              <Calendar size={24} className="text-primary" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-secondary/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Total Expenses</p>
              <h3 className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {(totalExpenses / income * 100).toFixed(1)}% of income
              </p>
            </div>
            <div className="bg-secondary/20 p-2 rounded-lg">
              <TrendingDown size={24} className="text-secondary" />
            </div>
          </div>
        </Card>
        
        <Card className={`${monthlyBalance >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Monthly Balance</p>
              <h3 className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                ₹{monthlyBalance.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {savingsRate.toFixed(1)}% savings rate
              </p>
            </div>
            <div className={`${monthlyBalance >= 0 ? 'bg-success/20' : 'bg-danger/20'} p-2 rounded-lg`}>
              {monthlyBalance >= 0 ? (
                <TrendingUp size={24} className="text-success" />
              ) : (
                <AlertTriangle size={24} className="text-danger" />
              )}
            </div>
          </div>
        </Card>
        
        <Card className="bg-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Financial Score</p>
              <h3 className="text-2xl font-bold">{monthlyScore}/100</h3>
              <p className="text-sm text-gray-500 mt-1">
                {monthlyScore >= 80 ? 'Excellent' : 
                 monthlyScore >= 60 ? 'Good' : 
                 monthlyScore >= 40 ? 'Fair' : 'Needs Improvement'}
              </p>
            </div>
            <div className="bg-gray-200 p-2 rounded-lg">
              {monthlyScore >= 60 ? (
                <CheckCircle size={24} className="text-success" />
              ) : (
                <AlertTriangle size={24} className="text-warning" />
              )}
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Expense Breakdown">
          <div className="h-64">
            <Pie 
              data={expenseBreakdownData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </Card>
        
        <Card title="Income vs Expenses">
          <div className="h-64">
            <Bar 
              data={incomeVsExpensesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>
      
      {/* Expense Optimization */}
      <Card title="Expense Optimization Analysis" className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-64">
              <Bar 
                data={optimizationData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Optimization Summary</h3>
            {optimizedExpenses ? (
              <>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Before Optimization:</span>
                    <span className="font-medium">₹{(fixedExpenses.reduce((sum, e) => sum + e.amount, 0) + 
                      reducibleExpenses.reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">After Optimization:</span>
                    <span className="font-medium">₹{optimizedExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Potential Savings:</span>
                    <span className="font-semibold text-success">
                      ₹{((fixedExpenses.reduce((sum, e) => sum + e.amount, 0) + 
                        reducibleExpenses.reduce((sum, e) => sum + e.amount, 0)) - 
                        optimizedExpenses.reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  Our algorithm analyzed your expenses and found potential savings by optimizing reducible expenses based on their priority levels.
                </p>
                
                <Button variant="outline" size="sm" className="w-full">
                  View Detailed Breakdown <ArrowRight size={14} className="ml-1" />
                </Button>
              </>
            ) : (
              <p className="text-gray-500 italic">No optimization data available yet.</p>
            )}
          </div>
        </div>
      </Card>
      
      {/* Savings Goal Progress */}
      {goal && (
        <Card title="Savings Goal Progress" className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center mb-2">
                <span className="text-gray-600 mr-2">Goal: {goal.description}</span>
                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                  {goal.type}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{savingsProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-primary h-4 rounded-full" 
                    style={{ width: `${savingsProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Target Amount</p>
                  <p className="font-semibold">₹{goal.targetAmount.toLocaleString()}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Current Savings</p>
                  <p className="font-semibold">₹{(goal.targetAmount * savingsProgress / 100).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Savings Projection</h3>
              
              {monthlyBalance > 0 ? (
                <>
                  <p className="text-sm mb-3">
                    At your current savings rate of ₹{monthlyBalance.toLocaleString()}/month:
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goal completion in:</span>
                      <span className="font-medium">
                        {Math.ceil(goal.targetAmount / monthlyBalance)} months
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated date:</span>
                      <span className="font-medium">
                        {new Date(Date.now() + Math.ceil(goal.targetAmount / monthlyBalance) * 30 * 24 * 60 * 60 * 1000)
                          .toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-danger">
                  Your current monthly balance is negative. You need to reduce expenses or increase income to make progress toward your goal.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
      
      {/* Alerts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Financial Alerts" className="bg-warning/5">
          {alerts && alerts.length > 0 ? (
            <ul className="space-y-3">
              {alerts.map((alert, index) => (
                <li key={index} className="flex items-start">
                  <AlertTriangle size={18} className="text-warning mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{alert}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center text-success">
              <CheckCircle size={18} className="mr-2" />
              <p className="text-sm">No financial alerts at this time. Great job!</p>
            </div>
          )}
        </Card>
        
        <Card title="Smart Recommendations">
          {tips && tips.length > 0 ? (
            <ul className="space-y-3">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm">{tip}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Loading personalized recommendations...</p>
          )}
        </Card>
      </div>
      
      {/* Monthly Transactions Summary */}
      <Card title="Monthly Transactions Summary" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2">Category</th>
                <th className="text-right py-2 px-2">Budget</th>
                <th className="text-right py-2 px-2">Actual</th>
                <th className="text-right py-2 px-2">Variance</th>
                <th className="text-right py-2 px-2">% of Income</th>
              </tr>
            </thead>
            <tbody>
              {expenseBreakdown.map((item, index) => {
                // Mock budget values for demonstration
                const budget = item.amount * (Math.random() * 0.4 + 0.8);
                const variance = item.amount - budget;
                
                return (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-2">{item.category}</td>
                    <td className="text-right py-3 px-2">₹{budget.toFixed(0)}</td>
                    <td className="text-right py-3 px-2">₹{item.amount.toLocaleString()}</td>
                    <td className={`text-right py-3 px-2 ${variance > 0 ? 'text-danger' : 'text-success'}`}>
                      {variance > 0 ? '+' : ''}{variance.toFixed(0)}
                    </td>
                    <td className="text-right py-3 px-2">
                      {(item.amount / income * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 font-semibold">
                <td className="py-3 px-2">Total</td>
                <td className="text-right py-3 px-2">
                  ₹{expenseBreakdown.reduce((sum, item) => sum + item.amount * 0.9, 0).toFixed(0)}
                </td>
                <td className="text-right py-3 px-2">
                  ₹{totalExpenses.toLocaleString()}
                </td>
                <td className="text-right py-3 px-2 text-danger">
                  +{(totalExpenses - expenseBreakdown.reduce((sum, item) => sum + item.amount * 0.9, 0)).toFixed(0)}
                </td>
                <td className="text-right py-3 px-2">
                  {(totalExpenses / income * 100).toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </Layout>
  );
};

export default MonthlyReport;