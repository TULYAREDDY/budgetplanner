import React, { useEffect, useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, PieChart, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    income, 
    fixedExpenses, 
    reducibleExpenses, 
    emiPlans,
    weeklySpends,
    optimizedExpenses,
    setOptimizedExpenses,
    setAlerts,
    setTips,
    goal,
    lifestyleType
  } = useBudget();
  
  const [totalFixedExpenses, setTotalFixedExpenses] = useState(0);
  const [totalReducibleExpenses, setTotalReducibleExpenses] = useState(0);
  const [totalEMI, setTotalEMI] = useState(0);
  const [balance, setBalance] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);
  const [backendConnected, setBackendConnected] = useState(true);
  const [expenseBreakdown, setExpenseBreakdown] = useState({
    'Housing & Utilities': 0,
    'Food & Groceries': 0,
    'Transportation': 0,
    'Entertainment': 0,
    'EMI Payments': 0,
    'Others': 0
  });
  const [recommendedEMIPlan, setRecommendedEMIPlan] = useState(null);
  
  // Check backend connectivity on component mount
  useEffect(() => {
    const checkBackendConnection = async () => {
      console.log("Checking backend connectivity...");
      try {
        const response = await fetch('http://localhost:5000/health');
        console.log("Backend response status:", response.status);
        if (response.ok) {
          setBackendConnected(true);
          console.log("Backend is connected.");
        } else {
          setBackendConnected(false);
          console.log("Backend returned error status.");
        }
      } catch (error) {
        setBackendConnected(false);
        console.error("Error connecting to backend:", error);
      }
    };

    checkBackendConnection();
  }, []);
  
  // Call backend /process endpoint to get optimized budget data
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const response = await fetch('http://localhost:5000/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            income,
            fixedExpenses,
            reducibleExpenses,
            emiPlans,
            weeklySpends,
            goal,
            lifestyleType: 'Moderate',
          }),
        });
        if (!response.ok) {
          throw new Error(`Backend error: ${response.statusText}`);
        }
        const data = await response.json();

        // Update state with backend response
        setOptimizedExpenses(data.optimizedExpenses || []);
        setAlerts(data.alerts || []);
        setTips(data.tips || []);
        setRecommendedEMIPlan(data.recommendedEMIPlan || null);

        // Update totals and rates from backend data
        const fixedTotal = fixedExpenses.reduce((sum: number, expense: { amount: number }) => sum + expense.amount, 0);
        const reducibleTotal = data.optimizedExpenses
          ? data.optimizedExpenses.reduce((sum: number, expense: { amount: number }) => sum + expense.amount, 0) - fixedTotal
          : 0;
        const emiTotal = emiPlans.reduce((sum: number, plan: { monthlyPayment: number }) => sum + plan.monthlyPayment, 0);
        const totalExpenses = fixedTotal + reducibleTotal + emiTotal;
        const remainingBalance = income - totalExpenses;
        const savingsPercentage = income > 0 ? (remainingBalance / income) * 100 : 0;

        setTotalFixedExpenses(fixedTotal);
        setTotalReducibleExpenses(reducibleTotal);
        setTotalEMI(emiTotal);
        setBalance(remainingBalance);
        setSavingsRate(savingsPercentage);

        // Set expense breakdown from backend or default values
        if (data.expenseBreakdown) {
          setExpenseBreakdown({
            'Housing & Utilities': data.expenseBreakdown['Housing & Utilities'] || 0,
            'Food & Groceries': data.expenseBreakdown['Food & Groceries'] || 0,
            'Transportation': data.expenseBreakdown['Transportation'] || 0,
            'Entertainment': data.expenseBreakdown['Entertainment'] || 0,
            'EMI Payments': data.expenseBreakdown['EMI Payments'] || emiTotal,
            'Others': data.expenseBreakdown['Others'] || 0
          });
        } else {
          // Default fallback values
          setExpenseBreakdown({
            'Housing & Utilities': 0,
            'Food & Groceries': 0,
            'Transportation': 0,
            'Entertainment': 0,
            'EMI Payments': emiTotal,
            'Others': 0
          });
        }
      } catch (error) {
        console.error('Error fetching backend data:', error);
        // Optionally set error state here
      }
    };

    fetchBackendData();
  }, [income, fixedExpenses, reducibleExpenses, emiPlans, weeklySpends, goal, setOptimizedExpenses, setAlerts, setTips, expenseBreakdown, totalFixedExpenses, totalReducibleExpenses, totalEMI]);
  
  // Prepare data for expense breakdown pie chart
  const expenseBreakdownData = {
    labels: Object.keys(expenseBreakdown),
    datasets: [
      {
        data: Object.values(expenseBreakdown),
        backgroundColor: ['#4dabf7', '#63e6be', '#ffa94d', '#ff6b6b', '#ffa94d', '#adb5bd'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };
  
  // Prepare data for income vs expenses bar chart
  const incomeVsExpensesData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [income, totalFixedExpenses + totalReducibleExpenses + totalEMI],
        backgroundColor: ['#51cf66', '#ff6b6b'],
      },
    ],
  };
  
  // Prepare data for weekly spending trend
  const last4Weeks = weeklySpends.slice(-4);
  const weeklyTrendData = {
    labels: last4Weeks.map(week => `Week ${week.week}`),
    datasets: [
      {
        label: 'Weekly Spending (₹)',
        data: last4Weeks.map(week => week.amount),
        backgroundColor: '#4dabf7',
      },
    ],
  };
  
  return (
    <Layout title="Dashboard">
      {!backendConnected && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> Unable to connect to the backend service. Please check your connection.</span>
        </div>
      )}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-primary/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Monthly Income</p>
              <h3 className="text-2xl font-bold">₹{income.toLocaleString()}</h3>
            </div>
            <div className="bg-primary/20 p-2 rounded-lg">
              <Wallet size={24} className="text-primary" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-secondary/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Total Expenses</p>
              <h3 className="text-2xl font-bold">₹{(totalFixedExpenses + totalReducibleExpenses + totalEMI).toLocaleString()}</h3>
            </div>
            <div className="bg-secondary/20 p-2 rounded-lg">
              <TrendingDown size={24} className="text-secondary" />
            </div>
          </div>
        </Card>
        
        <Card className={`${balance >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Monthly Balance</p>
              <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
                ₹{balance.toLocaleString()}
              </h3>
            </div>
            <div className={`${balance >= 0 ? 'bg-success/20' : 'bg-danger/20'} p-2 rounded-lg`}>
              {balance >= 0 ? (
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
              <p className="text-gray-600 mb-1">Savings Rate</p>
              <h3 className="text-2xl font-bold">{savingsRate.toFixed(1)}%</h3>
            </div>
            <div className="bg-gray-200 p-2 rounded-lg">
              <PieChart size={24} className="text-gray-700" />
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
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>
      
      {/* Alerts and Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Weekly Spending Trend" className="lg:col-span-2">
          {weeklySpends.length > 0 ? (
            <div className="h-64">
              <Bar 
                data={weeklyTrendData}
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
          ) : (
            <p className="text-gray-500 italic">No weekly spending data available yet.</p>
          )}
        </Card>
        
        <div className="space-y-6">
          <Card title="Budget Alerts" className="bg-warning/10">
            {optimizedExpenses ? (
              <ul className="space-y-2">
                {optimizedExpenses.length > 0 && balance < 0 && (
                  <li className="flex items-start">
                    <AlertTriangle size={18} className="text-danger mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Your expenses exceed your income by ₹{Math.abs(balance).toLocaleString()}.</p>
                  </li>
                )}
                {savingsRate < 20 && savingsRate >= 0 && (
                  <li className="flex items-start">
                    <AlertTriangle size={18} className="text-warning mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Your savings rate is {savingsRate.toFixed(1)}%, below the recommended 20%.</p>
                  </li>
                )}
                {totalEMI > income * 0.4 && (
                  <li className="flex items-start">
                    <AlertTriangle size={18} className="text-danger mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">EMI payments are {((totalEMI / income) * 100).toFixed(1)}% of income, exceeding the 40% threshold.</p>
                  </li>
                )}
                {optimizedExpenses.length > 0 && balance >= 0 && savingsRate >= 20 && totalEMI <= income * 0.4 && (
                  <li className="flex items-start">
                    <AlertTriangle size={18} className="text-success mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Your budget looks healthy! Keep up the good work.</p>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Loading budget analysis...</p>
            )}
          </Card>
          
          <Card title="Smart Tips">
            <ul className="space-y-2">
              <li className="text-sm pb-2 border-b border-gray-100">
                Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.
              </li>
              <li className="text-sm pb-2 border-b border-gray-100">
                Review your subscriptions and cancel those you don't use regularly.
              </li>
              <li className="text-sm">
                Consider automating your savings by setting up automatic transfers.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
