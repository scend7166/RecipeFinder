# RecipeFinder

A web application that takes up to 3 photos of cooking ingredients as input and returns a list of possible meal recipes to build with those ingredients.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Python + Django + Django REST Framework
- **AI Integration**: OpenAI GPT-4 Vision API
- **Deployment**: Vercel

## Features (MVP)

- Upload up to 3 photos of ingredients with format validation (jpg, png, bmp)
- AI-powered ingredient recognition from images
- Generate 3 recipe suggestions based on identified ingredients
- Modern, responsive UI

## Project Structure

```
RecipeFinder/
├── frontend/          # React/TypeScript app
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/           # Django API
│   ├── recipefinder/  # Django project
│   ├── api/           # Django app
│   ├── requirements.txt
│   └── manage.py
├── .gitignore
├── vercel.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   SECRET_KEY=your_django_secret_key_here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Environment Variables

### Backend (.env)
- `OPENAI_API_KEY`: Your OpenAI API key
- `SECRET_KEY`: Django secret key
- `DEBUG`: Set to True for development
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts

## API Endpoints

- `POST /api/upload/` - Upload ingredient images
- `POST /api/analyze/` - Analyze images and get ingredients
- `POST /api/recipes/` - Generate recipes from ingredients

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `SECRET_KEY`

## Development Workflow

1. Start backend server: `cd backend && python manage.py runserver`
2. Start frontend server: `cd frontend && npm run dev`
3. Open `http://localhost:5173` in your browser

## Edge Cases Considered

- **Image Quality**: Handles poor lighting, blurry images, unclear ingredients
- **File Size Limits**: Validates file sizes and formats
- **API Rate Limits**: Implements error handling for OpenAI API limits
- **Error Handling**: Graceful fallbacks for AI failures
- **Cost Management**: Consider implementing usage limits for production
- **Network Issues**: Handles upload failures and API timeouts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
