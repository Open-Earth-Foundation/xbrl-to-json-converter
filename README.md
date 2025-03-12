# ESRS Analysis Tool 🚀

Interactive tool for analyzing and exploring European Sustainability Reporting Standards (ESRS) documents using AI assistance.

## 🌟 Features

- 📊 XBRL file processing and conversion
- 💬 AI-powered chat interface
- 📚 ESRS documentation browser
- 🔄 Real-time WebSocket communication
- 🎨 Modern React + TypeScript UI

## 🛠️ Local Development Setup

### Prerequisites

- Python 3.9+
- Node.js 16+
- Git

### 1️⃣ Clone Repository
```bash
git clone <repository-url>
cd <repository-name>
```

### 2️⃣Run with Docker:

```bash
$ docker-compose up --build # use --build only the first time you're running it
```

### 2️⃣ Backend Setup

Create and activate virtual environment:
```bash
# Windows
cd backend
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies and run:
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### 3️⃣ Arelle Service Setup

Create new virtual environment:
```bash
cd arelle_service
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies and run:
```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

### 4️⃣ Frontend Setup
```bash
cd ..
cd client
npm install
npm run dev
```

## 🌐 Access Points

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Arelle Service: `http://localhost:8001`
- API Documentation: 
  - Backend: `http://localhost:8000/docs`
  - Arelle: `http://localhost:8001/docs`

## 🔍 Verification Steps

1. Open frontend URL in browser
2. Confirm WebSocket connection
3. Test file upload functionality
4. Try AI chat interface

## ⚠️ Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check if ports are in use
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # macOS/Linux
```

#### Virtual Environment
```bash
# Verify active environment
pip list
```

#### CORS Issues
Check `backend/app.py` for CORS settings:
```python
origins = [
    "http://localhost:3000",
    "http://localhost:5173"
]
```

## 📦 Docker Reference Commands

Backend:
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

Arelle Service:
```bash
uvicorn app:app --host 0.0.0.0 --port 8001
```

Frontend:
```bash
npm run dev
```

## 🏗️ Project Structure
```
├── backend/               # FastAPI backend service
├── arelle_service/        # XBRL processing service
├── client/               # React frontend
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📝 License

[MIT License](LICENSE)

## 📧 Contact

For support or queries, please open an issue in the repository.

---
Made with ❤️ by [Your Name/Team]
