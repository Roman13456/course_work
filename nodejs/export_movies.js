const axios = require('axios');
const db = require('./config/db');  // Import the MySQL pool

async function createIndex() {
  const indexConfig = {
    settings: {
      number_of_shards: 1,
      number_of_replicas: 1,
      analysis: {
        analyzer: {
          custom_stop_analyzer: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['lowercase', 'stop']
          }
        }
      }
    },
    mappings: {
      properties: {
        id: { type: 'integer' },
        title: { type: 'text', analyzer: 'custom_stop_analyzer' },
        description: { type: 'text', analyzer: 'custom_stop_analyzer' },
        genre: { type: 'text' },
        release_date: { type: 'date' },
        vote_average: { type: 'float' },
        vote_count: { type: 'integer' }
      }
    }
  };

  try {
    // Create the movies index
    const response = await axios.put('http://localhost:9200/movies', indexConfig, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Index created successfully:', response.data);
  } catch (error) {
    console.error('Error creating index:', error.response ? error.response.data : error.message);
  }
}

async function exportMovies() {
  const [movies] = await db.query('SELECT id, title, description, genre, release_date, vote_average, vote_count FROM movie');

  // Build the bulk request body
  let bulkBody = '';

  for (const movie of movies) {
    // Add action (metadata) and document lines
    bulkBody += JSON.stringify({ index: { _index: 'movies', _id: movie.id } }) + '\n';
    bulkBody += JSON.stringify({
      id:  movie.id,
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      release_date: movie.release_date,
      vote_count: movie.vote_count,
      vote_average: movie.vote_average
    }) + '\n';
  }

  try {
    // Send the bulk request
    const response = await axios.post('http://localhost:9200/_bulk', bulkBody, {
      headers: { 'Content-Type': 'application/x-ndjson' }
    });
    console.log('Bulk indexing completed:', response.data);
  } catch (error) {
    console.error('Error during bulk indexing:', error.response ? error.response.data : error.message);
  } finally {
    db.end();  // Close the MySQL connection
  }
}

async function main() {
  await createIndex();  // Create the index first
  await exportMovies();  // Then perform the bulk indexing
}

main();
