# [BasicAuth] POST Request
POST http://localhost:8080/v1/fragments
Content-Type: image/jpeg
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`This is a fragment!`

# Expect to get back a HTTP 415
HTTP/1.1 415
