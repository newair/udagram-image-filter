import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import {requireAuth} from './routes/auth.router';
import schema from './joi-schema';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.use("/", requireAuth);

  /**
   * This filteredimage end point apply filter
   * to a provided image URL.
   * Method: GET
   * Params: image_url: string
   * Returns: Binary Image
   */
  app.get( "/filteredimage", async ( req, res ) => {

    const validation = schema.validate(req.query);

    if(validation.error) {
      return res.status(400).send(validation.error);
    }

    try{
      const content = await filterImageFromURL(req.query.image_url);
      return res.sendFile(content, async (error) => {
        if (!error) {
          await deleteLocalFiles([content]);
        }
      });

    } catch(error) {
      return res.status(400).send(error.message);
    }
    
  });
  
  app.get( "/filteredimage", async ( req, res ) => {
    schema.validate(req.params);

    res.send("try GET /filteredimage?image_url={{}}")
  } );
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();