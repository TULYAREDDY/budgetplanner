from flask import Flask, request, jsonify
from flask_cors import CORS
from logic.greedy_optimizer import greedy_optimizer
from logic.backtrack_expenses import backtrack_expenses
from logic.dp_emi_selector import dp_emi_selector
from logic.decision_tree_advice import decision_tree_advice

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health_check():
    print("Received health check request")
    return jsonify({"status": "ok"})

@app.route('/process', methods=['POST'])
def process_budget():
    data = request.get_json()
    
    # Extract input data
    income = data.get('income', 0)
    fixed_expenses = data.get('fixedExpenses', [])
    reducible_expenses = data.get('reducibleExpenses', [])
    emi_plans = data.get('emiPlans', [])
    weekly_spends = data.get('weeklySpends', [])
    goal = data.get('goal', None)
    lifestyle_type = data.get('lifestyleType', 'Moderate')
    
    # Calculate total expenses
    total_fixed = sum(e['amount'] for e in fixed_expenses)
    total_reducible = sum(e['amount'] for e in reducible_expenses)
    total_emi = sum(e['monthlyPayment'] for e in emi_plans)
    total_expenses = total_fixed + total_reducible + total_emi
    balance = income - total_expenses
    
    # Define savings goal amount (if goal provided)
    savings_goal = 0
    if goal and 'targetAmount' in goal:
        # Use goal targetAmount as savings goal, not targetAmount - balance
        savings_goal = max(0, goal['targetAmount'])
    
    # Run greedy optimizer
    optimized_expenses, status = greedy_optimizer(reducible_expenses, savings_goal)

    # If greedy fails to reach goal, run backtracking
    if not status['savings_goal_reached']:
        optimized_expenses, backtrack_success = backtrack_expenses(reducible_expenses, savings_goal)
        if not backtrack_success:
            # If backtracking also fails, fallback to greedy result
            optimized_expenses, _ = greedy_optimizer(reducible_expenses, 0)

    # Combine fixed and optimized reducible expenses
    combined_expenses = fixed_expenses + optimized_expenses

    # Run EMI selector
    emi_selection = dp_emi_selector(emi_plans, income)
    recommended_emi_plan = emi_selection.get('best_plan', None)

    # Generate alerts and tips
    print("DEBUG: combined_expenses:", combined_expenses)
    print("DEBUG: recommended_emi_plan:", recommended_emi_plan)
    print("DEBUG: income:", income)
    advice = decision_tree_advice(combined_expenses, recommended_emi_plan, income)
    print("DEBUG: advice alerts:", advice.get('alerts', []))

    # Calculate financial metrics
    total_optimized = sum(e['amount'] for e in combined_expenses)
    optimized_balance = income - total_optimized
    savings_rate = (optimized_balance / income) * 100 if income > 0 else 0

    # Expense breakdown by category (simplified)
    expense_breakdown = {
        'Housing & Utilities': 0,
        'Food & Groceries': 0,
        'Transportation': 0,
        'Entertainment': 0,
        'EMI Payments': total_emi,
        'Others': 0
    }
    # Use combined_expenses for breakdown instead of fixed_expenses and reducible_expenses separately
    for e in combined_expenses:
        name = e.get('name', '').lower()
        amount = e.get('amount', 0)
        if 'rent' in name or 'utility' in name:
            expense_breakdown['Housing & Utilities'] += amount
        elif 'food' in name or 'grocery' in name:
            expense_breakdown['Food & Groceries'] += amount
        elif 'transport' in name or 'fuel' in name:
            expense_breakdown['Transportation'] += amount
        elif 'entertainment' in name or 'subscription' in name:
            expense_breakdown['Entertainment'] += amount
        else:
            expense_breakdown['Others'] += amount

    # Calculate savings progress
    savings_progress = 0
    if goal and goal.get('targetAmount', 0) > 0:
        savings_progress = min(100, (optimized_balance / goal['targetAmount']) * 100)

    # Calculate financial score (simplified)
    emi_ratio = total_emi / income if income > 0 else 0
    financial_score = 0
    financial_score += min(40, savings_rate * 2)
    financial_score += 30 if optimized_balance > 0 else max(0, 30 + (optimized_balance / income) * 30)
    financial_score += 20 if emi_ratio <= 0.3 else max(0, 20 - ((emi_ratio - 0.3) * 100))
    # Weekly spending consistency score omitted for simplicity

    response = {
        'optimizedExpenses': combined_expenses,
        'recommendedEMIPlan': recommended_emi_plan,
        'alerts': advice.get('alerts', []),
        'tips': advice.get('tips', []),
        'savingsRate': round(savings_rate, 2),
        'monthlyBalance': round(optimized_balance, 2),
        'financialScore': round(financial_score, 2),
        'expenseBreakdown': expense_breakdown,
        'savingsProgress': round(savings_progress, 2)
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
