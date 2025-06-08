from typing import List, Dict, Tuple

def greedy_optimizer(reducible_expenses: List[Dict], savings_goal: float) -> Tuple[List[Dict], Dict]:
    """
    Reduce reducible expenses based on priority caps until savings goal is reached.
    Priority caps:
        Low: 70% reduction max
        Medium: 40% reduction max
        High: 10% reduction max
    Stops once savings goal is reached.
    Returns modified expense list and status dict.
    """
    priority_caps = {
        'Low': 0.7,
        'Medium': 0.4,
        'High': 0.1
    }
    
    total_reduction = 0.0
    optimized_expenses = []
    
    for expense in reducible_expenses:
        if expense.get('isLocked', False):
            # Locked expenses are not reduced
            optimized_expenses.append(expense)
            continue
        
        priority = expense.get('priority', 'Medium')
        cap = priority_caps.get(priority, 0.4)
        original_amount = expense['amount']
        
        # Calculate max reduction allowed
        max_reduction = original_amount * cap
        
        # Calculate needed reduction to reach savings goal
        needed_reduction = savings_goal - total_reduction
        reduction = min(max_reduction, needed_reduction)
        
        new_amount = original_amount - reduction
        total_reduction += reduction
        
        optimized_expense = expense.copy()
        optimized_expense['amount'] = round(new_amount, 2)
        optimized_expenses.append(optimized_expense)
        
        if total_reduction >= savings_goal:
            # Savings goal reached, append remaining expenses as is
            idx = reducible_expenses.index(expense)
            optimized_expenses.extend(reducible_expenses[idx+1:])
            break
    
    status = {
        'total_reduction': round(total_reduction, 2),
        'savings_goal_reached': total_reduction >= savings_goal
    }
    
    return optimized_expenses, status
