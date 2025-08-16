# Data Analyst Agent

An AI-powered data analysis API that uses Large Language Models to source, prepare, analyze, and visualize data.

## Features

- **AI-Powered Analysis**: Uses Google's Gemini AI to perform complex data analysis tasks
- **Data Visualization**: Generates charts and plots as base64-encoded images
- **Response Validation**: Ensures all responses meet expected formats
- **Timeout Handling**: 3-minute execution limit for all tasks
- **Error Handling**: Comprehensive error handling and logging

## API Usage

### Main Endpoint (For Testing & Evaluation)
\`\`\`
POST https://data-analyst-pkoh.onrender.com/api
\`\`\`

### Health Check Endpoint (For Monitoring)
\`\`\`
GET https://data-analyst-pkoh.onrender.com/api/health
\`\`\`

### Request Format
Send your analysis task as plain text in the request body:

\`\`\`bash
curl -X POST https://data-analyst-pkoh.onrender.com/api \
  -H "Content-Type: text/plain" \
  -d "Scrape the list of highest grossing films from Wikipedia. Answer: 1. How many $2bn movies were released before 2020? 2. Which is the earliest film that grossed over $1.5bn? 3. What's the correlation between Rank and Peak? 4. Draw a scatterplot of Rank and Peak with a dotted red regression line"
\`\`\`

### Response Format
The API returns a JSON array with your answers:

\`\`\`json
[1, "Titanic", 0.485782, "data:image/png;base64,iVBORw0KG..."]
\`\`\`

Or for object-based responses:
\`\`\`json
{
  "Which high court disposed the most cases from 2019-2022?": "Delhi High Court",
  "What's the regression slope?": 0.234,
  "Plot visualization": "data:image/png;base64,iVBORw0KG..."
}
\`\`\`

## Deployment on Render

### Quick Deploy

1. Fork this repository
2. Connect your GitHub account to Render
3. Create a new Web Service
4. Select this repository
5. Set environment variables:
   - `GEMINI_API_KEY`: Your Google AI API key
6. Deploy!

### Manual Setup

1. **Create a new Web Service on Render**
2. **Connect your repository**
3. **Configure build settings:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. **Set environment variables:**
   - `GEMINI_API_KEY`: Your Google AI API key
   - `NODE_ENV`: `production`
5. **Deploy**

### FastCron Setup (Keep-Alive Service)

To prevent Render free tier from sleeping, set up a cron job with FastCron:

1. **Go to [FastCron.com](https://www.fastcron.com/)**
2. **Create a free account**
3. **Add a new cron job:**
   - **URL**: `https://data-analyst-pkoh.onrender.com/api/health`
   - **Method**: GET
   - **Schedule**: Every 10 minutes (`*/10 * * * *`)
   - **Timeout**: 30 seconds
4. **Save and activate**

**Important**: The cron job pings the `/api/health` endpoint to keep the service alive, while the main `/api` endpoint is reserved for actual data analysis tasks and evaluation.

## Local Development

1. **Clone the repository:**
   \`\`\`bash
   git clone <your-repo-url>
   cd data-analyst-agent
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set environment variables:**
   \`\`\`bash
   # Create .env.local file
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   \`\`\`

4. **Run development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open http://localhost:3000**

## Example Tasks

### Movie Analysis
\`\`\`
Scrape the list of highest grossing films from Wikipedia. Answer:
1. How many $2bn movies were released before 2020?
2. Which is the earliest film that grossed over $1.5bn?
3. What's the correlation between Rank and Peak?
4. Draw a scatterplot of Rank and Peak with a dotted red regression line
\`\`\`

### Court Data Analysis
\`\`\`
Analyze the Indian high court judgment dataset. Answer:
1. Which high court disposed the most cases from 2019-2022?
2. What's the regression slope of date_of_registration vs decision_date delay?
3. Plot the year and number of days of delay as a scatter plot
\`\`\`

## Architecture

- **Next.js 15**: Full-stack React framework
- **Google Gemini AI**: Large language model for analysis
- **SVG Charts**: Custom visualization generation
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling

## License

MIT License - see LICENSE file for details.
