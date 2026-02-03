# Telelog Analytics 📊

AI-powered analytics dashboard for Telegram data. Analyze conversations, track engagement metrics, and gain insights from your Telegram activity using OpenAI and Anthropic AI models.

## Features

- 📈 **Conversation Analytics** - Analyze message patterns and engagement
- 🤖 **Multi-AI Support** - Powered by OpenAI GPT-4 and Anthropic Claude
- 📊 **Interactive Charts** - Beautiful visualizations with Recharts
- 🔐 **Secure Authentication** - User accounts with Supabase Auth
- 💾 **Cloud Storage** - All data stored securely in Supabase
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI Components:** shadcn/ui, Radix UI
- **Styling:** Tailwind CSS
- **AI Models:** OpenAI GPT-4, Anthropic Claude
- **Backend:** Supabase (Auth, Database, Storage)
- **Charts:** Recharts
- **State Management:** TanStack Query
- **Routing:** React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- OpenAI API key
- Anthropic API key (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/magnusfroste/telelog-analytics.git
cd telelog-analytics
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
VITE_OPENAI_API_KEY=your-openai-api-key-here
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Set up authentication (Email/Password or OAuth)
3. Create the necessary database tables for storing analytics data
4. Copy your project URL and anon key to `.env`

### AI API Setup

**OpenAI:**
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add the API key to `.env`

**Anthropic (Optional):**
1. Get an API key from [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Add the API key to `.env`

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## How It Works

1. **Import Data** - Upload your Telegram export data
2. **AI Analysis** - AI models analyze conversation patterns and sentiment
3. **View Insights** - Interactive dashboards show key metrics
4. **Track Trends** - Monitor changes over time

## Project Structure

```
telelog-analytics/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and API clients
│   └── pages/          # Page components
└── public/             # Static assets
```

## Features in Detail

### Analytics Dashboard
- Message frequency analysis
- Response time metrics
- Sentiment analysis
- User engagement tracking

### AI-Powered Insights
- Conversation topic extraction
- Sentiment trends
- Key phrase identification
- Automated summaries

## License

MIT License - feel free to use this for your own analytics projects!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue on GitHub.

## Privacy

This tool processes Telegram data locally and only sends anonymized data to AI APIs for analysis. No personal data is stored without your consent.
