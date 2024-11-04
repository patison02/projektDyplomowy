document.getElementById('flight-search-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form data
    const fromLocation = document.getElementById('from').value;
    const toLocation = document.getElementById('to').value + '.AIRPORT';
    const location = document.getElementById('to').value;
    const departDate = document.getElementById('departDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;

    const budgetCap = parseFloat(document.getElementById('budgetCap').value);

    let fromId;
    let toId;
    
    let filteredFlights = [];
    let filteredAccommodation = [];

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    fetch(`/search-flight-location?location=${encodeURIComponent(fromLocation)}`)
    .then(response => {
        if(!response.ok) {
            throw new Error(`Error fetching 'from' location. Status: ${response.status}`);
        } else {
            return response.json();
        }
    })
    .then(data => {
        console.log('From Location API Response:', data);

        const fromAirport = data.data.filter(location => location.type === "AIRPORT");

        if (fromAirport.length >0 && fromAirport[0].code) {
            fromId = fromAirport[0].code + ".AIRPORT";
        } else {
            throw new Error('no valid data for departure location');
        }

        return fetch(`/search-flight-location?location=${encodeURIComponent(toLocation)}`);
    })
    .then(response => {
        if(!response.ok) {
            throw new Error(`Error fetching 'to' location. Status ${response.status}`);
        } else {
            return response.json();
        }
    })
    .then(data => {
        console.log('To Location API Response:', data);

        const toAirport = data.data.filter(location => location.type === "AIRPORT");

        if (data && data.data && data.data.length > 0) {
            toId = toAirport[0].code + ".AIRPORT";
        } else {
            throw new Error('No valid data for arrival location');
        }

        return fetch('/search-flights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fromId: fromId,
                toId: toId,
                departDate: departDate,
                returnDate: returnDate
            })
        });
    })
    .then(response => {
        if(!response.ok) {
            throw new Error(`Error searching flights. Status: ${response.status}`);
        } else {
            return response.json();
        }
    })
    .then(data => {
        console.log("Flight Search Results:", data);

        const flightResults = data.flights || [];
        filteredFlights = flightResults.filter(flight => flight.price <= budgetCap);

        
        filteredFlights.forEach(flight => {
            let flightInfo = `
                <div class="flight">
                    <h3>${flight.outboundAirline} (${flight.tripType})</h3>
                    <p><strong>Price:</strong> ${flight.price} USD</p>
                </div><hr>`;
            resultsDiv.innerHTML += flightInfo;
        });
/*
        if (data.flights && data.flights.length > 0) {
            data.flights.forEach(flight => {
                console.log("Flight Details Token:", flight.token);

                let flightInfo = `
                    <div class="flight">
                        <h3>${flight.outboundAirline} (${flight.tripType})</h3>
                        <p><strong>Price:</strong> ${flight.price} USD</p>
                        <h4>Outbound Flight:</h4>
                        <p>Stops: ${flight.outboundStops}</p>
                        <p>From: ${flight.outboundSegments.departureAirport} (${flight.outboundSegments.departureCode})</p>
                        <p>To: ${flight.outboundSegments.arrivalAirport} (${flight.outboundSegments.arrivalCode})</p>
                        <p>Departure Time: ${flight.outboundSegments.departureTime}</p>
                        <p>Arrival Time: ${flight.outboundSegments.arrivalTime}</p>
                `;

                if (flight.tripType === 'ROUNDTRIP' && flight.returnSegments.departureAirport) {
                    flightInfo += `
                        <h4>Return Flight:</h4>
                        <p>Stops: ${flight.returnStops}
                        <p>From: ${flight.returnSegments.departureAirport} (${flight.returnSegments.departureCode})</p>
                        <p>To: ${flight.returnSegments.arrivalAirport} (${flight.returnSegments.arrivalCode})</p>
                        <p>Departure Time: ${flight.returnSegments.departureTime}</p>
                        <p>Arrival Time: ${flight.returnSegments.arrivalTime}</p>
                    `;
                }
                flightInfo += `
                        <button onclick="window.location.href='/get-flight-details?token=${flight.token}'">
                            View Details
                        </button>
                    </div><hr>`;
                resultsDiv.innerHTML += flightInfo;
            });
        } else {
            resultsDiv.innerHTML = '<p>No flights found.</p>';
        }*/
        return fetch(`search-destination?location=${encodeURIComponent(location)}`);
    })
    .then(response => response.json())
    .then(data => {
        console.log("Destination API Response: ", JSON.stringify(data, null, 2));

        if(data.status) {
            const dest_id = data.data[0].dest_id;
            const searchType = data.data[0].search_type;

            const accommodationBody = {
                destination: dest_id,
                search_type: searchType,
                arrival_date: checkInDate,
                departure_date: checkOutDate   
            }

            return fetch('/search-accommodation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(accommodationBody)
            });
        } else {
            throw new Error("No valid destination data");
        }
    })
    .then(response => response.json())
    .then(data => {
        const accommodationResults = data.data.hotels || [];
        filteredAccommodation = accommodationResults.filter(acc => acc.priceBreakdown?.grossPrice?.value <= budgetCap);

        const accommodationResultsDiv = document.getElementById('accommodation-result');
        accommodationResultsDiv.innerHTML = '';

        
        filteredAccommodation.forEach(hotel => {
            const hotelInfo = `
                <div class="accommodation">
                    <h3>${hotel.property.name}</h3>
                    <p><strong>Price:</strong> ${hotel.priceBreakdown.grossPrice.value} ${hotel.priceBreakdown.grossPrice.currency}</p>
                </div><hr>`;
            accommodationResultsDiv.innerHTML += hotelInfo;
        });

        const bundles = [];
        filteredFlights.forEach(flight => {
            filteredAccommodation.forEach(acc => {
                const totalCost = flight.price + acc.priceBreakdown?.grossPrice?.value;
                if (totalCost <= budgetCap) {
                    bundles.push({ flight, accommodation: acc, totalCost});
                }
            });
        });

        if (bundles.length > 0) {
            bundles.forEach(bundle => {
                const bundleInfo = `
                    <div class="bundle">
                        <h3>Flight: ${bundle.flight.outboundAirline || 'N/A'} (${bundle.flight.tripType || 'N/A'})</h3>
                        <p><strong>Flight Price:</strong> ${bundle.flight.price || 'N/A'} USD</p>
                        <h3>Accommodation: ${bundle.accommodation.property?.name || 'No name available'}</h3>
                        <p><strong>Accommodation Price:</strong> ${bundle.accommodation.priceBreakdown?.grossPrice?.value || 'N/A'} ${bundle.accommodation.priceBreakdown?.grossPrice?.currency || 'USD'}</p>
                        <p><strong>Total Price:</strong> ${bundle.totalCost || 'N/A'} USD</p>
                        <button onclick="window.location.href='/get-flight-details?token=${bundle.flight.token}'">View Flight Details</button>
                    </div><hr>`;
                resultsDiv.innerHTML += bundleInfo;
            });
        } else {
            resultsDiv.innerHTML = '<p>No bundles found within budget.</p>';
        }
    })
    /*
    .then(data => {
        // Check if data is already a JavaScript object and avoid double parsing
        if (typeof data === 'object') {
            console.log("Accommodation API Response (Parsed as Object):", data);
        } else {
            console.error("Error: ", data);
            throw new Error(data);  // Throw the error message if it's not JSON
        }

        const accommodationResultsDiv = document.getElementById('accommodation-result');
        accommodationResultsDiv.innerHTML = '';

        if (data && data.data && data.data.hotels && data.data.hotels.length > 0) {
            data.data.hotels.forEach(hotel => {
                // Use optional chaining to safely access nested properties
                const hotelName = hotel?.property?.name || 'No name available';
                const grossPriceValue = hotel?.priceBreakdown?.grossPrice?.value || 'Price not available';
                const grossPriceCurrency = hotel?.priceBreakdown?.grossPrice?.currency || '';
                const ratingWord = hotel?.property?.reviewScoreWord || 'No rating available';
                const ratingScore = hotel?.property?.reviewScore || 'No score available';
                const address = hotel?.accessibilityLabel || 'Address not available';
                const imageUrl = hotel?.property?.photoUrls?.[0] || '';
    
                // Construct accommodation info HTML
                const accommodationInfo = `
                    <div class="accommodation">
                        <h3>${hotelName}</h3>
                        <p><strong>Price:</strong> ${grossPriceValue} ${grossPriceCurrency}</p>
                        <p><strong>Rating:</strong> ${ratingWord} (${ratingScore}) stars</p>
                        <p><strong>Address:</strong> ${address}</p>
                        ${imageUrl ? `<img src="${imageUrl}" alt="${hotelName} image" width="200">` : ''}
                    </div>
                    <hr>
                `;
                accommodationResultsDiv.innerHTML += accommodationInfo;
            });
        } else {
            accommodationResultsDiv.innerHTML = '<p>No accommodations found.</p>';
        }
    })
    */
    .catch(err => {
        console.error("Error: ", err);
        document.getElementById('results').innerHTML = '<p>An error occurred during the search.</p>';
    });
});