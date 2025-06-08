from flask import Flask, render_template, request, jsonify
from logic.greedy_optimizer import greedy_optimizer
from logic.dp_emi_selector import dp_emi_selector
from logic.decision_tree_advice import decision_tree_advice
from logic.backtrack_expenses import backtrack_expenses
from typing import List, Dict
import json
import google.generativeai as genai
from datetime import datetime
import os
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    print("Warning: GOOGLE_API_KEY not found in environment variables. AI analysis will be disabled.")
    GOOGLE_API_KEY = "dummy_key"

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

app = Flask(__name__)

def get_ai_advice(expenses: List[Dict], salary: float, emi_plans: List[Dict], bank_statement: Dict = None) -> Dict:
    """Get AI-powered financial advice using Gemini API."""
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    if GOOGLE_API_KEY == "dummy_key":
        return {
            'detailed_analysis': "Smart Model analysis is disabled. Please set GOOGLE_API_KEY in .env file to enable analysis.",
            'timestamp': current_time
        }
    
    prompt = f"""
    Analyze the following financial situation and provide structured advice. Your response MUST be a JSON array of objects. Each object in the array should represent a section and MUST have two keys:
    - `header`: A string for the section title (e.g., "1. Budget Analysis").
    - `body`: A multi-line string for the detailed content of that section.

    Here is the financial data:
    Monthly Salary: ₹{salary:,.2f}
    
    Current Expenses:
    {json.dumps(expenses, indent=2)}
    
    EMI Plans:
    {json.dumps(emi_plans, indent=2)}
    """
    
    if bank_statement:
        prompt += f"""
        
    Bank Statement Analysis:
    {json.dumps(bank_statement, indent=2)}
    """
    
    prompt += """
    Ensure your response includes sections on:
    1. Budget Analysis
    2. Expense Optimization Suggestions
    3. Investment Recommendations
    4. Emergency Fund Advice
    5. Long-Term Financial Planning
    6. Transaction Pattern Analysis
    7. Spending Behavior Insights
    8. Cash Flow Optimization
    9. Banking Product Recommendations
    
    Each section should be concise and actionable. Ensure the JSON is valid.
    """
    
    try:
        response = model.generate_content(prompt)
        raw_gemini_text = response.text

        # Attempt to extract JSON from a markdown code block using string slicing for robustness
        json_start_tag = "```json"
        json_end_tag = "```"

        start_index = raw_gemini_text.find(json_start_tag)
        if start_index != -1:
            # Adjust start_index to point right after the ```json marker
            start_index += len(json_start_tag)
            end_index = raw_gemini_text.rfind(json_end_tag, start_index)
            
            if end_index != -1:
                json_string = raw_gemini_text[start_index:end_index].strip()
                
                if json_string:
                    try:
                        parsed_response = json.loads(json_string)
                        return {
                            'detailed_analysis': parsed_response,
                            'timestamp': current_time
                        }
                    except json.JSONDecodeError as e:
                        return {
                            'detailed_analysis': f"AI response contained JSON markdown, but parsing failed (JSONDecodeError: {str(e)}). Extracted JSON string: '{json_string}'. Raw Gemini text: {raw_gemini_text}",
                            'timestamp': current_time,
                            'error': "JSON parsing failed"
                        }
                else:
                    return {
                        'detailed_analysis': f"AI response contained an empty JSON markdown block. Raw Gemini text: {raw_gemini_text}",
                        'timestamp': current_time,
                        'error': "Empty JSON block"
                    }
            else:
                return {
                    'detailed_analysis': f"AI response contained ```json but no closing ```. Raw Gemini text: {raw_gemini_text}",
                    'timestamp': current_time,
                    'error': "Missing closing JSON markdown fence"
                }
        else:
            return {
                'detailed_analysis': f"AI response not in expected ```json``` markdown format. Raw Gemini text: {raw_gemini_text}",
                'timestamp': current_time,
                'error': "JSON markdown not found"
            }
    except Exception as e:
        return {
            'detailed_analysis': f"Unable to get Smart Model analysis from Gemini at this time. Error: {str(e)}",
            'timestamp': current_time,
            'error': "Gemini API call failed"
        }

def format_currency(amount: float) -> str:
    """Format amount as Indian currency."""
    return f"₹{amount:,.2f}"

def analyze_expenses_by_category(expenses: List[Dict]) -> Dict:
    """Analyze expenses by category."""
    category_totals = {}
    for expense in expenses:
        category = expense['category']
        if category not in category_totals:
            category_totals[category] = 0
        category_totals[category] += expense['amount']
    return category_totals

def save_results_to_json(results: Dict, user_name: str):
    """Save results to a JSON file."""
    safe_filename = "".join(c for c in user_name if c.isalnum() or c in (' ', '-', '_')).strip()
    safe_filename = safe_filename.replace(' ', '_').lower()
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{safe_filename}_{timestamp}.json"
    
    try:
        if 'smart_model_summary' in results and 'formatted_analysis' in results['smart_model_summary']:
            formatted_text = results['smart_model_summary']['formatted_analysis']
            formatted_text = formatted_text.replace('\n', '\\n').replace('"', '\\"')
            results['smart_model_summary']['formatted_analysis'] = formatted_text
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        content = content.replace('\\n', '\n')
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
            
        return filename
    except Exception as e:
        return None

@app.route('/')
def index():
    """Render the main page."""
    # Get list of available bank statements
    bank_statements = [f for f in os.listdir('bank') if f.endswith('.json')]
    
    # Generate a unique version string for cache busting
    current_time_version = datetime.now().timestamp()
    
    return render_template('index.html', bank_statements=bank_statements, current_time_version=current_time_version)

@app.route('/get_bank_statement/<filename>')
def get_bank_statement(filename):
    """Get bank statement data."""
    try:
        with open(os.path.join('bank', filename), 'r') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze financial data and return results."""
    try:
        data = request.json
        user_name = data.get('user_name', 'user_' + datetime.now().strftime("%Y%m%d_%H%M%S"))
        salary = float(data.get('salary', 0))
        expenses = data.get('expenses', [])
        emi_plans = data.get('emi_plans', [])
        bank_statement = data.get('bank_statement')
        
        # Separate fixed and reducible expenses
        fixed_expenses = [exp for exp in expenses if exp.get('expense_type') == 'Fixed']
        reducible_expenses = [exp for exp in expenses if exp.get('expense_type') == 'Reducible']

        # Run optimization only on reducible expenses
        optimized_reducible_expenses, status = greedy_optimizer(reducible_expenses, salary)

        # Merge fixed expenses back with optimized reducible expenses
        optimized_expenses = fixed_expenses + optimized_reducible_expenses

        emi_recommendation = dp_emi_selector(emi_plans, salary)
        advice = decision_tree_advice(optimized_expenses, emi_recommendation, salary)

        # Get AI advice
        ai_advice = get_ai_advice(optimized_expenses, salary, emi_plans, bank_statement)

        # Prepare results
        results = {
            'user_name': user_name,
            'salary': salary,
            'optimized_expenses': optimized_expenses,
            'emi_recommendation': emi_recommendation,
            'advice': advice,
            'smart_model_summary': ai_advice,
            'bank_statement': bank_statement
        }

        # Save results to JSON
        filename = save_results_to_json(results, user_name)

        return jsonify({
            'success': True,
            'results': results,
            'filename': filename
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True) 