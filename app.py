from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()

headers = {
    "X-RapidAPI-Key": os.getenv("RAPIDAPI_KEY"),
    "X-RapidAPI-Host": os.getenv("RAPIDAPI_HOST")
}
flight_location_url = os.getenv("FLIGHT_LOCATION_URL")
flight_url = os.getenv("FLIGHT_URL")
destination_url = os.getenv("DESTINATION_URL")
accommodation_url = os.getenv("ACCOMMODATION_URL")
flight_details_url = os.getenv("FLIGHT_DETAILS_URL")
minimum_price_url = os.getenv("MINIMUM_PRICE_URL")
filter_url = os.getenv("FILTER_URL")
sort_url = os.getenv("SORT_URL")
hotel_details_url = os.getenv("HOTEL_DETAILS_URL")
hotel_photos_url = os.getenv("HOTEL_PHOTOS_URL")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/search-flight-location', methods=['GET'])
def search_flight_location():
    flight_query = request.args.get('location')

    querystring = {
        "query": flight_query,
    }

    response = requests.get(flight_location_url, headers=headers, params=querystring)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        jsonify({"status": False, "message": "Error with the API request"}), response.status_code

@app.route('/search-flights', methods=['POST'])
def search_flights():
    from_id = request.json.get('fromId')
    to_id = request.json.get('toId')
    depart_date = request.json.get('departDate')
    return_date = request.json.get('returnDate')

    querystring = {
        "fromId": from_id, 
        "toId": to_id,      
        "departDate": depart_date,
        "returnDate": return_date,
    }

    response = requests.get(flight_url, headers=headers, params=querystring)

    if response.status_code == 200: 
        flights_data = response.json()

        flight_results = []
        for offer in flights_data.get('data', {}).get('flightOffers', []):
            trip_type = offer.get('tripType', 'Unknown')
            
            segments = offer.get('segments', [])

            outbound_segments = []
            return_segments = []

            for segment in segments:
                if segment.get('return', False):
                    return_segments.append(segment)
                else:
                    outbound_segments.append(segment)
                
            flight_info = {
                "airline": offer.get('carrierData', [{}])[0].get('name', 'Unknown Airline'),
                "price": offer.get('priceBreakdown', {}).get('total', {}).get('units', {}),
                "tripType": trip_type,
                "outboundSegments": [{
                    "departureAirport": seg.get('departureAirport', {}).get('name'),
                    "departureCode": seg.get('departureAirport', {}).get('code'),
                    "arrivalAirport": seg.get('arrivalAirport', {}).get('name'),
                    "arrivalCode": seg.get('arrivalAirport', {}).get('code'),
                    "departureTime": seg.get('departureTime'),
                    "arrivalTime": seg.get('arrivalTime'),
                } for seg in outbound_segments],
                "returnSegments": [{
                    "departureAirport": seg.get('departureAirport', {}).get('name'),
                    "departureCode": seg.get('departureAirport', {}).get('code'),
                    "arrivalAirport": seg.get('arrivalAirport', {}).get('name'),
                    "arrivalCode": seg.get('arrivalAirport', {}).get('code'),
                    "departureTime": seg.get('departureTime'),
                    "arrivalTime": seg.get('arrivalTime')
                } for seg in return_segments]
            }
            flight_results.append(flight_info)

        return jsonify({"flights": flight_results})
    else:
        return jsonify({"status": False, "message": "Error with the API request"}), response.status_code

################jeszcze nie wykorzystane###################   
@app.route('/get-flight-details', methods=['POST'])
def get_flight_details():
    details_token = request.json.get('token')

    querystring = {
        "token": details_token,
    }

    response = requests.get(flight_details_url, headers=headers, params=querystring)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"status": False, "message": "Error with the API request"}), response.status_code
############################################################  

##################jeszcze nie wykorzystane##################
@app.route('/get-min-price', methods=['POST'])
def get_min_price():
    from_id = request.json.get('fromId')
    to_id = request.json.get('toId')
    depart_date = request.json.get('departDate')
    return_date = request.json.get('returnDate')

    querystring = {
        "fromId": from_id,
        "toId": to_id,
        "departDate": depart_date,
        "returnDate": return_date,
    }

    response = requests.get(minimum_price_url, headers=headers, params=querystring)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"status": False, "message": "Error with the API request"}, response.status_code)
#############################################################

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

####################jeszcze nie wykorzystane############################
@app.route('/get-hotel-details', methods=['POST'])
def get_hotel_details():
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
#########################################################################
 
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