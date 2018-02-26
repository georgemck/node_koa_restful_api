# node_koa_restful_api

This is a Node.js application for a RESTful API built using Koa (atop of Express) and Koa-Router. Testing is provided by Chakram (atop of Chai). It provides CRUD for Feature, TV Series and Bonus specified in the titles.json. Filtering is available on retrieval for Title Type. 

The available methods include: 
  "/ - entry point",
  "/retrieve/ - 'get' for all data",
  "/retrieve/type/ - 'get' for filtering by Title Type",
  "/create/ - 'post' using a parameter named create with JSON payload",
  "/update/type/name - 'put' using a parameter named update with JSON payload with matching URL parameters type and name",
  "/delete/type/name - 'delete' using a parameter named delete to remove an element by matching URL parameters type and name"
Be sure to use the correct method, URL parameters and JSON data to manipulate the API.

To build, run and test,
  Step 1. Clone or download this Github repo
  Step 2. Navigate to the node_koa_restful_api directory using terminal/command line and type "npm install" and press Enter. This will add the node modules dependencies
  Step 3. Start the server by typing "node server.js" and press Enter. The server is set to run on port 8080. HTTPS is also available on 4443.
  Step 4. Open another terminal/command line and navigate to the node_koa_restful_api directory. Type "mocha" and press Enter to start tests. The test.js is set for http://localhost:8080. A test server was created at https://midivr.com:4443, which may be available. 
  
About the data. Titles.json is a file containing JSON data. This data is loaded into a titles_json variable object and used as the data store. This data is manipulated in memory. The data store could have been accessible through a NoSQL database such as DynamoDB, MongoDB, PouchDB, CouchDB, Couchbase or Cloudant. GraphQL can then be used to enhance the query ability. For a small application, an in memory data store should suffice.
