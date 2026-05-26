this project contains the basic of the backend 
 
important terms->
->starting from npm init
->.gitingnore contains the file which we dont want to push to git hub we can genrate it using gitingore generator
-> in package.json "type":"module"
 
->Dependencies
->Dev Dependencies
->nodemon whenever we change the code it automatically re- starts 
->prettier

********
While connecting a database 
1-> always handle error (tryand catch)
2->DB is always in another continent ->use ASYNC AWAIT

->cokkie-parser
->cors:CORS stands for Cross-Origin Resource Sharing
It’s a security feature built into web browsers that controls how web pages can request resources (like APIs, images, or scripts) from a different domain than the one they were loaded from.->middleware

->middle-ware => supoose you type the url and then its checked whetehr you are logged in and then data is shown to you , this checking part is called middleware

->libraries:
->mongoose-aggregattion :
Perform operations on multiple documents and produce computed results.


Both JWT and bcrypt are core technologies used in authentication systems

->bcrypt:helps Hashing passwords securely
*You CANNOT convert hash back to original password.

->jwt(jasonwebtoken):is a bearer token ,used for Authentication and Authorization
Simple Meaning

JWT is like:

Digital identity card
After login, server gives token.
User sends token in future requests.
Server verifies token and identifies user.

Why JWT Needed
Without JWT:
Server would need to store sessions.
JWT enables:
Stateless authentication
meaning:
server does not store login session

->HOOkS:
are middlewares,Hooks allow functional components to use React features.

->in env accesstoken we wont save in database but refresh token we will save


