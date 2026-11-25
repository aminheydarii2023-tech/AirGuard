AIRGUARD — HISTORICAL TRENDS UPDATE

What changed
- Replaced the previous next-24-hours preview chart with historical hourly air-quality trends.
- Added 24-hour, 7-day, and 30-day periods.
- Added metric selection for US AQI, PM2.5, and PM10.
- Added latest value, period average, and sample count.
- Added Persian and English labels.
- Historical requests use the Open-Meteo Air Quality API with forecast_days=0 and past_days up to 30.
- Values are model-based estimates, not direct ground-station measurements.

Install
1. Keep a backup of your working project.
2. Extract this ZIP to a new folder.
3. Open PowerShell in the extracted project folder.
4. Run:
   npm install
   npm run build
   npm run dev

Please test
- Build completes without TypeScript errors.
- 24-hour / 7-day / 30-day controls load data.
- AQI / PM2.5 / PM10 controls update the chart and summary.
- Changing the dashboard city loads history for the new city.
- Persian/English and light/dark themes remain usable.

Build status
The ZIP archive structure and locale JSON files were checked. Dependency installation timed out in the preparation environment, so a production build has NOT been verified here. Please run npm run build locally before treating this version as stable.
