import sqlite3
from flask import Flask, request, jsonify, render_template

app = Flask(__name__, template_folder='templates', static_folder='static')
DATABASE = 'nextcampus.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

@app.route('/')
def index():
    return render_template('index.html')

# GET /api/students - List & Search
@app.route('/api/students', methods=['GET'])
def get_students():
    query = request.args.get('q', '').strip()
    db = get_db()
    if query:
        search_pattern = f'%{query}%'
        cursor = db.execute(
            "SELECT * FROM students WHERE name LIKE ? OR roll_no LIKE ? ORDER BY id DESC",
            (search_pattern, search_pattern)
        )
    else:
        cursor = db.execute("SELECT * FROM students ORDER BY id DESC")
    
    students = [dict(row) for row in cursor.fetchall()]
    return jsonify(students)

# POST /api/students - Add New Student
@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.get_json()
    if not data or not data.get('roll_no') or not data.get('name'):
        return jsonify({'error': 'Roll Number and Name are required'}), 400

    db = get_db()
    # Check duplicate roll number
    existing = db.execute("SELECT id FROM students WHERE roll_no = ?", (data['roll_no'],)).fetchone()
    if existing:
        return jsonify({'error': 'Duplicate Roll Number. Record already exists.'}), 400

    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO students (roll_no, name, student_class, marks, contact, email) VALUES (?, ?, ?, ?, ?, ?)",
            (data['roll_no'], data['name'], data['student_class'], data['marks'], data['contact'], data.get('email', ''))
        )
        db.commit()
        return jsonify({'message': 'Student record created successfully', 'id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# PUT /api/students/<id> - Update Record
@app.route('/api/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.get_json()
    db = get_db()
    
    student = db.execute("SELECT id FROM students WHERE id = ?", (student_id,)).fetchone()
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    db.execute(
        "UPDATE students SET roll_no=?, name=?, student_class=?, marks=?, contact=?, email=? WHERE id=?",
        (data['roll_no'], data['name'], data['student_class'], data['marks'], data['contact'], data.get('email', ''), student_id)
    )
    db.commit()
    return jsonify({'message': 'Student updated successfully'})

# DELETE /api/students/<id> - Delete Record
@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    db = get_db()
    db.execute("DELETE FROM students WHERE id = ?", (student_id,))
    db.commit()
    return jsonify({'message': 'Student deleted successfully'})

if __name__ == '__main__':
    # Initialize SQLite table on startup if needed
    try:
        init_db()
    except Exception:
        pass
    app.run(debug=True, port=5000)