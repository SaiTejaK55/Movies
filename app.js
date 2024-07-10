const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasepath = path.join(__dirname, 'moviesData.db')
const app = express()

app.use(express.json())

let database = null

const initializeDbandServer = async () => {
  try {
    database = await open({
      filename: databasepath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('server running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}
initializeDbandServer()

const convertMovieDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie.name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorDbObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directirName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT 
       movie_name
    FROM 
       movie;`

  const movieArray = await database.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachmovie => ({movieName: eachmovie.movie_name})),
  )
})

app.get('/movie/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const getMovieQuery = `
    SELECT
    * 
    FROM 
        movie
    WHERE 
        movie_id = ${movieId};`

  const movie = await database.get(getMovieQuery)
  response.send(convertMovieDbObjectToResponseObject(movie))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body

  const postMovieQuery = `
    INSERT INTO
    movie ( director_id, movie_name, lead_actor )
    VALUES
    ( '${directorId}', '${movieName}', '${leadActor}');`
  await database.run(postMovieQuery)
  response.send('Movie Successfully Added')
})
app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body

  const {movieId} = request.params
  const updateMovieQuery = `
    UPDATE
    movie
    SET
    directir_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = '${movieId}'; `

  await database.run(updateMovieQuery)
  response.send('Movie Details Updated')
})
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const deleteMovieQuery = `
    DELETE FROM
    movie
    WHERE
    movie_id = '${movieId};`

  await database.run(deleteMovieQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    SELECT
    *
    FROM
    
    director;`

  const directorsArray = await database.all(getDirectorsQuery)
  response.send(
    directorsArray.map(eachDirector =>
      convertDirectorDbObjectToResponseObject(eachDirector),
    ),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params

  const getDirectorsMovieQuery = `
 SELECT
 
 movie_name
 
 FROM 
 
 movie
 
 WHERE 
 
 director_id = '${directorId}';`

  const moviesArray = await database.all(getDirectorsMovieQuery)
  response.send(
    moviesArray.map(eachmovie => ({movieName: eachmovie.movie_name})),
  )
})

module.exports = app
