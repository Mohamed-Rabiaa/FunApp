# FunAPP

## Setup Instructions:
## 1. Install the dependencies of this project:
Run the following command to install all required dependencies:

```npm install```

## 2. Create an Environment Configuration File:
Create a .env file in the project root directory with the following variables:  
```
DB_HOST='localhost'  
DB_PORT=5432  
DB_USERNAME='Your_database_user_name'  
DB_PASSWORD='Your_database_user_password'  
DB_NAME='Your_database_name'  
API_KEY='ee03f15100a4470894533935b14c8714'  
JWT_SECRET_KEY='Aved1SPKNVcYkyzflvAdD915C6uKkN2f'  
JWT_EXPIRATION=3600s
```
`API_KEY`: Required for accessing the OpenCage Geocoding API.  
`JWT_SECRET_KEY`: Used to generate the authentication token for JWT.  

## 3. Testing the API:
1- Sign up a new user and generate an auth token.  
2- Retrieve user profile information:
Make a `GET` request to the following endpoint, replacing 1 with the user ID:
```http://localhost:3000/user/1```  

Include an `Authorization` header with the token value in the following format:  
```Authorization: 'Bearer your_user_token'```  

## Notes:
Ensure your PostgreSQL database is up and running with the credentials provided in the .env file.   
Replace placeholder values in .env with actual configuration details relevant to your environment.  
