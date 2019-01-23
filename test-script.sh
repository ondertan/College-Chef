printf '\n--------------------------login tests-----------------------------------\n'
read -p $'\nLog in'
curl -X "POST" "http://localhost:3000/login" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "userName": "user",
  "password": "user"
}'

read -p $'\nLog in'
curl -X "POST" "http://localhost:3000/login" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "userName": "admin",
  "password": "admin"
}'

printf '\n'

read -p $'\nLog in with missing inputs - will get 400'
curl -X "POST" "http://localhost:3000/login" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "userName": "user"
}'

printf '\n'

read -p $'\nLog in with wrong inputs - will get 403'
curl -X "POST" "http://localhost:3000/login" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "userName": "user",
  "password": "password"
}'

printf '\n--------------------------users tests-----------------------------------\n'

read -p $'\nCreate users'
curl -X "POST" "http://localhost:3000/user" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "userName": "testUser1",
  "password": "testUser1"
}'

printf '\n'

read -p $'\nCreate users with required input missing -- will get 400'
curl -X "POST" "http://localhost:3000/user" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "userName": "testUser2"
}'

printf '\n'

read -p $'\nCreate existing user failed -- will get 403'
curl -X "POST" "http://localhost:3000/user" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "userName": "testUser1",
  "password": "testUser1"
}'

printf '\n'

read -p $'\nChange password'
curl -X "PUT" "http://localhost:3000/user/0/password" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "userName": "admin",
  "password": "admin",
  "newPassword": "mypassword"
}'

printf '\n'

read -p $'\nChange password without authorization -- will get 401'
curl -X "PUT" "http://localhost:3000/user/1/password" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "userName": "testUser1",
  "password": "testUser1",
  "newPassword": "mypassword"
}'

printf '\n'

read -p $'\nChange password without required input -- will get 400'
curl -X "PUT" "http://localhost:3000/user/1/password" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "userName": "testUser1",
  "password": "testUser1"
}'

printf '\n'

read -p $'\nGet user profile by id'
curl -X "GET" "http://localhost:3000/user/1" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIwIiwiZXhwIjoxNTUyODQ1Nzg5NjM0fQ.DjnMuU5no8k8YBRttxmYnOksHbGPRkiWMqSwV7FZDAs"\
     -H "Content-Type: application/json; charset=utf-8" 

printf '\n'

read -p $'\nEdit given user profile'
curl -X "PUT" "http://localhost:3000/user/1" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIwIiwiZXhwIjoxNTUyODQ1Nzg5NjM0fQ.DjnMuU5no8k8YBRttxmYnOksHbGPRkiWMqSwV7FZDAs"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "email": "johnsmith@home.ca",
  "description": "I am a professional chef.",
  "profilePhoto": "/img/recipes/steak.jpg"
}'

printf '\n'

read -p $'\nGet list of users'
curl -X "GET" "http://localhost:3000/users" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIwIiwiZXhwIjoxNTUyODQ1Nzg5NjM0fQ.DjnMuU5no8k8YBRttxmYnOksHbGPRkiWMqSwV7FZDAs"\
     -H "Content-Type: application/json; charset=utf-8" 

printf '\n'

read -p $'\nGet list of users without authorization -- will get 401'
curl -X "GET" "http://localhost:3000/users" \
     -H "Content-Type: application/json; charset=utf-8" 

printf '\n--------------------------feedback tests-----------------------------------\n'

read -p $'\nGet list of submitted feedback when there is no feedback -- will get 404'
curl -X "GET" "http://localhost:3000/feedback" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIwIiwiZXhwIjoxNTUyODQ1Nzg5NjM0fQ.DjnMuU5no8k8YBRttxmYnOksHbGPRkiWMqSwV7FZDAs"\
     -H "Content-Type: application/json; charset=utf-8" 

printf '\n'

read -p $'\nSubmit feedback'
curl -X "POST" "http://localhost:3000/feedback" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "feedback": "Great site!"
}'

