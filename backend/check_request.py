import requests
import json

# Login
login_data = {'username': 'maria_cliente', 'password': '123456'}
login_response = requests.post('http://localhost:8000/api/auth/login/', json=login_data)
print(f'Login response: {login_response.json()}')
if 'access' in login_response.json():
    token = login_response.json()['access']
else:
    print('Login failed')
    exit()

# Get request details
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:8000/api/requests/12/', headers=headers)
request_data = response.json()

print('Request data:')
print(json.dumps(request_data, indent=2, ensure_ascii=False))
print('\nCategory structure:')
print(f'Category: {request_data.get("category")}')
print(f'Category type: {type(request_data.get("category"))}')
if isinstance(request_data.get('category'), dict):
    print(f'Category ID: {request_data.get("category").get("id")}')
    print(f'Category Name: {request_data.get("category").get("name")}')