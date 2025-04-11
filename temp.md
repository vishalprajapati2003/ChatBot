Below is an example of Cypress code to automate ticket booking on the IRCTC website, including login functionality. Please note that this is a simplified version for educational purposes, and you may need to adjust it based on the current structure of the IRCTC website (as it may change over time). Additionally, automating ticket booking on IRCTC may violate their terms of service, so use this code responsibly and only for learning purposes.PrerequisitesNode.js and Cypress: Ensure you have Node.js installed and Cypress set up in your project (npm install cypress --save-dev).IRCTC Credentials: Store sensitive data like username and password securely (e.g., in cypress.env.json or environment variables).Passenger Data: Prepare a JSON file with passenger details (e.g., passenger_data.json).Cypress Code ExampleCreate a file named irctc_ticket_booking.spec.js in your cypress/e2e folder:describe('IRCTC Auto Ticket Booking', () => {
// Define constants (replace with actual values)
const IRCTC_URL = 'https://www.irctc.co.in/nget/train-search';
const USERNAME = Cypress.env('IRCTC_USERNAME'); // Store in cypress.env.json
const PASSWORD = Cypress.env('IRCTC_PASSWORD'); // Store in cypress.env.json

before(() => {
// Load passenger data from fixtures
cy.fixture('passenger_data.json').as('passengerData');
});

it('should login and book a ticket automatically', () => {
// Visit IRCTC website
cy.visit(IRCTC_URL);

    // Login to IRCTC
    cy.get('#loginText').click(); // Click login button (adjust selector if needed)
    cy.get('#userId').type(USERNAME); // Enter username
    cy.get('#pwd').type(PASSWORD); // Enter password

    // Handle CAPTCHA manually (Cypress cannot solve CAPTCHA automatically)
    cy.log('Please solve the CAPTCHA manually within 30 seconds');
    cy.wait(30000); // Wait for manual CAPTCHA input (adjust time as needed)

    cy.get('#loginbutton').click(); // Submit login (adjust selector if needed)

    // Verify successful login
    cy.url().should('include', '/nget/booking/train-list');

    // Fill journey details
    cy.get('#origin > input').type('MUMBAI CST'); // From station
    cy.get('#destination > input').type('DELHI'); // To station
    cy.get('#jDate').click(); // Open date picker
    cy.get('.ui-state-default').contains('15').click(); // Select date (e.g., 15th)

    // Search trains
    cy.get('#divMain button').contains('Search').click();

    // Wait for train list and select a train
    cy.get('.train-list').should('be.visible');
    cy.get('.btnDefault.trainName').first().click(); // Select first available train

    // Select class (e.g., Sleeper)
    cy.get('.class-list').contains('SL').click();

    // Click "Book Now"
    cy.get('.btnDefault').contains('Book Now').click();

    // Fill passenger details from fixture
    cy.get('@passengerData').then((data) => {
      cy.get('#psgn_1_name').type(data.passengers[0].name);
      cy.get('#psgn_1_age').type(data.passengers[0].age);
      cy.get('#psgn_1_gender').select(data.passengers[0].gender);
      cy.get('#psgn_1_berth').select(data.passengers[0].berthPreference);
    });

    // Enter mobile number and proceed
    cy.get('#mobileNumber').type(data.mobileNumber);
    cy.get('#proceedBtn').click();

    // Payment (simplified - adjust based on payment gateway)
    cy.get('#paymentOption').select('UPI');
    cy.get('#upiId').type(data.upiId);
    cy.get('#payBtn').click();

    // Wait for payment confirmation (manual step in real scenario)
    cy.log('Please complete the payment on your UPI app');
    cy.wait(10000); // Adjust time as needed

    // Verify booking success
    cy.get('.booking-success').should('be.visible');

});
});Supporting Filescypress.env.json (in the root of your Cypress project):{
"IRCTC_USERNAME": "your_irctc_username",
"IRCTC_PASSWORD": "your_irctc_password"
}cypress/fixtures/passenger_data.json:{
"passengers": [
{
"name": "John Doe",
"age": "30",
"gender": "MALE",
"berthPreference": "LOWER"
}
],
"mobileNumber": "9876543210",
"upiId": "yourname@upi"
}
Steps to RunInstall dependencies: npm install.Open Cypress: npx cypress open.Select irctc_ticket_booking.spec.js from the Cypress test runner.Ensure you manually solve the CAPTCHA and complete the UPI payment when prompted.Important NotesCAPTCHA Handling: IRCTC uses CAPTCHA, which Cypress cannot solve automatically. The code includes a pause (cy.wait()) for manual input. For a fully automated solution, you’d need an external CAPTCHA-solving service (e.g., 2Captcha API), but this is beyond basic Cypress functionality and may violate IRCTC policies.Dynamic Selectors: The selectors (e.g., #userId, #pwd) are placeholders. Inspect the IRCTC website using browser developer tools to get the latest IDs or classes, as they may change.Legal Disclaimer: Automating ticket booking on IRCTC may breach their terms of service. This code is for educational purposes only. Misuse could lead to account bans or legal consequences.Error Handling: Add more robust error handling (e.g., retries for failed steps) depending on your needs.Tatkal Timing: For Tatkal booking, ensure the test runs at the appropriate time (10 AM for AC, 11 AM for non-AC) and adjust the date selection logic accordingly.This code provides a starting point. You’ll need to tweak it based on the latest IRCTC website structure and your specific requirements. Let me know if you need further assistance!
