# hamlogbook-js

<h1>HamLogbook</h1>
<h2>Overview</h2>

Test it here https://johnzonneveld.github.io/hamlogbook. Backend running on heroku so some delays are possible.

<p>A single page web based database for radio amateurs to create/read/update/delete contacts. User needs to create an account to be able to access the database. User has to add a callsign before he can add contacts. If user obtains another callsign he/she can change it in the profile, no need to create an new account. User can edit all fields it the profile.</p>

Backend at  https://github.com/johnzonneveld/hamlogbook-api

Fork and Clone this repository. You will need to setup the rails api back-end to get the application working properly. Once you have your API up and running you will need to alter the BASEURL constant in index.js to match the url which your API server is running on. After that open index.html in your browser.

<h2>Usage</h2>

This application is made to be used in tandem with the [rails api backend](https://github.com/johnzonneveld/hamlogbook-api). Once your server is up and running and you have `index.html` open in the browser:

- Users can register and login
- Users can edit their profile
- User can create/read/update/delete contacts
- Contact detail has a Google Map with the path user<->contact based on the maidenhead grids


<h2>License</h2>

[MIT License](https://opensource.org/licenses/MIT).
