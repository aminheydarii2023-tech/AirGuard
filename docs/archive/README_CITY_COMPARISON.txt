AIRGUARD - CITY COMPARISON UPDATE

New feature:
- Search for cities using the existing Persian/English geocoding service.
- Add up to four cities to a side-by-side comparison.
- View current US AQI, category, PM2.5 and PM10 for each city.
- Compare AQI values on a shared visual scale.
- Remove cities and refresh the selected city data.
- Persian/English labels and existing dark/light theme variables are supported.

Data source: Open-Meteo Air Quality API (CAMS model-based estimates).
These are model estimates, not direct measurements from local monitoring stations.

Install:
1. Back up the current project.
2. Extract this archive to a separate folder.
3. Run npm install, then npm run build, then npm run dev.
4. Open Compare cities from the top navigation.
5. Search for Tehran and Mashhad, add them, then try Qeshm and Kish.

Build note:
The dependency installation in the preparation environment timed out, so this update has not been verified with a production build here. Run npm run build locally and share any TypeScript/Vite errors.
