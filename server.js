require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Student = require('./models/Student');

const app = express();

// Middleware
app.use(express.json());

// Cấu hình CORS cho Frontend trên Render và môi trường local
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Cho phép request không có Origin và các Origin đã được khai báo
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origin không được phép bởi CORS'));
    },
    credentials: true
}));

// Kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log('Đã kết nối MongoDB thành công');
        })
        .catch((err) => {
            console.error('Lỗi kết nối MongoDB:', err.message);
        });
} else {
    console.error('Chưa cấu hình MONGO_URI hoặc MONGODB_URI');
}

// Trang kiểm tra Backend
app.get('/', (req, res) => {
    res.json({
        message: 'Backend đang hoạt động!'
    });
});

// API kiểm tra
app.get('/api/hello', (req, res) => {
    res.json({
        message: 'Hello from Backend Docker!'
    });
});

// Lấy danh sách sinh viên
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({
            message: 'Lỗi lấy danh sách sinh viên',
            error: err.message
        });
    }
});

// Thêm sinh viên
app.post('/api/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        const savedStudent = await student.save();

        res.status(201).json(savedStudent);
    } catch (err) {
        res.status(400).json({
            message: 'Lỗi thêm sinh viên',
            error: err.message
        });
    }
});

// Cập nhật sinh viên
app.put('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                message: 'Không tìm thấy sinh viên'
            });
        }

        res.json(student);
    } catch (err) {
        res.status(400).json({
            message: 'Lỗi cập nhật sinh viên',
            error: err.message
        });
    }
});

// Xóa sinh viên
app.delete("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Không tìm thấy sinh viên"
            });
        }

        res.json({
            message: "Xóa sinh viên thành công",
            student
        });
    } catch (err) {
        res.status(400).json({
            message: "Lỗi xóa sinh viên",
            error: err.message
        });
    }
});

// Khởi động Server
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng ${PORT}`);
});
