# Learnly Assessment

1. Core API Development (Node.js):

   - Create RESTful APIs for the following functionalities:

     - User Registration and Authentication:

       - Secure user signup/login using JWT.
       - Endpoint to update patient profiles (e.g., name, address, medical history).

     - Book a Health Test:

       - Browse and book health tests with appointment details (e.g., date, time, test type).

     - Consult a Doctor:
       - Book doctor consultations (text/video chat).
     - Chat with Itura (Stub):
       - Create a placeholder endpoint simulating interactions with a virtual assistant.

2. Database Integration:

   - Use PostgreSQL for structured data such as users, appointments, and test bookings.
   - Use MongoDB for dynamic data such as medical records, doctor notes, and test results.

3. CI/CD Pipeline:

   - Set up a pipeline to:
     - Run automated tests.
     - Lint and build the application.
     - Deploy the application in a containerized environment (Docker).
     - Bonus: Deploy to a cloud provider like AWS, Azure, or GCP.

4. Optional Golang Microservice:

   - Build a microservice in Golang to calculate health statistics (e.g., BMI or blood sugar trends) based on test results.
   - Integrate it with the main Node.js application via an internal API call.

5. Documentation:
   - Include a README with setup instructions, API documentation, and an overview of your CI/CD pipeline.

## Assumptions

1. Anyone can register and by default he/she is a patient.
2. Only a Doctor with WRITE permission can upgrade a user to a role Doctor.
3. All routes are protected except registration & login.
   - All routes require PATIENT role except `/api/v1/profile/staff` which
     requires role DOCTOR and permission WRITE.

## Pre-requisite

1. Node version 20 or greater installed.
2. Docker or PostgreSQL installed.

## Clone

1. `git clone https://github.com/iTchTheRightSpot/learnly.git`
2. `cd assessment`

## Configure app

1. Create public & private keys using the command
   `openssl genrsa -out keys/private.key 2048 && openssl rsa -in keys/private.key -pubout -out keys/public.key`.
2. Create the `.env` file.
3. Copy the following into the file
   ```
   NODE_ENV=development
   PORT=4000
   UI_URL=*
   DB_DATABASE=assessment_db
   DB_USERNAME=assessment
   DB_PASSWORD=assessment
   DB_PORT=5432
   DB_HOST=localhost
   PRIV_KEY_PATH='./keys/private.key'
   PUB_KEY_PATH='./keys/public.key'
   ```
4. You can replace the database name & credentials if necessary.

## Run app using Docker

1. Uncomment `api` service.
2. Run `docker compose up -d` and you are all set.

## Run app without Docker

1. Install the necessary dependencies by running the command `npm i`.
2. Assuming PostgreSQL is up and running, run database migration:
   - `DATABASE_URL=postgres://<DB_USERNAME>:<DB_PASSWORD>@localhost:<DB_PORT>/<DB_DATABASE> npm run migrate up`.
3. Run `npm run start` to start the app (app runs on PORT 4000 by default).

## Test

1. After database base migration, run `npm run test` to run test.

## [Api documentation](./API.md)

## CI/CD Overview

In the CI/CD pipeline, we automate the process of building, testing, and
deploying the application to ensure smooth integration and delivery. Here's
a brief overview of the CI/CD steps used in the pipeline:

1. Triggering Events:

   - The pipeline is triggered when code is pushed to any branch or a pull
     request is created targeting the master branch.

2. CI Steps:

   - Checkout Source Code: The code is fetched from the repository.
   - Setup Node.js: Node.js environment is set up for the build, including caching npm dependencies.
   - Environment Setup: RSA keys are generated, and a .env file with necessary environment variables is created for the build.
   - Database Setup: The application uses Docker Compose to run required services like the database.
   - Code Formatting: Prettier checks the code format to ensure consistency.
   - Database Migrations: Any necessary database migrations are applied.
   - Run Tests: Automated tests are executed to ensure code integrity.

3. CD Steps:
   - Build Docker Image: The Docker image for the application is built.
   - Tear Down Services: Docker Compose services are shut down to clean up.

## Documentation

1. [Relational database schema](https://dbdiagram.io/d/learnlyapp-67584005e9daa85aca423534)
