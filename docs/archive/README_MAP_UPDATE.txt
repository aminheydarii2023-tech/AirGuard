AirGuard - Light Interactive Map Update

This update is based on the latest supplied AirGuard_AI_Smooth_Scroll.zip project snapshot.

Changes:
- Replaced the dark map tile layer with CARTO light tiles.
- Added a Persian/English city search directly above the map using the existing Open-Meteo geocoding service.
- Selecting a search result fetches air-quality data, adds/updates its marker, and selects that city in the dashboard.
- Selecting a city in the dashboard automatically flies the map to that city's coordinates.
- Kept the existing map-marker popup action and smooth scroll to the dashboard.
- Added localized map-search messages.

Install:
1. Extract this ZIP into the root of your existing project folder.
2. Replace files when prompted.
3. Run: npm run build
4. If build succeeds: npm run dev

The map uses CARTO light basemap tiles and Open-Meteo Geocoding/Air Quality APIs. Internet access is required for map tiles and live data.

Note: Build could not be run in the packaging environment because dependency installation timed out. Please verify with npm run build on the project machine.
