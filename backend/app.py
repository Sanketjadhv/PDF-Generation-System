from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId # Needed for fetching user data by ID
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
import io
import json

app = Flask(__name__)
CORS(app)  # Allows React Native app to connect

# --- DATABASE CONNECTION ---
# Connect to your local MongoDB instance
client = MongoClient("mongodb://localhost:27017/")
db = client['pdf_generator_db']
templates_col = db['templates']
users_col = db['users']

# Helper: JSON Path Resolver (e.g., finds "user.payDetail.total" in the JSON data)
def get_value_by_path(data, path, default):
    """Safely retrieves a value from a nested dictionary using a dot-separated path."""
    try:
        keys = path.split('.')
        current = data
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return default
        return str(current)
    except Exception:
        return default

# --- PDF GENERATION CORE LOGIC ---
def generate_pdf_buffer(template, data_source):
    """Generates the PDF content using ReportLab based on the template structure and data."""
    
    # 1. Setup
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, leftMargin=72, rightMargin=72, topMargin=50, bottomMargin=50)
    elements = []
    styles = getSampleStyleSheet()
    
    # Map text alignment strings to ReportLab enums
    align_map = {
        'Left': TA_LEFT,
        'Center': TA_CENTER,
        'Right': TA_RIGHT
    }
    
    # 2. Process Sections (Header, Body, Footer)
    for section_name in ['Header', 'Body', 'Footer']:
        section_data = template.get(section_name, [])
        
        if not section_data:
            continue
            
        # Add Section Title (only if section has content)
        if section_data:
            elements.append(Paragraph(f"<font size='16'><b>{section_name}</b></font>", styles['Heading2']))
            elements.append(Spacer(1, 12))

        data_table = []
        
        # 3. Process Fields and Apply Mapping/Alignment
        for field in section_data:
            key = field.get('key', 'Missing Key')
            mapping = field.get('mapping_field', '')
            default = field.get('default_value', 'N/A')
            alignment_str = field.get('alignment', 'Left')
            
            # Fetch value using JSON Path helper function
            value = get_value_by_path(data_source, mapping, default)
            
            # Escape HTML special characters in value to prevent rendering issues
            value = str(value).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            key_escaped = str(key).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            
            # Define the text content
            text_content = f"<b>{key_escaped}:</b> {value}"
            
            # Create Paragraph Style with specific alignment
            custom_style = ParagraphStyle(
                name=f"Style_{key}_{section_name}_{len(elements)}",
                parent=styles['Normal'],
                alignment=align_map.get(alignment_str, TA_LEFT),
                fontSize=11,
                leading=14,
                spaceAfter=6
            )
            
            # Place the content into the table data as a Paragraph
            row_content = Paragraph(text_content, custom_style)
            data_table.append([row_content])

        # 4. Create the table for this section
        if data_table:
            # Use a single column table to apply alignment to the text
            t = Table(data_table, colWidths=[500]) 
            t.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('TOPPADDING', (0,0), (-1,-1), 3),
            ]))
            elements.append(t)
            elements.append(Spacer(1, 24))

    # 5. Build and return (handle empty template case)
    if not elements:
        # Add a default message if template is empty
        elements.append(Paragraph("<b>No content to display</b>", styles['Normal']))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer

# --- API ENDPOINTS ---

@app.route('/', methods=['GET'])
def health_check():
    """Simple check to ensure the server and MongoDB connection are active."""
    return "Server is running and connected to MongoDB!", 200

