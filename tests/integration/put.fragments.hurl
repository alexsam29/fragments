# [BasicAuth] POST Request
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
# Body
`DynamoDB is **great**.`

# Expect to get back a HTTP 201
HTTP/1.1 201
[Captures]
fragment_url: header "Location"

# [BasicAuth] PUT Request
PUT {{fragment_url}}
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
# Body
`This PUT request is **great**.`

# Expect to get back a HTTP 201
HTTP/1.1 200


# GET the fragment by URL
GET {{fragment_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/markdown; charset=utf-8
Content-Length: 30
[Asserts]
body == "This PUT request is **great**."
