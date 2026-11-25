AirGuard — Five-Day Air Quality Forecast

What's added:
- Five-day (120-hour) hourly air-quality forecast using Open-Meteo Air Quality API.
- Metric selector for US AQI, PM2.5, and PM10.
- Hourly forecast line chart.
- Daily summaries: average AQI and peak PM2.5 / PM10.
- Persian and English translations.
- Dark/light theme styling and responsive layout.
- Forecast navigation link.

Data notes:
- Forecast values are model-based estimates from Open-Meteo / CAMS, not direct measurements.
- The forecast is requested as 120 forecast hours starting at the current hour.
- Global CAMS forecast data can have a coarser time resolution than hourly in some regions.

How to install:
1. Keep your current working project as a backup.
2. Extract this ZIP into a NEW folder.
3. Open PowerShell in the extracted project root.
4. Run:
   npm install
   npm run build
   npm run dev
5. Open the local URL shown by Vite.
6. Find the "Forecast / پیش‌بینی" section (also linked in the top navigation).
7. Test AQI, PM2.5, PM10 and switch the dashboard city.

This archive does not include node_modules or dist.
