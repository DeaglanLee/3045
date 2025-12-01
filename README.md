# 3045
## Environment setup
- Create .env file and add the following parameters:
    - `GEMINI_API_KEY=<your gemini api key>`
    - `MONGO_URI=<mongo db url>` If running locally, this will be `mongodb://127.0.0.1:27017/chatbot`

## Local database setup
- This project uses MongoDB. You can install it (here)[https://www.mongodb.com/docs/manual/administration/install-community/?operating-system=linux&linux-distribution=red-hat&linux-package=default&search-linux=with-search-linux#std-label-install-mdb-community-edition]
- For mac users, you can use homebrew to install MongoDB:
    - Run `brew tap mongodb/brew`
    - Then run `brew install mongodb-community@8.0` to install the community version
- After installation, you can start the database with `brew services start mongodb-community@8.0`
- To verify that it is running, run `mongosh` to connect.

## Where to get Gemini API Key
- This project uses Gemini to create responses to any questions. You need an API key to interact.
- Gemini provides a free tier which you can generate an API key for.
- To get this free tier API key:
    - Go to (Google's AI studio)[https://aistudio.google.com/]
    - Click Dashboard on the left sidebar
    - Click 'Create API Key' in the top right
    - Create a name for the key and select Default Gemini Project and click Create
    - You will now see a new row on the Dashboard screen
    - Click the copy icon to copy the API Key
    - Paste this key into your .env file (See above)

## How to run the app
- Run `npm install` to install all dependencies
- Run `npx nodemon` to start the app
- Visit `http://localhost:3000` to get started