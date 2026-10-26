# Kratos Systems CRM

Internal CRM for Kratos Systems Ltd — client pipeline management, AI-powered meeting intelligence, automated proposals & invoicing.

## Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Auth**: Clerk (RBAC — Admin / BD / Developer roles)
- **Backend**: Django 5 + Django REST Framework + Django Unfold (admin)
- **Database**: PostgreSQL
- **File Storage**: Cloudflare R2
- **Automation**: n8n (self-hosted)
- **Meeting Bot**: Recall.ai (Zoom + Google Meet + Teams)
- **Transcription**: AssemblyAI
- **AI**: Claude API (Anthropic)
- **Email**: Resend
- **Invoicing**: eTIMS + custom PDF

## Project Structure
```
KratosSystemsCRM/
├── frontend/          # Next.js 15 app
└── backend/           # Django REST API
    └── venv/          # Python virtual environment
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Backend
```bash
cd backend
source venv/bin/activate
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Roles
| Role | Access |
|------|--------|
| `admin` | Full CRM + Django Unfold admin panel |
| `bd` | Hit List, Pipeline, Proposals, Client Sessions |
| `developer` | Assigned client profiles, Sessions, Build tracker |
