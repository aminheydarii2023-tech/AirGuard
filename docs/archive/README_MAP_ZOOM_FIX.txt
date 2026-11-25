AirGuard — Map Zoom Consistency Fix

Change:
- Selecting any city now moves the map to that city's coordinates using a consistent zoom level (8).
- The current-city/recenter button now also recenters the map even when the selected city has not changed.
- Existing AQI markers and map search behavior are preserved.

To use:
Replace the existing project with this ZIP, or copy src/components/AirQualityMap.tsx into the matching path in your current project.
Then run:
  npm install
  npm run build
  npm run dev
