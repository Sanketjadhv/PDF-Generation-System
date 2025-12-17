"""
Script to seed the database with sample PDF templates.
Run this script to add pre-configured templates for Salary Slip, Invoice, and Bill.
"""

from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['pdf_generator_db']
templates_col = db['templates']

# Sample templates
templates = [
    {
        "name": "Salary Slip",
        "Header": [
            {
                "key": "Company Name",
                "mapping_field": "company.name",
                "default_value": "ABC Corporation",
                "alignment": "Center"
            },
            {
                "key": "Employee Name",
                "mapping_field": "name",
                "default_value": "N/A",
                "alignment": "Left"
            },
            {
                "key": "Employee ID",
                "mapping_field": "employee_id",
                "default_value": "N/A",
                "alignment": "Left"
            },
            {
                "key": "Pay Period",
                "mapping_field": "payDetail.period",
                "default_value": "Monthly",
                "alignment": "Right"
            }
        ],
        "Body": [
            {
                "key": "Basic Pay",
                "mapping_field": "payDetail.basic_pay",
                "default_value": "0 USD",
                "alignment": "Left"
            },
            {
                "key": "Allowances",
                "mapping_field": "payDetail.allowances",
                "default_value": "0 USD",
                "alignment": "Left"
            },
            {
                "key": "Deductions",
                "mapping_field": "payDetail.deductions",
                "default_value": "0 USD",
                "alignment": "Left"
            },
            {
                "key": "Total Salary Amount",
                "mapping_field": "payDetail.total_salary_amount",
                "default_value": "0 USD",
                "alignment": "Right"
            },
            {
                "key": "Address",
                "mapping_field": "personal.address",
                "default_value": "Not provided",
                "alignment": "Left"
            }
        ],
        "Footer": [
            {
                "key": "Generated Date",
                "mapping_field": "generated_date",
                "default_value": "N/A",
                "alignment": "Center"
            },
            {
                "key": "Note",
                "mapping_field": "note",
                "default_value": "This is a computer-generated document.",
                "alignment": "Center"
            }
        ]
    },
    {
        "name": "Invoice",
        "Header": [
            {
                "key": "INVOICE",
                "mapping_field": "invoice.title",
                "default_value": "INVOICE",
                "alignment": "Center"
            },
            {
                "key": "Invoice Number",
                "mapping_field": "billDetail.invoice_number",
                "default_value": "INV-0000",
                "alignment": "Left"
            },
            {
                "key": "Date",
                "mapping_field": "billDetail.date",
                "default_value": "N/A",
                "alignment": "Right"
            },
            {
                "key": "Bill To",
                "mapping_field": "billDetail.bill_to",
                "default_value": "Customer Name",
                "alignment": "Left"
            }
        ],
        "Body": [
            {
                "key": "Description",
                "mapping_field": "billDetail.description",
                "default_value": "Service/Product",
                "alignment": "Left"
            },
            {
                "key": "Quantity",
                "mapping_field": "billDetail.quantity",
                "default_value": "1",
                "alignment": "Center"
            },
            {
                "key": "Unit Price",
                "mapping_field": "billDetail.unit_price",
                "default_value": "0 USD",
                "alignment": "Right"
            },
            {
                "key": "Total Amount",
                "mapping_field": "billDetail.amount",
                "default_value": "0 USD",
                "alignment": "Right"
            }
        ],
        "Footer": [
            {
                "key": "Payment Terms",
                "mapping_field": "billDetail.payment_terms",
                "default_value": "Net 30 days",
                "alignment": "Left"
            },
            {
                "key": "Thank you for your business!",
                "mapping_field": "",
                "default_value": "Thank you for your business!",
                "alignment": "Center"
            }
        ]
    },
    {
        "name": "Bill",
        "Header": [
            {
                "key": "BILL",
                "mapping_field": "bill.title",
                "default_value": "BILL",
                "alignment": "Center"
            },
            {
                "key": "Bill Number",
                "mapping_field": "billDetail.invoice_number",
                "default_value": "BILL-0000",
                "alignment": "Left"
            },
            {
                "key": "Date",
                "mapping_field": "billDetail.date",
                "default_value": "N/A",
                "alignment": "Right"
            }
        ],
        "Body": [
            {
                "key": "Item Description",
                "mapping_field": "billDetail.description",
                "default_value": "Item/Service",
                "alignment": "Left"
            },
            {
                "key": "Amount",
                "mapping_field": "billDetail.amount",
                "default_value": "0 USD",
                "alignment": "Right"
            },
            {
                "key": "Tax",
                "mapping_field": "billDetail.tax",
                "default_value": "0 USD",
                "alignment": "Right"
            },
            {
                "key": "Total",
                "mapping_field": "billDetail.total",
                "default_value": "0 USD",
                "alignment": "Right"
            }
        ],
        "Footer": [
            {
                "key": "Payment Due Date",
                "mapping_field": "billDetail.due_date",
                "default_value": "N/A",
                "alignment": "Left"
            },
            {
                "key": "Please pay within the due date",
                "mapping_field": "",
                "default_value": "Please pay within the due date",
                "alignment": "Center"
            }
        ]
    }
]

def seed_templates():
    """Add sample templates to the database."""
    print("Seeding templates...")
    
    for template in templates:
        # Check if template already exists
        existing = templates_col.find_one({"name": template["name"]})
        if existing:
            print(f"Template '{template['name']}' already exists. Skipping...")
            continue
        
        # Insert template
        result = templates_col.insert_one(template)
        print(f"[OK] Added template: {template['name']} (ID: {result.inserted_id})")
    
    print("\nTemplates seeding completed!")
    print(f"Total templates in database: {templates_col.count_documents({})}")

if __name__ == '__main__':
    try:
        seed_templates()
    except Exception as e:
        print(f"Error seeding templates: {e}")