# 1. Create Template (Saves JSON structure)
@app.route('/api/templates', methods=['POST'])
def create_template():
    data = request.json
    try:
        # Validate required fields
        if not data.get('name'):
            return jsonify({"error": "Template name is required"}), 400
        
        # Check if template with same name already exists
        existing = templates_col.find_one({"name": data.get('name')})
        if existing:
            return jsonify({"error": f"Template with name '{data.get('name')}' already exists"}), 400
        
        templates_col.insert_one(data)
        return jsonify({"message": "Template saved successfully", "id": str(data.get('_id', ''))}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. Get All Templates (For Preview Screen list)
@app.route('/api/templates', methods=['GET'])
def get_templates():
    # Return name and the MongoDB ID (converted to string)
    templates = list(templates_col.find({}, {'_id': 1, 'name': 1})) 
    for template in templates:
        template['_id'] = str(template['_id'])
    return jsonify(templates)

# 3. Get All Users (For Salary Dropdown)
@app.route('/api/users', methods=['GET'])
def get_users():
    # Insert Dummy Data if the collection is empty for easy testing
    if users_col.count_documents({}) == 0:
        users_col.insert_many([
            {
                "name": "Alice Johnson",
                "employee_id": "EMP-001",
                "personal": {"address": "123 Tech Lane, New York, NY 10001"},
                "company": {"name": "ABC Corporation"},
                "payDetail": {
                    "period": "January 2025",
                    "total_salary_amount": "7500 USD",
                    "basic_pay": "5000 USD",
                    "allowances": "2000 USD",
                    "deductions": "500 USD"
                },
                "generated_date": "2025-01-15",
                "note": "This is a computer-generated document."
            },
            {
                "name": "Bob Smith",
                "employee_id": "EMP-002",
                "personal": {"address": "456 Business Ave, Los Angeles, CA 90001"},
                "company": {"name": "ABC Corporation"},
                "payDetail": {
                    "period": "January 2025",
                    "total_salary_amount": "8500 USD",
                    "basic_pay": "6000 USD",
                    "allowances": "2500 USD",
                    "deductions": "0 USD"
                },
                "generated_date": "2025-01-15",
                "note": "This is a computer-generated document."
            },
            {
                "name": "Charlie Brown",
                "billDetail": {
                    "invoice_number": "INV-2025-001",
                    "date": "2025-01-15",
                    "bill_to": "Charlie Brown",
                    "description": "Web Development Services",
                    "quantity": "40",
                    "unit_price": "75 USD",
                    "amount": "3000 USD",
                    "payment_terms": "Net 30 days"
                }
            },
            {
                "name": "Diana Prince",
                "billDetail": {
                    "invoice_number": "INV-2025-002",
                    "date": "2025-01-16",
                    "bill_to": "Diana Prince",
                    "description": "Consulting Services",
                    "quantity": "20",
                    "unit_price": "100 USD",
                    "amount": "2000 USD",
                    "payment_terms": "Net 15 days"
                }
            },
            {
                "name": "Edward Wilson",
                "billDetail": {
                    "invoice_number": "BILL-2025-001",
                    "date": "2025-01-17",
                    "description": "Monthly Subscription",
                    "amount": "99 USD",
                    "tax": "8.91 USD",
                    "total": "107.91 USD",
                    "due_date": "2025-02-17"
                }
            }
        ])
    
    users = list(users_col.find({}, {'_id': 1, 'name': 1})) 
    for user in users:
        user['_id'] = str(user['_id'])
    return jsonify(users)

# 4. Generate PDF (The main execution route)
@app.route('/api/generate_pdf', methods=['POST'])
def generate_pdf_endpoint():
    try:
        req_data = request.json
        if not req_data:
            return jsonify({"error": "Request body is required"}), 400
            
        template_name = req_data.get('template_name')
        user_id = req_data.get('user_id') # Optional
        
        if not template_name:
            return jsonify({"error": "Template name is required"}), 400
        
        # 1. Fetch Template
        template = templates_col.find_one({"name": template_name})
        if not template:
            return jsonify({"error": f"Template '{template_name}' not found"}), 404

        # 2. Fetch Data Source
        data_source = {}
        if user_id:
            try:
                # MongoDB uses ObjectId for IDs
                data_source = users_col.find_one({"_id": ObjectId(user_id)}) or {}
                if not data_source:
                    # If user_id provided but not found, use empty dict (will use defaults)
                    pass
            except Exception as e:
                # Handle invalid ObjectId format
                print(f"Error fetching user: {e}")
                pass 

        # 3. Generate PDF
        pdf_buffer = generate_pdf_buffer(template, data_source)
        
        # 4. Send the PDF file back
        return send_file(
            pdf_buffer,
            as_attachment=False, # Allows the app or browser to view it directly
            mimetype='application/pdf',
            download_name=f"{template_name.replace(' ', '_')}.pdf"
        )
    except Exception as e:
        print(f"Error generating PDF: {e}")
        return jsonify({"error": f"Failed to generate PDF: {str(e)}"}), 500

if __name__ == '__main__':
    # Run on all interfaces (0.0.0.0) to allow mobile devices to connect
    # Use host='0.0.0.0' to make it accessible from other devices on the network
    app.run(debug=True, host='0.0.0.0', port=5000)