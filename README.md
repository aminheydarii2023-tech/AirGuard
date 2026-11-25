AirGuard

A bilingual air-quality monitoring dashboard designed to help users explore, compare, and understand air quality across cities.

Overview

AirGuard is a responsive web application that provides air-quality information through an interactive dashboard, city search, historical charts, forecasts, and an interactive map.

The application supports both Persian and English, including right-to-left (RTL) and left-to-right (LTR) layouts.

Features

• City Search: Search for cities using Persian or English names.

• Air Quality Dashboard: View air-quality information and pollutant indicators.

• Interactive Map: Explore locations using OpenStreetMap.

• City Comparison: Compare air-quality conditions across multiple cities.

• Historical Trends: Explore historical air-quality data over 24-hour, 7-day, and 30-day periods.

• 5-Day Forecast: View upcoming air-quality trends.

• Bilingual Interface: Switch between Persian and English.

• RTL / LTR Support: Automatic layout direction based on the selected language.

• Responsive Design: Adapted for desktop, tablet, and mobile screens.

• Dark and Light Themes: Choose the preferred visual appearance.

Tech Stack



Technology

Purpose



React

User interface



TypeScript

Type-safe development



Vite

Development server and build tool



Tailwind CSS

Styling



i18next

Internationalization



Leaflet

Interactive maps



React Leaflet

React integration for Leaflet



Chart.js

Data visualization



Open-Meteo

Air-quality and geocoding data





Data Sources

AirGuard uses the following external services:

• Open-Meteo Air Quality API: Air-quality data.

• Open-Meteo Geocoding API: City search and location lookup.

• OpenStreetMap: Map tiles and geographic data.

• Nominatim: Reverse geocoding for identifying locations selected on the map.

Data Transparency

AirGuard displays model-based air-quality information provided by Open-Meteo, using the CAMS atmospheric monitoring service.

These values are model-based estimates and should not be interpreted as direct measurements from local ground-based monitoring stations.

External data services may have usage limits and availability restrictions. Their respective usage policies should be followed.

Getting Started

Prerequisites

• Node.js

• npm

Installation

Clone the repository:

bash

git clone https://github.com/aminheydarii2023-tech/AirGuard.git

cd AirGuard



Install dependencies:

bash

npm install



Start the development server:

bash

npm run dev



Production Build

Create a production build:

bash

npm run build



Preview the production build locally:

bash

npm run preview



Project Structure

text

AirGuard/

|-- docs/

|   `-- archive/

|-- src/

|   |-- components/

|   |-- data/

|   |-- hooks/

|   |-- i18n/

|   |   `-- locales/

|   |-- services/

|   |-- App.tsx

|   |-- index.css

|   `-- styles.css

|-- index.html

|-- package.json

|-- package-lock.json

|-- tsconfig.json

|-- tsconfig.app.json

|-- tsconfig.node.json

|-- vite.config.ts

`-- README.md



Attribution

AirGuard uses services and geographic data provided by:

• Open-Meteo

• Copernicus Atmosphere Monitoring Service (CAMS)

• OpenStreetMap

• Nominatim Usage Policy

Please review the relevant usage policies before deploying the application for public or high-traffic use.

Project Status

AirGuard is an academic and portfolio project.

License

No license has been specified yet.

