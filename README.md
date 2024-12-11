# Assessment

## Pre-requisite

1. Docker or (PostgreSQL & MongoDB) installed
2. Open your terminal, in the root of the application create public & private keys using the command
   `openssl genrsa -out keys/private.key 2048 && openssl rsa -in keys/private.key -pubout -out keys/public.key`.
3. Assuming you are using a Unix-based OS, enter the following in your terminal to create the `.env` file:
   ```
   echo -e "NODE_ENV=pipeline\nUI_URL=*\nPORT=4000\nDB_HOST=localhost\nDB_USERNAME=assessment\nDB_PASSWORD=assessment\nDB_DATABASE=assessment_db\nDB_PORT=5432\nPUB_KEY_PATH=\"./keys/public.key\"\nPRIV_KEY_PATH=\"./keys/private.key\"" > .env
   ```
4. Run `npm install` to install the dependencies.
5. To run tests, use the command: `npm run test`.

## Documentation

1. [Database schema](https://dbdiagram.io/d/learnlyapp-67584005e9daa85aca423534)
