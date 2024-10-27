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

    let fromId;
    let toId;

    fetch(`/search-flight-location?location=${encodeURIComponent(fromLocation)}`)
    .then(response => response.json())
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
    .then(response => response.json())
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
    .then(response => response.json())
    .then(data => {
        console.log("API Response: ", JSON.stringify(data, null, 2));

        // Clear previous results
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        // Check if flights are available
        if (data && data.data && data.data.aggregation && data.data.aggregation.airlines && data.data.aggregation.airlines.length > 0) {
            data.data.aggregation.airlines.forEach(airline => {
                // Display flight information
                const flightInfo = `
                    <div class="flight">
                        <h3>Airline: ${airline.name} (${airline.iataCode})</h3>
                        <img src="${airline.logoUrl}" alt="${airline.name} logo" width="50" height="50">
                        <p><strong>Min Price:</strong> ${airline.minPrice.units}.${airline.minPrice.nanos / 1e9} ${airline.minPrice.currencyCode}</p>
                    </div>
                    <hr>
                `;
                // Append the flight info to the results div
                resultsDiv.innerHTML += flightInfo;
            });
        } else {
            resultsDiv.innerHTML = '<p>No airlines found or data in incorrect format.</p>';
        }

        return fetch(`/search-destination?location=${encodeURIComponent(location)}`);
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
    .then(response => {
        if(response.ok) {
            return response.json();
        } else {
            return response.text();
        }
    })
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
    .catch(err => {
        console.error("Error: ", err);
        document.getElementById('results').innerHTML = '<p>An error occurred during the search.</p>';
    });
});