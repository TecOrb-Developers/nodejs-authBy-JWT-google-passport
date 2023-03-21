# Nodejs-authBy-JWT-google-Passport
Direact link to main website (https://www.passportjs.org/packages/passport-google-oauth20/)


What is JWT-google-Passport Authentication?
JWT-google-Passport Authentication is an extra layer of security used to make sure that people trying to gain access to end points urls.  First, a user will enter their username and a password. Then, instead of immediately gaining access, they will be required to provide another auth with google passport auth service.


What we have implemented in this project?
- User Signup
- User Login via password


#Required dependencies:
Node is installed (v 14.x)
Postman is installed (Version 10.12.3-230318-0431)
Mongodb altles free tier cluster
Git is installed.

#Create development.env to setup required environment variables
* Go to the pre-start folder and env>development.env file directory
NODE_ENV=development
jwt_secret_key=
MONGO_URI=

GOOGLE_PLACES_FIND_URL= 
GOOGLE_PLACES_API_KEY= 
FRONTEND_URL=google.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
## Server ##
PORT=3000
HOST=localhost


#Major steps are followed to create/setup:
`npm install`



### local server
`npm run start:dev`


### prod build
`npm run build`


### prod build run
`node dist/index.js`


# postman  api url
type get  "{host-url}/auth/google"
in body pass email 
