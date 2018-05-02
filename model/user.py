from werkzeug.security import safe_str_cmp

#User class, specifying id, username, and password
class User:
    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password

#UserTable will contain a list of users authorized to be giving a JWT token
class UserTable:
    def __init__(self, users):
        self.users = users
        self.usernameTable = {u.username: u for u in self.users}
        self.useridTable = {u.id: u for u in self.users}
    
    #authenticate method will return a User object if inputted username and password are correct
    def authenticate(self, username, password):
        user = self.usernameTable.get(username, None)
        if user and safe_str_cmp(user.password.encode('utf-8'), password.encode('utf-8')):
            return user

    #identity method will return a value for JWT payload
    def identity(self, payload):
        userid = payload['identity']
        return self.useridTable.get(userid, None)