# mims
Mobile inventory management system

### Use it live
The app and admin can be used in browser from either links below. Use the account information found in the 'MIMS account info' section. The API is also publically available at the listed location. 
Read the 'Get it on your device' section to be able to use the barcode scanner, which is only available through the Ionic DevApp.

* App: [http://mims.cf](http://mims.cf)
* Admin: [http://mims.cf/admin](http://mims.cf/admin)
* API: `http://mims.cf:5000`

### Get it on your device
To get the app running on your personal phone, you can simply open up [http://mims.cf](http://mims.cf) in your mobile web browser of choice. This will not allow you to use the barcode scanner, however. To use the barcode scanner, you must download the Ionic DevApp ([App Store](https://itunes.apple.com/us/app/ionic-devapp/id1233447133?mt=8), [Google Play Store](https://play.google.com/store/apps/details?id=io.ionic.devapp&hl=en_US)). An Ionic account is needed to access the app, but can be created easily upon opening the app. Once you are inside the app, open the menu with the menu icon to the left of the navigation bar. Then click on 'Enter address manually' and enter `mims.cf` in the first textbox and `80` in the second textbox. Then click 'Done', which will open the app with the barcode scanner.

### MIMS account info

| Username  | Password |
|-----------|----------|
| Manager1  | password |
| Employee1 | password |

### Team members
Patrick Richeal, Brandon Ostasewski, Matthew Finnegan, Dominic Marandino, John Donahue, Paul Sigloch, Steven Bruman, Sagarika Kumar

### Development commands

###### Starting the app for local development
* Run `npx ionic serve` in the `app/` directory

###### Starting the admin for local development
* Run `npx ng serve` in the `admin/` directory

###### Starting the API for local development
* Run `FLASK_APP=main.py flask run` in the `api/` directory

###### Managing the EC2 instance
* Run `nohup python3 main.py &` to start the api or simulation in the background
* Run `sudo nohup python3 -m http.server 80 &` to start the web server in the background
* Run `ps -e | grep python3` to see the process of the running api
* Run `kill -9 process-id` to kill the api
