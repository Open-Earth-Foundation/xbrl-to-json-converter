# XBRL to JSON Converter 🚀

A service for converting XBRL (eXtensible Business Reporting Language) files to JSON format.

## 🌟 Features

- 📊 XBRL file processing and conversion
- 🔄 FastAPI-based REST API
- 🏗️ Modular architecture with separate services
- 🐳 Docker and Kubernetes support

## 🛠️ Usage Options

### 1️⃣ Live Deployment
The service is available as a live API at:
- API Endpoint: [https://xbrl-to-json-backend.openearth.dev/](https://xbrl-to-json-backend.openearth.dev/)
- API Documentation: [https://xbrl-to-json-backend.openearth.dev/docs#/](https://xbrl-to-json-backend.openearth.dev/docs#/)

### 2️⃣ Local Development Setup

#### Prerequisites
- Python 3.9+
- Git
- Docker 

#### Clone Repository
```bash
git clone <repository-url>
cd <repository-name>
```

#### Run with Docker:
```bash
$ docker-compose up --build # use --build only the first time you're running it
```

## 🌐 Access Points

### Local Development
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Arelle Service: `http://localhost:8001`
- API Documentation: 
  - Backend: `http://localhost:8000/docs`
  - Arelle: `http://localhost:8001/docs`

### Production
- API Endpoint: [https://xbrl-to-json-backend.openearth.dev/](https://xbrl-to-json-backend.openearth.dev/)
- API Documentation: [https://xbrl-to-json-backend.openearth.dev/docs#/](https://xbrl-to-json-backend.openearth.dev/docs#/)

## 🔍 Verification Steps

### Local Development
1. Open frontend URL in browser
2. Upload a file using Upload button
3. Download converted file

### API Usage
1. Access the API documentation at the provided URL
2. Use the interactive documentation to test endpoints
3. Integrate the API into your application using the provided endpoints

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
