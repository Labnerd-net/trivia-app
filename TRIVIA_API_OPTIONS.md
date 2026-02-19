# Free Trivia API Options

Comprehensive list of free trivia APIs that could be integrated into this application.

## Currently Implemented

### ✅ Open Trivia Database (OpenTDB)
- **URL**: https://opentdb.com/api_config.php
- **Questions**: 4,000+ community-contributed (growing daily)
- **Categories**: 24 categories
- **Difficulties**: Easy, Medium, Hard
- **Types**: Multiple Choice, True/False
- **API Key**: Not required (session token available)
- **Format**: JSON REST
- **Rate Limits**: None specified
- **Best for**: General trivia with difficulty levels and type control
- **Status**: ✅ Implemented

### ✅ The Trivia API
- **URL**: https://the-trivia-api.com/
- **Questions**: High-quality curated database
- **Categories**: 10 predefined categories (arts, film, food, geography, history, music, science, etc.)
- **Difficulties**: Easy, Medium, Hard
- **Types**: Multiple Choice
- **API Key**: Not required
- **Format**: JSON REST
- **Rate Limits**: Free for non-commercial use
- **License**: Creative Commons Attribution-NonCommercial 4.0
- **Special Features**: Region filtering (country codes), tag-based sub-categories
- **Best for**: High-quality questions with consistent formatting
- **Status**: ✅ Implemented

### ✅ jService (Jeopardy!)
- **URL**: https://jservice.io/
- **Questions**: 221,510+ from the TV show Jeopardy!
- **Categories**: 1,000+ Jeopardy categories
- **Difficulties**: Auto-calculated from dollar value
- **Types**: Jeopardy format (question → answer, no multiple choice)
- **API Key**: Not required
- **Format**: JSON REST
- **Rate Limits**: None specified
- **Special Features**: Includes airing dates, difficulty ratings, dollar values
- **Best for**: Jeopardy fans, unique Q&A format, nostalgia
- **Status**: ✅ Implemented

## Additional Free Options (Not Yet Implemented)

### API Ninjas Trivia
- **URL**: https://api-ninjas.com/api/trivia
- **Questions**: 100,000+ (premium tier)
- **Categories**: Science, literature, philosophy, and more
- **Difficulties**: Varies
- **Types**: Multiple formats
- **API Key**: Required (free tier available)
- **Format**: JSON REST
- **Rate Limits**: Free tier: 100 questions/month, 10 requests/minute
- **Premium**: $0.001 per question for 100,000+ questions
- **Best for**: Academic/educational content, large question database
- **Integration Effort**: Medium (requires API key management)

### Quiz API
- **URL**: https://quizapi.io/
- **Questions**: Technical quiz database
- **Categories**: Programming, networking, Docker, cloud computing, DevOps
- **Difficulties**: Easy, Medium, Hard
- **Types**: Multiple Choice, Multiple Answers, True/False
- **API Key**: Required (free tier available)
- **Format**: JSON REST
- **Rate Limits**: Free tier has limits
- **Special Features**: Programming language filters (PHP, Laravel, JavaScript, etc.), specific technology tags
- **Best for**: Developer/tech-focused trivia, technical interviews
- **Integration Effort**: Medium (requires API key management)

### Numbers API
- **URL**: http://numbersapi.com/
- **Questions**: Numeric trivia and facts
- **Categories**: Math, trivia, dates, years
- **Difficulties**: N/A
- **Types**: Fact-based (single answer)
- **API Key**: Not required
- **Format**: Plain text or JSON
- **Rate Limits**: None specified
- **Special Features**: Simple URL structure, great for daily fact widgets
- **Best for**: Number facts, date trivia, math trivia, daily widgets
- **Integration Effort**: Low (very simple API)
- **Example**: http://numbersapi.com/42 or http://numbersapi.com/1/31/date

### Trivia REST API (GitHub - jgoralcz/trivia)
- **URL**: https://github.com/jgoralcz/trivia
- **Questions**: 5,000+ trivia questions
- **Categories**: Multiple categories
- **Difficulties**: Easy, Medium, Hard
- **Types**: Multiple Choice, True/False
- **API Key**: Not required (if self-hosted)
- **Format**: JSON REST
- **Rate Limits**: Depends on hosting
- **Special Features**: Open source, self-hostable, customizable
- **Best for**: Full control over questions, custom modifications
- **Integration Effort**: Medium-High (requires self-hosting or finding hosted instance)

### Trivia Generator API (APIVerve)
- **URL**: https://apiverve.com/marketplace/trivia
- **Questions**: Large database
- **Categories**: Multiple categories
- **Difficulties**: Varies
- **Types**: Multiple Choice
- **API Key**: Required
- **Format**: JSON REST
- **Rate Limits**: Free tier: 50 credits/month, 10 requests/minute
- **Response Format**: Question, answer, options, category
- **Best for**: Simple trivia generation with categories
- **Integration Effort**: Medium (requires API key management)

### Will Hains' Trivia API
- **URL**: https://the-trivia-api.com/ (alternative endpoints available)
- **Questions**: Various
- **Categories**: Multiple
- **Difficulties**: Easy, Medium, Hard
- **Types**: Multiple Choice
- **API Key**: Not required
- **Format**: JSON REST
- **Rate Limits**: Reasonable free tier
- **Best for**: Additional variety
- **Integration Effort**: Low

## Evaluation Criteria for Adding New APIs

When considering adding a new trivia API provider:

### Technical Requirements
- ✅ **JSON REST API** - Must return JSON format
- ✅ **CORS Support** - Must work from browser (or proxy through Cloudflare Worker)
- ✅ **Reliability** - Stable uptime and maintained
- ✅ **Documentation** - Clear API documentation

### Feature Requirements
- ✅ **Category Support** - Ability to filter by category
- ⚠️ **Difficulty Levels** - Preferred but not required
- ⚠️ **Type Filtering** - Preferred but not required
- ✅ **Reasonable Limits** - Free tier usable for hobby projects

### User Experience
- ✅ **No Signup Required** - Or easy free tier signup
- ✅ **Fast Responses** - Low latency for good UX
- ✅ **Quality Content** - Well-formatted, accurate questions

## Implementation Priority

### High Priority (Easy Integration)
1. **Numbers API** - Very simple, unique numeric trivia
2. **Will Hains' Trivia** - Similar to existing APIs

### Medium Priority (Requires API Key)
1. **Quiz API** - Unique technical content
2. **API Ninjas** - Large question database

### Low Priority (Complex/Self-Hosted)
1. **GitHub Trivia API** - Requires self-hosting
2. **APIVerve** - Limited free tier

## Sources

- [5 Free Trivia APIs to create your own quiz app](https://keracudmore.dev/posts/2023-02-01/)
- [4 Trivia APIs (no API Key required!)](https://medium.com/@c_yatteau/4-trivia-apis-no-api-key-required-840ecf0d175)
- [The Trivia API Documentation](https://the-trivia-api.com/)
- [Quiz API - Technical Quizzes](https://quizapi.io/)
- [API Ninjas Trivia](https://api-ninjas.com/api/trivia)
- [jService API](https://jservice.io/)
- [Open Trivia Database](https://opentdb.com/)
- [Numbers API](http://numbersapi.com/)
- [GitHub - jgoralcz/trivia](https://github.com/jgoralcz/trivia)
- [RapidAPI Trivia APIs Collection](https://rapidapi.com/collection/trivia-apis)

---

Last Updated: February 16, 2026
