AirGuard - Map Double-Click City Selection

- Double-click a city area on the map to identify the nearest city/town.
- The app uses the OpenStreetMap Nominatim reverse-geocoding endpoint to resolve the location.
- Once a city is identified, AirGuard requests its air-quality data from Open-Meteo and selects it in the dashboard.
- Double-click zoom is disabled because double-click is now used for city selection.
- The public Nominatim service has a usage policy and rate limit; the app prevents rapid repeated requests.
- Reverse geocoding may return a nearby municipality or county for rural/ambiguous locations. Double-click closer to a city center for better results.
