from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv
from datetime import datetime
import json

app = Flask(__name__)

load_dotenv()

headers = {
    "X-RapidAPI-Key": os.getenv("RAPIDAPI_KEY"),
    "X-RapidAPI-Flight-Host": os.getenv("RAPIDAPI_FLIGHT_HOST"),
    "X-RapidAPI-Accommodation-Host": os.getenv("RAPIDAPI_ACCOMMODATION_HOST")
}
airport_url = os.getenv("AIRPORT_URL")
flight_url = os.getenv("FLIGHT_URL")
flight_details_url = os.getenv("FLIGHT_DETAILS_URL")

destination_url = os.getenv("DESTINATION_URL")
accommodation_url = os.getenv("ACCOMMODATION_URL")
filter_url = os.getenv("FILTER_URL")
sort_url = os.getenv("SORT_URL")
hotel_details_url = os.getenv("HOTEL_DETAILS_URL")
hotel_photos_url = os.getenv("HOTEL_PHOTOS_URL")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/search-airports', methods=['GET'])
def search_ariports():
    airport_query = request.args.get('location')

    querystring = {
        "query": airport_query,
    }

    response = requests.get(airport_url, headers=headers, params=querystring)

    if response.status_code == 200:

        return jsonify(response.json())
    else:
        return jsonify({"status": False, "message": "Error with the API request"}), response.status_code
    
@app.route('/search-flights', methods=['POST'])
def search_flights():
    data = request.get_json()

    origin_sky_id = data.get('originSkyId')
    origin_entity_id = data.get('originEntityId')
    destination_sky_id = data.get('destinationSkyId')
    destination_entity_id = data.get('destinationEntityId')
    departure_date = data.get('date')
    return_date = data.get('returnDate')

    querystring = {
        "originSkyId": origin_sky_id, 
        "destinationSkyId": destination_sky_id,
        "originEntityId": origin_entity_id,
        "destinationEntityId": destination_entity_id,
        "date": departure_date,
        "returnDate": return_date
    }

    response = requests.get(flight_url, headers=headers, params=querystring)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"status": False, "message": "Error with the API request"}), response.status_code

@app.route('/get-flight-details')
def get_flight_details():
    return render_template("flight_details.html")

@app.route('/api/flight-details', methods=['POST'])
def api_flight_details():
    data = request.get_json()

    print("received data:", data)

    if not itinerary_id:
        return jsonify({"status": False, "message": "Missing itineraryId"}), 400

    # Ensure 'legs' is valid
    if not legs:
        return jsonify({"status": False, "message": "Missing flight legs data"}), 400

    itinerary_id = data.get('itineraryId')
    legs = data.get('legs')
    session_id = data.get('sessionId')

    print("itinerary ID:", itinerary_id)

    if isinstance(legs, str):
        # If 'legs' is a string, ensure it's parsed first
        legs_parsed = json.loads(legs)
    elif isinstance(legs, list) or isinstance(legs, dict):
        # If 'legs' is already a list or dict, we can directly use it
        legs_parsed = legs
    else:
        # Handle the case where 'legs' is neither string, list, nor dict
        return jsonify({"status": False, "message": "'legs' is of invalid type"}), 400

    querystring = {
        "itineraryId": itinerary_id,
        "legs": str(legs_parsed),
        "sessionId": session_id
    }

    response = requests.get(flight_details_url, headers=headers, params=querystring)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"status": False, "message": "error fetching flight details"}), response.status_code














































##################jeszcze nie wykorzystane###################
@app.route('/get-filter', methods=['POST'])
def get_filter():
    dest_id = request.json.get('destId')
    search_type = request.json.get('searchType')
    arrival_date = request.json.get('arrivalDate')
    departure_date = request.json.get('departureDate')

    querystring = {
        "destId": dest_id,
        "searchType": search_type,
        "arrivalDate": arrival_date,
        "departureDate": departure_date,
    }

    response = requests.get(filter_url, headers=headers, params=querystring)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"status": False, "message": "Error with the API request"}, response.status_code)
##############################################################

###################jeszcze nie wykorzystane###################
@app.route('/get-sort-by', methods=['POST'])
def get_sort_by():
    dest_id = request.json.get('destId')
    search_type = request.json.get('searchType')
    arrival_date = request.json.get('arrivalDate')
    departure_date = request.json.get('departureDate')

    querystring = {
        "destId": dest_id,
        "searchType": search_type,
        "arrivalDate": arrival_date,
        "departureDate": departure_date,
    }

    response = requests.get(sort_url, headers=headers, params=querystring)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"status": False, "message": "Error with the API request"}, response.status_code)
################################################################

@app.route('/search-destination', methods=['GET'])
def search_destination():
    destination_query = request.args.get('location')
    
    querystring = {
        "query": destination_query,
    }

    response = requests.get(destination_url, headers=headers, params=querystring)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"status": False, "message": "Error with the API request"}), response.status_code
    
@app.route('/search-accommodation', methods=['POST'])
def search_accommodation():
    destination = request.json.get('destination')
    search_type = request.json.get('search_type').upper()
    arrival_date = request.json.get('arrival_date')
    departure_date = request.json.get('departure_date')

    querystring = {
        "dest_id": destination,
        "search_type": search_type,
        "arrival_date": arrival_date,
        "departure_date": departure_date
    }

    response = requests.get(accommodation_url, headers=headers, params=querystring)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return jsonify({"status": False, "message": "Error with the API request"}), response.status_code
    
if __name__ == '__main__':
    app.run(debug=True)

@app.route('/get-hotel-details')
def get_hotel_details():
    return render_template('hotel_details.html')

@app.route('/api/hotel-details', methods=['GET'])
def api_hotel_details():
    hotel_id = request.json.get('hotel_id')
    arrival_date = request.json.get('arrival_date')
    departure_date = request.json.get('departure_date')

    querystring = {
        "hotelId": hotel_id,
        "arrivalDate": arrival_date,
        "departureDate": departure_date,
    }

    response = requests.get(hotel_details_url, headers=headers, params=querystring)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"status": False, "message": "Error with the API request"}), response.status_code
 
#######################jeszcze nie wykorzystane########################## 
@app.route('/get-hotel-photos', methods=['POST'])
def get_hotel_photos():
    hotel_id = request.json.get('hotel_id')
    
    querystring = {
        "hotelId": hotel_id,
    }

    response = requests.get(hotel_photos_url, headers=headers, params=querystring)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"status": False, "message": "Error with the API request"}), response.status_code
##########################################################################