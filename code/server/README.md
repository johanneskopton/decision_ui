# Decision Support UI - Server Component

This component provides a simple webserver to host the frontend and 
relay any api requests to the Python backend.

Besides, it rewrites the `X-Auth-Token` HTTP header for api requests as 
an `Authorization` header to the python backend. This allows to secure the
app with an additional authentication mechanism (e.g. basic authentication) 
but still support the token-based authentication of the Python backend.