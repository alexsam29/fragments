# Unauthenticated POST Request
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
# Body of the request goes in ```...``` when it's a string
`This is a fragment!`

# Expect to get back a HTTP 401
HTTP/1.1 401
