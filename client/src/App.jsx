import { useEffect, useState } from 'react'
import './App.css'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000'

function App() {
  const [students, setStudents] = useState([])
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadStudents() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/students`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      setStudents(data)
    } catch (err) {
      setError(`Lỗi kết nối Backend: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  function resetForm() {
    setStudentId('')
    setName('')
    setEmail('')
    setEditingId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const student = {
      studentId: studentId.trim(),
      name: name.trim(),
      email: email.trim(),
    }

    if (!student.studentId || !student.name || !student.email) {
      setError('Vui lòng nhập đầy đủ MSSV, họ tên và email.')
      return
    }

    try {
      const url = editingId
        ? `${API_URL}/api/students/${editingId}`
        : `${API_URL}/api/students`

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`)
      }

      resetForm()
      await loadStudents()
    } catch (err) {
      setError(`Không thể lưu sinh viên: ${err.message}`)
    }
  }

  function handleEdit(student) {
    setStudentId(student.studentId || '')
    setName(student.name || '')
    setEmail(student.email || '')
    setEditingId(student._id)
    setError('')
  }

  async function handleDelete(id) {
    if (!window.confirm('Bạn có chắc muốn xóa sinh viên này?')) return

    setError('')

    try {
      const response = await fetch(`${API_URL}/api/students/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`)
      }

      await loadStudents()
    } catch (err) {
      setError(`Không thể xóa sinh viên: ${err.message}`)
    }
  }

  return (
    <main className="student-app">
      <h1>QUẢN LÝ SINH VIÊN</h1>
      <p className="backend-url">Backend: {API_URL}</p>

      <form className="student-form" onSubmit={handleSubmit}>
        <input
          placeholder="MSSV"
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
          required
        />
        <input
          placeholder="Họ tên"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button type="submit">
          {editingId ? 'Lưu cập nhật' : 'Thêm sinh viên'}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Hủy
          </button>
        )}
      </form>

      {error && <p className="error-message">{error}</p>}
      {loading && <p>Đang tải danh sách sinh viên...</p>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>MSSV</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading && students.length === 0 ? (
              <tr>
                <td colSpan="4">Chưa có sinh viên.</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id}>
                  <td>{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td className="actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(student)}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(student._id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default App