# [BasicAuth] POST Request
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`This is a fragment!`

# Expect to get back a HTTP 201
HTTP/1.1 201

# Capture the Location URL
[Captures]
url: header "Location"

# GET the fragment by URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 19
[Asserts]
body == "This is a fragment!"
