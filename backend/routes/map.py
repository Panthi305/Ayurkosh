from flask import Blueprint, jsonify, send_file, request
import folium
import geopandas as gpd
import pandas as pd
import os
import requests

map_bp = Blueprint("map_bp", __name__)

@map_bp.route("/state-heatmap")
def state_heatmap():
    # Get plant name from query parameter
    plant_name = request.args.get("name")
    if not plant_name:
        return jsonify({"error": "Plant name required"}), 400

    # Fetch plant data from the internal API
    internal_api_url = "http://localhost:5000/api/search-plant"
    try:
        response = requests.get(internal_api_url, params={"name": plant_name}, headers={"x-api-key": "mysecretkey123"})
        if response.status_code != 200:
            return jsonify({"error": f"Failed to fetch plant data: {response.json().get('error', 'Unknown error')}"}), 500
        plant_data = response.json()

        # Extract where_grown_in_india from API response
        where_grown = plant_data.get("where_grown_in_india", {})
        if not where_grown:
            return jsonify({"error": "No distribution data available for this plant"}), 400

    except requests.RequestException as e:
        return jsonify({"error": f"API request failed: {str(e)}"}), 500
    except ValueError:
        return jsonify({"error": "Invalid API response format"}), 500

    # Convert to DataFrame for merging
    df = pd.DataFrame(list(where_grown.items()), columns=["NAME_1", "Value"])

    # Load GeoJSON file
    geojson_path = os.path.join(os.path.dirname(__file__), "..", "india.geojson")
    if not os.path.exists(geojson_path):
        return jsonify({"error": f"GeoJSON file not found at {geojson_path}"}), 500
    try:
        gdf = gpd.read_file(geojson_path)
        # Merge GeoJSON data with API-derived data
        merged = gdf.merge(df, on="NAME_1", how="left")
        # Fill NaN values with 0 for states not in the data
        merged["Value"] = merged["Value"].fillna(0)
    except Exception as e:
        return jsonify({"error": f"Failed to read GeoJSON file: {str(e)}"}), 500

    # Create Folium map centered on India
    m = folium.Map(location=[20.5937, 78.9629], zoom_start=5, tiles="OpenStreetMap")

    # Add choropleth layer
    choropleth = folium.Choropleth(
        geo_data=merged,
        name=f"{plant_name} Growth Index",
        data=merged,
        columns=["NAME_1", "Value"],
        key_on="feature.properties.NAME_1",
        fill_color="YlGnBu",
        fill_opacity=0.8,
        line_opacity=0.3,
        legend_name=f"{plant_name} Growth Index",
        nan_fill_color="gray",
        nan_fill_opacity=0.4
    ).add_to(m)

    # Add tooltips
    folium.GeoJsonTooltip(
        fields=["NAME_1", "Value"],
        aliases=["State:", "Growth Index:"],
        localize=True,
        sticky=True,
        labels=True,
        style="background-color: #F0EFEF; border: 2px solid black; border-radius: 3px; box-shadow: 3px;"
    ).add_to(choropleth.geojson)

    # Add layer control
    folium.LayerControl().add_to(m)

    # Save map to a temporary HTML file
    map_path = os.path.join(os.path.dirname(__file__), "temp_map.html")
    m.save(map_path)

    # Serve the HTML file
    return send_file(map_path, mimetype="text/html")