printf '\n'

read -p $'\nSubmit feedback with required input missing -- will get 400'
curl -X "POST" "http://localhost:3000/user" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{}'

printf '\n'

read -p $'\nGet list of submitted feedback'
curl -X "GET" "http://localhost:3000/feedback" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIwIiwiZXhwIjoxNTUyODQ1Nzg5NjM0fQ.DjnMuU5no8k8YBRttxmYnOksHbGPRkiWMqSwV7FZDAs"\
     -H "Content-Type: application/json; charset=utf-8" 

printf '\n'

read -p $'\nGet list of submitted feedback without authorization -- will get 401'
curl -X "GET" "http://localhost:3000/users" \
     -H "Content-Type: application/json; charset=utf-8" 

printf '\n--------------------------ingredients tests-----------------------------------\n'

read -p $'\nGet all ingredients'
curl "http://localhost:3000/ingredients"

printf '\n'

read -p $'\nSearch recipes by ingredients case 1 (result might be empty since recipes are randomly created)'
curl -X "POST" "http://localhost:3000/search?searchtype=include" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "ingredients": [1, 2]
}'

printf '\n'

read -p $'\nSearch recipes by ingredients case 2 (result might be empty since recipes are randomly created)'
curl -X "POST" "http://localhost:3000/search?searchtype=equal" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "ingredients": [0]
}'

printf '\n'

read -p $'\nSearch recipes by ingredients with no input- will get 400'
curl -X "POST" "http://localhost:3000/search" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{

}'

printf '\n--------------------------recipes tests-----------------------------------\n'

read -p $'\nGet list of all recipes'
curl "http://localhost:3000/recipes"

printf '\n'

read -p $'\nDelete a recipe that is not created by themselves -- will get 401'
curl -X "DELETE" "http://localhost:3000/recipe/5" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOjAsImV4cCI6MTU1NDEyMzc0OTMxOH0.I0iyeppJvFJLAwMXRDaFgYATB2rak1wHcA81X-TgEm8"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{}'

printf '\n'

read -p $'\nAdmin can delete any recipe'
curl -X "DELETE" "http://localhost:3000/recipe/9" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOjEsImV4cCI6MTU1NDEyNDA0NDM5MH0.9bgHDnmHC8VUiJnybeH7ZjfU-48yM9gxlZr52mqXV4s"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{}'

printf '\n'

read -p $'\nUpdate a recipe'
curl -X "PUT" "http://localhost:3000/recipe/1" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "recipeName": "Chocolate Mousse"
}'

printf '\n'

read -p $'\nGet a specific recipe'
curl "http://localhost:3000/recipe/1"

printf '\n'

read -p $'\nGet list (10) of hot (mostly commented) recipes'
curl "http://localhost:3000/recipes/hot"

printf '\n'

read -p $'\nGet list (10) of remarkable (highestly rated) recipes'
curl "http://localhost:3000/recipes/remarkable"

printf '\n'

read -p $'\nGet list (10) of new recipes'
curl "http://localhost:3000/recipes/new"

printf '\n'

read -p $'\nGet list of recipes uploaded by current user'
curl -X "POST" "http://localhost:3000/recipes/uploaded" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{

}'

printf '\n'

read -p $'\nGet list of recipes uploaded by user called user'
curl -X "POST" "http://localhost:3000/recipes/uploaded" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
   "userName": "user"
}'

printf '\n'

read -p $'\nGet list of recipes uploaded with no bearer - will get 401'
curl -X "POST" "http://localhost:3000/recipes/uploaded" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
   "userName": "user"
}'

printf '\n--------------------------notification history tests-----------------------------------\n'

#notification history test
read -p $'\nGet notification history of current user'
curl "http://localhost:3000/notification" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\

printf '\n'

read -p $'\nGet notification history of current user without authorization -- wii get 401'
curl "http://localhost:3000/notification" \

