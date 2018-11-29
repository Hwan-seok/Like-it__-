const cookieParser = require('cookie-parser'),
  session_Option = require("./session.js");

module.exports = {
    cookieParser: cookieParser, // the same middleware you registrer in express
    key: session_Option.key, // the name of the cookie where express/connect stores its session_id
    secret: session_Option.secret, // the session_secret to parse the cookie
    store: session_Option.store // we NEED to use a sessionstore. no memorystore please
    // success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
    // fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
  }



// function onAuthorizeSuccess(data, accept){
//   console.log('successful connection to socket.io');

//   // The accept-callback still allows us to decide whether to
//   // accept the connection or not.
//   accept(null, true);

//   // OR

//   // If you use socket.io@1.X the callback looks different
//   accept();
// }

// function onAuthorizeFail(data, message, error, accept){
//   if(error)
//     throw new Error(message);
//   console.log('failed connection to socket.io:', message);

//   // We use this callback to log all of our failed connections.
//   accept(null, false);

//   // OR

//   // If you use socket.io@1.X the callback looks different
//   // If you don't want to accept the connection
//   if(error)
//     accept(new Error(message));
//   // this error will be sent to the user as a special error-package
//   // see: http://socket.io/docs/client-api/#socket > error-object
// }