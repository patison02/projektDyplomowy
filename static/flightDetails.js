console.log("flightDetails.js loaded successfully");

const urlParams = new URLSearchParams(window.location.search);
const itineraryId = urlParams.get('itineraryId');
const legParams = urlParams.get('leg');
const sessionId = urlParams.get('sessionId');
const adults = urlParams.get('adults');

console.log("URL Parameters:");
console.log("itineraryId:", itineraryId);
console.log("legParam:", legParams);
console.log("sessionId", sessionId);
console.log("adults:", adults);

if (itineraryId && legParams && adults && sessionId) {
    let leg;
    try {
        leg = JSON.parse(decodeURIComponent(legParams));
        console.log("Parsed Legs:", leg);
    } catch (error) {
        console.error("Error parsing legs parameter:", error);
        document.getElementById('flight-details-content').innerHTML = '<p>Błąd: Nieprawidłowy parametr "legs".</p>';
        throw error;
    }

    const requestBody = {
        itineraryId: itineraryId,
        legs: leg,
        sessionId: sessionId,
        adults: adults
    };

    console.log("Request Body:", requestBody);

    fetch('/api/flight-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        console.log("API Response Status:", response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("API Response Data:", data);
        if (data.status === false) {
            document.getElementById('flight-details-content').innerHTML = `<p>${data.message}</p>`;
        } else {
            document.getElementById('flight-details-content').innerHTML = `
                <h3>${data.carrierName} (${data.flightNumber})</h3>
                <p><strong>Odlot:</strong> ${data.departure.origin} o ${data.departure.time}</p>
                <p><strong>Przylot:</strong> ${data.arrival.destination} o ${data.arrival.time}</p>
                <p><strong>Cena:</strong> ${data.price}</p>
                <p><strong>Czas trwania:</strong> ${data.duration}</p>
            `;
        }
    })
    .catch(err => {
        console.error("Error fetching flight details:", err);
        document.getElementById('flight-details-content').innerHTML = '<p>Wystąpił błąd podczas ładowania szczegółów lotu.</p>';
    });
} else {
    console.error("Missing required URL parameters");
    document.getElementById('flight-details-content').innerHTML = '<p>Błąd: Nie podano wszystkich wymaganych parametrów.</p>';
}