# POS
point of sale with nodejs

# tech
- typescript
- nodejs
- expressjs
- formidable
- mongoose

***install Dependencies***
```
npm install
```
***watch typescript changes***
```
npm run dev
```
***Run  js [from dist]***
```
npm run start
```
***Run ts [from src without converting to js]***
```
npm run ts
```
***Run Tests***
```
npm run test
```
# features 
- sign in 
- register
- get me[user] just send the tokken and the server return the user
- update user
- reset password
- email validation
- machine CRUD
- supplier CRUD
- branch CRUD
- remove bulk from branch
- inline edit for any model [but for now it's only connected to the branch api end point]
- products crud
- order crud
- relation between order and products [decrease product stock based on each order itm]

# End Points 🧭
> by default all content type is application/json 
- /register
    - POST
    - required feilds [body]
        - username
        - password
        - email
# todo
- [ ] hash password
- [ ] vaild email
- [ ] solve sent email as spam
- [ ] remove [/login/error , /login/success]
- [ ] type gurd for order_list 
- [ ] documentation HAHAHAHAHAAAHHA

***.env must contain :***
```
SENDGRID_API_KEY=
PORT= 
MONGO_USER = 
MONGO_PASSWORD =
SECRET = 
EXPIRESIN = 
ACTIVESECRET = 
ACTIVEESPIRES = 
RESETSECRET = 
RESETESPIRES =
```