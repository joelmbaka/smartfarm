# Crop Advisor

A web application to assist farmers in making informed decisions about crop selection based on soil and climate data.

### Technical Stack

#### Frontend
- React 18 with TypeScript
- Vite as build tool
- Material UI (@mui/material)
- Leaflet.js for mapping
- Axios for API calls

#### Backend
- Express.js with TypeScript
- MongoDB with Mongoose
- Node.js runtime

#### Package Management
- pnpm (for better dependency management and disk space efficiency)

### Requirements

#### Functional Requirements
1. **Location Selection** (Must Have):
   - Users must be able to select a location on a map using an interactive pin drop interface.
   - Implementation using Leaflet.js

2. **Soil Information Retrieval** (Must Have):
   - Real-time soil characteristics for the selected location
   - Data points: pH level, organic matter, soil type
   - Using ISRIC SoilGrids API (free tier)

3. **Climatic Data Analysis** (Must Have):
   - Recent and forecasted climatic conditions
   - Using Open-Meteo API (free tier)
   - Data points: rainfall, temperature trends

4. **Best-Fit Crop Suggestions** (Must Have):
   - Recommend the top 3-5 crops suitable for the selected location
   - Based on combined soil and climatic conditions

5. **Multi-Language Support** (Should Have):
   - Enable access to users in multiple languages for global inclusivity

6. **Mobile Responsiveness** (Should Have):
   - Material UI responsive design principles
   - Optimized for various screen sizes

#### Non-Functional Requirements
1. **Performance** (Must Have):
   - Results should load within 3 seconds on 4G connection
   - Client-side caching where appropriate

2. **Scalability** (Must Have):
   - Handle up to 10,000 active users globally
   - Efficient database queries and indexing

3. **Data Accuracy** (Must Have):
   - High precision crop recommendations
   - Regular data validation

4. **Security** (Should Have):
   - HTTPS implementation
   - API rate limiting
   - Input validation

#### Out of Scope
1. Farm management features (module II)
2. Premium API integrations
3. User authentication (initial phase)

### Development Setup

Install dependencies for both client and server
pnpm install
Run development server
pnpm dev

### API Dependencies
- ISRIC SoilGrids (Soil Data)
- Open-Meteo (Weather Data)