from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv
from datetime import datetime;

app = Flask(__name__)

load_dotenv()

headers = {
    "X-RapidAPI-Key": "dbfa26ca31msh8d66daa3ca4a956p1579a9jsn788ce48b137b  ",
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

    print("flight location URL:", flight_location_url)
    print("headers:", headers)
    print("Query:",querystring)

    response = requests.get(flight_location_url, headers=headers, params=querystring)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"status": False, "message": "Error with the API request"}), response.status_code

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
            details_token = offer.get('token')

            print("Offer token:", details_token)

            outbound_segment = segments[0] if len(segments) > 0 else {}
            return_segment = segments[1] if len(segments) > 1 else {}

            outbound_airline = outbound_segment.get('carriersData', [{}])[0]
            return_airline = return_segment.get('carriersData', [{}])[0]

            outbound_stops = max(len(outbound_segment.get('legs', [])) - 1, 0)
            return_stops = max(len(return_segment.get('legs', [])) - 1, 0)

            price_units = offer.get('priceBreakdown', {}).get('total', {}).get('units', {})
            price_nanos = offer.get('priceBreakdown',{}).get('total', {}).get('nanos', {})
            total_price = price_units + (price_nanos / pow(10, 9))

            outbound_departure_date = outbound_segment.get('departureTime')
            outbound_arrival_date = outbound_segment.get('arrivalTime')
            return_departure_date = return_segment.get('departureTime')
            return_arrival_date = return_segment.get('arrivalTime')

            outbound_departue_datetime = datetime.fromisoformat(outbound_departure_date)
            outbound_arrival_datetime = datetime.fromisoformat(outbound_arrival_date)
            return_departure_datetime = datetime.fromisoformat(return_departure_date)
            return_arrival_datetime = datetime.fromisoformat(return_arrival_date)

            formatted_outbound_departure_date = outbound_departue_datetime.strftime("%B %d, %Y, %I:%M %p")
            formatted_outbound_arrival_date = outbound_arrival_datetime.strftime("%B %d, %Y, %I:%M %p")
            formatted_return_departure_date = return_departure_datetime.strftime("%B %d, %Y, %I:%M %p")
            formatted_return_arrival_date = return_arrival_datetime.strftime("%B %d, %Y, %I:%M %p")

            flight_info = {
                "token": details_token,
                "outboundAirline": outbound_airline.get('name', 'Unknown Airline'),
                "outboundLogo": outbound_airline.get('logo', ''),
                "returnAirline": return_airline.get('name', 'Unknown Airline'),
                "returnLogo": return_airline.get('logo', ''),
                "price": total_price,
                "tripType": trip_type,
                "outboundStops": outbound_stops,
                "returnStops": return_stops,
                "outboundSegments": {
                    "departureAirport": outbound_segment.get('departureAirport', {}).get('name'),
                    "departureCode": outbound_segment.get('departureAirport', {}).get('code'),
                    "arrivalAirport": outbound_segment.get('arrivalAirport', {}).get('name'),
                    "arrivalCode": outbound_segment.get('arrivalAirport', {}).get('code'),
                    "departureTime": formatted_outbound_departure_date,
                    "arrivalTime": formatted_outbound_arrival_date,
                },
                "returnSegments": {
                    "departureAirport": return_segment.get('departureAirport', {}).get('name'),
                    "departureCode": return_segment.get('departureAirport', {}).get('code'),
                    "arrivalAirport": return_segment.get('arrivalAirport', {}).get('name'),
                    "arrivalCode": return_segment.get('arrivalAirport', {}).get('code'),
                    "departureTime": formatted_return_departure_date,
                    "arrivalTime": formatted_return_arrival_date
                }
            }
            flight_results.append(flight_info)

        return jsonify({"flights": flight_results})
    else:
        return jsonify({"status": False, "message": "Error with the API request"}), response.status_code
  
@app.route('/get-flight-details')
def get_flight_details():
    return render_template('flight_details.html')

@app.route('/api/flight-details', methods={'GET'})
def api_flight_details():
    details_token = request.args.get('token')
    print("Token received in get-flight-details:", details_token)
    if not details_token:
        return "Error: No token provided", 400

    querystring = {
        "token": details_token,
    }

    response = requests.get(flight_details_url, headers=headers, params=querystring)

    print("API response status:", response.status_code)
    if response.status_code != 200:
        return jsonify({"error": "Could not fetch flight details"}), 500

    flight_data = response.json()
    print("Flight data response:", flight_data)

    data = flight_data.get('data', {})
    segments = data.get('segments', [])

    outbound_segment = segments[0] if len(segments) > 0 else {}
    return_segment = segments[1] if len(segments) > 1 else {}

    price_units = data.get('priceBreakdown', {}).get('total', {}).get('units', {})
    price_nanos = data.get('priceBreakdown',{}).get('total', {}).get('nanos', {})
    total_price = price_units + (price_nanos / pow(10, 9))


    details = {
        "price": total_price,
        "currency": data.get('price', {}).get('currency', 'USD'),
        "outboundLegs": [],
        "returnLegs": []
    }

    for segment in data.get('segments', []):
        leg_type = "returnLegs" if segment.get('isReturn') else "outboundLegs"

        for leg in segment.get('legs', []):
            leg_info = {
                "departureAirport": leg.get('departureAirport', {}).get('name', 'Unknown Airport'),
                "departureCode": leg.get('departureCode', {}).get('code', 'N/A'),
                "arrivalAirport": leg.get('arrivalAirport', {}).get('name', 'Unknown Airport'),
                "arrivalCode": leg.get('arrivalCode', {}).get('code', 'N/A'),
                "departureTime": leg.get('departureTime', 'N/A'),
                "arrivalTime": leg.get('arrivalTime', 'N/A'),
                "airlineName": leg.get('airline', {}).get('name', 'Unknown Airline'),
                "airlineLogo": leg.get('airline', {}).get('logo', '')
            }
            details[leg_type].append(leg_info)

    return jsonify(details)

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