printf '\n---------------------------------comments tests-----------------------------------\n'

#comments test
read -p $'\nGet all comments of a given recipe - recipe have mutiple comments'
curl "http://localhost:3000/recipe/8/comments/text" \

printf '\n'

read -p $'\nGet all comments of a given recipe - recipe have no comment'
curl "http://localhost:3000/recipe/0/comments/text" \

printf '\n'

read -p $'\nGet all image comments of a given recipe'
curl "http://localhost:3000/recipe/1/comments/image"

printf '\n'

read -p $'\nLeave a comment in a recipe'
curl -X "POST" "http://localhost:3000/recipe/0/comments" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
   "isImage": true,
   "message": "/img/recipes/steak.jpg"
}'

printf '\n'

read -p $'\nLeave a comment with no authorization - will get 401'
curl -X "POST" "http://localhost:3000/recipe/0/comments" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
   "isImage": true,
   "message": "/img/recipes/steak.jpg"
}'

printf '\n'

read -p $'\nLeave a comment with required input missing - will get 400'
curl -X "POST" "http://localhost:3000/recipe/0/comments" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
   "message": "/img/recipes/steak.jpg"
}'

printf '\n---------------------------------rate tests-----------------------------------\n'

#rate tests
read -p $'\nGet rate of recipe -- not logged-in user -- will get 401'
curl "http://localhost:3000/recipe/1/rate" \

printf '\n'

read -p $'\nGet rate of recipe -- current user has never set the rate of this recipe'
curl "http://localhost:3000/recipe/0/rate" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\

printf '\n'

read -p $'\nGet rate of recipe -- current user has set the rate of this recipe'
curl "http://localhost:3000/recipe/1/rate" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\

printf '\n'

read -p $'\nRate recipe -- rate the given recipe for the first time'
curl -X "POST" "http://localhost:3000/recipe/0/rate" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
   "scores": 3
}'

printf '\n'

read -p $'\nRate recipe -- update rate'
curl -X "POST" "http://localhost:3000/recipe/9/rate" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
   "scores": 3
}'

printf '\n'

read -p $'\nRate recipe without authorization -- will get 401'
curl -X "POST" "http://localhost:3000/recipe/9/rate" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
   "scores": 3
}'

printf '\n'

read -p $'\nRate recipe with required input missing -- will get 400'
curl -X "POST" "http://localhost:3000/recipe/9/rate" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
}'

printf '\n---------------------------------favorite tests-----------------------------------\n'

#favorite tests
read -p $'\nGet list of favorited recipes of user with id 0'
curl "http://localhost:3000/recipes/favorite" \
-H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIwIiwiZXhwIjoxNTUyODQ1Nzg5NjM0fQ.DjnMuU5no8k8YBRttxmYnOksHbGPRkiWMqSwV7FZDAs"\

printf '\n'

read -p $'\nGet list of favorited recipes of user with id 1'
curl "http://localhost:3000/recipes/favorite" \
-H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\

printf '\n'

read -p $'\nGet list of favorited recipes without token - will get 401'
curl "http://localhost:3000/recipes/favorite" \

printf '\n'

read -p $'\nUnfavorite recipe'
curl -X "DELETE" "http://localhost:3000/recipe/0/favorite" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{}'

printf '\n'

read -p $'\nFavorite recipe'
curl -X "POST" "http://localhost:3000/recipe/0/favorite" \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNTUyODQwOTg0Nzk4fQ.oxRn-qB7itdDP-W8zDpwlzfmwHlC8esVqTC1Q5xZOGk"\
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{}'

printf '\n'

read -p $'\nFavorite recipe without authorization -- will get 401'
curl -X "POST" "http://localhost:3000/recipe/0/favorite" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{}'

printf '\n'

read -p $'\nUnfavorite recipe without authorization -- will get 401'
curl -X "DELETE" "http://localhost:3000/recipe/9/favorite" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{}'

printf '\n'
