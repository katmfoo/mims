# mims
Mobile inventory management system

### Team members
Patrick Richeal, Brandon Ostasewski, Matthew Finnegan, Dominic Marandino, John Donahue, Paul Sigloch, Steven Bruman, Sagarika Kumar

### Account info for users on the API

| Username  | Password |
|-----------|----------|
| Manager1  | password |
| Employee1 | password |

### Live API URL
The live API is available at `http://mims.cf:5000`.

### Starting the app for local development
* Run `npx ionic serve` in the `app/` directory

### Starting the admin for local development
* Run `npx ng serve` in the `admin/` directory

### Starting the API for local development
* Run `FLASK_APP=main.py flask run` in the `api/` directory

### Managing the API on the EC2 instance
* Run `nohup python3 main.py &` to start the api in the background
* Run `ps -e | grep python3` to see the process of the running api
* Run `kill -9 process-id` to kill the api

### Start the web server on the EC2 instance
* Run `sudo python3 -m http.server 80` in the `webserver/` directory
