import urllib.request
import json

# register user
data = json.dumps({'name': 'Test', 'email': 'test2@test.com', 'password': 'password'}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/auth/register', data=data, headers={'Content-Type': 'application/json'})
try:
    urllib.request.urlopen(req)
except Exception:
    pass # might already exist

# login
data = json.dumps({'email': 'test2@test.com', 'password': 'password'}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/auth/login', data=data, headers={'Content-Type': 'application/json'})
res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
token = res['access_token']

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = '--' + boundary + '\r\nContent-Disposition: form-data; name="file"; filename="test.csv"\r\nContent-Type: text/csv\r\n\r\nDate,Description,Amount,Paid By,Split Method\n2023-01-01,Dinner,100,John,Equal\n\r\n--' + boundary + '--\r\n'
req = urllib.request.Request('http://127.0.0.1:8000/imports/upload', data=body.encode('utf-8'), headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'multipart/form-data; boundary=' + boundary})
try:
    print(urllib.request.urlopen(req).read().decode('utf-8'))
except Exception as e:
    print("ERROR:")
    print(e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
